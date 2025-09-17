import {
  FetchAbortPlugin,
  RequestAdapterFetch,
  RequestTransaction
} from '@qlover/fe-corekit';
import { inject, injectable } from 'inversify';
import type { AppApiConfig } from '../appApi/AppApiRequester';

@injectable()
export class AdminApiRequester extends RequestTransaction<AppApiConfig> {
  constructor(
    @inject(FetchAbortPlugin) protected abortPlugin: FetchAbortPlugin
  ) {
    super(
      new RequestAdapterFetch({
        baseURL: '/api/admin',
        responseType: 'json'
      })
    );
  }
}
