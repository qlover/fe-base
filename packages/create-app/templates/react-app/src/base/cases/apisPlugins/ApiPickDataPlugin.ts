import {
  ExecutorContext,
  ExecutorPlugin,
  RequestAdapterFetchConfig,
  RequestAdapterResponse
} from '@qlover/fe-corekit';
import { injectable } from 'inversify';

// @ts-expect-error
export type ApiPickDataResponse<Request, Response> = Response;

/**
 * From `RequestAdapterResponse` pick data
 *
 * Return `RequestAdapterResponse`'s `data` property
 */
@injectable()
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
