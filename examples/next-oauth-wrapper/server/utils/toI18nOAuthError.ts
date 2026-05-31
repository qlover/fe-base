import { OAuthWrapperError } from '@qlover/oauth-wrapper';
import { oauthWrapperI18n } from '@config/i18n-mapping/oauthWrapperI18n';
import type { OAuthRfcCodeType } from '@qlover/oauth-wrapper';

/**
 * OAuthWrapperError 转换 i18n 错误
 * @param error
 * @returns
 */
export function toI18nOAuthError(error: OAuthWrapperError): OAuthWrapperError {
  return new OAuthWrapperError(
    oauthWrapperI18n[error.id as OAuthRfcCodeType] as OAuthRfcCodeType,
    error.status,
    error.cause
  );
}
