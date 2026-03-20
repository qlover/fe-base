import { ExecutorError } from '@qlover/fe-corekit';
import { first } from 'lodash';
import { ZodError } from 'zod';
import { API_SERVER_ERROR } from '@config/i18n-identifier/api';
import { V_ZOD_FAILED } from '@config/i18n-identifier/common/validators';
import {
  isAppApiErrorInterface,
  isAppApiSuccessInterface,
  type AppApiResult,
  type AppApiErrorInterface,
  type AppApiSuccessInterface
} from '@interfaces/AppApiInterface';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type { LoggerInterface } from '@qlover/logger';

export type CreateOptions<T> = {
  requestId: string;
  data?: T;
  logger: LoggerInterface;
  config: SeedServerConfigInterface;
};

/**
 * 创建 ApiResult 的工厂类
 *
 * 内部自动处理了 ZodError 和 ExecutorError 的错误
 */
export class ApiResultFactory {
  public static isAppApiResult<T>(result: unknown): result is AppApiResult<T> {
    return isAppApiSuccessInterface(result) || isAppApiErrorInterface(result);
  }

  public static createApiSuccess<T>(
    data: T,
    options: CreateOptions<T>
  ): AppApiSuccessInterface<T> {
    return {
      success: true,
      data,
      requestId: options.requestId
    };
  }

  public static createApiError<T>(
    id: string,
    message: string,
    options: CreateOptions<T>
  ): AppApiErrorInterface {
    return {
      success: false,
      id,
      requestId: options.requestId,
      message,
      data: options.data
    };
  }

  public static createApiWithError<T>(
    error: Error,
    options: CreateOptions<T>
  ): AppApiErrorInterface {
    if (error instanceof ZodError) {
      return ApiResultFactory.createWithZodError(error, options);
    }

    if (error instanceof ExecutorError) {
      return ApiResultFactory.createWithExecutorError(error, options);
    }

    return ApiResultFactory.createApiError(
      API_SERVER_ERROR,
      error.message,
      options
    );
  }

  public static createWithExecutorError(
    error: ExecutorError,
    options: CreateOptions<unknown>
  ): AppApiErrorInterface {
    options.logger.log('NextApiServer ExecutorError', error.id);
    options.logger.error(error.cause ? error.cause : error);

    // 如果配置为生产环境，则返回空消息的错误
    if (options.config.isProduction) {
      return ApiResultFactory.createApiError(error.id, '', options);
    }

    if (error.cause instanceof ZodError) {
      return ApiResultFactory.createWithZodError(error.cause, options);
    }

    return ApiResultFactory.createApiError(error.id, error.message, options);
  }

  public static createWithZodError(
    error: ZodError,
    options: CreateOptions<unknown>
  ): AppApiErrorInterface {
    options.logger.error(error);

    try {
      const messageList = JSON.parse(error.message);

      if (Array.isArray(messageList)) {
        return ApiResultFactory.createApiError(
          V_ZOD_FAILED,
          first(messageList)?.message,
          options
        );
      }
    } catch {}

    return ApiResultFactory.createApiError(
      V_ZOD_FAILED,
      error.message,
      options
    );
  }
}
