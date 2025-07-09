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
import {
  LoginResponseData,
  UserAuthApiInterface,
  UserAuthStoreInterface,
  UserAuthState
} from '@qlover/corekit-bridge';
import {
  RegisterFormData,
  UserServiceUserInfo
} from '@/base/services/UserService';
import { RES_NO_TOKEN } from '@config/Identifier';
import { AppError } from '@/base/cases/AppError';

export type UserApiState = UserAuthState<UserServiceUserInfo>;

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
  implements UserAuthApiInterface<UserApiState>
{
  protected store: UserAuthStoreInterface<UserApiState> | null = null;

  constructor(
    @inject(FetchAbortPlugin) private abortPlugin: FetchAbortPlugin,
    @inject(UserApiAdapter) adapter: RequestAdapterFetch
  ) {
    super(adapter);
  }

  getStore(): UserAuthStoreInterface<UserApiState> | null {
    return this.store;
  }

  /**
   * @override
   * @param store
   */
  setStore(store: UserAuthStoreInterface<UserApiState>): void {
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
  async login(
    params: UserApiLoginTransaction['data']
  ): Promise<LoginResponseData> {
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
    params: RegisterFormData
  ): Promise<UserApiLoginTransaction['response']> {
    return this.post<UserApiLoginTransaction>('/api/register', params);
  }

  /**
   * @override
   * @returns
   */
  logout(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * @override
   * @returns
   */
  async getUserInfo(): Promise<
    UserApiGetUserInfoTransaction['response']['data']
  > {
    const response =
      await this.get<UserApiGetUserInfoTransaction>('/api/userinfo');

    if (response.apiCatchResult) {
      throw response.apiCatchResult;
    }

    return response.data;
  }
}
