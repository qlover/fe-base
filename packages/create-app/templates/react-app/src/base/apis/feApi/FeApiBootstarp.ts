import {
  RequestAdapterConfig,
  RequestAdapterResponse,
  RequestTransactionInterface
} from '@qlover/fe-corekit';
import { FetchURLPlugin } from '@qlover/fe-corekit';
import {
  BootstrapContext,
  BootstrapExecutorPlugin
} from '@qlover/fe-prod/core';
import { FeApi } from './FeApi';
import { ApiMockPluginConfig } from '@/base/cases/apisPlugins/ApiMockPlugin';
import { IOCIdentifier } from '@/core/IOC';
import { RequestLogger } from '@/base/cases/apisPlugins/RequestLogger';
import { ApiPickDataPlugin } from '@/base/cases/apisPlugins/ApiPickDataPlugin';

/**
 * FeApiConfig
 *
 * @description
 * FeApiConfig is the config for the FeApi.
 *
 * extends:
 */
export interface FeApiConfig<Request = unknown>
  extends RequestAdapterConfig<Request>,
    ApiMockPluginConfig {}

/**
 * FeApiResponse
 *
 * @description
 * FeApiResponse is the response for the FeApi.
 *
 * extends:
 * - RequestAdapterResponse<Request, Response>
 */
export interface FeApiResponse<Request = unknown, Response = unknown>
  extends RequestAdapterResponse<Request, Response> {}

/**
 * FeApi common transaction
 *
 * FIXME: maybe we can add data to RequestTransactionInterface
 *
 * add data property
 */
export interface FeApiTransaction<Request = unknown, Response = unknown>
  extends RequestTransactionInterface<
    FeApiConfig<Request>,
    FeApiResponse<Request, Response>['data']
  > {
  data: FeApiConfig<Request>['data'];
}

export class FeApiBootstarp implements BootstrapExecutorPlugin {
  readonly pluginName = 'FeApiBootstarp';

  onBefore({ parameters: { ioc } }: BootstrapContext): void {
    ioc
      .get<FeApi>(FeApi)
      .usePlugin(new FetchURLPlugin())
      .usePlugin(ioc.get(IOCIdentifier.FeApiCommonPlugin))
      .usePlugin(ioc.get(RequestLogger))
      .usePlugin(ioc.get(ApiPickDataPlugin));
  }
}
