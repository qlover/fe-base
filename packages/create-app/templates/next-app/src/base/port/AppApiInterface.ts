export interface AppApiErrorInterface {
  success: false;
  id: string;
  message?: string;
}

export interface AppApiSuccessInterface<T = unknown> {
  success: true;
  data?: T;
}

export type AppApiResult<T = unknown> =
  | AppApiErrorInterface
  | AppApiSuccessInterface<T>;

export function isAppApiSuccessInterface(
  result: unknown
): result is AppApiSuccessInterface {
  return (
    typeof result === 'object' &&
    result !== null &&
    'success' in result &&
    result.success === true
  );
}

export function isAppApiErrorInterface(
  result: unknown
): result is AppApiErrorInterface {
  return (
    typeof result === 'object' &&
    result !== null &&
    'success' in result &&
    result.success === false
  );
}
