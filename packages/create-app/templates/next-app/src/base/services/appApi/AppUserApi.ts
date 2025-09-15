import {
  FetchAbortPlugin,
  RequestTransaction,
  RequestAdapterFetch
} from '@qlover/fe-corekit';
import { inject, injectable } from 'inversify';
import type { AppApiResponse } from '@/base/port/AppApiInterface';
import type { AppUserApiInterface } from '@/base/port/AppUserApiInterface';
import type {
  UserApiConfig,
  UserApiLoginTransaction,
  UserApiRegisterTransaction
} from './AppUserType';

/**
 * UserApi
 *
 * @description
 * UserApi is a client for the user API.
 *
 */
@injectable()
export class AppUserApi
  extends RequestTransaction<UserApiConfig>
  implements AppUserApiInterface
{
  constructor(
    @inject(FetchAbortPlugin) protected abortPlugin: FetchAbortPlugin
  ) {
    super(
      new RequestAdapterFetch({
        baseURL: '/api',
        responseType: 'json'
      })
    );
  }

  async login(
    params: UserApiLoginTransaction['data']
  ): Promise<AppApiResponse<unknown>> {
    const response = await this.request<UserApiLoginTransaction>({
      url: '/user/login',
      method: 'POST',
      data: params,
      encryptProps: 'password'
    });

    return response.data;
  }

  async register(
    params: UserApiRegisterTransaction['data']
  ): Promise<AppApiResponse<unknown>> {
    const response = await this.request<UserApiRegisterTransaction>({
      url: '/user/register',
      method: 'POST',
      data: params,
      encryptProps: 'password'
    });

    return response.data;
  }
}
