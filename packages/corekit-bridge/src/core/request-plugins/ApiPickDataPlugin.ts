import {
  type ExecutorContextInterface,
  type LifecyclePluginInterface,
  type RequestAdapterFetchConfig,
  type RequestAdapterResponse
} from '@qlover/fe-corekit';

export type ApiPickDataResponse<_Request, Response> = Response;

/**
 * From `RequestAdapterResponse` pick data
 *
 * Return `RequestAdapterResponse`'s `data` property
 */
export class ApiPickDataPlugin implements LifecyclePluginInterface<
  ExecutorContextInterface<RequestAdapterFetchConfig, RequestAdapterResponse>,
  RequestAdapterResponse,
  RequestAdapterFetchConfig
> {
  public readonly pluginName = 'ApiPickDataPlugin';

  /**
   * @override
   */
  public onSuccess(
    context: ExecutorContextInterface<
      RequestAdapterFetchConfig,
      RequestAdapterResponse
    >
  ): void | Promise<void> {
    const { returnValue } = context;

    // pick data, return data
    context.setReturnValue(returnValue?.data);
    // FIXME:Because override the returnValue, this plugin whether break the chain?
    context.runtimes({
      breakChain: true
    });
  }
}
