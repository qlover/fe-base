/**
 * Append or set a header value to headers object
 *
 * This function supports both plain objects and Web API Headers objects.
 * For plain objects, it returns a new object (immutable).
 * For Headers objects, it modifies the original object.
 * If headers is null or undefined, it creates a new object.
 *
 * @param headers - The headers object (plain object, Headers instance, or null/undefined)
 * @param key - The header key to set
 * @param value - The header value (will be converted to string)
 * @returns The headers object (new object for plain objects/null/undefined, same reference for Headers)
 *
 * @example
 * ```typescript
 * // Plain object (returns new object)
 * const headers = { 'Accept': 'application/json' };
 * const newHeaders = appendHeaders(headers, 'Content-Type', 'application/json');
 * // headers !== newHeaders (new object)
 *
 * // Null/undefined (creates new object)
 * const newHeaders2 = appendHeaders(null, 'Content-Type', 'application/json');
 * // newHeaders2 = { 'Content-Type': 'application/json' }
 *
 * // Headers object (modifies original)
 * const headersObj = new Headers();
 * appendHeaders(headersObj, 'Content-Type', 'application/json');
 * // headersObj is modified
 * ```
 */
export function appendHeaders<T extends Record<string, unknown> | Headers>(
  headers: T | null | undefined,
  key: string,
  value: string | number | boolean
): T {
  // Handle null or undefined - create a new object
  if (!headers) {
    return { [key]: value } as T;
  }

  // Handle Web API Headers object
  if (headers instanceof Headers) {
    headers.set(key, String(value));
    return headers as T;
  }

  // Handle plain object (return new object for immutability)
  return {
    ...headers,
    [key]: value
  } as T;
}
