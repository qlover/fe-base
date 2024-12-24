import { ApiCommonPlugin } from '@lib/plugins/ApiCommonPlugin';
import {
  FetchURLPlugin,
  RequestAdapterFetch,
  RequestAdpaterConfig,
  RequestScheduler,
  FetchAbortPlugin
} from 'packages/fe-utils/common';

export class FeApi extends RequestScheduler<RequestAdpaterConfig> {
  constructor(private abortPlugin: FetchAbortPlugin) {
    super(
      new RequestAdapterFetch({
        responseType: 'json'
      })
    );

    this.usePlugin(new FetchURLPlugin());
    this.usePlugin(new ApiCommonPlugin());
  }

  stop(config: RequestAdpaterConfig) {
    this.abortPlugin.abort(config);
  }

  async getIpInfo() {
    return this.get('http://ip-api.com/json/');
  }

  async getRandomUser() {
    return this.get('https://randomuser.me/api/');
  }
}
