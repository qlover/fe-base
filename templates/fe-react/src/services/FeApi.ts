import { ApiCommonPlugin } from '@lib/plugins/ApiCommonPlugin';
import {
  FetchURLPlugin,
  RequestAdapterFetch,
  RequestAdpaterConfig,
  RequestScheduler
} from 'packages/fe-utils/common';

export class FeApi extends RequestScheduler<RequestAdpaterConfig> {
  constructor() {
    super(
      new RequestAdapterFetch({
        responseType: 'json'
      })
    );

    this.usePlugin(new FetchURLPlugin());
    this.usePlugin(new ApiCommonPlugin());
  }

  async getIpInfo() {
    return this.get('http://ip-api.com/json/');
  }

  async getRandomUser() {
    return this.get('https://randomuser.me/api/');
  }
}
