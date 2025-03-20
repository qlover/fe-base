import { ApiClient } from '@lib/api-client';
import {
  FetchAbortPlugin,
  RequestAdapterConfig,
  RequestAdapterFetch
} from '@qlover/fe-utils';
import { FeApiLogin } from '../feApi/FeApiType';
import { FeApiGetUserInfo } from '../feApi/FeApiType';
import { FeApiGetRandomUser } from '../feApi/FeApiType';
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

  async getRandomUser(): Promise<FeApiGetRandomUser['response']> {
    return this.get('https://randomuser.me/api/');
  }

  async getUserInfo(): Promise<FeApiGetUserInfo['response']> {
    return this.get('/api/userinfo');
  }

  async login(params: FeApiLogin['request']): Promise<FeApiLogin['response']> {
    return this.post('/api/login', {
      // FIXME: RequestAdapterResponse response type error
      data: params as unknown as FeApiLogin['response']['data']
    });
  }
}
