import { StreamProcessorInterface } from './StreamProcessorInterface';

/**
 * Stream event handler for processing stream data
 *
 * Core functionality:
 * - Manages streaming data processing lifecycle
 * - Buffers and processes data chunks
 * - Tracks stream state and processing statistics
 * - Handles binary and text data conversion
 *
 * Implementation details:
 * - Uses TextDecoder for binary data conversion
 * - Maintains buffer for incomplete chunks
 * - Tracks number of processed chunks
 * - Preserves last processed message
 *
 * Business rules:
 * - Processes chunks sequentially to maintain data integrity
 * - Handles both binary (ArrayBuffer) and text data
 * - Preserves partial data between chunks
 * - Provides final data processing on stream end
 *
 * @example Basic usage
 * ```typescript
 * const processor = new LineStreamProcessor();
 * const event = new StreamEvent(processor);
 *
 * // Process chunks
 * event.append("chunk1\n");
 * const messages = event.processBuffer();
 *
 * // Finish stream
 * const final = event.doned();
 * ```
 */
export class StreamEvent {
  constructor(
    /**
     * Stream processor implementation for chunk processing
     *
     * Determines how raw chunks are converted to messages
     *
     * @param chunk - Raw chunk data from stream
     * @returns Array of processed messages
     */
    protected readonly processor: StreamProcessorInterface,

    /**
     * Text decoder for binary data conversion
     *
     * Used when processing ArrayBuffer chunks
     *
     * @default new TextDecoder()
     */
    protected readonly decoder: TextDecoder = new TextDecoder()
  ) {}

  /**
   * Number of chunks processed
   *
   * Tracks how many chunks have been processed through parseChunk
   * Useful for monitoring stream progress and debugging
   */
  private _times: number = 0;
  get times(): number {
    return this._times;
  }

  /**
   * Last successfully processed message
   *
   * Preserved for:
   * - Fallback when final processing yields no results
   * - Stream state tracking and debugging
   * - Message continuity verification
   *
   * @private
   */
  private lastMessage?: string;

  /**
   * Buffer for incomplete data chunks
   *
   * Used to:
   * - Store chunks until they can be processed
   * - Handle partial messages across chunk boundaries
   * - Manage processing order and data integrity
   *
   * @private
   */
  private bufferChunks: string[] = [];

  /**
   * Stream completion flag
   *
   * Indicates whether the stream has finished processing
   * Used to prevent further processing after stream end
   */
  private _finish: boolean = false;
  get finish(): boolean {
    return this._finish;
  }

  /**
   * Parse raw chunk data into string format
   *
   * Processing steps:
   * 1. Increment chunk counter
   * 2. Check chunk type (ArrayBuffer or other)
   * 3. Convert chunk to string format
   *
   * Business rules:
   * - ArrayBuffer chunks are decoded using TextDecoder
   * - Other types are converted using String()
   * - Maintains chunk count for monitoring
   *
   * @param chunk - Raw chunk data (binary or text)
   * @returns Decoded string from chunk
   *
   * @example Binary data
   * ```typescript
   * const binaryChunk = new Uint8Array([104, 101, 108, 108, 111]); // "hello"
   * const text = event.parseChunk(binaryChunk);
   * ```
   */
  parseChunk<R>(chunk: R): string {
    this._times++;

    // Check if chunk is ArrayBuffer or ArrayBufferView
    if (chunk instanceof ArrayBuffer || ArrayBuffer.isView(chunk)) {
      return this.decoder.decode(chunk);
    }

    // For other types, try to convert to string
    return String(chunk);
  }

  /**
   * Process buffered chunks into complete messages
   *
   * Processing steps:
   * 1. Check buffer for content
   * 2. Process each chunk sequentially
   * 3. Update last message tracking
   * 4. Clear processed chunks
   *
   * Business rules:
   * - Maintains chunk processing order
   * - Preserves last complete message
   * - Processes all buffered chunks
   * - Returns empty array if no chunks
   *
   * @returns Array of processed messages
   *
   * @example
   * ```typescript
   * event.append("message1\n");
   * event.append("message2\n");
   * const messages = event.processBuffer();
   * // Result: ["message1", "message2"]
   * ```
   */
  processBuffer(): string[] {
    if (this.bufferChunks.length === 0) {
      return [];
    }

    const messages: string[] = [];
    // Process each chunk individually
    while (this.bufferChunks.length > 0) {
      const chunk = this.bufferChunks.shift();
      if (chunk) {
        const processedMessages = this.processor.processChunk(chunk);
        messages.push(...processedMessages);
        if (processedMessages.length > 0) {
          this.lastMessage = processedMessages[processedMessages.length - 1];
        }
      }
    }
    return messages;
  }

  /**
   * Append new chunk to processing buffer
   *
   * Business rules:
   * - Only non-empty chunks are buffered
   * - Maintains chunk order for processing
   * - Does not process chunks immediately
   *
   * @param chunk - New chunk data to buffer
   */
  append(chunk: string): void {
    if (chunk.length > 0) {
      this.bufferChunks.push(chunk);
    }
  }

  /**
   * Process final data when stream is complete
   *
   * Processing steps:
   * 1. Mark stream as finished
   * 2. Check for remaining buffered data
   * 3. Process remaining data if any
   * 4. Clear buffer after processing
   *
   * Business rules:
   * - Returns last message if buffer is empty
   * - Processes remaining buffer as final data
   * - Clears buffer after final processing
   * - Falls back to last message if final processing yields nothing
   *
   * @returns Final processed message or last known message
   *
   * @example
   * ```typescript
   * event.append("final chunk");
   * const lastMessage = event.doned();
   * ```
   */
  doned(): string | undefined {
    this.finished();
    if (this.bufferChunks.length === 0) {
      return this.lastMessage;
    }
    // Join remaining chunks for final processing
    const finalData = this.processor.processFinal(this.bufferChunks.join(''));
    this.bufferChunks = [];
    return finalData ?? this.lastMessage;
  }

  /**
   * Mark stream as finished
   *
   * This method:
   * - Sets the finish flag to true
   * - Prevents further chunk processing
   * - Indicates stream completion
   *
   * Used in conjunction with doned() to handle stream completion
   */
  finished(): void {
    this._finish = true;
  }

  /**
   * Check if stream is finished
   *
   * @returns True if stream is marked as finished, false otherwise
   */
  isFinished(): boolean {
    return this._finish;
  }
}
