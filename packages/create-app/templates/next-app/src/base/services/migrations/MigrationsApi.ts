import { RequestCommonPlugin } from '@qlover/corekit-bridge';
import {
  FetchAbortPlugin,
  RequestTransaction,
  RequestAdapterFetch,
  FetchURLPlugin
} from '@qlover/fe-corekit';
import { inject, injectable } from 'inversify';
import type { MigrationApiInterface } from '@/base/port/MigrationApiInterface';
import type { RequestAdapterConfig } from '@qlover/fe-corekit';

/**
 * UserApi
 *
 * @description
 * UserApi is a client for the user API.
 *
 */
@injectable()
export class MigrationsApi
  extends RequestTransaction<RequestAdapterConfig>
  implements MigrationApiInterface
{
  constructor(
    @inject(FetchAbortPlugin) protected abortPlugin: FetchAbortPlugin
  ) {
    super(
      new RequestAdapterFetch({
        baseURL: '/api/admin/migrations',
        responseType: 'json'
      })
    );

    this.usePlugin(new FetchURLPlugin()).usePlugin(new RequestCommonPlugin());
  }

  async init(): Promise<unknown> {
    return this.request({
      url: '/init',
      method: 'POST'
    });
  }
}
