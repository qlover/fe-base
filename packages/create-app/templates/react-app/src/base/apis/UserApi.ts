import { ApiClient } from '@lib/api-client';
import { RequestAdapterConfig, RequestAdapterFetch } from '@qlover/fe-utils';

export class UserApi extends ApiClient<RequestAdapterConfig> {
  constructor(config: RequestAdapterConfig) {
    super(new RequestAdapterFetch(config));
  }

  /**
   * @override
   */
  stop(request: RequestAdapterConfig): Promise<void> | void {
    throw new Error('Method not implemented.');
  }
}
