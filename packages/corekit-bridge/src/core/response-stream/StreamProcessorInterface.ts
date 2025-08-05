/**
 * Stream processor interface for custom stream data processing
 *
 * Core functionality:
 * - Defines standard interface for stream data processing
 * - Handles chunk-based data processing
 * - Manages stream completion and remaining data
 * - Supports custom data formats and protocols
 *
 * Implementation requirements:
 * - Must handle partial data between chunks
 * - Must process data in sequential order
 * - Must handle stream completion properly
 * - Should be stateless for processing operations
 *
 * Common implementations:
 * - Line-based processing (split by newlines)
 * - SSE (Server-Sent Events) processing
 * - JSON stream processing
 * - Custom protocol processing
 *
 * @example Basic implementation
 * ```typescript
 * class CustomProcessor implements StreamProcessorInterface {
 *   processChunk(chunk: string): string[] {
 *     return chunk.split(',').map(item => item.trim());
 *   }
 *
 *   processFinal(data: string): string | undefined {
 *     return data.trim() || undefined;
 *   }
 * }
 * ```
 */
export interface StreamProcessorInterface {
  /**
   * Process a chunk of data from the stream
   *
   * Implementation requirements:
   * - Must handle partial data at chunk boundaries
   * - Must maintain data integrity across chunks
   * - Should filter invalid or incomplete data
   * - Should handle empty chunks gracefully
   *
   * Common processing steps:
   * 1. Parse raw chunk data
   * 2. Split into individual items if needed
   * 3. Filter and validate items
   * 4. Transform items to desired format
   *
   * @param chunk - The raw chunk data from stream
   * @returns Array of processed data items
   *
   * @example
   * ```typescript
   * // Line-based processing example
   * processChunk(chunk: string): string[] {
   *   return chunk
   *     .split('\n')
   *     .map(line => line.trim())
   *     .filter(line => line !== '');
   * }
   * ```
   */
  processChunk(chunk: string): string[];

  /**
   * Process remaining data when stream ends
   *
   * Implementation requirements:
   * - Must handle any remaining partial data
   * - Must maintain consistency with processChunk
   * - Should handle empty remaining data
   * - Should return undefined if no valid data
   *
   * Common scenarios:
   * - Partial line or message at stream end
   * - Incomplete protocol frame
   * - Buffered data needing final processing
   * - Clean up of any processing state
   *
   * @param data - Remaining unprocessed data from the stream
   * @returns Final processed data item if valid, undefined otherwise
   *
   * @example
   * ```typescript
   * // Handle remaining partial data
   * processFinal(data: string): string | undefined {
   *   const trimmed = data.trim();
   *   return trimmed !== '' ? trimmed : undefined;
   * }
   * ```
   */
  processFinal(data: string): string | undefined;
}
