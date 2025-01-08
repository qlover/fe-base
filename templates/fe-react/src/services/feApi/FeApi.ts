import {
  FetchURLPlugin,
  RequestAdapterFetch,
  RequestAdapterConfig,
  RequestScheduler,
  FetchAbortPlugin
} from '@qlover/fe-utils';
import { FeApiGetIpInfo, FeApiGetRandomUser } from './FeApiType';
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
}
