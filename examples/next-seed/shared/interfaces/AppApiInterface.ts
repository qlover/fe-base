export interface AppApiErrorInterface {
  success: false;
  id: string;
  requestId: string;
  message?: string;
  data?: unknown;
}

export interface AppApiSuccessInterface<T> {
  success: true;
  requestId: string;
  data?: T;
}

export type AppApiResult<T> = AppApiErrorInterface | AppApiSuccessInterface<T>;

export function isAppApiSuccessInterface<T>(
  result: unknown
): result is AppApiSuccessInterface<T> {
  return (
    typeof result === 'object' &&
    result !== null &&
    'success' in result &&
    result.success === true &&
    'requestId' in result &&
    typeof result.requestId === 'string'
  );
}

export function isAppApiErrorInterface(
  result: unknown
): result is AppApiErrorInterface {
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
