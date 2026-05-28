import type { ValueOf } from '@qlover/fe-corekit';

export const OAuthRfcCodes = {
  INVALID_REQUEST: 'invalid_request',
  INVALID_CLIENT: 'invalid_client',
  INVALID_GRANT: 'invalid_grant',
  INVALID_TOKEN: 'invalid_token',
  UNAUTHORIZED_CLIENT: 'unauthorized_client',
  INVALID_SCOPE: 'invalid_scope',
  ACCESS_DENIED: 'access_denied',
  UNSUPPORTED_RESPONSE_TYPE: 'unsupported_response_type',
  UNSUPPORTED_GRANT_TYPE: 'unsupported_grant_type',
  OAUTH_ERROR: 'oauth_error'
} as const;

export type OAuthRfcErrorCodesType = typeof OAuthRfcCodes;

/**
 * OAuth 2.0 RFC 6749 `error` parameter values used in redirects and token responses.
 */
export type OAuthRfcCodeType = ValueOf<OAuthRfcErrorCodesType>;
