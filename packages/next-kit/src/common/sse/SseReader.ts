import { SseCodec } from './SseCodec';
import type { SseCodecInterface } from './SseCodecInterface';
import type { SseReaderInterface } from './SseReaderInterface';
import type { SseEnvelopeType } from './SseTypes';

/**
 * {@link SseReaderInterface} 默认实现。
 */
export class SseReader implements SseReaderInterface {
  constructor(protected readonly codec: SseCodecInterface = new SseCodec()) {}

  /**
   * @override
   */
  public async *read(
    stream: ReadableStream<Uint8Array>,
    signal?: AbortSignal
  ): AsyncGenerator<SseEnvelopeType, void, void> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    const throwIfAborted = (): void => {
      if (signal?.aborted === true) {
        throw this.createAbortError();
      }
    };

    const onAbort = (): void => {
      void reader.cancel('aborted').catch(() => undefined);
    };
    signal?.addEventListener('abort', onAbort, { once: true });

    try {
      throwIfAborted();
      while (true) {
        throwIfAborted();
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split('\n\n');
        buffer = frames.pop() ?? '';
        for (const frame of frames) {
          const envelope = this.codec.decodeFrameText(frame);
          if (envelope !== null) {
            yield envelope;
          }
        }
      }

      const trailing = this.codec.decodeFrameText(buffer);
      if (trailing !== null) {
        yield trailing;
      }
    } finally {
      signal?.removeEventListener('abort', onAbort);
      try {
        reader.releaseLock();
      } catch {
        // reader 可能已因 cancel 释放
      }
    }
  }

  /**
   * @override
   */
  public createAbortError(message: string = 'SSE aborted'): Error {
    const error = new Error(message);
    error.name = 'AbortError';
    return error;
  }

  /**
   * @override
   */
  public isAbortError(error: unknown): boolean {
    return (
      (error instanceof Error && error.name === 'AbortError') ||
      (typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        (error as { name: unknown }).name === 'AbortError')
    );
  }
}
