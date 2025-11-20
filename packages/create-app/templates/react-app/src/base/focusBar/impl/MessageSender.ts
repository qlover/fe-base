import { ExecutorError } from '@qlover/fe-corekit';
import { AbortPlugin, type AbortPluginConfig, AbortError } from './AbortPlugin';
import {
  type MessageSenderContext,
  type MessageSenderPluginContext,
  MessageSenderExecutor
} from './MessageSenderExecutor';
import {
  MessageStatus,
  type MessageStoreMsg,
  type MessagesStore
} from './MessagesStore';
import { template } from './utils';
import type {
  GatewayOptions,
  MessageGetwayInterface
} from '../interface/MessageGetwayInterface';
import type { MessageSenderInterface } from '../interface/MessageSenderInterface';
import type { ExecutorPlugin } from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';

export interface MessageSenderConfig {
  /**
   * 发送器名称
   *
   * @default 'MessageSender'
   */
  senderName?: string;

  logger?: LoggerInterface;

  /**
   * 是否在发送失败时抛出错误
   *
   * @default false
   */
  throwIfError?: boolean;

  /**
   * 网关
   */
  gateway?: MessageGetwayInterface;

  /**
   * 流式消息对象
   *
   * - 可用作对 gateway 事件接受, 如: onChunk, onComplete, onError, onProgress
   * - 可以给 gateway 传递中止信号
   */
  gatewayOptions?: GatewayOptions<any>;
}

const defaultSenderName = 'MessageSender';
const defaultMessageSenderErrorId = 'MESSAGE_SENDER_ERROR';

