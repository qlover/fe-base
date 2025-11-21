import {
  ThreadUtil,
  MessageStatus,
  ChatMessageRole
} from '@qlover/corekit-bridge';
import { random } from 'lodash';
import type {
  MessageStoreMsg,
  ChatMessageStore,
  MessageGetwayInterface,
  GatewayOptions
} from '@qlover/corekit-bridge';

export class MessageApi implements MessageGetwayInterface {
  constructor(protected messagesStore: ChatMessageStore<unknown>) {
    this.messagesStore = messagesStore;
  }

  /**
   * 发送消息（支持普通和流式两种模式）
   * - 如果 options.stream === true，使用流式模式（逐步输出）
   * - 如果提供了 options 但 stream !== true，使用可中断的普通模式
   * - 如果没有 options，使用快速普通模式（不可中断）
   */
  async sendMessage<M extends MessageStoreMsg<string>>(
    message: M,
    options?: GatewayOptions<M>
  ): Promise<M> {
    const messageContent = message.content ?? '';

    // 检查是否需要模拟错误
    if (messageContent.includes('Failed') || messageContent.includes('error')) {
      const error = new Error('Failed to send message');
      await options?.onError?.(error);
      throw error;
    }

    // 判断使用哪种模式
    if (options?.stream === true) {
      // 流式模式：逐步输出
      return this.sendStreamMode(message, options);
    } else if (options) {
      // 可中断的普通模式：一次性返回，但支持停止
      return this.sendInterruptibleMode(message, options);
    } else {
      // 快速普通模式：不可中断
      return this.sendNormalMode(message);
    }
  }

  /**
   * 流式发送模式
   * - 模拟逐字输出的效果
   */
  private async sendStreamMode<M extends MessageStoreMsg<string>>(
    message: M,
    options: GatewayOptions<M>
  ): Promise<M> {
    const messageContent = message.content ?? '';

    // 模拟生成的回复内容
    const responseText = `Hello! You sent: ${messageContent}. This is a streaming response that will be sent word by word to simulate real streaming behavior.`;
    const words = responseText.split(' ');

    // 创建初始的助手消息
    const assistantMessageId =
      ChatMessageRole.ASSISTANT + message.id + Date.now();
    let accumulatedContent = '';

    try {
      // 模拟连接建立 - 调用 onConnected
      await ThreadUtil.sleep(random(2000, 5000));
      // 注意：框架会自动拦截这个调用，触发插件系统，然后调用用户的原始回调
      await options.onConnected?.();

      // 逐词发送
      for (let i = 0; i < words.length; i++) {
        // 检查是否被取消
        if (options.signal?.aborted) {
          throw new DOMException('Request aborted', 'AbortError');
        }

        // 累积内容
        accumulatedContent += (i > 0 ? ' ' : '') + words[i];

        // 创建当前 chunk 的消息对象
        const chunkMessage = this.messagesStore.createMessage({
          ...message,
          id: assistantMessageId,
          role: ChatMessageRole.ASSISTANT,
          content: accumulatedContent,
          error: null,
          loading: true,
          status: MessageStatus.SENDING,
          startTime: message.startTime,
          endTime: 0,
          result: null
        }) as unknown as M;

        // 调用 onChunk 回调
        await options.onChunk?.(chunkMessage);

        // 计算进度
        const progress = ((i + 1) / words.length) * 100;
        await options.onProgress?.(progress);

        // 模拟网络延迟（随机延迟）
        await ThreadUtil.sleep(random(100, 500));
      }

      // 创建最终完成的消息
      const finalMessage = this.messagesStore.createMessage({
        ...message,
        id: assistantMessageId,
        role: ChatMessageRole.ASSISTANT,
        content: accumulatedContent,
        error: null,
        loading: false,
        status: MessageStatus.SENT,
        startTime: message.startTime,
        endTime: Date.now(),
        result: null
      }) as unknown as M;

      // 调用完成回调
      await options.onComplete?.(finalMessage);

      return finalMessage;
    } catch (error) {
      // 检查是否是停止错误
      if (
        error instanceof DOMException &&
        error.name === 'AbortError' &&
        typeof options.onAborted === 'function'
      ) {
        // 调用 onAborted 回调
        // 注意：这里的消息包含已经累积的内容
        const abortedMessage = this.messagesStore.createMessage({
          ...message,
          id: assistantMessageId,
          role: ChatMessageRole.ASSISTANT,
          content: accumulatedContent,
          error: null,
          loading: false,
          status: MessageStatus.STOPPED,
          startTime: message.startTime,
          endTime: Date.now(),
          result: null
        }) as unknown as M;

        await options.onAborted(abortedMessage);
      } else {
        // 其他错误，调用 onError 回调
        await options.onError?.(error);
      }

      throw error;
    }
  }

