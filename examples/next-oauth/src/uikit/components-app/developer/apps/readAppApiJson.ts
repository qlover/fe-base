import {
  isNextKitApiError,
  isNextKitApiSuccess,
  type NextKitApiResult
} from '@qlover/next-kit/common';

export async function readAppApiJson<T>(response: Response): Promise<T> {
  const body = (await response.json()) as NextKitApiResult<T>;

  if (isNextKitApiError(body)) {
    throw new Error(body.message ?? body.id);
  }

  if (!isNextKitApiSuccess<T>(body)) {
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
