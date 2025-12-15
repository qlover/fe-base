import { RequestAdapterFetch, RequestScheduler } from '@qlover/fe-corekit';
import { inject, injectable } from 'inversify';
import { FeApiAdapter } from './FeApiAdapter';
import { FeApiConfig } from './FeApiBootstarp';
import { FeApiGetIpInfo } from './FeApiType';

@injectable()
export class FeApi extends RequestScheduler<FeApiConfig> {
  constructor(@inject(FeApiAdapter) adapter: RequestAdapterFetch) {
    super(adapter);
  }

  public stop(_config: FeApiConfig): void {}

  public async getIpInfo(): Promise<FeApiGetIpInfo['response']> {
    return this.get('http://ip-api.com/json/') as unknown as Promise<
      FeApiGetIpInfo['response']
    >;
  }
}
