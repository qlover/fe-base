import { MessageStatus, type MessageStoreMsg } from './MessagesStore';
import type {
  MessageSenderContext,
  MessageSenderPlugin,
  MessageSenderPluginContext
} from './MessageSenderExecutor';
import type { ExecutorContext, ExecutorError } from '@qlover/fe-corekit';

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
 */
export class SenderStrategyPlugin implements MessageSenderPlugin {
  readonly pluginName = 'SenderStrategyPlugin';

  constructor(protected failureStrategy: SendFailureStrategyType) {}

  protected handleBefore_KEEP_FAILED(
    parameters: MessageSenderContext<MessageStoreMsg<any, unknown>>
  ): MessageStoreMsg<any, unknown> {
    const { currentMessage, store } = parameters;

    return store.addMessage(currentMessage);
  }

  onBefore(context: ExecutorContext<MessageSenderContext>): void {
    switch (this.failureStrategy) {
      case SendFailureStrategy.ADD_ON_SUCCESS:
        context.parameters.addedToStore = false;
        break;

      case SendFailureStrategy.KEEP_FAILED:
      case SendFailureStrategy.DELETE_FAILED:
      default:
        const addedMessage = this.handleBefore_KEEP_FAILED(context.parameters);
        context.parameters.currentMessage = addedMessage;
        context.parameters.addedToStore = true;
        break;
    }
  }

  protected handleSuccess_KEEP_FAILED(
    parameters: MessageSenderContext<MessageStoreMsg<any, unknown>>,
    successData: MessageStoreMsg<any, unknown>
  ): MessageStoreMsg<any, unknown> | undefined {
    const { currentMessage, store: messages } = parameters;

    const updatedMessage = messages.updateMessage(
      currentMessage.id!,
      successData as Partial<MessageStoreMsg<any>>
    );

    return updatedMessage;
  }

  protected handleSuccess_ADD_ON_SUCCESS(
    parameters: MessageSenderContext<MessageStoreMsg<any, unknown>>,
    successData: MessageStoreMsg<any, unknown>
  ): MessageStoreMsg<any, unknown> {
    const { currentMessage, store: messages } = parameters;

    const addedMessage = messages.addMessage({
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

      context.parameters.currentMessage = updatedMessage;
      context.returnValue = updatedMessage;
    } else {
      const addedMessage = this.handleSuccess_ADD_ON_SUCCESS(
        context.parameters,
        successData
      );

      context.parameters.currentMessage = addedMessage;
      context.returnValue = addedMessage;
    }
  }

  onError(
    context: ExecutorContext<MessageSenderContext>
  ): ExecutorError | void {
    const { currentMessage, store, addedToStore } = context.parameters;
    const error = context.error;

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
      context.parameters.currentMessage = finalMessage;
      context.returnValue = finalMessage;
    }
  }

  /**
   * 流式数据处理钩子
   * - 根据不同策略更新消息内容
   * - KEEP_FAILED/DELETE_FAILED: 实时更新 store 中的消息
   * - ADD_ON_SUCCESS: 不更新 store，等待完成时再添加
   */
  onStream(
    context: MessageSenderPluginContext<any>,
    chunk: unknown
  ): Promise<unknown> | unknown | void {
    const { addedToStore, currentMessage, store } = context.parameters;

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

  protected handleStream_UpdateExisting(
    parameters: MessageSenderContext<MessageStoreMsg<any, unknown>>,
    chunkMessage: unknown
  ): unknown | void {
    const { store } = parameters;

    console.log('handleStream_UpdateExisting', chunkMessage);

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
