import { ExecutorError } from '@qlover/fe-corekit';
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
import type {
  GatewayOptions,
  MessageGetwayInterface
} from '../interface/MessageGetwayInterface';
import type { MessageSenderInterface } from '../interface/MessageSenderInterface';
import type { ExecutorPlugin } from '@qlover/fe-corekit';

export interface MessageSenderConfig {
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

export class MessageSender<MessageType extends MessageStoreMsg<any>>
  implements MessageSenderInterface<MessageType>
{
  protected messageSenderErrorId = 'MESSAGE_SENDER_ERROR';
  protected readonly executor: MessageSenderExecutor;

  constructor(
    protected readonly messages: MessagesStore<MessageType>,
    protected readonly config?: MessageSenderConfig
  ) {
    this.executor = new MessageSenderExecutor();
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

      newGatewayOptions = {
        ...gatewayOptions,
        onChunk: async (chunk) => {
          // Pass context for plugin hooks, but don't capture it in closure unnecessarily
          const result = await executor.runStream(chunk, context);

          if (originalOnChunk) {
            originalOnChunk(result || chunk);
          }
        }
      };
    }

    const result = await gateway?.sendMessage(message, newGatewayOptions);

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

    const endTime = context.currentMessage.endTime || Date.now();
    // Create a new message object instead of modifying the original
    return this.messages.mergeMessage(context.currentMessage, {
      loading: false,
      error: processedError,
      status: MessageStatus.FAILED,
      endTime: endTime
    } as Partial<MessageType>);
  }

  /**
   * 发送消息
   *
   * - 如果 `throwIfError=true` ，则会在发送失败时抛出错误
   * - 如果 `throwIfError=false(默认)` ，则会在发送失败时返回失败消息
   * - 如果提供 `streamEvent`，则使用流式模式
   *
   * @param message - 消息对象（支持部分字段）
   * @param streamEvent - 可选的流式事件对象，提供则使用流式模式,可覆盖 config.streamEvent
   * @returns 发送的消息
   */
  public async send(
    message: Partial<MessageType>,
    gatewayOptions?: GatewayOptions<MessageType>
  ): Promise<MessageType> {
    // Create context with explicit property assignment to avoid shallow copy issues
    const context: MessageSenderContext<MessageType> = {
      throwIfError: this.config?.throwIfError,
      gateway: this.config?.gateway,
      gatewayOptions: gatewayOptions ?? this.config?.gatewayOptions,
      store: this.messages,
      currentMessage: this.generateSendingMessage(message)
    };

    try {
      return await this.executor.exec(context, async (ctx) => {
        return await this.sendMessage(ctx.parameters.currentMessage, ctx);
      });
    } catch (error) {
      return this.handleError(error, context);
    }
  }
}
