import {
  FetchAbortPlugin,
  RequestAdapterFetch,
  RequestTransaction
} from '@qlover/fe-corekit';
import {
  GetIpInfoTransaction,
  UserApiGetUserInfoTransaction,
  UserApiLoginTransaction,
  UserApiTestApiCatchResultTransaction
} from './UserApiType';
import { inject, injectable } from 'inversify';
import { UserApiAdapter } from './UserApiAdapter';
import { UserApiConfig } from './UserApiBootstarp';

/**
 * UserApi
 *
 * @description
 * UserApi is a client for the user API.
 *
 */
@injectable()
export class UserApi extends RequestTransaction<UserApiConfig> {
  constructor(
    @inject(FetchAbortPlugin) private abortPlugin: FetchAbortPlugin,
    @inject(UserApiAdapter) adapter: RequestAdapterFetch
  ) {
    super(adapter);
  }

  stop(request: UserApiConfig): Promise<void> | void {
    this.abortPlugin.abort(request);
  }

  async getRandomUser(): Promise<GetIpInfoTransaction['response']> {
    return this.request<GetIpInfoTransaction>({
      url: 'https://randomuser.me/api/',
      method: 'GET',
      disabledMock: true
    });
  }

  async testApiCatchResult(): Promise<
    UserApiTestApiCatchResultTransaction['response']
  > {
    return this.request<UserApiTestApiCatchResultTransaction>({
      url: 'https://randomuser.me/api/?_name=ApiCatchResult',
      method: 'GET',
      disabledMock: true,
      openApiCatch: true
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
