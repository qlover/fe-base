import { RequestStatusCatcher } from '@/base/cases/RequestStatusCatcher';
import type { RequestCatcherInterface } from '@/base/port/RequestCatcherInterface';
import { ApiClientInterceptingInterface } from '@fe-prod/core/api-client';
import type {
  ExecutorContext,
  ExecutorPlugin,
  RequestAdapterResponse
} from '@qlover/fe-corekit';
import { inject, injectable } from 'inversify';
import { AppError } from '../appError/AppError';

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
export interface ApiCatchPluginResponse<Request, Response>
  extends RequestAdapterResponse<Request, Response> {
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
export class ApiCatchPlugin
  extends ApiClientInterceptingInterface<ApiCatchResult>
  implements ExecutorPlugin
{
  readonly pluginName = 'ApiCatchPlugin';

  constructor(
    @inject(RequestStatusCatcher)
    private readonly feApiRequestCatcher: RequestCatcherInterface<
      RequestAdapterResponse<unknown, unknown>
    >
  ) {
    super();
  }

  /**
   * @override
   */
  static is(result: unknown): result is ApiCatchResult {
    return result instanceof ApiCatchResult;
  }

  onSuccess(context: ExecutorContext<unknown>): void | Promise<void> {
    const returnValue = context.returnValue as ApiCatchPluginResponse<
      unknown,
      unknown
    >;

    this.feApiRequestCatcher.handler(returnValue);

    if (this.isErrorResponse(context)) {
      Object.assign(
        context.returnValue as ApiCatchPluginResponse<unknown, unknown>,
        {
          apiCatchResult: new ApiCatchResult('test eror id')
        }
      );
    }
  }

  isErrorResponse(context: ExecutorContext<unknown>): boolean {
    const returnValue = context.returnValue as ApiCatchPluginResponse<
      unknown,
      unknown
    >;

    return returnValue.statusText !== 'OK';
  }
}
