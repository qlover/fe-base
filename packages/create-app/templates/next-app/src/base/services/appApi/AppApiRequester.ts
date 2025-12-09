import {
  FetchAbortPlugin,
  RequestAdapterFetch,
  RequestTransaction
} from '@qlover/fe-corekit';
import { inject, injectable } from 'inversify';
import type { RequestEncryptPluginProps } from '@/base/cases/RequestEncryptPlugin';
import type { AppApiResult } from '@/base/port/AppApiInterface';
import type {
  RequestAdapterConfig,
  RequestAdapterResponse,
  RequestTransactionInterface
} from '@qlover/fe-corekit';

export interface AppApiConfig<Request = unknown>
  extends RequestAdapterConfig<Request>, RequestEncryptPluginProps<Request> {}

/**
 * UserApiResponse
 *
 * @description
 * UserApiResponse is the response for the UserApi.
 *
 * extends:
 * - RequestAdapterResponse<Request, Response>
 */
export type AppApiResponse<
  Request = unknown,
  Response = unknown
> = RequestAdapterResponse<Request, AppApiResult<Response>>;

/**
 * UserApi common transaction
 */
export interface AppApiTransaction<
  Request = unknown,
  Response = unknown
> extends RequestTransactionInterface<
  AppApiConfig<Request>,
  AppApiResponse<Request, Response>
> {
  data: AppApiConfig<Request>['data'];
}

@injectable()
export class AppApiRequester extends RequestTransaction<AppApiConfig> {
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
