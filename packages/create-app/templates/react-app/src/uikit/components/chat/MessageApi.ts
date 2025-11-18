import { ThreadUtil } from '@qlover/corekit-bridge';
import { random } from 'lodash';
import {
  MessageStatus,
  type MessageStoreMsg
} from '@/base/focusBar/impl/MessagesStore';
import type {
  MessageGetwayInterface,
  GatewayOptions
} from '@/base/focusBar/interface/MessageGetwayInterface';
import { ChatMessageRoleType } from './chatMessage/ChatMessage';
import type { ChatMessageStore } from './chatMessage/ChatMessageStore';

export class MessageApi implements MessageGetwayInterface {
  constructor(protected messagesStore: ChatMessageStore<unknown>) {
    this.messagesStore = messagesStore;
  }

  /**
   * 发送消息（支持普通和流式两种模式）
   * - 如果 options 中有 onChunk 回调，则使用流式模式
   * - 否则使用普通模式
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

    // 判断是否使用流式模式
    const isStreamMode = typeof options?.onChunk === 'function';

    if (isStreamMode) {
      // 流式模式
      return this.sendStreamMode(message, options);
    } else {
      // 普通模式
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
      ChatMessageRoleType.ASSISTANT + message.id + Date.now();
    let accumulatedContent = '';

    try {
      // 逐词发送
      for (let i = 0; i < words.length; i++) {
        // 检查是否被取消
        if (options.signal?.aborted) {
          throw new Error('Request aborted');
        }

        // 累积内容
        accumulatedContent += (i > 0 ? ' ' : '') + words[i];

        // 创建当前 chunk 的消息对象
        const chunkMessage = this.messagesStore.createMessage({
          ...message,
          id: assistantMessageId,
          role: ChatMessageRoleType.ASSISTANT,
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
        await ThreadUtil.sleep(random(300, 5000));
      }

      // 创建最终完成的消息
      const finalMessage = this.messagesStore.createMessage({
        ...message,
        id: assistantMessageId,
        role: ChatMessageRoleType.ASSISTANT,
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
      // 发生错误时调用错误回调
      await options.onError?.(error);
      throw error;
    }
  }

  /**
   * 普通发送模式
   * - 一次性返回完整消息
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
      id: ChatMessageRoleType.ASSISTANT + message.id + endTime,
      role: ChatMessageRoleType.ASSISTANT,
      content: '(' + endTime + ')Hello! You sent7: ' + message.content,
      error: null,
      loading: false,
      status: MessageStatus.SENT,
      endTime: endTime,
      result: null
    }) as unknown as M;
  }
}
