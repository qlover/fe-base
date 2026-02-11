import {
  LifecycleExecutor,
  RequestAdapterFetch,
  RequestExecutor,
  RequestPlugin,
  ResponsePlugin
} from '@qlover/fe-corekit';
import { injectable } from './Container';
import { UserService } from './UserService';
import type { BootstrapExecutorPlugin } from '@qlover/corekit-bridge/bootstrap';
import type {
  ExecutorContextInterface,
  RequestAdapterConfig,
  RequestAdapterResponse
} from '@qlover/fe-corekit';

export interface RequestTransactionInterface<Request, Response> {
  request: Request;
  response: Response;
}

export type AppApiConfig<Request = unknown> = RequestAdapterConfig<Request> & {
  encryptProps?: string | string[];
  token?: string;
};

export type AppApiRequesterContext = ExecutorContextInterface<AppApiConfig>;

/**
 * UserApiResponse
 *
 * @description
 * UserApiResponse is the response for the UserApi.
 *
 * extends:
 * - RequestAdapterResponse<Request, Response>
 */
export type AppApiResponse<
  Request = unknown,
  Response = unknown
> = RequestAdapterResponse<
  Request,
  {
    data: Response;
  }
>;

/**
 * UserApi common transaction
 */
export interface AppApiTransaction<
  Request = unknown,
  Response = unknown
> extends RequestTransactionInterface<
  AppApiConfig<Request>,
  AppApiResponse<Request, Response>
> {
  data: AppApiConfig<Request>['data'];
}

@injectable()
export class AppApiRequester extends RequestExecutor<
  AppApiConfig,
  AppApiRequesterContext
> {
  constructor() {
    super(
      new RequestAdapterFetch({
        baseURL: '/api',
        responseType: 'json'
      }),
      new LifecycleExecutor()
    );

    // this.use(
    //   new RequestPlugin({
    //     authKey: 'Authorization',
    //     tokenPrefix: 'Bearer',
    //     token() {
    //       return userService.getCredential()?.token ?? null;
    //     }
    //   })
    // );
  }

  /**
   * 你可以创建无数个相同的请求器
   *
   * @example 增加一个自定义的插件
   *
   * ```typescript
   * const appApiRequester = new AppApiRequester();
   *
   * const withPrintParams = appApiRequester.clone().use({
   *   pluginName: 'customPlugin',
   *   onBefore({ parameters }) {
   *     console.log(parameters)
   *   }
   * });
   *
   * const withPrintResult = appApiRequester.clone().use({
   *   pluginName: 'customPlugin',
   *   onSuccess({ returnValue }) {
   *     console.log(returnValue)
   *   }
   * });
   * ```
   *
   * @returns
   */
  public clone(): RequestExecutor<AppApiConfig, AppApiRequesterContext> {
    return new RequestExecutor(this.adapter, new LifecycleExecutor());
  }
}

export const appApiRequesterBootstrap: BootstrapExecutorPlugin = {
  pluginName: 'AppApiRequesterBootstrap',
  onBefore({ parameters: { ioc } }) {
    const appApiRequester = ioc.get<AppApiRequester>(AppApiRequester);
    const userService = ioc.get<UserService>(UserService);

    appApiRequester
      .use(
        new RequestPlugin({
          authKey: 'Authorization',
          tokenPrefix: 'Bearer',
          token() {
            return userService.getCredential()?.token ?? null;
          }
        })
      )
      .use(new ResponsePlugin());
  }
};
