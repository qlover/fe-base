/**
 * Simple shallow clone utility for objects and arrays
 *
 * Key features:
 * - Creates new object/array with same prototype
 * - Only copies top-level properties (shallow)
 * - Preserves object types (Date, RegExp, etc.)
 * - Works with class instances
 * - Designed to be used with Object.assign
 *
 * @example
 * ```ts
 * const original = { a: 1, b: { c: 2 } };
 * const cloned = clone(original);
 * const updated = Object.assign(cloned, { a: 2 });
 *
 * // Array cloning
 * const arr = [1, 2, { a: 3 }];
 * const clonedArr = clone(arr);
 * ```
 */
export function clone<T>(value: T): T {
  // Handle primitives and null/undefined
  if (value == null || typeof value !== 'object') {
    return value;
  }

  // Handle Arrays
  if (Array.isArray(value)) {
    return [...value] as T;
  }

  // Handle special objects that can be copied by constructor
  if (value instanceof Date) {
    return new Date(value) as T;
  }
  if (value instanceof RegExp) {
    return new RegExp(value) as T;
  }
  if (value instanceof Set) {
    return new Set(value) as T;
  }
  if (value instanceof Map) {
    return new Map(value) as T;
  }

  // Handle plain objects and class instances
  return Object.assign(Object.create(Object.getPrototypeOf(value)), value);
}
