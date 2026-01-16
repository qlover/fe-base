import { AbortError } from '../AbortError';

/**
 * Create an abort promise that rejects when the signal is aborted
 *
 * This function creates a promise that never resolves but rejects when the provided
 * abort signal is triggered. It's designed to be used with `Promise.race()` to implement
 * cancellable operations.
 *
 * Key features:
 * - Immediately rejects if signal is already aborted
 * - Listens for abort events and rejects accordingly
 * - Provides cleanup function to prevent memory leaks
 * - Uses signal's reason or creates default `AbortError`
 *
 * @param signal - The abort signal to monitor
 * @returns Object containing the abort promise and cleanup function
 *
 * @example
 * ```typescript
 * const controller = new AbortController();
 * const { promise, cleanup } = createAbortPromise(controller.signal);
 *
 * try {
 *   await Promise.race([fetchData(), promise]);
 * } finally {
 *   cleanup(); // Always cleanup to prevent memory leaks
 * }
 * ```
 */
export function createAbortPromise(signal: AbortSignal): {
  promise: Promise<never>;
  cleanup: () => void;
} {
  let cleanup: () => void = () => {};

  const promise = new Promise<never>((_, reject) => {
    // If already aborted, immediately reject
    if (signal.aborted) {
      reject(signal.reason || new AbortError('The operation was aborted'));
      return;
    }

    // Listen for abort event
    const onAbort = () => {
      reject(signal.reason || new AbortError('The operation was aborted'));
    };

    signal.addEventListener('abort', onAbort);

    // Provide cleanup function to remove event listener
    cleanup = () => {
      signal.removeEventListener('abort', onAbort);
    };
  });

  return { promise, cleanup };
}

/**
 * Race a promise with an abort signal
 *
 * This utility function allows you to make any promise cancellable by racing it
 * against an abort signal. If the signal is aborted before the promise resolves,
 * the operation will be cancelled and an `AbortError` will be thrown.
 *
 * Core functionality:
 * - Returns original promise if no signal provided
 * - Throws immediately if signal is already aborted
 * - Races promise against abort signal
 * - Automatically cleans up event listeners to prevent memory leaks
 * - Preserves original promise result or error
 *
 * Use cases:
 * - Making network requests cancellable
 * - Implementing timeout for async operations
 * - Cancelling long-running computations
 * - User-initiated operation cancellation
 *
 * @param promise - The promise to race with abort signal
 * @param signal - Optional abort signal to cancel the operation
 * @returns Promise that resolves/rejects with original promise result, or rejects with `AbortError` if aborted
 *
 * @throws {AbortError} When the signal is aborted before promise completes
 *
 * @example Basic usage
 * ```typescript
 * const controller = new AbortController();
 *
 * try {
 *   const result = await raceWithAbort(
 *     fetch('https://api.example.com/data'),
 *     controller.signal
 *   );
 *   console.log('Success:', result);
 * } catch (error) {
 *   if (error instanceof AbortError) {
 *     console.log('Operation cancelled');
 *   }
 * }
 * ```
 *
 * @example With timeout
 * ```typescript
 * const controller = new AbortController();
 * setTimeout(() => controller.abort(), 5000);
 *
 * const data = await raceWithAbort(
 *   fetchLargeData(),
 *   controller.signal
 * );
 * ```
 *
 * @example Without signal (no cancellation)
 * ```typescript
 * // Works normally without signal
 * const result = await raceWithAbort(somePromise());
 * ```
 */
export function raceWithAbort<T>(
  promise: Promise<T>,
  signal?: AbortSignal
): Promise<T> {
  if (!signal) {
    return promise;
  }

  signal.throwIfAborted();

  const { promise: abortPromise, cleanup } = createAbortPromise(signal);

  // Use Promise.race - whichever completes first wins
  return Promise.race([promise, abortPromise]).finally(() => {
    // Always cleanup event listener to prevent memory leaks
    cleanup();
  });
}
