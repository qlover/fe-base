import { I } from '@config/IOCIdentifier';
import {
  type BootstrapContext,
  type BootstrapExecutorPlugin,
  type ApiMockPluginConfig,
  ApiPickDataPlugin
} from '@qlover/corekit-bridge';
import {
  RequestPlugin,
  type RequestAdapterConfig,
  type RequestAdapterResponse
} from '@qlover/fe-corekit';
import type { AppConfig } from '@/base/cases/AppConfig';
import { RequestLogger } from '@/base/cases/RequestLogger';
import type { UserService } from '@/base/services/UserService';
import { FeApi } from './FeApi';

export interface RequestTransactionInterface<Request, Response> {
  request: Request;
  response: Response;
}

/**
 * FeApiConfig
 *
 * @description
 * FeApiConfig is the config for the FeApi.
 *
 * extends:
 */
export type FeApiConfig<Request = unknown> = RequestAdapterConfig<Request> &
  ApiMockPluginConfig & {};

/**
 * FeApiResponse
 *
 * @description
 * FeApiResponse is the response for the FeApi.
 *
 * extends:
 * - RequestAdapterResponse<Request, Response>
 */
export interface FeApiResponse<
  Request = unknown,
  Response = unknown
> extends RequestAdapterResponse<Request, Response> {}

/**
 * FeApi common transaction
 *
 * FIXME: maybe we can add data to RequestTransactionInterface
 *
 * add data property
 */
export interface FeApiTransaction<
  Request = unknown,
  Response = unknown
> extends RequestTransactionInterface<
  FeApiConfig<Request>,
  FeApiResponse<Request, Response>['data']
> {
  data: FeApiConfig<Request>['data'];
}

export class FeApiBootstarp implements BootstrapExecutorPlugin {
  public readonly pluginName = 'FeApiBootstarp';

  /**
   * @override
   */
  public onBefore({ parameters: { ioc } }: BootstrapContext): void {
    const appConfig = ioc.get<AppConfig>(I.AppConfig);
    ioc
      .get<FeApi>(FeApi)
      .use(
        new RequestPlugin({
          tokenPrefix: appConfig.openAiTokenPrefix,
          token: () => ioc.get<UserService>(I.UserServiceInterface).getToken()
        })
      )
      .use(ioc.get(RequestLogger))
      .use(ioc.get(ApiPickDataPlugin));
  }
}
