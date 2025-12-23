import { IOCIdentifier } from '@config/IOCIdentifier';
import {
  type BootstrapContext,
  type BootstrapExecutorPlugin,
  type ApiMockPluginOptions,
  type ApiCatchPluginConfig,
  type ApiCatchPluginResponse
} from '@qlover/corekit-bridge';
import { FetchAbortPlugin, FetchURLPlugin } from '@qlover/fe-corekit';
import { RequestLogger } from '@/base/cases/RequestLogger';
import { UserApi } from './UserApi';
import { RequestLanguages } from '../../cases/RequestLanguages';
import type {
  RequestAdapterConfig,
  RequestAdapterResponse,
  RequestTransactionInterface
} from '@qlover/fe-corekit';

/**
 * UserApiConfig
 *
 * @description
 * UserApiConfig is the config for the UserApi.
 *
 * extends:
 * - ApiMockPluginOptions
 * - ApiCatchPluginConfig
 */
export interface UserApiConfig<Request = unknown>
  extends
    RequestAdapterConfig<Request>,
    ApiMockPluginOptions,
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
  extends RequestAdapterResponse<Request, Response>, ApiCatchPluginResponse {}

/**
 * UserApi common transaction
 *
 * FIXME: maybe we can add data to RequestTransactionInterface
 *
 * add data property
 */
export interface UserApiTransaction<
  Request = unknown,
  Response = unknown
> extends RequestTransactionInterface<
  UserApiConfig<Request>,
  UserApiResponse<Request, Response>
> {
  data: UserApiConfig<Request>['data'];
}

export class UserApiBootstarp implements BootstrapExecutorPlugin {
  public readonly pluginName = 'UserApiBootstarp';

  /**
   * @override
   */
  public onBefore({ parameters: { ioc } }: BootstrapContext): void {
    ioc
      .get<UserApi>(UserApi)
      .usePlugin(new FetchURLPlugin())
      .usePlugin(ioc.get(IOCIdentifier.FeApiCommonPlugin))
      .usePlugin(
        new RequestLanguages(ioc.get(IOCIdentifier.I18nServiceInterface))
      )
      .usePlugin(ioc.get(IOCIdentifier.ApiMockPlugin))
      .usePlugin(ioc.get(RequestLogger))
      .usePlugin(ioc.get(FetchAbortPlugin))
      .usePlugin(ioc.get(IOCIdentifier.ApiCatchPlugin));
  }
}
