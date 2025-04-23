import {
  FetchAbortPlugin,
  RequestAdapterConfig,
  RequestAdapterResponse,
  RequestTransactionInterface
} from '@qlover/fe-corekit';
import { IOC, IOCIdentifier } from '@/core/IOC';
import { RequestLogger } from '@/base/cases/RequestLogger';
import { FetchURLPlugin } from '@qlover/fe-corekit';
import {
  type BootstrapContext,
  type BootstrapExecutorPlugin,
  type ApiMockPluginConfig,
  type ApiCatchPluginConfig,
  type ApiCatchPluginResponse
} from '@qlover/corekit-bridge';
import { UserApi } from './UserApi';

/**
 * UserApiConfig
 *
 * @description
 * UserApiConfig is the config for the UserApi.
 *
 * extends:
 * - ApiMockPluginConfig
 * - ApiCatchPluginConfig
 */
export interface UserApiConfig<Request = unknown>
  extends RequestAdapterConfig<Request>,
    ApiMockPluginConfig,
    ApiCatchPluginConfig {}

/**
 * UserApiResponse
 *
 * @description
 * UserApiResponse is the response for the UserApi.
 *
 * extends:
 * - RequestAdapterResponse<Request, Response>
 */
export interface UserApiResponse<Request = unknown, Response = unknown>
  extends RequestAdapterResponse<Request, Response>,
    ApiCatchPluginResponse {}

/**
 * UserApi common transaction
 *
 * FIXME: maybe we can add data to RequestTransactionInterface
 *
 * add data property
 */
export interface UserApiTransaction<Request = unknown, Response = unknown>
  extends RequestTransactionInterface<
    UserApiConfig<Request>,
    UserApiResponse<Request, Response>
  > {
  data: UserApiConfig<Request>['data'];
}

export class UserApiBootstarp implements BootstrapExecutorPlugin {
  readonly pluginName = 'UserApiBootstarp';

  onBefore({ parameters: { ioc } }: BootstrapContext): void {
    ioc
      .get<UserApi>(UserApi)
      .usePlugin(new FetchURLPlugin())
      .usePlugin(IOC.get(IOCIdentifier.FeApiCommonPlugin))
      .usePlugin(IOC.get(IOCIdentifier.ApiMockPlugin))
      .usePlugin(IOC.get(RequestLogger))
      .usePlugin(IOC.get(FetchAbortPlugin))
      .usePlugin(IOC.get(IOCIdentifier.ApiCatchPlugin));
  }
}
