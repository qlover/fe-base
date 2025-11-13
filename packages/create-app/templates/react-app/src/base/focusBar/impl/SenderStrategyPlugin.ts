import { MessageStatus } from './MessagesStore';
import type { MessageSenderContext } from './MessageSender';
import type {
  ExecutorContext,
  ExecutorError,
  ExecutorPlugin
} from '@qlover/fe-corekit';

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
export class SenderStrategyPlugin
  implements ExecutorPlugin<MessageSenderContext>
{
  readonly pluginName = 'SenderStrategyPlugin';

  constructor(protected failureStrategy: SendFailureStrategyType) {}

  /**
   * 生命周期钩子：发送前处理
   *
   * 根据策略决定是否立即将消息添加到 store
   */
  onBefore(context: ExecutorContext<MessageSenderContext>): void {
    const { currentMessage, messages } = context.parameters;

    switch (this.failureStrategy) {
      case SendFailureStrategy.ADD_ON_SUCCESS:
        // 延迟添加策略：不添加到 store，等成功后再添加
        context.parameters.addedToStore = false;
        break;

      case SendFailureStrategy.KEEP_FAILED:
      case SendFailureStrategy.DELETE_FAILED:
      default:
        // 立即添加策略：现在就添加到 store
        const addedMessage = messages.addMessage(currentMessage);
        // 更新 context 中的 currentMessage 为已添加的消息（可能 id 有变化）
        context.parameters.currentMessage = addedMessage;
        context.parameters.addedToStore = true;
        break;
    }
  }

  /**
   * 生命周期钩子：发送成功处理
   *
   * 根据 addedToStore 决定是更新消息（已在store）还是添加消息（ADD_ON_SUCCESS策略）
   */
  onSuccess(context: ExecutorContext<MessageSenderContext>): void {
    const { currentMessage, messages, addedToStore, gatewayResult } =
      context.parameters;

    const successData = {
      status: MessageStatus.SENT,
      result: gatewayResult,
      loading: false,
      endTime: Date.now()
    };

    if (addedToStore) {
      // 消息已在 store 中，更新状态
      const updatedMessage = messages.updateMessage(currentMessage.id!, {
        ...successData
      } as any);

      if (!updatedMessage) {
        throw new Error('Failed to update message');
      }

      // 更新 context 中的 currentMessage 为更新后的消息
      context.parameters.currentMessage = updatedMessage;

      // 更新 returnValue，让 executor 返回更新后的消息
      context.returnValue = updatedMessage;
    } else {
      // 消息不在 store 中，现在添加（ADD_ON_SUCCESS 策略）
      const addedMessage = messages.addMessage({
        ...currentMessage,
        ...successData
      } as any);

      // 更新 context
      context.parameters.currentMessage = addedMessage;
      context.returnValue = addedMessage;
    }
  }

  /**
   * 生命周期钩子：发送失败处理
   *
   * 根据策略决定如何处理失败的消息
   */
  onError(
    context: ExecutorContext<MessageSenderContext>
  ): ExecutorError | void {
    const { currentMessage, messages, addedToStore } = context.parameters;
    const error = context.error;

    // 根据策略处理失败消息
    let failedMessage: any;

    switch (this.failureStrategy) {
      case SendFailureStrategy.KEEP_FAILED:
        // 保留失败消息：更新消息状态为 FAILED
        if (addedToStore && currentMessage.id) {
          const updatedMessage = messages.updateMessage(currentMessage.id, {
            loading: false,
            error: error,
            status: MessageStatus.FAILED,
            endTime: Date.now()
          } as any);

          failedMessage = updatedMessage;
        } else {
          // 消息不在 store 中，创建临时消息对象
          failedMessage = messages.createMessage({
            ...currentMessage,
            loading: false,
            error: error,
            status: MessageStatus.FAILED,
            endTime: Date.now()
          } as any);
        }
        break;

      case SendFailureStrategy.DELETE_FAILED:
        // 删除失败消息：从 store 中删除
        if (addedToStore && currentMessage.id) {
          messages.deleteMessage(currentMessage.id);
        }
        // 创建临时失败消息对象返回（不在 store 中）
        failedMessage = messages.createMessage({
          ...currentMessage,
          loading: false,
          error: error,
          status: MessageStatus.FAILED,
          endTime: Date.now()
        } as any);
        break;

      case SendFailureStrategy.ADD_ON_SUCCESS:
        // 延迟添加策略：创建临时失败消息对象（不添加到 store）
        failedMessage = messages.createMessage({
          ...currentMessage,
          loading: false,
          error: error,
          status: MessageStatus.FAILED,
          endTime: Date.now()
        } as any);
        break;
    }

    // 更新 context 的返回值为失败消息
    context.returnValue = failedMessage;

    // 返回 void 表示错误已被处理，不再向上抛出
  }
}
