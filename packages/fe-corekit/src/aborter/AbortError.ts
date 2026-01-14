import { ExecutorError } from '../executor/interface';

/**
 * Error identifier constant for abort-related errors
 *
 * Used to identify abort errors in error handling logic.
 * This constant is used as the error ID when creating `AbortError` instances.
 *
 * @example
 * ```typescript
 * if (error instanceof ExecutorError && error.id === ABORT_ERROR_ID) {
 *   console.log('This is an abort error');
 * }
 * ```
 */
export const ABORT_ERROR_ID = 'ABORT_ERROR';

/**
 * Custom error class for abort operations
 *
 * Extends `ExecutorError` to provide abort-specific error information,
 * including abort identifiers and timeout details.
 *
 * Core features:
 * - Abort identification: Tracks which operation was aborted via `abortId`
 * - Timeout tracking: Records timeout duration when abort is timeout-triggered
 * - Standard error properties: Inherits `message`, `name`, `stack` from Error
 *
 * @example Manual abort
 * ```typescript
 * throw new AbortError('User cancelled the upload', 'upload-123');
 * ```
 *
 * @example Timeout abort
 * ```typescript
 * throw new AbortError('Request timed out', 'api-call-456', 5000);
 * ```
 *
 * @example Minimal abort
 * ```typescript
 * throw new AbortError('Operation aborted');
 * ```
 */
export class AbortError extends ExecutorError {
  public readonly name = 'AbortError';

  /**
   * Unique identifier for the aborted operation
   *
   * Helps track and identify which specific operation was aborted.
   * Corresponds to the `abortId` from abort configuration.
   *
   * @optional
   * @example `"fetch-user-profile-123"`
   * @example `"upload-file-456"`
   */
  public readonly abortId?: string;

  /**
   * Timeout duration in milliseconds
   *
   * Only populated when abort was triggered by a timeout.
   * Used to distinguish between manual aborts and timeout-based aborts.
   *
   * @optional
   * @example `5000` // 5 seconds timeout
   */
  public readonly timeout?: number;

  /**
   * Creates a new AbortError instance
   *
   * @param message - Human-readable error message describing why the operation was aborted
   * @param abortId - Optional identifier for the aborted operation
   * @param timeout - Optional timeout duration in milliseconds (indicates timeout-based abort)
   */
  constructor(message: string, abortId?: string, timeout?: number) {
    super(ABORT_ERROR_ID, message);
    this.abortId = abortId;
    this.timeout = timeout;
  }
}

/**
 * Checks if an error is abort-related
 *
 * Comprehensive check for various abort error types. Can be used independently
 * without aborter instance to detect abort errors in catch blocks.
 *
 * Detection logic (in order):
 * 1. Custom `AbortError` instance (this module)
 * 2. `DOMException` with name 'AbortError' or 'TimeoutError' (browser/Node.js native)
 * 3. `ExecutorError` with `ABORT_ERROR_ID` (executor system)
 * 4. `Event` with type 'abort' (signal event)
 * 5. Native `Error` with name 'AbortError' (fetch API)
 *
 * @param error - Error object to check
 * @returns `true` if error is abort-related, `false` otherwise
 *
 * @example Basic usage
 * ```typescript
 * try {
 *   await fetch(url, { signal });
 * } catch (error) {
 *   if (isAbortError(error)) {
 *     console.log('Request was cancelled');
 *   } else {
 *     console.error('Request failed:', error);
 *   }
 * }
 * ```
 *
 * @example In error handler
 * ```typescript
 * function handleError(error: unknown) {
 *   if (isAbortError(error)) {
 *     // User cancelled - don't show error message
 *     return;
 *   }
 *   showErrorNotification(error);
 * }
 * ```
 *
 * @example Distinguish timeout from manual abort
 * ```typescript
 * catch (error) {
 *   if (isAbortError(error)) {
 *     if (error instanceof AbortError && error.timeout) {
 *       console.log(`Operation timed out after ${error.timeout}ms`);
 *     } else {
 *       console.log('Operation was manually cancelled');
 *     }
 *   }
 * }
 * ```
 */
export function isAbortError(error?: unknown): boolean {
  if (error instanceof AbortError) {
    return true;
  }

  // Note: DOMException is used by native AbortSignal.timeout()
  // TimeoutError is the standard name for timeout-related aborts
  if (
    typeof DOMException !== 'undefined' &&
    error instanceof DOMException &&
    (error.name === 'AbortError' || error.name === 'TimeoutError')
  ) {
    return true;
  }

  if (error instanceof ExecutorError && error?.id === ABORT_ERROR_ID) {
    return true;
  }

  // Note: Event type check for signal.addEventListener('abort', handler)
  if (error instanceof Event && error.type === 'abort') {
    return true;
  }

  // Note: Native fetch API throws Error with name 'AbortError'
  if (error instanceof Error && error.name === 'AbortError') {
    return true;
  }

  return false;
}