  /**
   * 可中断的普通模式
   * - 一次性返回完整消息（不逐字输出）
   * - 支持停止控制（通过 signal）
   * - 支持事件回调（onComplete, onAborted, onError）
   */
  private async sendInterruptibleMode<M extends MessageStoreMsg<string>>(
    message: M,
    options: GatewayOptions<M>
  ): Promise<M> {
    const messageContent = message.content ?? '';

    // 模拟连接建立 - 调用 onConnected
    // 注意：框架会自动拦截这个调用，触发插件系统，然后调用用户的原始回调
    await options.onConnected?.();

    // 模拟随机延迟
    const times = random(200, 1000);

    // 在延迟过程中检查是否被取消
    const startTime = Date.now();
    while (Date.now() - startTime < times) {
      if (options.signal?.aborted) {
        // 被取消，创建停止状态的消息
        const abortedMessage = this.messagesStore.createMessage({
          ...message,
          id: ChatMessageRole.ASSISTANT + message.id,
          role: ChatMessageRole.ASSISTANT,
          content: '', // 还没开始生成内容
          error: null,
          loading: false,
          status: MessageStatus.STOPPED,
          endTime: Date.now(),
          result: null
        }) as unknown as M;

        // 调用 onAborted
        await options.onAborted?.(abortedMessage);

        throw new DOMException('Request aborted', 'AbortError');
      }

      // 每 50ms 检查一次
      await ThreadUtil.sleep(50);
    }

    // 检查是否需要模拟错误
    if (messageContent.includes('Failed') || messageContent.includes('error')) {
      const error = new Error('Failed to send message');
      await options.onError?.(error);
      throw error;
    }

    if (times % 5 === 0) {
      const error = new Error(`Network error(${times})`);
      await options.onError?.(error);
      throw error;
    }

    const endTime = Date.now();
    const finalMessage = this.messagesStore.createMessage({
      ...message,
      id: ChatMessageRole.ASSISTANT + message.id,
      role: ChatMessageRole.ASSISTANT,
      content: '(' + endTime + ')Hello! You sent: ' + message.content,
      error: null,
      loading: false,
      status: MessageStatus.SENT,
      endTime: endTime,
      result: null
    }) as unknown as M;

    // 调用 onComplete
    await options.onComplete?.(finalMessage);

    return finalMessage;
  }

  /**
   * 快速普通模式
   * - 一次性返回完整消息
   * - 不可中断（不检查 signal）
   */
  private async sendNormalMode<M extends MessageStoreMsg<string>>(
    message: M
  ): Promise<M> {
    const times = random(200, 1000);

    await ThreadUtil.sleep(times);

    const messageContent = message.content ?? '';
    if (messageContent.includes('Failed') || messageContent.includes('error')) {
      throw new Error('Failed to send message');
    }

    if (times % 5 === 0) {
      throw new Error(`Network error(${times})`);
    }

    const endTime = Date.now();
    return this.messagesStore.createMessage({
      ...message,
      id: ChatMessageRole.ASSISTANT + message.id,
      role: ChatMessageRole.ASSISTANT,
      content: '(' + endTime + ')Hello! You sent7: ' + message.content,
      error: null,
      loading: false,
      status: MessageStatus.SENT,
      endTime: endTime,
      result: null
    }) as unknown as M;
  }
}
