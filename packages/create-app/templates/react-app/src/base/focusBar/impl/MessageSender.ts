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

  /**
   * AbortController 管理 - 用于停止正在发送的消息
   */
  private abortControllers = new Map<string, AbortController>();

  /**
   * Context 管理 - 用于追踪和清理消息发送上下文
   * 注意：只在消息发送完成后清理，不在 stop() 时清理（避免干扰正在进行的异步操作）
   */
  private messageContexts = new Map<
    string,
    MessageSenderContext<MessageType>
  >();

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
   * 获取消息的 AbortController
   * @param messageId - 消息ID
   * @returns AbortController 或 undefined
   */
  public getAbortController(messageId: string): AbortController | undefined {
    return this.abortControllers.get(messageId);
  }

  /**
   * 清理指定消息的所有资源
   * - 移除 AbortController
   * - 清理闭包引用
   * - 清理回调函数引用
   * - 清理 context 引用
   * - 可由子类扩展以清理其他资源
   *
   * @param messageId - 消息ID
   * @param context - 可选的上下文对象，如果不传则从内部 Map 获取
   */
  protected cleanupMessage(
    messageId: string,
    context?: MessageSenderContext<MessageType>
  ): void {
    // 1. 清理 AbortController
    this.abortControllers.delete(messageId);

    return;
    // 2. 获取 context（如果没有传入则从 Map 中获取）
    const ctxToClean = context || this.messageContexts.get(messageId);

    // 3. 清理 context 中的回调引用（防止闭包持有大对象）
    if (ctxToClean?.gatewayOptions) {
      // 清理所有回调引用，但保留 signal（因为它可能被外部持有）
      const gatewayOptions = ctxToClean.gatewayOptions;
      if (gatewayOptions.onChunk) {
        delete gatewayOptions.onChunk;
      }
      if (gatewayOptions.onError) {
        delete gatewayOptions.onError;
      }
      if (gatewayOptions.onComplete) {
        delete gatewayOptions.onComplete;
      }
      if (gatewayOptions.onProgress) {
        delete gatewayOptions.onProgress;
      }
      if (gatewayOptions.onAborted) {
        delete gatewayOptions.onAborted;
      }
    }

    // 4. 清理 context 中的其他引用
    if (ctxToClean) {
      // 注意：不清理 store 和 gateway，因为它们是共享的
      // 但可以清理 currentMessage 引用
      // @ts-ignore - 允许删除只读属性以释放内存
      delete ctxToClean.currentMessage;
    }

    // 5. 从 Map 中移除 context 引用
    this.messageContexts.delete(messageId);
  }

  /**
   * 停止指定消息的发送
   *
   * 注意：
   * - 只能停止由 MessageSender 自动创建的请求（未提供 signal）
   * - 如果发送时提供了自定义 signal，此方法不生效
   * - 停止后会自动清理相关资源
   *
   * @param messageId - 要停止的消息ID
   * @returns 是否成功停止（false 表示未找到或已完成）
   */
  public stop(messageId: string): boolean {
    const controller = this.abortControllers.get(messageId);
    if (controller) {
      controller.abort();
      // 立即清理资源（不等 finally）
      this.cleanupMessage(messageId);
      return true;
    }
    return false;
  }

  /**
   * 停止所有正在发送的消息
   * - 调用所有 AbortController 的 abort()
   * - 清理所有相关资源
   */
  public stopAll(): void {
    this.abortControllers.forEach((controller, messageId) => {
      controller.abort();
      this.cleanupMessage(messageId);
    });
  }

  /**
   * 获取所有正在发送的消息ID列表
   * @returns 消息ID数组
   */
  public getPendingMessageIds(): string[] {
    return Array.from(this.abortControllers.keys());
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

  protected createSendContext(
    sendingMessage: MessageType,
    gatewayOptions?: GatewayOptions<MessageType>
  ): MessageSenderContext<MessageType> {
    const _gatewayOptions = {
      ...this.config?.gatewayOptions,
      ...gatewayOptions
    };

    if (!_gatewayOptions.signal) {
      const controller = new AbortController();
      _gatewayOptions.signal = controller.signal;
      this.abortControllers.set(sendingMessage.id!, controller);
    }

    const context = {
      store: this.messages,
      currentMessage: sendingMessage,
      throwIfError: this.config?.throwIfError,
      gateway: this.config?.gateway,
      gatewayOptions: _gatewayOptions
    };

    // 存储 context 以便后续清理
    this.messageContexts.set(sendingMessage.id!, context);

    return context;
  }

  /**
   * 发送消息
   *
   * - 如果 `throwIfError=true` ，则会在发送失败时抛出错误
   * - 如果 `throwIfError=false(默认)` ，则会在发送失败时返回失败消息
   * - 如果提供 `gatewayOptions`，则使用相应的配置
   * - 如果 `gatewayOptions.signal` 已提供，则使用用户的 signal（stop 方法将不生效）
   * - 如果未提供 signal，则自动创建 AbortController（可通过 stop 方法停止）
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
      return await this.executor.exec(context, async (ctx) => {
        return await this.sendMessage(ctx.parameters.currentMessage, ctx);
      });
    } catch (error) {
      return this.handleError(error, context);
    } finally {
      // 清理消息相关资源，传入 context 以清理更多引用
      this.cleanupMessage(sendingMessage.id!, context);
    }
  }
}
