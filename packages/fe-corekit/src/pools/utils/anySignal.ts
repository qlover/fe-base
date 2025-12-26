import { anySignal as anySignalLib, type ClearableSignal } from 'any-signal';

/**
 * Creates a combined AbortSignal from multiple signals with cleanup capability
 *
 * This function prioritizes the native `AbortSignal.any()` when available (Node.js 20+, modern browsers),
 * falling back to the `any-signal` library for older environments.
 *
 * Key features:
 * - Uses native `AbortSignal.any()` when available for better performance and no memory leaks
 * - Falls back to `any-signal` library which provides manual cleanup via `clear()` method
 * - Handles null/undefined signals gracefully
 * - Propagates abort reasons correctly
 *
 * Performance notes:
 * - Native `AbortSignal.any()` is faster and doesn't require manual cleanup
 * - `any-signal` library requires calling `clear()` to prevent memory leaks
 *
 * @param signals - Array of AbortSignals to combine (null/undefined entries are filtered out)
 * @returns A ClearableSignal that aborts when any input signal aborts
 *
 * @example Basic usage
 * ```typescript
 * const controller1 = new AbortController();
 * const controller2 = new AbortController();
 *
 * const combined = anySignal([controller1.signal, controller2.signal]);
 *
 * try {
 *   await fetch('/api/data', { signal: combined });
 * } finally {
 *   combined.clear(); // Clean up listeners
 * }
 * ```
 *
 * @example With timeout
 * ```typescript
 * const controller = new AbortController();
 * const timeoutSig = timeoutSignal(5000);
 *
 * const combined = anySignal([controller.signal, timeoutSig]);
 *
 * try {
 *   await fetch('/api/data', { signal: combined });
 * } finally {
 *   combined.clear();
 * }
 * ```
 */
export function anySignal(
  signals: Array<AbortSignal | undefined | null>
): ClearableSignal {
  // Use native AbortSignal.any() if available (Node.js 20+, modern browsers)
  // Type assertion needed because TypeScript types may not include AbortSignal.any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const AbortSignalAny = (AbortSignal as any).any;
  if (typeof AbortSignalAny === 'function') {
    // Filter out null/undefined for native API
    const validSignals = signals.filter(
      (s): s is AbortSignal => s != null
    ) as AbortSignal[];

    // Native API requires at least one signal
    if (validSignals.length > 0) {
      const combinedSignal = AbortSignalAny(validSignals) as ClearableSignal;

      // Native AbortSignal.any() doesn't leak in modern environments,
      // but we still provide a clear() method for API consistency
      combinedSignal.clear = () => {
        // Native implementation handles cleanup automatically
        // This is a no-op for API compatibility
      };

      return combinedSignal;
    }
  }

  // Fallback: Use any-signal library for older environments
  // The library handles null/undefined filtering and empty arrays internally
  return anySignalLib(signals);
}

