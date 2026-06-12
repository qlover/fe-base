import {
  isAppApiErrorInterface,
  isAppApiSuccessInterface,
  type AppApiResult
} from '@interfaces/AppApiInterface';

export async function readAppApiJson<T>(response: Response): Promise<T> {
  const body = (await response.json()) as AppApiResult<T>;

  if (isAppApiErrorInterface(body)) {
    throw new Error(body.message ?? body.id);
  }

  if (!isAppApiSuccessInterface<T>(body)) {
    throw new Error('Invalid API response');
  }

  return body.data as T;
}
