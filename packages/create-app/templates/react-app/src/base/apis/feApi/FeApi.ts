import { RequestAdapterFetch, RequestAdapterConfig } from '@qlover/fe-corekit';
import { FeApiGetIpInfo } from './FeApiType';
import { ApiClient } from '@qlover/fe-prod/core/api-client';
import { inject, injectable } from 'inversify';
import { FeApiAdapter } from './FeApiAdapter';

@injectable()
export class FeApi extends ApiClient<RequestAdapterConfig> {
  constructor(@inject(FeApiAdapter) adapter: RequestAdapterFetch) {
    super(adapter);
  }

  stop(_config: RequestAdapterConfig): void {}

  async getIpInfo(): Promise<FeApiGetIpInfo['response']> {
    /**
     * Because FeApi uses the ApiPickDataPlugin plugin,
     * the ApiPickDataPlugin plugin rewrites the data at runtime
     *
     * So we need to assert the return value of FeApi
     */
    return this.get('http://ip-api.com/json/', {
      disabledMock: true
    }) as unknown as FeApiGetIpInfo['response'];
  }
}
