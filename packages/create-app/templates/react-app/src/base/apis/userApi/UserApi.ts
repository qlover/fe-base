import {
  FetchAbortPlugin,
  RequestAdapterFetch,
  RequestTransaction
} from '@qlover/fe-corekit';
import { UserApiGetUserInfoTransaction } from './UserApiType';
import { inject, injectable } from 'inversify';
import { UserApiAdapter } from './UserApiAdapter';
import type {
  GetIpInfoTransaction,
  UserApiConfig,
  UserApiLoginTransaction
} from './UserApiType';
import { IOCContainerInterface } from '@qlover/fe-prod/core';
import { ApiClientInterface } from '@qlover/fe-prod/core/api-client/interface/ApiClientInterface';

/**
 * UserApi
 *
 * @description
 * UserApi is a client for the user API.
 *
 */
@injectable()
export class UserApi
  extends RequestTransaction<UserApiConfig>
  implements ApiClientInterface<UserApiConfig>
{
  constructor(
    @inject(FetchAbortPlugin) private abortPlugin: FetchAbortPlugin,
    @inject(UserApiAdapter) adapter: RequestAdapterFetch
  ) {
    super(adapter);
  }

  /**
   * @override
   * @param ioc
   */
  usePlugins(ioc: IOCContainerInterface): void {
    ioc.get(FetchAbortPlugin);
  }

  /**
   * @override
   * @param request
   */
  stop(request: UserApiConfig): Promise<void> | void {
    this.abortPlugin.abort(request);
  }

  async getRandomUser(): Promise<GetIpInfoTransaction['response']> {
    return this.request<GetIpInfoTransaction>({
      url: 'https://randomuser.me/api/',
      disabledMock: true
    });
  }

  async getUserInfo(): Promise<UserApiGetUserInfoTransaction['response']> {
    return this.get<UserApiGetUserInfoTransaction>('/api/userinfo');
  }

  async login(
    params: UserApiLoginTransaction['data']
  ): Promise<UserApiLoginTransaction['response']> {
    return this.post<UserApiLoginTransaction>('/api/login', params);
  }
}
