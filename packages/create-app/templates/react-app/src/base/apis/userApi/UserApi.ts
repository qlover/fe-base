import { RES_NO_TOKEN } from '@config/Identifier';
import {
  FetchAbortPlugin,
  RequestAdapterFetch,
  RequestTransaction
} from '@qlover/fe-corekit';
import { inject, injectable } from 'inversify';
import { AppError } from '@/base/cases/AppError';
import { UserApiAdapter } from './UserApiAdapter';
import { UserApiConfig } from './UserApiBootstarp';
import {
  GetIpInfoTransaction,
  UserApiGetUserInfoTransaction,
  UserApiLoginTransaction,
  UserApiRegisterTransaction,
  UserApiTestApiCatchResultTransaction,
  UserInfo,
  UserCredential
} from './UserApiType';
import type {
  UserAuthStoreInterface,
  UserServiceGateway
} from '@qlover/corekit-bridge';

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
  implements UserServiceGateway<UserCredential, UserInfo>
{
  protected store: UserAuthStoreInterface<UserInfo> | null = null;

  constructor(
    @inject(FetchAbortPlugin) protected abortPlugin: FetchAbortPlugin,
    @inject(UserApiAdapter) adapter: RequestAdapterFetch
  ) {
    super(adapter);
  }

  getStore(): UserAuthStoreInterface<UserInfo> | null {
    return this.store;
  }

  /**
   * @override
   * @param store
   */
  setStore(store: UserAuthStoreInterface<UserInfo>): void {
    this.store = store;
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

  /**
   * @override
   * @param params
   * @returns
   */
  async login<Params extends UserApiLoginTransaction['data']>(
    params: Params
  ): Promise<UserCredential> {
    const response = await this.post<UserApiLoginTransaction>(
      '/api/login',
      params
    );

    if (response.apiCatchResult) {
      throw response.apiCatchResult;
    }

    if (!response.data.token) {
      throw new AppError(RES_NO_TOKEN);
    }

    return response.data;
  }

  /**
   * @override
   * @param params
   * @returns
   */
  register(
    params: UserApiRegisterTransaction['data']
  ): Promise<UserApiRegisterTransaction['response']['data']> {
    // @ts-expect-error - TODO: implement
    return this.post<UserApiRegisterTransaction>('/api/register', params);
  }

  /**
   * @override
   * @returns
   */
  async refreshUserInfo(): Promise<UserInfo> {
    throw new Error('Not implemented');
  }

  /**
   * @override
   * @returns
   */
  logout(): Promise<any> {
    return Promise.resolve();
  }

  /**
   * @override
   * @returns
   */
  async getUserInfo(): Promise<UserInfo> {
    const response =
      await this.get<UserApiGetUserInfoTransaction>('/api/userinfo');

    if (response.apiCatchResult) {
      throw response.apiCatchResult;
    }

    return response.data;
  }
}
