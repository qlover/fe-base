import { AbortPlugin } from './AbortPlugin';
import { MessageSenderBasePlugin } from './MessageSenderBasePlugin';
import {
  type MessagesStore,
  MessageStatus,
  type MessageStoreMsg
} from './MessagesStore';
import { template } from './utils';
import type {
  MessageSenderContext,
  MessageSenderPluginContext
} from './MessageSenderExecutor';
import type { ExecutorContext, ExecutorError } from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';

/**
 * 发送失败时的消息处理策略
 */
export const SendFailureStrategy = Object.freeze({
  /** 保留失败消息（默认）- 适合聊天应用，用户可以看到失败记录并重试 */
  KEEP_FAILED: 'keep_failed',
  /** 删除失败消息 - 消息列表保持干净，只显示成功消息 */
  DELETE_FAILED: 'delete_failed',
  /** 延迟添加 - 成功后才添加到列表（发送过程中不显示） */
  ADD_ON_SUCCESS: 'add_on_success'
});

export type SendFailureStrategyType =
  (typeof SendFailureStrategy)[keyof typeof SendFailureStrategy];

/**
 * 消息发送策略插件
 *
 * 实现三个生命周期钩子来控制消息的添加、更新和失败处理
 *
 * Message loading 处理规则示例：
 * 1. 不是 stream 时, gateway
 *  - 返回结果前都是 loading=true, status=sending
 *  - 返回正确结果后 loading=false, status=sent
 *
 * 2. 是 stream 时, gateway
 *  - chunk之前都是 loading=true, status=sending, streaming=true
 *  - chunk 结束后 loading=false, status=sent, streaming=false
 */
export class SenderStrategyPlugin extends MessageSenderBasePlugin {
  readonly pluginName = 'SenderStrategyPlugin';

  protected loggerTpl = {
    stream: '[${pluginName}] onStream #${times} - chunk:',
    startStreaming: '[${pluginName}] startStreaming',
    endStreaming: '[${pluginName}] endStreaming'
  } as const;

  constructor(
    protected failureStrategy: SendFailureStrategyType,
    protected logger?: LoggerInterface
  ) {
    super();
  }

  /**
   * 判断错误是否为 abort 错误
   * @param error - 错误对象
   * @returns 是否为 abort 错误
   */
  protected isAbortError(error: any): boolean {
    return AbortPlugin.isAbortError(error);
  }

  protected handleBefore_KEEP_FAILED(
    parameters: MessageSenderContext<MessageStoreMsg<any, unknown>>
  ): MessageStoreMsg<any, unknown> {
    const { currentMessage, store } = parameters;

    return store.addMessage(currentMessage);
  }

  protected cleanup(context: ExecutorContext<MessageSenderContext>): void {
    const { store } = context.parameters;
    store.stopStreaming();

    this.logger?.info(
      template(this.loggerTpl.endStreaming, {
        pluginName: this.pluginName
      })
    );
  }

  onBefore(context: ExecutorContext<MessageSenderContext>): void {
    switch (this.failureStrategy) {
      case SendFailureStrategy.ADD_ON_SUCCESS:
        this.closeAddedToStore(context);
        break;

      case SendFailureStrategy.KEEP_FAILED:
      case SendFailureStrategy.DELETE_FAILED:
      default:
        const addedMessage = this.handleBefore_KEEP_FAILED(context.parameters);

        this.mergeRuntimeMessage(context, addedMessage);
        this.openAddedToStore(context);
        break;
    }
  }

  protected handleSuccess_KEEP_FAILED(
    parameters: MessageSenderContext<MessageStoreMsg<any, unknown>>,
    successData: MessageStoreMsg<any, unknown>
  ): MessageStoreMsg<any, unknown> | undefined {
    const { currentMessage, store } = parameters;

    const updatedMessage = store.updateMessage(
      currentMessage.id!,
      successData as Partial<MessageStoreMsg<any>>
    );

    return updatedMessage;
  }

