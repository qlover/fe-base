import type { ClearableSignal } from 'any-signal';

/**
 * Maximum timeout value that setTimeout can handle reliably
 *
 * JavaScript's setTimeout uses a 32-bit signed integer for delay,
 * limiting the maximum value to 2^31 - 1 milliseconds (~24.8 days).
 * Values larger than this will be clamped to prevent immediate timeout.
 */
const MAX_TIMEOUT_MS = 2147483647; // 2^31 - 1 (~24.8 days)

/**
 * Creates an AbortSignal that triggers after a specified timeout
 *
 * Automatically uses the best available implementation:
 * - Native `AbortSignal.timeout()` (Node.js 17.3+, modern browsers) for optimal performance
 * - Manual timer implementation for older environments (Node.js 16-17.2)
 *
 * Key features:
 * - Aborts with `TimeoutError` DOMException for standard error handling
 * - Provides `clear()` method to cancel timeout and prevent memory leaks
 * - Handles invalid timeout values gracefully (NaN, Infinity, negative)
 * - Clamps large timeouts to maximum safe value
 *
 * Timeout behavior:
 * - Valid timeout: Aborts after specified milliseconds
 * - Invalid timeout (NaN, Infinity, negative): Uses maximum safe timeout
 * - Zero timeout: Aborts immediately on next tick
 *
 * @param ms - Timeout duration in milliseconds
 * @returns ClearableSignal or AbortSignal that aborts after timeout
 *
 * @example Basic usage
 * ```typescript
 * const signal = timeoutSignal(5000);
 * try {
 *   await fetch('/api/data', { signal });
 * } finally {
 *   signal.clear(); // Cancel timeout if request completes early
 * }
 * ```
 *
 * @example With error handling
 * ```typescript
 * const signal = timeoutSignal(3000);
 * try {
 *   const response = await fetch('/api/data', { signal });
 *   return await response.json();
 * } catch (error) {
 *   if (error.name === 'TimeoutError') {
 *     console.log('Request timed out after 3 seconds');
 *   }
 *   throw error;
 * } finally {
 *   signal.clear();
 * }
 * ```
 *
 * @example Immediate timeout
 * ```typescript
 * const signal = timeoutSignal(0); // Aborts immediately
 * ```
 *
 * @example Long timeout
 * ```typescript
 * const signal = timeoutSignal(86400000); // 24 hours
 * ```
 */
export function timeoutSignal(ms: number): ClearableSignal | AbortSignal {
  // Note: Use native AbortSignal.timeout() when available (Node.js 17.3+)
  if (typeof AbortSignal.timeout === 'function') {
    if (Number.isFinite(ms) && ms >= 0) {
      try {
        return AbortSignal.timeout(ms);
      } catch {
        // Note: Fall through to manual implementation if native API throws
      }
    }
  }

  // Note: Manual implementation for older environments
  const controller = new AbortController();

  // Important: Clamp timeout to maximum safe value to prevent immediate timeout
  // Handle invalid values: NaN, Infinity, negative numbers
  const safeTimeout = Number.isFinite(ms) && ms >= 0
    ? Math.min(ms, MAX_TIMEOUT_MS)
    : MAX_TIMEOUT_MS;

  const timeoutId = setTimeout(() => {
    controller.abort(new DOMException('The operation timed out', 'TimeoutError'));
  }, safeTimeout);

  const signal = controller.signal as ClearableSignal;
  signal.clear = () => clearTimeout(timeoutId);

  return signal;
}
