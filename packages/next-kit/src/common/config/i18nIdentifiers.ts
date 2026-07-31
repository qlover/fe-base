/**
 * Stable i18n message identifiers owned by `@qlover/next-kit`.
 *
 * Use the `next_kit:` namespace so keys do not collide with app-local
 * `common:v:*` (or other) identifiers. Apps supply locale copy for these
 * keys in their own i18n pipeline (`@localZh` / ts2locales / etc.).
 *
 * Pattern: `next_kit:<name>` (single colon — fits shared i18n key shape).
 */

/** Login form params are missing or invalid. */
export const V_LOGIN_PARAMS_REQUIRED = 'next_kit:v_login_params_required';

/** Username is required. */
export const V_USERNAME_REQUIRED = 'next_kit:v_username_required';

/** Email format is invalid. */
export const V_EMAIL_INVALID = 'next_kit:v_email_invalid';

/** Password is shorter than the minimum length. */
export const V_PASSWORD_MIN_LENGTH = 'next_kit:v_password_min_length';

/** Password exceeds the maximum length. */
export const V_PASSWORD_MAX_LENGTH = 'next_kit:v_password_max_length';

/** Password must not contain whitespace. */
export const V_PASSWORD_SPECIAL_CHARS = 'next_kit:v_password_special_chars';

/** Generic Zod / schema validation failure. */
export const V_ZOD_FAILED = 'next_kit:v_zod_failed';

/** List/search query must be a URLSearchParams instance. */
export const V_SEARCH_PARAMS_INVALID = 'next_kit:v_search_params_invalid';

/** Identifier / UUID is invalid. */
export const V_INVALID_ID = 'next_kit:v_invalid_id';

/** i18n key string format is invalid. */
export const COMMON_I18N_KEY_INVALID = 'next_kit:i18n_key_invalid';
