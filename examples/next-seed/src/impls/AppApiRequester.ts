import {
  LifecycleExecutor,
  RequestAdapterFetch,
  RequestExecutor
} from '@qlover/fe-corekit';
import type { RequestEncryptPluginProps } from '@/impls/RequestEncryptPlugin';
import { injectable } from '@shared/container';
import type { AppApiResult } from '@interfaces/AppApiInterface';
import type { DialogErrorConfig } from './DialogErrorPlugin';
import type {
  ExecutorContextInterface,
  RequestAdapterConfig,
  RequestAdapterResponse
} from '@qlover/fe-corekit';

export interface RequestTransactionInterface<Request, Response> {
  request: Request;
  response: Response;
}

export type AppApiConfig<Request = unknown> = RequestAdapterConfig<Request> &
  RequestEncryptPluginProps<Request> &
  DialogErrorConfig;

export interface AppApiRequesterContext extends ExecutorContextInterface<AppApiConfig> {}

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
export class AppApiRequester extends RequestExecutor<
  AppApiConfig,
  AppApiRequesterContext
> {
  constructor() {
    super(
      new RequestAdapterFetch({
        baseURL: '/api',
        responseType: 'json'
      }),
      new LifecycleExecutor()
    );
  }
}
