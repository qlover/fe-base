import type { MessageInterface } from './MessagesStoreInterface';

/**
 * 流式消息事件回调
 */
export interface MessageStreamEvent<M = unknown> {
  /**
   * 每次收到新的 chunk 时调用
   * @param chunk - 消息片段（通常是累积的消息）
   */
  onChunk?(chunk: M): void;

  /**
   * 流式传输完成时调用
   * @param finalMessage - 最终完整的消息
   */
  onComplete?(finalMessage: M): void;

  /**
   * 发生错误时调用
   * @param error - 错误对象
   */
  onError?(error: unknown): void;

  /**
   * 流式传输进度回调
   * @param progress - 进度百分比
   */
  onProgress?(progress: number): void;
}

export interface GatewayOptions<M, P = Record<string, any>>
  extends MessageStreamEvent<M> {
  /**
   * 取消请求信号
   */
  signal?: AbortSignal;

  /**
   * 请求参数
   */
  params?: P;
}

export interface MessageGetwayInterface {
  /**
   * 发送普通消息
   * @param message - 消息对象
   * @returns Promise<消息结果>
   */
  sendMessage<M extends MessageInterface<any>>(
    message: M,
    options?: GatewayOptions<M>
  ): Promise<M>;
}
