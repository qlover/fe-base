import { RequestAdapterResponse } from '../interface/RequestAdapter';

/**
 * Type guard function to check if a value is a RequestAdapterResponse
 *
 * Checks if the value has the structure of a RequestAdapterResponse object,
 * verifying that it has all required properties: response, status, statusText, headers, and config.
 *
 * @param value - The value to check
 * @returns True if value is a RequestAdapterResponse object
 *
 * @example Basic type guard
 * ```typescript
 * const value: unknown = {
 *   data: { id: 1 },
 *   status: 200,
 *   statusText: 'OK',
 *   headers: {},
 *   config: {},
 *   response: new Response()
 * };
 *
 * if (isRequestAdapterResponse(value)) {
 *   // value is now typed as RequestAdapterResponse
 *   console.log(value.status); // TypeScript knows 'status' exists
 *   console.log(value.data); // TypeScript knows 'data' exists
 * }
 * ```
 *
 * @example In plugin processing
 * ```typescript
 * const returnValue = context.returnValue;
 * if (isRequestAdapterResponse(returnValue)) {
 *   // Process adapter response
 *   const data = returnValue.data;
 * }
 * ```
 */
export function isRequestAdapterResponse(
  value: unknown
): value is RequestAdapterResponse {
  // Check if value is an object and not null
  if (!value || typeof value !== 'object') {
    return false;
  }

  const obj = value as Record<string, unknown>;

  // Check if it has all required properties of RequestAdapterResponse
  return (
    'response' in obj &&
    obj.response instanceof Response &&
    'status' in obj &&
    typeof obj.status === 'number' &&
    'statusText' in obj &&
    typeof obj.statusText === 'string' &&
    'headers' in obj &&
    typeof obj.headers === 'object' &&
    obj.headers !== null &&
    'config' in obj &&
    typeof obj.config === 'object' &&
    obj.config !== null
  );
}

