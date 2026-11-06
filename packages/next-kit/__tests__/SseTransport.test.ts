import { describe, expect, it } from 'vitest';
import { SseCodec, SseReader, SseWriter } from '../src/common/sse';

describe('common/sse', () => {
  const codec = new SseCodec();
  const writer = new SseWriter(codec);
  const reader = new SseReader(codec);

  it('round-trips envelope encode/decode', () => {
    const encoded = codec.encode({
      eventName: 'ping',
      data: { ok: true }
    });
    const text = new TextDecoder().decode(encoded);
    expect(text).toContain('event: ping');
    expect(codec.decodeFrameText(text)).toEqual({
      eventName: 'ping',
      data: { ok: true }
    });
  });

  it('writer stream yields readable envelopes', async () => {
    const stream = writer.createReadableStream(async (write) => {
      write({ eventName: 'a', data: 1 });
      write({ eventName: 'b', data: { x: 2 } });
    });
    const envelopes = [];
    for await (const item of reader.read(stream)) {
      envelopes.push(item);
    }
    expect(envelopes).toEqual([
      { eventName: 'a', data: 1 },
      { eventName: 'b', data: { x: 2 } }
    ]);
  });
});