  protected handleSuccess_ADD_ON_SUCCESS(
    parameters: MessageSenderContext<MessageStoreMsg<any, unknown>>,
    successData: MessageStoreMsg<any, unknown>
  ): MessageStoreMsg<any, unknown> {
    const { currentMessage, store } = parameters;

    const addedMessage = store.addMessage({
      ...currentMessage,
      ...successData
    });

    return addedMessage;
  }

  onSuccess(context: ExecutorContext<MessageSenderContext>): void {
    const { addedToStore } = context.parameters;

    const successData = context.returnValue as MessageStoreMsg<any>;

    if (addedToStore) {
      const updatedMessage = this.handleSuccess_KEEP_FAILED(
        context.parameters,
        successData
      );

      if (!updatedMessage) {
        throw new Error('Failed to update message');
      }

      this.mergeRuntimeMessage(context, updatedMessage);
      this.asyncReturnValue(context, updatedMessage);
    } else {
      const addedMessage = this.handleSuccess_ADD_ON_SUCCESS(
        context.parameters,
        successData
      );

      this.mergeRuntimeMessage(context, addedMessage);
      this.asyncReturnValue(context, addedMessage);
    }

    this.cleanup(context);
  }

  /**
   * 处理停止错误（AbortError）
   *
   * 当检测到停止操作时：
   * 1. 将消息状态设置为 STOPPED
   * 2. 调用 onAborted 回调
   * 3. 阻止错误传播到其他插件
   *
   * @param context - 执行上下文
   * @returns undefined - 阻止错误传播
   */
  protected onStopError(
    context: ExecutorContext<MessageSenderContext>
  ): ExecutorError | void {
    const { currentMessage, store, addedToStore, gatewayOptions } =
      context.parameters;

    const stoppedData = {
      error: context.error,
      loading: false,
      status: MessageStatus.STOPPED,
      endTime: Date.now()
    };

    let finalMessage: MessageStoreMsg<any>;

    if (addedToStore && currentMessage.id) {
      const updated = store.updateMessage(currentMessage.id, stoppedData);
      finalMessage = updated || store.mergeMessage(currentMessage, stoppedData);
    } else {
      finalMessage = store.mergeMessage(currentMessage, stoppedData);
    }

    this.mergeRuntimeMessage(context, finalMessage);
    this.asyncReturnValue(context, finalMessage);

    if (typeof gatewayOptions?.onAborted === 'function') {
      try {
        gatewayOptions.onAborted(finalMessage);
      } catch {
        // 防止回调错误影响主流程
      }
    }

    this.cleanup(context);

    return undefined;
  }

  onError(
    context: ExecutorContext<MessageSenderContext>
  ): ExecutorError | void {
    const error = context.error;

    // 如果是停止错误，使用专门的停止错误处理
    if (this.isAbortError(error)) {
      return this.onStopError(context);
    }

    const { currentMessage, store, addedToStore } = context.parameters;
    let finalMessage: MessageStoreMsg<any>;

    const faileds = {
      loading: false,
      error: error,
      status: MessageStatus.FAILED,
      endTime: Date.now()
    };

    switch (this.failureStrategy) {
      case SendFailureStrategy.KEEP_FAILED:
        if (addedToStore && currentMessage.id) {
          const updatedMessage = store.updateMessage(
            currentMessage.id,
            faileds
          );

          if (!updatedMessage) {
            throw new Error('Failed to call updateMessage in store');
          }

          finalMessage = updatedMessage;
        } else {
          finalMessage = Object.assign(currentMessage, faileds);
        }
        break;

      case SendFailureStrategy.DELETE_FAILED:
        if (addedToStore && currentMessage.id) {
          store.deleteMessage(currentMessage.id);
        }
        finalMessage = store.mergeMessage(currentMessage, faileds);
        break;

      case SendFailureStrategy.ADD_ON_SUCCESS:
        finalMessage = Object.assign(currentMessage, faileds);
        break;
    }

    if (finalMessage) {
      this.mergeRuntimeMessage(context, finalMessage);
      this.asyncReturnValue(context, finalMessage);
    }

    this.cleanup(context);
  }

