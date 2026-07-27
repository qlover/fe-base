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

/**
 * Parse machine OAuth endpoints (`/oauth/token`, `/oauth/userinfo`, `/oauth/revoke`)
 * that return flat RFC JSON (no `{ success, data }` envelope).
 */
export async function readOAuthMachineJson<T = unknown>(
  response: Response
): Promise<T> {
  const body = (await response.json()) as Record<string, unknown>;

  if (!response.ok || typeof body.error === 'string') {
    const description =
      typeof body.error_description === 'string'
        ? body.error_description
        : typeof body.error === 'string'
          ? body.error
          : `OAuth request failed (${response.status})`;
    throw new Error(description);
  }

  return body as T;
}
