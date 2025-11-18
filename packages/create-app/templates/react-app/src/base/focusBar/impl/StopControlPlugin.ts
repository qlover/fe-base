import { MessageStatus, type MessageStoreMsg } from './MessagesStore';
import type {
  MessageSenderContext,
  MessageSenderPlugin
} from './MessageSenderExecutor';
import type { ExecutorContext, ExecutorError } from '@qlover/fe-corekit';

/**
 * 停止控制插件
 *
 * 职责：
 * 1. 识别 AbortError（停止信号）
 * 2. 将消息状态设置为 STOPPED
 * 3. 阻止错误传播到其他插件
 *
 * 使用说明：
 * - 必须在 SenderStrategyPlugin 之前注册
 * - 只处理停止操作，不处理真正的错误
 * - 停止操作不被视为错误，而是正常的用户行为
 *
 * @example
 * ```typescript
 * const messageSender = new MessageSender(store);
 *
 * // ⭐ 必须先注册 StopControlPlugin
 * messageSender.use(new StopControlPlugin());
 *
 * // 然后注册其他插件
 * messageSender.use(new ChatSenderStrategy(...));
 * ```
 */
export class StopControlPlugin implements MessageSenderPlugin {
  readonly pluginName = 'StopControlPlugin';

  /**
   * 拦截错误，识别停止操作
   *
   * 如果是 AbortError，将消息设置为 STOPPED 状态并阻止错误传播
   * 如果不是 AbortError，不做处理，让其他插件处理
   */
  onError(
    context: ExecutorContext<MessageSenderContext>
  ): ExecutorError | void {
    const error = context.error;

    // 只处理 Abort 错误
    if (!this.isAbortError(error)) {
      // 不是停止错误，让其他插件（如 SenderStrategyPlugin）处理
      return;
    }

    // 这是停止操作，设置 STOPPED 状态
    const { currentMessage, store, addedToStore, gatewayOptions } =
      context.parameters;

    const stoppedData = {
      loading: false,
      status: MessageStatus.STOPPED,
      endTime: Date.now()
    };

    let finalMessage: MessageStoreMsg<any>;

    if (addedToStore && currentMessage.id) {
      // 消息已在 store 中，更新它
      const updated = store.updateMessage(currentMessage.id, stoppedData);
      finalMessage = updated || store.mergeMessage(currentMessage, stoppedData);
    } else {
      // 消息未添加，创建停止状态的消息
      finalMessage = store.mergeMessage(currentMessage, stoppedData);
    }

    // 更新 context
    context.parameters.currentMessage = finalMessage;
    context.returnValue = finalMessage;

    // 调用 onAborted 回调
    if (typeof gatewayOptions?.onAborted === 'function') {
      try {
        gatewayOptions.onAborted(finalMessage);
      } catch (callbackError) {
        // 防止回调错误影响主流程
        console.error('Error in onAborted callback:', callbackError);
      }
    }

    // ⭐ 关键：不返回 error，阻止错误传播
    // 这样 SenderStrategyPlugin 的 onError 不会被调用
    // 停止不是错误，是正常操作
    return undefined;
  }

  /**
   * 判断是否是 Abort 错误
   *
   * 支持多种 AbortError 的表现形式：
   * - DOMException with name 'AbortError'
   * - Error with 'abort' or 'cancel' in message
   * - Error with code 'ABORT_ERR' or 20
   *
   * @param error - 错误对象
   * @returns 是否是 Abort 错误
   */
  protected isAbortError(error: unknown): boolean {
    // DOMException with name 'AbortError' (标准形式)
    if (error instanceof DOMException && error.name === 'AbortError') {
      return true;
    }

    // 某些环境可能使用不同的错误类型
    if (error instanceof Error) {
      // 检查错误消息
      const message = error.message.toLowerCase();
      if (message.includes('abort') || message.includes('cancel')) {
        return true;
      }

      // 检查错误码
      const errorWithCode = error as any;
      if (errorWithCode.code === 'ABORT_ERR' || errorWithCode.code === 20) {
        return true;
      }
    }

    return false;
  }
}
