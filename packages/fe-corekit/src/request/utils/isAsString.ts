/**
 * Type guard function to check if a value is a string
 * Optionally compares the string with a target value
 *
 * @param value - The value to check
 * @param compareTo - Optional string to compare against
 * @param caseSensitive - Optional flag to control case sensitivity (default: true)
 * @returns True if value is a string and (if compareTo is provided) matches the target string
 *
 * @example Basic type guard
 * ```typescript
 * const value: unknown = 'hello';
 * if (isAsString(value)) {
 *   // value is now typed as string
 *   console.log(value.toUpperCase());
 * }
 * ```
 *
 * @example With comparison
 * ```typescript
 * isAsString('hello', 'hello'); // true
 * isAsString('hello', 'world'); // false
 * isAsString('Hello', 'hello', false); // true (case insensitive)
 * isAsString('Hello', 'hello', true); // false (case sensitive)
 * ```
 */
export function isAsString(
  value: unknown,
  compareTo?: string,
  caseSensitive: boolean = true
): value is string {
  // First check if value is a string
  if (typeof value !== 'string') {
    return false;
  }

  // If compareTo is provided, compare the strings
  if (compareTo !== undefined) {
    if (caseSensitive) {
      return value === compareTo;
    } else {
      return value.toLowerCase() === compareTo.toLowerCase();
    }
  }

  // If no comparison is needed, just return true (value is a string)
  return true;
}

/**
 * Internal helper function to find a key in an object and return its value
 *
 * @param obj - The object to search
 * @param key - The key to look for
 * @param caseSensitive - Whether key lookup is case-sensitive
 * @returns Object with found flag and value, or null if not found
 */
function findObjectKeyValue(
  obj: Record<string, unknown>,
  key: string,
  caseSensitive: boolean
): { found: true; value: unknown; actualKey: string } | { found: false } {
  if (caseSensitive) {
    if (key in obj) {
      return { found: true, value: obj[key], actualKey: key };
    }
    return { found: false };
  }

  // Case-insensitive lookup
  const lowerKey = key.toLowerCase();
  for (const objKey in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, objKey)) {
      if (objKey.toLowerCase() === lowerKey) {
        return { found: true, value: obj[objKey], actualKey: objKey };
      }
    }
  }

  return { found: false };
}

/**
 * Type guard function to check if an object has a specific key
 * Optionally performs case-insensitive key lookup
 *
 * This function is a type guard that provides type narrowing.
 * For value checking, use `hasObjectKeyWithValue` instead.
 *
 * @param obj - The object to check
 * @param key - The key to look for
 * @param caseSensitive - Optional flag to control case sensitivity (default: true)
 * @returns True if obj is an object and contains the specified key
 *
 * @example Basic key check
 * ```typescript
 * const obj: unknown = { name: 'John', age: 30 };
 * if (hasObjectKey(obj, 'name')) {
 *   // obj is now typed as Record<string, unknown> & { name: unknown }
 *   console.log(obj.name); // TypeScript knows 'name' exists
 * }
 * ```
 *
 * @example Case-sensitive (default)
 * ```typescript
 * const obj: unknown = { Name: 'John' };
 * hasObjectKey(obj, 'name'); // false
 * if (hasObjectKey(obj, 'Name')) {
 *   // obj is typed as Record<string, unknown> & { Name: unknown }
 *   console.log(obj.Name); // Type-safe access
 * }
 * ```
 *
 * @example Case-insensitive
 * ```typescript
 * const obj: unknown = { Name: 'John' };
 * if (hasObjectKey(obj, 'name', false)) {
 *   // obj is typed as Record<string, unknown>
 *   console.log(obj.name); // Can access, but type is less precise
 * }
 * ```
 */
export function hasObjectKey<
  T extends Record<string, unknown>,
  K extends string
>(
  obj: unknown,
  key: K,
  caseSensitive?: true
): obj is T & Record<K, unknown>;

export function hasObjectKey<T extends Record<string, unknown>>(
  obj: unknown,
  key: string,
  caseSensitive: false
): obj is T;

export function hasObjectKey<
  T extends Record<string, unknown>,
  K extends string
>(
  obj: unknown,
  key: K | string,
  caseSensitive: boolean = true
): obj is T & Record<K, unknown> {
  // Check if obj is an object and not null
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const result = findObjectKeyValue(obj as Record<string, unknown>, key, caseSensitive);
  return result.found;
}

/**
 * Check if an object has a specific key with a specific value
 *
 * This function checks if an object contains a key and optionally verifies
 * that the value matches a target value. Supports case-insensitive key lookup
 * and case-sensitive/case-insensitive value comparison.
 *
 * When value is not provided, this function behaves similarly to `hasObjectKey`,
 * but without type narrowing. Use `hasObjectKey` if you need type guards.
 *
 * @param obj - The object to check
 * @param key - The key to look for
 * @param value - The value to compare against (optional)
 * @param options - Options for key and value matching
 * @param options.keyCaseSensitive - Whether key lookup is case-sensitive (default: true)
 * @param options.valueCaseSensitive - Whether value comparison is case-sensitive (default: true)
 * @returns True if obj has the key and (if value provided) the value matches
 *
 * @example Basic key check
 * ```typescript
 * const obj = { 'Content-Type': 'application/json' };
 * hasObjectKeyWithValue(obj, 'Content-Type'); // true
 * ```
 *
 * @example Key with value check
 * ```typescript
 * const obj = { 'Content-Type': 'application/json' };
 * hasObjectKeyWithValue(obj, 'Content-Type', 'application/json'); // true
 * hasObjectKeyWithValue(obj, 'Content-Type', 'text/html'); // false
 * ```
 *
 * @example Case-insensitive key lookup
 * ```typescript
 * const obj = { 'Content-Type': 'application/json' };
 * hasObjectKeyWithValue(obj, 'content-type', 'application/json', { keyCaseSensitive: false }); // true
 * ```
 *
 * @example Case-insensitive value comparison
 * ```typescript
 * const obj = { 'Content-Type': 'Application/JSON' };
 * hasObjectKeyWithValue(obj, 'Content-Type', 'application/json', { valueCaseSensitive: false }); // true
 * ```
 */
export function hasObjectKeyWithValue(
  obj: unknown,
  key: string,
  value?: unknown,
  options?: {
    keyCaseSensitive?: boolean;
    valueCaseSensitive?: boolean;
  }
): boolean {
  // Check if obj is an object and not null
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const keyCaseSensitive = options?.keyCaseSensitive ?? true;
  const result = findObjectKeyValue(
    obj as Record<string, unknown>,
    key,
    keyCaseSensitive
  );

  // If key not found, return false
  if (!result.found) {
    return false;
  }

  // If no value provided, just check if key exists
  if (value === undefined) {
    return true;
  }

  // Compare values
  const valueCaseSensitive = options?.valueCaseSensitive ?? true;
  if (valueCaseSensitive) {
    return result.value === value;
  } else {
    // Case-insensitive comparison for strings
    if (typeof result.value === 'string' && typeof value === 'string') {
      return result.value.toLowerCase() === value.toLowerCase();
    }
    return result.value === value;
  }
}
