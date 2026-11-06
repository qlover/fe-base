import type { SseEnvelopeType } from './SseTypes';

/**
 * 客户端 SSE 读取：字节流 → 信封序列。
 */
export interface SseReaderInterface {
  /**
   * 逐帧 yield 信封；`signal` 中止时抛 AbortError。
   */
  read(
    stream: ReadableStream<Uint8Array>,
    signal?: AbortSignal
  ): AsyncGenerator<SseEnvelopeType, void, void>;

  /**
   * 构造标准 AbortError。
   */
  createAbortError(message?: string): Error;

  /**
   * 是否为 AbortError。
   */
  isAbortError(error: unknown): boolean;
}
