import type { RequestCatcherInterface } from './RequestCatcherInterface';
import {
  ExecutorError,
  type ExecutorContextInterface,
  type ExecutorTask,
  type LifecyclePluginInterface,
  type RequestAdapterFetchConfig,
  type RequestAdapterResponse
} from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';

export interface ApiCatchPluginConfig {
  /**
   * Whether to catch the error
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
  apiCatchResult?: ExecutorError;
}

type ApiCatchPluginContext = ExecutorContextInterface<
  ApiCatchPluginConfig & RequestAdapterFetchConfig,
  RequestAdapterResponse<unknown, unknown> & ApiCatchPluginResponse
>;

/**
 * Api request error catch plugin
 *
 * Do not throw errors, only return errors and data
 */
export class ApiCatchPlugin
  implements
    LifecyclePluginInterface<
      ApiCatchPluginContext,
      RequestAdapterResponse<unknown, unknown> & ApiCatchPluginResponse,
      ApiCatchPluginConfig & RequestAdapterFetchConfig
    >
{
  public readonly pluginName = 'ApiCatchPlugin';

  constructor(
    private readonly logger: LoggerInterface,
    private readonly feApiRequestCatcher: RequestCatcherInterface<
      RequestAdapterResponse<unknown, unknown>
    >
  ) {}

  /**
   * @override
   */
  public enabled(
    _name: string,
    context?: ApiCatchPluginContext
  ): boolean {
    // If the openApiCatch is true, the plugin will be enabled
    const { openApiCatch } = context?.parameters ?? {};
    return !!openApiCatch;
  }

  /**
   * @override
   */
  public onExec(
    context: ApiCatchPluginContext,
    task: ExecutorTask<
      RequestAdapterResponse<unknown, unknown> & ApiCatchPluginResponse,
      ApiCatchPluginConfig & RequestAdapterFetchConfig
    >
  ): Promise<
    RequestAdapterResponse<unknown, unknown> & ApiCatchPluginResponse
  > {
    const { url } = context.parameters;

    this.logger.info(`${url} openApiCatch, rewrite task`);

    return (async () => {
      try {
        const result = await task(context);
        return result;
      } catch {
        const errorResponse = new Response(null, {
          // The FetchURLPlugin may default to catching if the response is ok and throw an error,
          // here it is so that the error response is 200 by default, but that may not be very good
          // fetch responses status in 200-299 are ok, so here is 205
          status: 205, // 205 is Reset Content
          statusText: 'Internal Server Error(ApiCatchPlugin)'
        });

        return {
          apiCatchResult: new ExecutorError(
            'test eror id',
            'Internal Server Error(ApiCatchPlugin)'
          ),
          status: errorResponse.status,
          statusText: errorResponse.statusText,
          headers: {},
          data: null,
          config: context.parameters,
          response: errorResponse
        } as RequestAdapterResponse<unknown, unknown> & ApiCatchPluginResponse;
      }
    })();
  }

  /**
   * @override
   */
  public onSuccess(context: ApiCatchPluginContext): void | Promise<void> {
    const returnValue = context.returnValue as
      | (RequestAdapterResponse<unknown, unknown> & ApiCatchPluginResponse)
      | undefined;

    // When the apiCatchResult is not null, it means that the error has been caught
    if (returnValue?.apiCatchResult) {
      this.feApiRequestCatcher.handler(returnValue);
    }
  }
}
