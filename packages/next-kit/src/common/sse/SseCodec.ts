import type { SseCodecInterface } from './SseCodecInterface';
import type { SseEnvelopeType } from './SseTypes';

const TEXT_ENCODER = new TextEncoder();

/**
 * {@link SseCodecInterface} 默认实现。
 */
export class SseCodec implements SseCodecInterface {
  /**
   * @override
   */
  public encode(envelope: SseEnvelopeType): Uint8Array {
    const payload = `event: ${envelope.eventName}\ndata: ${JSON.stringify(envelope.data)}\n\n`;
    return TEXT_ENCODER.encode(payload);
  }

  /**
   * @override
   */
  public decodeFrameText(frameText: string): SseEnvelopeType | null {
    const trimmed = frameText.trim();
    if (trimmed.length === 0) {
      return null;
    }

    let eventName = '';
    const dataLines: string[] = [];
    for (const rawLine of trimmed.split('\n')) {
      const line = rawLine.replace(/\r$/, '');
      if (line.startsWith('event:')) {
        eventName = line.slice('event:'.length).trim();
        continue;
      }
      if (line.startsWith('data:')) {
        dataLines.push(line.slice('data:'.length).trimStart());
      }
    }

    if (eventName.length === 0 || dataLines.length === 0) {
      return null;
    }

    try {
      const data = JSON.parse(dataLines.join('\n')) as unknown;
      return { eventName, data };
    } catch {
      return null;
    }
  }
}
