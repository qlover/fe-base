import {
  RequestAdapterFetch,
  RequestAdapterConfig,
  FetchAbortPlugin
} from '@qlover/fe-utils';
import { FeApiGetIpInfo } from './FeApiType';
import { ApiClient } from '@lib/api-client';
import { inject, injectable } from 'inversify';
import { FeApiAdapter } from './FeApiAdapter';

@injectable()
export class FeApi extends ApiClient<RequestAdapterConfig> {
  constructor(
    @inject(FetchAbortPlugin) private abortPlugin: FetchAbortPlugin,
    @inject(FeApiAdapter) adapter: RequestAdapterFetch
  ) {
    super(adapter);
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
}
