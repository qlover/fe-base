import { ApiClient } from '@fe-prod/core/api-client';
import {
  FetchAbortPlugin,
  RequestAdapterConfig,
  RequestAdapterFetch
} from '@qlover/fe-utils';
import { UserApiLogin } from './UserApiType';
import { UserApiGetUserInfo } from './UserApiType';
import { UserApiGetRandomUser } from './UserApiType';
import { inject, injectable } from 'inversify';
import { UserApiAdapter } from './UserApiAdapter';

/**
 * UserApi
 *
 * @description
 * UserApi is a client for the user API.
 *
 */
@injectable()
export class UserApi extends ApiClient<RequestAdapterConfig> {
  constructor(
    @inject(FetchAbortPlugin) private abortPlugin: FetchAbortPlugin,
    @inject(UserApiAdapter) adapter: RequestAdapterFetch
  ) {
    super(adapter);
  }

  /**
   * @override
   */
  stop(request: RequestAdapterConfig): Promise<void> | void {
    this.abortPlugin.abort(request);
  }

  async getRandomUser(): Promise<UserApiGetRandomUser['response']> {
    return this.get('https://randomuser.me/api/', {
      disabledMock: true
    });
  }

  async getUserInfo(): Promise<UserApiGetUserInfo['response']> {
    return this.get('/api/userinfo');
  }

  async login(params: UserApiLogin['request']): Promise<UserApiLogin['response']> {
    return this.post('/api/login', {
      // FIXME: RequestAdapterResponse response type error
      data: params as unknown as UserApiLogin['response']['data']
    });
  }
}
