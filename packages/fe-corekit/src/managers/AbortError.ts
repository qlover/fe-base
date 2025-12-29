import { ExecutorError } from '../executor/interface';

/**
 * Error identifier constant for abort-related errors
 *
 * Used to identify abort errors in error handling logic.
 * This constant is used as the error ID when creating `AbortError` instances
 * and can be checked to distinguish abort errors from other executor errors.
 *
 * @see {@link AbortError} for the error class that uses this ID
 * @see {@link AbortManager} for abort error detection utilities
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
 * Extends `ExecutorError` to provide rich abort-specific error information,
 * including abort identifiers and timeout details
 *
 * Core features:
 * - Abort identification: Tracks which operation was aborted via `abortId`
 * - Timeout tracking: Records timeout duration when abort is timeout-triggered
 */
export class AbortError extends ExecutorError {
  /**
   * Unique identifier for the aborted operation
   *
   * Helps track and identify which specific operation was aborted
   * Corresponds to `id` from `AbortManagerId`
   *
   * @optional
   * @example `"fetch-user-profile-123"`
   * @example `"upload-file-456"`
   */
  public readonly abortId?: string;

  /**
   * Timeout duration in milliseconds
   *
   * Only populated when abort was triggered by a timeout
   * Used to distinguish between manual aborts and timeout-based aborts
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
   *
   * @example Manual abort
   * ```typescript
   * new AbortError('User cancelled the upload', 'upload-123')
   * ```
   *
   * @example Timeout abort
   * ```typescript
   * new AbortError('Request exceeded time limit', 'api-call-456', 5000)
   * ```
   *
   * @example Minimal abort
   * ```typescript
   * new AbortError('Operation aborted')
   * ```
   */
  constructor(message: string, abortId?: string, timeout?: number) {
    super(ABORT_ERROR_ID, message);
    this.abortId = abortId;
    this.timeout = timeout;
  }
}

/**
 * Checks if an error is abort-related (static utility method)
 *
 * Comprehensive check for various abort error types including custom `AbortError`,
 * native browser `AbortError`, `ExecutorError` with abort ID, `DOMException`,
 * and abort events. Can be used independently without pool instance.
 *
 * Detection logic:
 * 1. Custom `AbortError` instance
 * 2. Native `Error` with name 'AbortError'
 * 3. `ExecutorError` with `ABORT_ERROR_ID`
 * 4. `DOMException` with name 'AbortError'
 * 5. `Event` with type 'abort'
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
 */
export function isAbortError(error?: unknown): boolean {
  // Check if the error is our custom AbortError
  if (error instanceof AbortError) {
    return true;
  }

  // Check for DOMException with abort-related message
  // If DOMException is not defined in Node.js 16, we need to import it
  //  if (typeof DOMException === 'undefined') {
  //   const { DOMException } = require('util');
  //   globalThis.DOMException = DOMException;
  // }
  if (
    typeof DOMException !== 'undefined' &&
    error instanceof DOMException &&
    // TimeoutError is not a standard error name, but it is used by the browser to indicate a timeout error
    // The signal aborts with a TimeoutError DOMException on timeout.
    // https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout#timeouterror
    (error.name === 'AbortError' || error.name === 'TimeoutError')
  ) {
    return true;
  }

  // Check if the error is an ExecutorError with ABORT_ERROR_ID
  if (error instanceof ExecutorError && error?.id === ABORT_ERROR_ID) {
    return true;
  }

  // Check for Event with auto trigger abort
  // use: signal.addEventListener('abort')
  if (error instanceof Event && error.type === 'abort') {
    return true;
  }

  // Check if the error is an instance of AbortError
  if (error instanceof Error && error.name === 'AbortError') {
    return true;
  }

  // Add any additional conditions that signify an abort error
  // For example, custom error types or specific error codes

  return false;
}
