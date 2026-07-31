import { ExecutorError } from '@qlover/fe-corekit/executor';
import { OAuthWrapperError } from '@qlover/oauth-wrapper';
import { first, isNumber, isPlainObject, isString } from 'lodash-es';
import { ZodError } from 'zod';
import {
  API_SERVER_ERROR,
  V_ZOD_FAILED
} from '../../common/config/i18nIdentifiers';
import {
  isNextKitApiResult,
  type NextKitApiError,
  type NextKitApiResult,
  type NextKitApiSuccess
} from '../../common/interfaces/NextKitApi';
import type { ServerContextInterface } from '../interfaces/ServerContextInterface';
import type { LoggerInterface } from '@qlover/logger';

export class ResultContext {
  public httpStatus?: number;
  public redirectUrl?: string | URL;

  constructor(redirectUrl?: string | URL, httpStatus?: number) {
    this.redirectUrl = redirectUrl;
    this.httpStatus = httpStatus;
  }
}

/** @deprecated Typo alias kept for migration; prefer {@link ResultContext}. */
export class ResultCotnext extends ResultContext {}

function isResultHandlerContext(value: unknown): value is ResultHandlerContext {
  if (value instanceof ResultContext) {
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

export type ResultHandlerContext = ResultContext;

export interface ResultHandlerInterface {
  handler<T>(value: unknown, context: ServerContextInterface): NextKitApiResult<T>;
}

/**
 * Normalizes route/service return values into {@link NextKitApiResult}.
 *
 * OAuth i18n remapping is left to apps — this handler only applies HTTP status
 * from {@link OAuthWrapperError}.
 */
export class NextApiHandler implements ResultHandlerInterface {
  constructor(
    protected logger: LoggerInterface,
    protected serverContext: ServerContextInterface
  ) {}

  /**
   * @override
   */
  public handler<T>(value: unknown): NextKitApiResult<T> {
    if (isNextKitApiResult<T>(value)) {
      return value;
    }

    if (this.handlerResultContext(value)) {
      return NextApiHandler.createApiSuccess(value as T, this.serverContext);
    }

    value = this.handlerOAuthWrapper(value);

    if (value instanceof ZodError) {
      return NextApiHandler.createWithZodError(value, this.serverContext);
    }

    if (value instanceof ExecutorError) {
      if (this.handlerResultContext(value.cause)) {
        this.logger.debug('NextApiHandler handler', value);
        return NextApiHandler.createServerError(this.serverContext);
      }

      return NextApiHandler.createWithExecutorError(value, this.serverContext);
    }

    if (value instanceof Error) {
      return NextApiHandler.createServerError(this.serverContext, value);
    }

    return NextApiHandler.createApiSuccess(value as T, this.serverContext);
  }

  protected handlerResultContext(
    value: unknown
  ): value is ResultHandlerContext {
    if (isResultHandlerContext(value)) {
      this.logger.debug('is ResultContext', value);
      this.serverContext.changeState(value);
      return true;
    }
    return false;
  }

  protected static createServerError(
    context: ServerContextInterface,
    message?: Error | string
  ): NextKitApiError {
    return NextApiHandler.createApiError(
      API_SERVER_ERROR,
      message instanceof Error ? message.message : (message ?? ''),
      context
    );
  }

  protected handlerOAuthWrapper<T>(value: T): T {
    if (value instanceof OAuthWrapperError) {
      this.serverContext.changeState({ httpStatus: value.status });
    }
    return value;
  }

  public static createApiSuccess<T>(
    data: T,
    context: ServerContextInterface
  ): NextKitApiSuccess<T> {
    return {
      success: true,
      data,
      requestId: context.getState('uid')
    };
  }

  public static createWithExecutorError(
    error: ExecutorError,
    context: ServerContextInterface
  ): NextKitApiError {
    const cause = error.cause;

    if (cause instanceof ZodError) {
      return NextApiHandler.createWithZodError(cause, context);
    }

    if (isPlainObject(cause) || Array.isArray(cause)) {
      return NextApiHandler.createApiErrorWithCause(error.id, cause, context);
    }

    return NextApiHandler.createApiError(error.id, error.message, context);
  }

  public static createApiError(
    id: string,
    message: string,
    context: ServerContextInterface
  ): NextKitApiError {
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
  ): NextKitApiError {
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
  ): NextKitApiError {
    try {
      const messageList = JSON.parse(error.message);

      if (Array.isArray(messageList)) {
        return NextApiHandler.createApiError(
          V_ZOD_FAILED,
          first(messageList)?.message,
          context
        );
      }
    } catch {
      // fall through
    }

    return NextApiHandler.createApiError(V_ZOD_FAILED, error.message, context);
  }
}