  /**
   * 流式数据处理钩子
   * - 根据不同策略更新消息内容
   * - KEEP_FAILED/DELETE_FAILED: 实时更新 store 中的消息
   * - ADD_ON_SUCCESS: 不更新 store，等待完成时再添加
   * - Fallback: 如果第一次收到 chunk 时用户消息还在 loading，说明 onConnected 未被调用，自动触发
   */
  onStream(
    context: MessageSenderPluginContext<any>,
    chunk: unknown
  ): Promise<unknown> | unknown | void {
    const { addedToStore, currentMessage, store } = context.parameters;

    const times = context.hooksRuntimes.streamTimes;
    this.logger?.debug(
      template(this.loggerTpl.stream, {
        pluginName: this.pluginName,
        times: String(times)
      }),
      chunk
    );

    // Fallback: 如果是第一次 chunk 且用户消息还在 loading，说明 onConnected 未被调用
    // 此时第一次 chunk 到达意味着连接已建立，执行相同的逻辑
    if (times === 1 && addedToStore && currentMessage.id) {
      const userMessage = store.getMessageById(currentMessage.id);
      if (userMessage?.loading) {
        this.handleConnectionEstablished(context.parameters);

        this.logger?.info(
          `[${this.pluginName}] Fallback: Connection established on first chunk`
        );
      }
    }

    // 确保全局 streaming 状态已启动（防止某些边界情况）
    this.startStreaming(store);

    if (!store.isMessage(chunk)) {
      return chunk;
    }

    const chunkMessage = chunk as MessageStoreMsg<any, unknown>;

    switch (this.failureStrategy) {
      case SendFailureStrategy.KEEP_FAILED:
      case SendFailureStrategy.DELETE_FAILED:
        if (addedToStore && currentMessage.id) {
          return this.handleStream_UpdateExisting(
            context.parameters,
            chunkMessage
          );
        }
        break;

      case SendFailureStrategy.ADD_ON_SUCCESS:
        return chunk;
    }

    return chunk;
  }

  protected startStreaming(
    store: MessagesStore<MessageStoreMsg<any, unknown>>
  ): void {
    // 启动全局 streaming 状态
    if (!store.state.streaming) {
      this.logger?.debug(
        template(this.loggerTpl.startStreaming, {
          pluginName: this.pluginName
        })
      );
      store.startStreaming();
    }
  }

  /**
   * 处理连接建立的公共逻辑
   * - 启动全局 streaming 状态
   * - 将用户消息标记为已发送（loading=false）
   *
   * @param parameters - 消息发送上下文参数
   */
  protected handleConnectionEstablished(
    parameters: MessageSenderContext<MessageStoreMsg<any, unknown>>
  ): void {
    const { store, currentMessage, addedToStore } = parameters;

    // 启动全局 streaming 状态
    this.startStreaming(store);

    // 将用户消息的 loading 设置为 false，表示请求已发送成功
    if (addedToStore && currentMessage.id) {
      store.updateMessage(currentMessage.id, {
        loading: false,
        // sending 规则1
        status: MessageStatus.SENDING,
        endTime: Date.now()
      });
    }
  }

  onConnected(context: ExecutorContext<MessageSenderContext>): void {
    this.handleConnectionEstablished(context.parameters);
  }

  protected handleStream_UpdateExisting(
    parameters: MessageSenderContext<MessageStoreMsg<any, unknown>>,
    chunkMessage: unknown
  ): unknown | void {
    const { store } = parameters;

    if (!store.isMessage(chunkMessage) || !chunkMessage.id) {
      return chunkMessage;
    }
    const existingMessage = store.getMessageById(chunkMessage.id);

    if (existingMessage) {
      const updatedMessage = store.updateMessage(chunkMessage.id, chunkMessage);
      return updatedMessage || chunkMessage;
    }

    const addedMessage = store.addMessage(chunkMessage);
    return addedMessage;
  }
}
