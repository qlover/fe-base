import type { MessageInterface } from './MessagesStoreInterface';
import type { AbortPluginConfig } from '../impl/AbortPlugin';

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

  /**
   * 消息被停止/取消时调用
   * @param message - 被停止时的消息状态（包含已接收的部分内容）
   */
  onAborted?(message: M): void;
}

export interface GatewayOptions<M, P = Record<string, any>>
  extends MessageStreamEvent<M>,
    Omit<AbortPluginConfig, 'onAborted'> {
  /**
   * 是否使用流式模式
   * - true: 流式模式，逐步输出内容（会调用 onChunk）
   * - false 或 undefined: 普通模式，一次性返回完整内容
   *
   * 注意：无论是否流式，只要提供了 options，都支持停止控制（signal）
   *
   * @default false
   */
  stream?: boolean;

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
