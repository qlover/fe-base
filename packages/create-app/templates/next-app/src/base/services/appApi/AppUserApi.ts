import { RequestExecutor } from '@qlover/fe-corekit';
import { inject, injectable } from 'inversify';
import type {
  AppUserApiInterface,
  UserApiLoginTransaction,
  UserApiLogoutTransaction,
  UserApiRegisterTransaction
} from '@/base/port/AppUserApiInterface';
import { AppApiRequester } from './AppApiRequester';
import type { AppApiConfig, AppApiRequesterContext } from './AppApiRequester';

/**
 * UserApi
 *
 * @description
 * UserApi is a client for the user API.
 *
 */
@injectable()
export class AppUserApi implements AppUserApiInterface {
  constructor(
    @inject(AppApiRequester)
    protected client: RequestExecutor<AppApiConfig, AppApiRequesterContext>
  ) {}

  /**
   * @override
   */
  public async login(
    params: UserApiLoginTransaction['data']
  ): Promise<UserApiLoginTransaction['response']> {
    const response = await this.client.request<
      UserApiLoginTransaction['response'],
      UserApiLoginTransaction['request']
    >({
      url: '/user/login',
      method: 'POST',
      data: params,
      encryptProps: 'password'
    });

    return response;
  }

  /**
   * @override
   */
  public async register(
    params: UserApiRegisterTransaction['data']
  ): Promise<UserApiRegisterTransaction['response']> {
    const response = await this.client.request<
      UserApiRegisterTransaction['response'],
      UserApiRegisterTransaction['request']
    >({
      url: '/user/register',
      method: 'POST',
      data: params,
      encryptProps: 'password'
    });

    return response;
  }

  /**
   * @override
   */
  public async logout(
    _params?: unknown
  ): Promise<UserApiLogoutTransaction['response']> {
    return await this.client.request<
      UserApiLogoutTransaction['response'],
      UserApiLogoutTransaction['request']
    >({
      url: '/user/logout',
      method: 'POST'
    });
  }
}
