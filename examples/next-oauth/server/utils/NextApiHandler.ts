import {
  NextApiHandler as KitNextApiHandler,
  ResultContext,
  type ResultHandlerContext,
  type ResultHandlerInterface
} from '@qlover/next-kit/server';
import { OAuthWrapperError } from '@qlover/oauth-wrapper';
import { oauthWrapperI18n } from '@config/i18n-mapping/oauthWrapperI18n';
import type { OAuthRfcCodeType } from '@qlover/oauth-wrapper';

export {
  ResultContext,
  type ResultHandlerContext,
  type ResultHandlerInterface
};

function toI18nOAuthError(error: OAuthWrapperError): OAuthWrapperError {
  return new OAuthWrapperError(
    oauthWrapperI18n[error.id as OAuthRfcCodeType] as OAuthRfcCodeType,
    error.status,
    error.cause
  );
}

/**
 * 应用侧 NextApiHandler：基于 kit，并把 OAuth RFC 错误 id 映射为 i18n id。
 */
export class NextApiHandler extends KitNextApiHandler {
  protected override handlerOAuthWrapper<T>(value: T): T {
    if (value instanceof OAuthWrapperError) {
      this.serverContext.changeState({ httpStatus: value.status });
      return toI18nOAuthError(value) as T;
    }
    return value;
  }
}
