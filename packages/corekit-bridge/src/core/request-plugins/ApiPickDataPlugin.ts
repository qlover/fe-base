import {
  type ExecutorContext,
  type ExecutorPlugin,
  type RequestAdapterFetchConfig,
  type RequestAdapterResponse
} from '@qlover/fe-corekit';

// eslint-disable-next-line
export type ApiPickDataResponse<_Request, Response> = Response;

/**
 * From `RequestAdapterResponse` pick data
 *
 * Return `RequestAdapterResponse`'s `data` property
 */
export class ApiPickDataPlugin implements ExecutorPlugin {
  readonly pluginName = 'ApiPickDataPlugin';

  /**
   * @override
   */
  onSuccess(
    context: ExecutorContext<RequestAdapterFetchConfig>
  ): void | Promise<void> {
    const { returnValue } = context;

    // pick data, return data
    context.returnValue = (
      returnValue as RequestAdapterResponse<RequestAdapterFetchConfig, unknown>
    ).data;

    // FIXME:Because override the returnValue, this plugin whether break the chain?
    context.hooksRuntimes.breakChain = true;
  }
}
