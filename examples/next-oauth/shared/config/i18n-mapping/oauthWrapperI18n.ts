import { OAuthRfcCodes } from '@qlover/oauth-wrapper';
import * as apikeys from '@config/i18n-identifier/api';
import type { OAuthRfcCodeType } from '@qlover/oauth-wrapper';

/**
 * OAuth wrapper rfc code 对应i18n key
 */
export const oauthWrapperI18n: Record<OAuthRfcCodeType, string> = Object.freeze(
  {
    [OAuthRfcCodes.INVALID_REQUEST]: apikeys.API_OAUTH_INVALID_REQUEST,
    [OAuthRfcCodes.INVALID_CLIENT]: apikeys.API_OAUTH_INVALID_CLIENT,
    [OAuthRfcCodes.INVALID_GRANT]: apikeys.API_OAUTH_INVALID_GRANT,
    [OAuthRfcCodes.INVALID_TOKEN]: apikeys.API_OAUTH_INVALID_TOKEN,
    [OAuthRfcCodes.UNAUTHORIZED_CLIENT]: apikeys.API_REDIRECT_URL,
    [OAuthRfcCodes.INVALID_SCOPE]: apikeys.API_OAUTH_INVALID_SCOPE,
    [OAuthRfcCodes.ACCESS_DENIED]: apikeys.API_OAUTH_ACCESS_DENIED,
    [OAuthRfcCodes.UNSUPPORTED_RESPONSE_TYPE]:
      apikeys.API_OAUTH_UNSUPPORTED_RESPONSE_TYPE,
    [OAuthRfcCodes.UNSUPPORTED_GRANT_TYPE]:
      apikeys.API_OAUTH_UNSUPPORTED_GRANT_TYPE,
    [OAuthRfcCodes.OAUTH_ERROR]: apikeys.API_OAUTH_SERVER_ERROR
  }
);
