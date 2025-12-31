import isPromiseLib from 'is-promise';

/**
 * Check if a value is a Promise
 *
 * This function first checks if the value is an instance of Promise,
 * then uses the is-promise package for additional checks.
 * This ensures compatibility with various Promise implementations and
 * Promise-like objects.
 *
 * @param value - The value to check
 * @returns True if the value is a Promise, false otherwise
 *
 * @example
 * ```typescript
 * isPromise(Promise.resolve(1)); // true
 * isPromise({ then: () => {} }); // true (Promise-like)
 * isPromise(1); // false
 * ```
 */
export function isPromise(value: unknown): value is Promise<unknown> {
  // First check: native Promise instance (fastest check)
  if (value instanceof Promise) {
    return true;
  }
  // Second check: use is-promise package for Promise-like objects
  return isPromiseLib(value);
}
