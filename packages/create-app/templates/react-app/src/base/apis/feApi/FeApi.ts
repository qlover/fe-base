import {
  ExecutorContextInterface,
  LifecycleExecutor,
  RequestAdapterFetch,
  RequestExecutor
} from '@qlover/fe-corekit';
import { inject, injectable } from 'inversify';
import { FeApiAdapter } from './FeApiAdapter';
import { FeApiConfig } from './FeApiBootstarp';
import { FeApiGetIpInfo } from './FeApiType';

@injectable()
export class FeApi extends RequestExecutor<
  FeApiConfig,
  ExecutorContextInterface<FeApiConfig>
> {
  constructor(
    @inject(FeApiAdapter) adapter: RequestAdapterFetch,
  ) {
    super(adapter, new LifecycleExecutor<ExecutorContextInterface<FeApiConfig, unknown>>());
  }
  
  public async getIpInfo(): Promise<FeApiGetIpInfo['response']> {
    return this.get('http://ip-api.com/json/') as unknown as Promise<
      FeApiGetIpInfo['response']
    >;
  }
}
