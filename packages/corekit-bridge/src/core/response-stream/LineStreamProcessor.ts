import { StreamProcessorInterface } from './StreamProcessorInterface';

/**
 * Default line-based stream processor
 *
 * Core functionality:
 * - Processes incoming stream data by line breaks
 * - Handles partial line data between chunks
 * - Trims whitespace and filters empty lines
 * - Supports custom line separator configuration
 *
 * Implementation details:
 * - Uses string split operation for line separation
 * - Automatically trims whitespace from each line
 * - Filters out empty lines after trimming
 * - Processes remaining data when stream ends
 *
 * @example Basic usage with default separator
 * ```typescript
 * const processor = new LineStreamProcessor();
 * const lines = processor.processChunk("line1\nline2\nline3");
 * // Result: ["line1", "line2", "line3"]
 * ```
 *
 * @example Custom separator usage
 * ```typescript
 * const processor = new LineStreamProcessor("\r\n");
 * const lines = processor.processChunk("line1\r\nline2\r\nline3");
 * // Result: ["line1", "line2", "line3"]
 * ```
 */
export class LineStreamProcessor implements StreamProcessorInterface {
  /**
   * Creates a new line-based stream processor
   *
   * @param separator - Line separator string
   *                   Used to split incoming data into lines
   *                   Common values: '\n' (Unix), '\r\n' (Windows)
   * @default '\n'
   */
  constructor(private readonly separator: string = '\n') {}

  /**
   * Process a chunk of data into separate lines
   *
   * Processing steps:
   * 1. Split chunk by separator
   * 2. Trim whitespace from each line
   * 3. Filter out empty lines
   *
   * Business rules:
   * - Empty lines (after trimming) are excluded from output
   * - Whitespace is trimmed from both ends of each line
   * - Partial lines at chunk boundaries are handled by processFinal
   *
   * @param chunk - The raw chunk data from stream
   * @returns Array of processed non-empty lines
   *
   * @example
   * ```typescript
   * const lines = processor.processChunk("  line1  \n\n  line2  ");
   * // Result: ["line1", "line2"]
   * ```
   */
  processChunk(chunk: string): string[] {
    return chunk
      .split(this.separator)
      .map((line) => line.trim())
      .filter((line) => line !== '');
  }

  /**
   * Process remaining data when stream ends
   *
   * This method handles any remaining data that didn't end with a separator.
   * It ensures no data is lost at stream boundaries.
   *
   * Processing steps:
   * 1. Trim whitespace from remaining data
   * 2. Return trimmed data if non-empty
   * 3. Return undefined if empty after trimming
   *
   * @param data - Remaining data from the last chunk
   * @returns Processed data string if non-empty, undefined otherwise
   *
   * @example
   * ```typescript
   * const finalData = processor.processFinal("  last line  ");
   * // Result: "last line"
   * ```
   */
  processFinal(data: string): string | undefined {
    const trimmed = data.trim();
    return trimmed !== '' ? trimmed : undefined;
  }
}
