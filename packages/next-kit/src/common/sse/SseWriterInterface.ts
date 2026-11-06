import type { SseEnvelopeType, SseWriterRunErrorHandlerType } from './SseTypes';

/**
 * 服务端 SSE 写出：信封 → ReadableStream 字节。
 */
export interface SseWriterInterface {
  /**
   * 编码单个信封。
   */
  encode(envelope: SseEnvelopeType): Uint8Array;

  /**
   * 创建流；在 `run` 中调用 `write` 推送信封，结束时 close。
   */
  createReadableStream(
    run: (write: (envelope: SseEnvelopeType) => void) => Promise<void>,
    options?: {
      readonly onRunError?: SseWriterRunErrorHandlerType;
    }
  ): ReadableStream<Uint8Array>;
}
