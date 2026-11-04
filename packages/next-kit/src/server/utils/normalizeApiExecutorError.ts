import { ExecutorError } from '@qlover/fe-corekit/executor';
import { isI18nKey } from '../../common/schemas/i18nKey';
import { API_SERVER_ERROR } from '../../common/config/i18nIdentifiers';

/**
 * RFC 8628-inspired soft-fail ids used by CLI device token poll.
 * Kept as-is (not remapped) so callers can branch on them.
 */
const RFC8628_SOFT_FAIL_IDS = new Set([
  'authorization_pending',
  'expired_token',
  'access_denied',
  'slow_down'
]);

const NESTED_I18N_KEY = /^[a-z][a-z0-9_-]*(:[a-z][a-z0-9_-]*)+$/i;

/**
 * Whether an ExecutorError id is a stable client-facing contract id.
 *
 * Business / validation keys look like `api:…` / `common:…` / `next_kit:…`.
 * Infrastructure names such as `SupabasePGRSTError` are not.
 */
export function isStableApiErrorId(id: string): boolean {
  if (isI18nKey(id)) {
    return true;
  }
  // Keys with nested segments (e.g. `common:v:zod_failed`); kit `isI18nKey`
  // only allows a single colon.
  if (NESTED_I18N_KEY.test(id)) {
    return true;
  }
  return RFC8628_SOFT_FAIL_IDS.has(id);
}

/**
 * Dev-only: allow server-error envelopes to include diagnostic `data`.
 * Production always strips.
 */
export function isApiErrorDiagnosticsEnabled(): boolean {
  return process.env.NODE_ENV !== 'production';
}

/**
 * Maps kit infrastructure ExecutorError ids (e.g. SupabasePGRSTError) onto
 * {@link API_SERVER_ERROR} so API clients always receive an i18n key.
 *
 * Original id / cause stay in `data` for debugging until
 * {@link toClientFacingExecutorError} strips them for the HTTP envelope.
 */
export function toStableApiExecutorError(error: ExecutorError): ExecutorError {
  if (isStableApiErrorId(error.id)) {
    return error;
  }

  return new ExecutorError(API_SERVER_ERROR, {
    source: error.id,
    cause: error.cause
  });
}

/**
 * Client envelope form: keep business causes; strip infrastructure
 * diagnostics on the server error unless diagnostics are enabled.
 */
export function toClientFacingExecutorError(
  error: ExecutorError
): ExecutorError {
  const stable = toStableApiExecutorError(error);
  if (stable.id !== API_SERVER_ERROR) {
    return stable;
  }
  if (isApiErrorDiagnosticsEnabled() && stable.cause != null) {
    return stable;
  }
  return new ExecutorError(API_SERVER_ERROR);
}
