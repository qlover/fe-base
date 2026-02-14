import {
  LifecycleExecutor,
  RequestAdapterFetch,
  RequestExecutor
} from '@qlover/fe-corekit';
import type { RequestEncryptPluginProps } from '@/impls/RequestEncryptPlugin';
import { injectable } from '@shared/container';
import type { AppApiResult } from '@shared/interfaces/AppApiInterface';
import type {
  ExecutorContextInterface,
  RequestAdapterConfig,
  RequestAdapterResponse
} from '@qlover/fe-corekit';

export interface RequestTransactionInterface<Request, Response> {
  request: Request;
  response: Response;
}

export interface AppApiConfig<Request = unknown>
  extends RequestAdapterConfig<Request>, RequestEncryptPluginProps<Request> {}

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
        // TODO: ReqeustPlugin build url 最后需要带上/
        baseURL: '/api/',
        responseType: 'json'
      }),
      new LifecycleExecutor()
    );
  }
}
