import {
  API_EMAIL_NOT_CONFIRMED,
  API_EMAIL_SEND_RATE_LIMITED,
  API_INVALID_CREDENTIALS,
  API_OAUTH_WRAPPER_AUTH_FAILED,
  API_PASSWORD_RESET_LINK_INVALID,
  API_PASSWORD_SAME,
  API_PASSWORD_WEAK,
  API_SUPABASE_AUTH_ERROR
} from '@config/i18n-identifier/api';

/**
 * Supabase AuthApiError.code → api i18n key.
 * Unmapped codes fall back to {@link API_SUPABASE_AUTH_ERROR}.
 */
export const supabaseAuthErrorI18n: Readonly<Record<string, string>> =
  Object.freeze({
    invalid_credentials: API_INVALID_CREDENTIALS,
    email_not_confirmed: API_EMAIL_NOT_CONFIRMED,
    user_not_found: API_INVALID_CREDENTIALS,
    user_banned: API_OAUTH_WRAPPER_AUTH_FAILED,
    over_request_rate_limit: API_SUPABASE_AUTH_ERROR,
    over_email_send_rate_limit: API_EMAIL_SEND_RATE_LIMITED,
    otp_expired: API_SUPABASE_AUTH_ERROR,
    weak_password: API_PASSWORD_WEAK,
    same_password: API_PASSWORD_SAME,
    flow_state_expired: API_PASSWORD_RESET_LINK_INVALID,
    flow_state_not_found: API_PASSWORD_RESET_LINK_INVALID,
    bad_code_verifier: API_PASSWORD_RESET_LINK_INVALID,
    SupabaseAuthApiError: API_SUPABASE_AUTH_ERROR,
    SupabaseAuthError: API_SUPABASE_AUTH_ERROR
  });
