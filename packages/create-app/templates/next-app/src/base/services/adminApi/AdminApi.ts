import {
  FetchAbortPlugin,
  RequestAdapterFetch,
  RequestTransaction
} from '@qlover/fe-corekit';
import { inject, injectable } from 'inversify';
import type { AdminApiConfig } from './AdminApiType';

/**
 * UserApi
 *
 * @description
 * UserApi is a client for the user API.
 *
 */
@injectable()
export class AdminApi extends RequestTransaction<AdminApiConfig> {
  constructor(
    @inject(FetchAbortPlugin) protected abortPlugin: FetchAbortPlugin
  ) {
    super(
      new RequestAdapterFetch({
        baseURL: '/api',
        responseType: 'json'
      })
    );
  }
}
