/**
 * Custom error class for executor operations.
 *
 * This class provides a structured way to handle errors that occur during executor operations.
 * It extends the standard Error class to include an error identification string, which can be used
 * to categorize and manage errors more effectively.
 *
 * @category Executor
 *
 * @example
 * ```typescript
 * try {
 *   // some executor operation
 * } catch (error) {
 *   throw new ExecutorError('EXECUTOR_ERROR', error);
 * }
 * ```
 */
export class ExecutorError extends Error {
  /**
   * Constructs a new ExecutorError.
   *
   * if originalError is a string, it will be used as the error message.
   * if originalError is an Error object, its message will be used as the error message.
   * if originalError is not provided, the error message will be the id.
   *
   * @param id - A unique identifier for the error, used for categorization and tracking.
   * @param originalError - The original error message or Error object that triggered this error.
   *                        This parameter is optional.
   */
  constructor(
    public id: string,
    originalError?: string | Error
  ) {
    super(
      typeof originalError === 'string'
        ? originalError
        : originalError?.message || id
    );

    if (originalError instanceof Error && 'stack' in originalError) {
      // TODO: merge stacks
      // this.stack = this.getMergedStack(originalError.stack!, this.stack!);
    }

    Object.setPrototypeOf(this, new.target.prototype);
  }

  getMergedStack(originalStack: string, newStack: string): string {
    const originalLines = originalStack.split('\n');
    const newLines = newStack.split('\n');

    // Find the index where the new stack starts to repeat the original stack
    let startIndex = newLines.length;
    for (let i = 0; i < newLines.length; i++) {
      if (originalLines.includes(newLines[i])) {
        startIndex = i;
        break;
      }
    }

    // Merge stacks, avoiding repetition
    return [...originalLines, ...newLines.slice(startIndex)].join('\n');
  }
}
