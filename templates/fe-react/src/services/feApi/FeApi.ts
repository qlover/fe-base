import {
  FetchURLPlugin,
  RequestAdapterFetch,
  RequestAdapterConfig,
  RequestScheduler,
  FetchAbortPlugin
} from '@qlover/fe-utils';
import {
  FeApiGetIpInfo,
  FeApiGetRandomUser,
  FeApiGetUserInfo,
  FeApiLogin
} from './FeApiType';
import { RequestCommonPlugin } from '@lib/request-common-plugin';
export class FeApi extends RequestScheduler<RequestAdapterConfig> {
  constructor(private abortPlugin: FetchAbortPlugin) {
    super(
      new RequestAdapterFetch({
        responseType: 'json'
      })
    );

    this.usePlugin(new FetchURLPlugin());
    this.usePlugin(new RequestCommonPlugin());
  }

  stop(config: RequestAdapterConfig): void {
    this.abortPlugin.abort(config);
  }

  async getIpInfo(): Promise<FeApiGetIpInfo['response']> {
    return this.get('http://ip-api.com/json/');
  }

  async getRandomUser(): Promise<FeApiGetRandomUser['response']> {
    return this.get('https://randomuser.me/api/');
  }

  async getUserInfo(token: string): Promise<FeApiGetUserInfo['response']> {
    return this.get('/api/userinfo');
  }

  async login(params: FeApiLogin['request']): Promise<FeApiLogin['response']> {
    return this.post('/api/login', params);
  }
}
