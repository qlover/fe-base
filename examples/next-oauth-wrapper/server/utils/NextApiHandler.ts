import { ExecutorError } from '@qlover/fe-corekit';
import { OAuthWrapperError } from '@qlover/oauth-wrapper';
import { first, isNumber, isPlainObject, isString } from 'lodash';
import { ZodError } from 'zod';
import { API_SERVER_ERROR } from '@config/i18n-identifier/api';
import { V_ZOD_FAILED } from '@config/i18n-identifier/common/validators';
import { oauthWrapperI18n } from '@config/i18n-mapping/oauthWrapperI18n';
import type {
  AppApiErrorInterface,
  AppApiResult,
  AppApiSuccessInterface
} from '@interfaces/AppApiInterface';
import { isAppApiResult } from '@interfaces/AppApiInterface';
import type { ServerContextInterface } from '@server/interfaces/ServerContextInterface';
import type { LoggerInterface } from '@qlover/logger';
import type { OAuthRfcCodeType } from '@qlover/oauth-wrapper';

export class ResultCotnext {
  /**
   * 允许从内部决定状态码，而不是默认400
   *
   * 仅用于内存环境, 真实的返回会将属性去掉
   */
  public httpStatus?: number;
  /**
   * 该属性如果存在, 最后结果会导致相应重定向
   */
  public redirectUrl?: string | URL;

  constructor(redirectUrl?: string | URL, httpStatus?: number) {
    this.redirectUrl = redirectUrl;
    this.httpStatus = httpStatus;
  }
}

function isResultHandlerContext(value: unknown): value is ResultHandlerContext {
  if (value instanceof ResultCotnext) {
    return true;
  }

  if (isPlainObject(value)) {
    const redirectUrl = (value as ResultHandlerContext).redirectUrl;
    if (redirectUrl instanceof URL || isString(redirectUrl)) {
      return true;
    }

    if (isNumber((value as ResultHandlerContext).httpStatus)) {
      return true;
    }
  }
  return false;
}

export type ResultHandlerContext = (typeof ResultCotnext)['prototype'];

export interface ResultHandlerInterface {
  handler<T>(value: unknown, context: ServerContextInterface): AppApiResult<T>;
}

function toI18nOAuthError(error: OAuthWrapperError): OAuthWrapperError {
  return new OAuthWrapperError(
    oauthWrapperI18n[error.id as OAuthRfcCodeType] as OAuthRfcCodeType,
    error.status,
    error.cause
  );
}

/**
 * 这是 NextApiServer 的返回信息处理类
 *
 * 它会处理任何接口、服务返回的数据，包装成统一的格式 `AppApiResult`
 */
export class NextApiHandler implements ResultHandlerInterface {
  constructor(
    protected logger: LoggerInterface,
    protected serverContext: ServerContextInterface
  ) {}

  /**
   * @override
   */
  public handler<T>(value: unknown): AppApiResult<T> {
    // 如果 value 本身就是 AppApiResult 结果, 则直接返回
    // 可能是在 server 层或控制层返回了正确的数据
    if (isAppApiResult<T>(value)) {
      return value;
    }

    if (this.handlerResultContext(value)) {
      return NextApiHandler.createApiSuccess(value as T, this.serverContext);
    }

    // 如果是 oauth 包裹错误对象, 该对象有一个 httpStatus 属性需要注入
    value = this.handlerOAuthWrapper(value);

    // 如果是 Zod 验证错误,则直接返回
    if (value instanceof ZodError) {
      return NextApiHandler.createWithZodError(value, this.serverContext);
    }

    // 如果是一个执行错误
    if (value instanceof ExecutorError) {
      // 如果 excutorError 的 cause 是一个 ResultHandlerContext 对象
      if (this.handlerResultContext(value.cause)) {
        this.logger.debug('NextApiHandler handler', value);
        return NextApiHandler.createServerError(this.serverContext);
      }

      return NextApiHandler.createWithExecutorError(value, this.serverContext);
    }

    // 如果是未捕获的情况都返回服务器错误
    if (value instanceof Error) {
      return NextApiHandler.createServerError(this.serverContext, value);
    }

    return NextApiHandler.createApiSuccess(value as T, this.serverContext);
  }

  protected handlerResultContext(
    value: unknown
  ): value is ResultHandlerContext {
    if (isResultHandlerContext(value)) {
      this.logger.debug('is ResultCotnext', value);

      this.serverContext.changeState(value);
      return true;
    }
    return false;
  }

  protected static createServerError(
    context: ServerContextInterface,
    message?: Error | string
  ): AppApiErrorInterface {
    return NextApiHandler.createApiError(
      API_SERVER_ERROR,
      message instanceof Error ? message.message : (message ?? ''),
      context
    );
  }

  /**
   * 处理value 可能是 OAuthWrapperError 的情况
   * @param value
   */
  protected handlerOAuthWrapper<T>(value: T): T {
    if (value instanceof OAuthWrapperError) {
      this.serverContext.changeState({ httpStatus: value.status });
      return toI18nOAuthError(value) as T;
    }

    return value;
  }

  public static createApiSuccess<T>(
    data: T,
    context: ServerContextInterface
  ): AppApiSuccessInterface<T> {
    return {
      success: true,
      data,
      requestId: context.getState('uid')
    };
  }

  public static createWithExecutorError(
    error: ExecutorError,
    context: ServerContextInterface
  ): AppApiErrorInterface {
    const cause = error.cause;
    // // TODO: 如果配置为生产环境，则返回空消息的错
    // if (options.config.isProduction) {
    //   return NextApiHandler.createApiError(error.id, '', context);
    // }

    if (cause instanceof ZodError) {
      return NextApiHandler.createWithZodError(cause, context);
    }

    // 如果 cause 是一个普通数据, 则返回到 data 中
    if (isPlainObject(cause) || Array.isArray(cause)) {
      return NextApiHandler.createApiErrorWithCause(error.id, cause, context);
    }

    return NextApiHandler.createApiError(error.id, error.message, context);
  }

  public static createApiError(
    id: string,
    message: string,
    context: ServerContextInterface
  ): AppApiErrorInterface {
    return {
      id,
      success: false,
      requestId: context.getState('uid'),
      message
    };
  }

  public static createApiErrorWithCause(
    id: string,
    data: unknown,
    context: ServerContextInterface
  ): AppApiErrorInterface {
    return {
      id,
      success: false,
      requestId: context.getState('uid'),
      data
    };
  }

  public static createWithZodError(
    error: ZodError,
    context: ServerContextInterface
  ): AppApiErrorInterface {
    // Zod is already logged in BootstrapServer onError (e.g. nextApiServerBackstop); avoid duplicate.

    try {
      const messageList = JSON.parse(error.message);

      if (Array.isArray(messageList)) {
        return NextApiHandler.createApiError(
          V_ZOD_FAILED,
          first(messageList)?.message,
          context
        );
      }
    } catch {}

    return NextApiHandler.createApiError(V_ZOD_FAILED, error.message, context);
  }
}
