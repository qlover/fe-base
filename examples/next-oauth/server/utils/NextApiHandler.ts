import { ExecutorError } from '@qlover/fe-corekit/executor';
import {
  NextApiHandler as KitNextApiHandler,
  ResultContext,
  type ResultHandlerContext,
  type ResultHandlerInterface
} from '@qlover/next-kit/server';
import { OAuthWrapperError } from '@qlover/oauth-wrapper';
import { oauthWrapperI18n } from '@config/i18n-mapping/oauthWrapperI18n';
import { supabaseAuthErrorI18n } from '@config/i18n-mapping/supabaseAuthErrorI18n';
import type { OAuthRfcCodeType } from '@qlover/oauth-wrapper';
import type { NextKitApiResult } from '@qlover/next-kit/common';

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
 * Map Supabase AuthApiError.code (or class name) to app `api:` i18n keys.
 */
function toI18nAuthExecutorError(error: ExecutorError): ExecutorError {
  const i18nId = supabaseAuthErrorI18n[error.id];
  if (i18nId == null || i18nId === error.id) {
    return error;
  }
  return new ExecutorError(i18nId, error);
}

/**
 * 应用侧 NextApiHandler：OAuth RFC 与 Supabase Auth 错误映射为 i18n id。
 */
export class NextApiHandler extends KitNextApiHandler {
  /**
   * @override
   */
  public override handler<T>(value: unknown): NextKitApiResult<T> {
    if (value instanceof ExecutorError) {
      return super.handler(toI18nAuthExecutorError(value));
    }
    return super.handler(value);
  }

  protected override handlerOAuthWrapper<T>(value: T): T {
    if (value instanceof OAuthWrapperError) {
      this.serverContext.changeState({ httpStatus: value.status });
      return toI18nOAuthError(value) as T;
    }
    return value;
  }
}
