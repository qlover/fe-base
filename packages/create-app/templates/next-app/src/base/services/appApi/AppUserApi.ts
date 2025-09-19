import { inject, injectable } from 'inversify';
import type { AppApiResult } from '@/base/port/AppApiInterface';
import type { AppUserApiInterface } from '@/base/port/AppUserApiInterface';
import { AppApiRequester } from './AppApiRequester';
import type { AppApiConfig, AppApiTransaction } from './AppApiRequester';
import type { RequestTransaction } from '@qlover/fe-corekit';

export type UserApiLoginTransaction = AppApiTransaction<
  { email: string; password: string },
  {
    token: string;
  }
>;

export type UserApiRegisterTransaction = AppApiTransaction<
  {
    email: string;
    password: string;
  },
  AppApiTransaction['response']['data']
>;

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
    protected client: RequestTransaction<AppApiConfig>
  ) {}

  async login(
    params: UserApiLoginTransaction['data']
  ): Promise<AppApiResult<unknown>> {
    const response = await this.client.request<UserApiLoginTransaction>({
      url: '/user/login',
      method: 'POST',
      data: params,
      encryptProps: 'password'
    });

    return response.data;
  }

  async register(
    params: UserApiRegisterTransaction['data']
  ): Promise<AppApiResult<unknown>> {
    const response = await this.client.request<UserApiRegisterTransaction>({
      url: '/user/register',
      method: 'POST',
      data: params,
      encryptProps: 'password'
    });

    return response.data;
  }

  async logout(): Promise<AppApiResult<unknown>> {
    const response = await this.client.request({
      url: '/user/logout',
      method: 'POST'
    });

    return response.data as AppApiResult<unknown>;
  }
}
