import type { OAuthRfcCodeType } from '@shared/oauth-wrapper';
import { OAuthWrapperError } from '@shared/oauth-wrapper';
import { oauthWrapperI18n } from '@config/i18n-mapping/oauthWrapperI18n';

/**
 * 将 OAuthWrapperError 转换为 i18n 错误
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
