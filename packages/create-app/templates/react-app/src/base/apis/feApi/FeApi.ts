import {
  RequestAdapterFetch,
  RequestAdapterConfig,
  FetchAbortPlugin,
  RequestAdapterFetchConfig
} from '@qlover/fe-utils';
import {
  FeApiGetIpInfo,
  FeApiGetRandomUser,
  FeApiGetUserInfo,
  FeApiLogin
} from './FeApiType';
import { ApiClient } from '@lib/api-client';

export class FeApi extends ApiClient<RequestAdapterConfig> {
  private abortPlugin: FetchAbortPlugin;

  constructor({
    abortPlugin,
    config
  }: {
    abortPlugin: FetchAbortPlugin;
    config?: Partial<RequestAdapterFetchConfig>;
  }) {
    super(new RequestAdapterFetch(config));
    this.abortPlugin = abortPlugin;
  }

  /**
   * @override
   */
  stop(config: RequestAdapterConfig): void {
    this.abortPlugin.abort(config);
  }

  async getIpInfo(): Promise<FeApiGetIpInfo['response']> {
    return this.get('http://ip-api.com/json/');
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
