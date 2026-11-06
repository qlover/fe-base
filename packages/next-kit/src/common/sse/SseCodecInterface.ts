import type { SseEnvelopeType } from './SseTypes';

/**
 * SSE 线协议编解码（`event:` + `data:` JSON + 空行分帧）。
 */
export interface SseCodecInterface {
  /**
   * 编码为 UTF-8 字节块。
   */
  encode(envelope: SseEnvelopeType): Uint8Array;

  /**
   * 解析单帧文本；无效则 null。
   */
  decodeFrameText(frameText: string): SseEnvelopeType | null;
}
