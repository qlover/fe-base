import { IOCIdentifier } from '@config/IOCIdentifier';
import {
  type BootstrapContext,
  type BootstrapExecutorPlugin,
  type ApiMockPluginOptions,
  type ApiCatchPluginConfig,
  type ApiCatchPluginResponse
} from '@qlover/corekit-bridge';
import {
  Aborter,
  AborterPlugin,
  RequestPlugin,
  ResponsePlugin,
  type AborterConfig,
  type RequestAdapterConfig,
  type RequestAdapterResponse
} from '@qlover/fe-corekit';
import { RequestLanguages } from '@/base/cases/RequestLanguages';
import { RequestLogger } from '@/base/cases/RequestLogger';
import { UserApi } from './UserApi';
import type { RequestTransactionInterface } from '../feApi/FeApiBootstarp';

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
    ApiCatchPluginConfig,
    AborterConfig {}

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
      .use(new RequestPlugin())
      .use(ioc.get(ResponsePlugin))
      .use(new AborterPlugin(ioc.get(Aborter)))
      .use(new RequestLanguages(ioc.get(IOCIdentifier.I18nServiceInterface)))
      .use(ioc.get(IOCIdentifier.ApiMockPlugin))
      .use(ioc.get(IOCIdentifier.ApiCatchPlugin))
      .use(ioc.get(RequestLogger));
  }
}
