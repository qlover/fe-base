import { RequestStatusCatcher } from '@/base/cases/RequestStatusCatcher';
import type { RequestCatcherInterface } from '@/base/port/RequestCatcherInterface';
import type {
  ExecutorContext,
  ExecutorPlugin,
  Logger,
  PromiseTask,
  RequestAdapterFetchConfig,
  RequestAdapterResponse
} from '@qlover/fe-corekit';
import { inject, injectable } from 'inversify';
import { AppError } from '../appError/AppError';
import { IOCIdentifier } from '@/core/IOC';

export interface ApiCatchPluginConfig {
  /**
   * 是否开启捕获错误
   */
  openApiCatch?: boolean;
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
  apiCatchResult?: AppError;
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
    @inject(IOCIdentifier.Logger) private readonly logger: Logger,
    @inject(RequestStatusCatcher)
    private readonly feApiRequestCatcher: RequestCatcherInterface<
      RequestAdapterResponse<unknown, unknown>
    >
  ) {}

  enabled(
    _name: keyof ExecutorPlugin,
    context?:
      | ExecutorContext<RequestAdapterFetchConfig & ApiCatchPluginConfig>
      | undefined
  ): boolean {
    // If the openApiCatch is true, the plugin will be enabled
    const { openApiCatch } = context?.parameters ?? {};
    return !!openApiCatch;
  }

  onExec(
    context: ExecutorContext<RequestAdapterFetchConfig & ApiCatchPluginConfig>,
    task: PromiseTask<unknown, unknown>
  ): Promise<unknown> | unknown {
    const { url } = context.parameters;

    this.logger.info(`${url} openApiCatch, rewrite task`);

    const withErrorTask = async () => {
      let result;
      try {
        result = await task(context);

        return result;
      } catch (error) {
        const errorResponse = new Response(null, {
          // The FetchURLPlugin may default to catching if the response is ok and throw an error,
          // here it is so that the error response is 200 by default, but that may not be very good
          // fetch responses status in 200-299 are ok, so here is 205
          status: 205, // 205 is Reset Content
          statusText: 'Internal Server Error(ApiCatchPlugin)'
        });

        return {
          apiCatchResult: new AppError(
            'test eror id',
            'Internal Server Error(ApiCatchPlugin)'
          ),
          status: errorResponse.status,
          statusText: errorResponse.statusText,
          headers: Object.fromEntries(errorResponse.headers.entries()),
          data: null,
          config: context.parameters,
          response: errorResponse
        } as RequestAdapterResponse & ApiCatchPluginResponse;
      }
    };

    return withErrorTask();
  }

  onSuccess(context: ExecutorContext<unknown>): void | Promise<void> {
    const returnValue = context.returnValue as RequestAdapterResponse &
      ApiCatchPluginResponse;

    // When the apiCatchResult is not null, it means that the error has been caught
    if (returnValue.apiCatchResult) {
      this.feApiRequestCatcher.handler(returnValue);
    }
  }
}
