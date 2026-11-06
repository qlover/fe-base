import { SseCodec } from './SseCodec';
import type { SseCodecInterface } from './SseCodecInterface';
import type { SseEnvelopeType, SseWriterRunErrorHandlerType } from './SseTypes';
import type { SseWriterInterface } from './SseWriterInterface';

/**
 * {@link SseWriterInterface} 默认实现。
 */
export class SseWriter implements SseWriterInterface {
  constructor(protected readonly codec: SseCodecInterface = new SseCodec()) {}

  /**
   * @override
   */
  public encode(envelope: SseEnvelopeType): Uint8Array {
    return this.codec.encode(envelope);
  }

  /**
   * @override
   */
  public createReadableStream(
    run: (write: (envelope: SseEnvelopeType) => void) => Promise<void>,
    options?: {
      readonly onRunError?: SseWriterRunErrorHandlerType;
    }
  ): ReadableStream<Uint8Array> {
    return new ReadableStream<Uint8Array>({
      start: async (
        controller: ReadableStreamDefaultController<Uint8Array>
      ): Promise<void> => {
        const write = (envelope: SseEnvelopeType): void => {
          controller.enqueue(this.codec.encode(envelope));
        };
        try {
          await run(write);
        } catch (error: unknown) {
          if (this.isAbortError(error)) {
            return;
          }
          options?.onRunError?.(error, write);
        } finally {
          controller.close();
        }
      }
    });
  }

  protected isAbortError(error: unknown): boolean {
    return (
      (error instanceof Error && error.name === 'AbortError') ||
      (typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        (error as { name: unknown }).name === 'AbortError')
    );
  }
}
