import {
  API_OAUTH_ACCESS_DENIED,
  API_OAUTH_INVALID_CLIENT,
  API_OAUTH_INVALID_GRANT,
  API_OAUTH_INVALID_REQUEST,
  API_OAUTH_INVALID_SCOPE,
  API_OAUTH_INVALID_TOKEN,
  API_OAUTH_SERVER_ERROR,
  API_REDIRECT_URL,
  API_OAUTH_UNSUPPORTED_GRANT_TYPE,
  API_OAUTH_UNSUPPORTED_RESPONSE_TYPE
} from './i18n-identifier/api';

/**
 * OAuth 2.0 RFC 6749 `error` parameter values used in redirects and token responses.
 */
export type OAuthRfcErrorCode =
  | 'invalid_request'
  | 'invalid_client'
  | 'invalid_grant'
  | 'invalid_token'
  | 'unauthorized_client'
  | 'invalid_scope'
  | 'access_denied'
  | 'unsupported_response_type'
  | 'unsupported_grant_type'
  | 'server_error';

const OAUTH_I18N_TO_RFC: Record<string, OAuthRfcErrorCode> = {
  [API_OAUTH_INVALID_REQUEST]: 'invalid_request',
  [API_OAUTH_INVALID_CLIENT]: 'invalid_client',
  [API_OAUTH_INVALID_GRANT]: 'invalid_grant',
  [API_OAUTH_INVALID_TOKEN]: 'invalid_token',
  [API_REDIRECT_URL]: 'unauthorized_client',
  [API_OAUTH_INVALID_SCOPE]: 'invalid_scope',
  [API_OAUTH_ACCESS_DENIED]: 'access_denied',
  [API_OAUTH_UNSUPPORTED_RESPONSE_TYPE]: 'unsupported_response_type',
  [API_OAUTH_UNSUPPORTED_GRANT_TYPE]: 'unsupported_grant_type',
  [API_OAUTH_SERVER_ERROR]: 'server_error'
};

const OAUTH_RFC_TO_I18N: Record<OAuthRfcErrorCode, string> = {
  invalid_request: API_OAUTH_INVALID_REQUEST,
  invalid_client: API_OAUTH_INVALID_CLIENT,
  invalid_grant: API_OAUTH_INVALID_GRANT,
  invalid_token: API_OAUTH_INVALID_TOKEN,
  unauthorized_client: API_REDIRECT_URL,
  invalid_scope: API_OAUTH_INVALID_SCOPE,
  access_denied: API_OAUTH_ACCESS_DENIED,
  unsupported_response_type: API_OAUTH_UNSUPPORTED_RESPONSE_TYPE,
  unsupported_grant_type: API_OAUTH_UNSUPPORTED_GRANT_TYPE,
  server_error: API_OAUTH_SERVER_ERROR
};

/**
 * Maps an App API / i18n error id to the RFC 6749 `error` code for OAuth HTTP responses.
 */
export function oauthI18nIdToRfc(errorId: string): OAuthRfcErrorCode {
  return OAUTH_I18N_TO_RFC[errorId] ?? 'server_error';
}

/**
 * Maps an RFC 6749 `error` code to the i18n identifier used in App API envelopes.
 */
export function oauthRfcToI18nId(rfc: OAuthRfcErrorCode | string): string {
  return OAUTH_RFC_TO_I18N[rfc as OAuthRfcErrorCode] ?? API_OAUTH_SERVER_ERROR;
}

/**
 * RFC `error` value for OAuth authorization redirect query parameters.
 */
export function oauthI18nIdToRedirectError(errorId: string): OAuthRfcErrorCode {
  return oauthI18nIdToRfc(errorId);
}
