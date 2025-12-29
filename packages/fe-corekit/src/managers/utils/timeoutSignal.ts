import type { ClearableSignal } from 'any-signal';

/**
 * Maximum timeout value that setTimeout can handle reliably (32-bit signed integer max)
 * Values larger than this will be clamped to prevent immediate timeout
 */
const MAX_TIMEOUT_MS = 2147483647; // 2^31 - 1 (approximately 24.8 days)

/**
 * Creates an AbortSignal that triggers after a specified timeout
 *
 * @param ms - Timeout duration in milliseconds
 * @returns AbortSignal that will be aborted after the timeout
 */
export function timeoutSignal(ms: number): ClearableSignal | AbortSignal {
  if (typeof AbortSignal.timeout === 'function') {
    // Native API may throw for invalid values, so we handle them in fallback
    if (!Number.isFinite(ms) || ms < 0) {
      // Fall through to fallback implementation for invalid values
    } else {
      try {
        return AbortSignal.timeout(ms);
      } catch {
        // If native API throws (e.g., for very large values), fall back
      }
    }
  }

  const controller = new AbortController();

  // Clamp timeout to maximum safe value to prevent immediate timeout
  // Handle invalid values: NaN, Infinity, negative numbers
  const safeTimeout = Number.isFinite(ms) && ms >= 0
    ? Math.min(ms, MAX_TIMEOUT_MS)
    : MAX_TIMEOUT_MS;

  const timeoutId = setTimeout(() => {
    controller.abort(
      new DOMException('The operation timed out', 'TimeoutError')
    );
  }, safeTimeout);

  // Create a proper ClearableSignal by extending the signal
  const signal = controller.signal as ClearableSignal;
  signal.clear = () => clearTimeout(timeoutId);

  return signal;
}
