import { RequestStatusCatcher } from '@/base/cases/RequestStatusCatcher';
import type { RequestCatcherInterface } from '@/base/port/RequestCatcherInterface';
import type {
  ExecutorContext,
  ExecutorPlugin,
  RequestAdapterResponse
} from '@qlover/fe-corekit';
import { inject, injectable } from 'inversify';
import { AppError } from '../appError/AppError';

export interface ApiCatchPluginConfig {
  /**
   * 是否禁用捕获错误
   */
  disabledCatch?: boolean;
}

/**
 * Api 捕获到错误时封装的错误对象
 */
export class ApiCatchResult extends AppError {
  constructor(public readonly id: string = '') {
    super(id);
  }
}

/**
 * extends RequestAdapterResponse
 *
 * - add catchError
 */
export interface ApiCatchPluginResponse {
  /**
   * `ApiCatchPlugin` returns value
   */
  apiCatchResult?: ApiCatchResult;
}

/**
 * Api request error catch plugin
 *
 * 不让错误抛出，仅返回错误和数据
 */
@injectable()
export class ApiCatchPlugin implements ExecutorPlugin {
  readonly pluginName = 'ApiCatchPlugin';

  constructor(
    @inject(RequestStatusCatcher)
    private readonly feApiRequestCatcher: RequestCatcherInterface<
      RequestAdapterResponse<unknown, unknown>
    >
  ) {}

  static is(result: unknown): result is ApiCatchResult {
    return result instanceof ApiCatchResult;
  }

  onSuccess(context: ExecutorContext<unknown>): void | Promise<void> {
    const returnValue = context.returnValue as RequestAdapterResponse;

    this.feApiRequestCatcher.handler(returnValue);

    if (this.isErrorResponse(context)) {
      Object.assign(context.returnValue!, {
        apiCatchResult: new ApiCatchResult('test eror id')
      });
    }
  }

  isErrorResponse(context: ExecutorContext<unknown>): boolean {
    const returnValue = context.returnValue as RequestAdapterResponse;

    return returnValue.statusText !== 'OK';
  }
}
