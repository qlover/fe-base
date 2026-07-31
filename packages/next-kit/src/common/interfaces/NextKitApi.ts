/**
 * Standard JSON API envelope used by next-kit server/browser helpers.
 *
 * Shape is intentionally framework-agnostic; apps may alias these types
 * locally if they prefer shorter names.
 */

export interface NextKitApiError {
  success: false;
  id: string;
  requestId: string;
  message?: string;
  data?: unknown;
}

export interface NextKitApiSuccess<T> {
  success: true;
  requestId: string;
  data?: T;
}

export type NextKitApiResult<T> = NextKitApiError | NextKitApiSuccess<T>;

export function isNextKitApiSuccess<T>(
  result: unknown
): result is NextKitApiSuccess<T> {
  return (
    typeof result === 'object' &&
    result !== null &&
    'success' in result &&
    result.success === true &&
    'requestId' in result &&
    typeof result.requestId === 'string'
  );
}

export function isNextKitApiError(
  result: unknown
): result is NextKitApiError {
  return (
    typeof result === 'object' &&
    result !== null &&
    'id' in result &&
    typeof result.id === 'string' &&
    'success' in result &&
    result.success === false &&
    'requestId' in result &&
    typeof result.requestId === 'string'
  );
}

export function isNextKitApiResult<T>(
  value: unknown
): value is NextKitApiResult<T> {
  return isNextKitApiSuccess(value) || isNextKitApiError(value);
}
