import {
  ExecutorContextInterface,
  RequestAdapterFetch,
  RequestExecutor
} from '@qlover/fe-corekit';
import { injectable } from 'inversify';
import type { AppApiConfig } from '../appApi/AppApiRequester';

export interface AdminApiRequesterContext extends ExecutorContextInterface<AppApiConfig> {}

@injectable()
export class AdminApiRequester extends RequestExecutor<
  AppApiConfig,
  AdminApiRequesterContext
> {
  constructor() {
    super(
      new RequestAdapterFetch({
        baseURL: '/api/admin',
        responseType: 'json'
      })
    );
  }
}
