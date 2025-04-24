import { RequestAdapterFetch, RequestScheduler } from '@qlover/fe-corekit';
import { FeApiGetIpInfo } from './FeApiType';
import { inject, injectable } from 'inversify';
import { FeApiAdapter } from './FeApiAdapter';
import { FeApiConfig } from './FeApiBootstarp';

@injectable()
export class FeApi extends RequestScheduler<FeApiConfig> {
  constructor(@inject(FeApiAdapter) adapter: RequestAdapterFetch) {
    super(adapter);
  }

  stop(_config: FeApiConfig): void {}

  async getIpInfo(): Promise<FeApiGetIpInfo['response']> {
    return this.get('http://ip-api.com/json/') as unknown as Promise<
      FeApiGetIpInfo['response']
    >;
  }
}