export class MessageSender<MessageType extends MessageStoreMsg<any>>
  implements MessageSenderInterface<MessageType>
{
  protected messageSenderErrorId = defaultMessageSenderErrorId;
  protected readonly executor: MessageSenderExecutor;
  protected readonly abortPlugin: AbortPlugin<
    MessageSenderContext<MessageType>
  >;
  protected readonly logger?: LoggerInterface;
  protected readonly senderName: string;

  protected loggerTpl = {
    failed: '[${senderName}] ${messageId} failed',
    success: '[${senderName}] ${messageId} success, speed: ${speed}ms'
  } as const;

  constructor(
    protected readonly messages: MessagesStore<MessageType>,
    readonly config?: MessageSenderConfig
  ) {
    this.logger = config?.logger;
    this.senderName = config?.senderName || defaultSenderName;
    this.executor = new MessageSenderExecutor();

    this.abortPlugin = new AbortPlugin<MessageSenderContext<MessageType>>({
      getConfig: (parameters) =>
        (parameters.gatewayOptions || parameters) as AbortPluginConfig,
      logger: config?.logger
    });
    this.executor.use(this.abortPlugin);
  }

  public getMessageStore(): MessagesStore<MessageType> {
    return this.messages;
  }

  public getGateway(): MessageGetwayInterface | undefined {
    return this.config?.gateway;
  }

  public use(plugin: ExecutorPlugin<MessageSenderContext<MessageType>>): this {
    this.executor.use(plugin);
    return this;
  }

  /**
   * 停止指定消息的发送
   *
   * 注意：
   * - 只能停止由 MessageSender 自动创建的请求（未提供 signal）
   * - 如果发送时提供了自定义 signal，此方法不生效
   * - 停止后会自动清理相关资源（由 AbortPlugin 管理）
   *
   * @param messageId - 要停止的消息ID
   */
  public stop(messageId: string): boolean {
    return this.abortPlugin.abort(messageId);
  }

  /**
   * 停止所有正在发送的消息
   * - 调用 AbortPlugin 的 abortAll()
   * - 清理所有相关资源（由 AbortPlugin 管理）
   */
  public stopAll(): void {
    this.abortPlugin.abortAll();
  }

  /**
   * 发送普通消息
   *
   * @param message - 消息对象
   * @returns 消息结果
   */
  protected async sendMessage(
    message: MessageType,
    context: MessageSenderPluginContext<MessageType>
  ): Promise<MessageType> {
    const gateway = this.getGateway();

    const gatewayOptions = context.parameters.gatewayOptions;
    let newGatewayOptions: GatewayOptions<MessageType> | undefined;
    if (gatewayOptions) {
      // Extract only necessary references to minimize closure capture
      const originalOnChunk = gatewayOptions.onChunk;
      const executor = this.executor;
      const signal = gatewayOptions.signal;

      executor.resetRuntimesStreamTimes(context);

      newGatewayOptions = {
        ...gatewayOptions,
        onChunk: async (chunk) => {
          // 在每次 chunk 到达时检查是否已被 abort
          if (signal?.aborted) {
            throw (
              signal.reason ||
              new AbortError('The operation was aborted', undefined)
            );
          }

          // Pass context for plugin hooks, but don't capture it in closure unnecessarily
          const result = await executor.runStream(chunk, context);

          if (originalOnChunk) {
            originalOnChunk(result || chunk);
          }
        }
      };
    }

    // 使用 AbortPlugin.raceWithAbort 确保即使 gateway 不检查 signal，我们也能响应 abort
    const gatewayPromise = gateway?.sendMessage(message, newGatewayOptions);
    const result = await this.abortPlugin.raceWithAbort(
      gatewayPromise!,
      gatewayOptions?.signal
    );

    return this.messages.mergeMessage(message, {
      status: MessageStatus.SENT,
      result: result,
      loading: false,
      endTime: Date.now()
    } as Partial<MessageType>);
  }

  protected generateSendingMessage(message: Partial<MessageType>): MessageType {
    return this.messages.createMessage({
      ...message,
      status: MessageStatus.SENDING,
      loading: true,
      startTime: Date.now(),
      endTime: 0,
      error: null
    } as Partial<MessageType>);
  }

  protected async handleError(
    error: unknown,
    context: MessageSenderContext<MessageType>
  ): Promise<MessageType> {
    // If is unknown async error, create a new error with MESSAGE_SENDER_ERROR id
    let processedError = error;
    if (error instanceof ExecutorError && error.id === 'UNKNOWN_ASYNC_ERROR') {
      // Create a new ExecutorError instead of modifying the original
      // The constructor will automatically preserve the stack trace from the original error
      processedError = new ExecutorError(this.messageSenderErrorId, error);
    }

    if (this.config?.throwIfError) {
      throw processedError;
    }

    const { currentMessage } = context;
    const endTime = currentMessage.endTime || Date.now();
    // 允许插件修改最终的状态, 可能在某些情况下失败后不这是为失败
    // 比如: STOPPED
    const status = currentMessage.status || MessageStatus.FAILED;

    if (this.logger) {
      this.logger.debug(
        template(this.loggerTpl.failed, {
          senderName: this.senderName,
          messageId: currentMessage.id
        })
      );
    }

    // Create a new message object instead of modifying the original
    return this.messages.mergeMessage(context.currentMessage, {
      loading: false,
      error: processedError,
      status: status,
      endTime: endTime
    } as Partial<MessageType>);
  }

  protected createSendContext(
    sendingMessage: MessageType,
    gatewayOptions?: GatewayOptions<MessageType>
  ): MessageSenderContext<MessageType> {
    const _gatewayOptions = {
      ...this.config?.gatewayOptions,
      ...gatewayOptions,
      // 使用消息 ID 作为 AbortPlugin 的请求标识
      id: sendingMessage.id
    };

    return {
      store: this.messages,
      currentMessage: sendingMessage,
      throwIfError: this.config?.throwIfError,
      gateway: this.config?.gateway,
      gatewayOptions: _gatewayOptions
    };
  }

  /**
   * 发送消息
   *
   * - 如果 `throwIfError=true` ，则会在发送失败时抛出错误
   * - 如果 `throwIfError=false(默认)` ，则会在发送失败时返回失败消息
   * - 如果提供 `gatewayOptions`，则使用相应的配置
   * - 如果 `gatewayOptions.signal` 已提供，则使用用户的 signal（stop 方法将不生效）
   * - 如果未提供 signal，则由 AbortPlugin 自动创建（可通过 stop 方法停止）
   * - 资源清理由 AbortPlugin 自动管理
   *
   * @param message - 消息对象（支持部分字段）
   * @param gatewayOptions - 可选的网关选项
   * @returns 发送的消息
   */
  public async send(
    message: Partial<MessageType>,
    gatewayOptions?: GatewayOptions<MessageType>
  ): Promise<MessageType> {
    const sendingMessage = this.generateSendingMessage(message);
    const context = this.createSendContext(sendingMessage, gatewayOptions);

    try {
      const reuslt = await this.executor.exec(context, async (ctx) => {
        return await this.sendMessage(ctx.parameters.currentMessage, ctx);
      });

      if (this.logger) {
        this.logger.info(
          template(this.loggerTpl.success, {
            senderName: this.senderName,
            messageId: sendingMessage.id,
            speed: String(this.getDuration(reuslt))
          })
        );
      }

      return reuslt;
    } catch (error) {
      return this.handleError(error, context);
    }
  }

  public getDuration(message: MessageType): number {
    return message.endTime ? message.endTime - message.startTime : 0;
  }
}
