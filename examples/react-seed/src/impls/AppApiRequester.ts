import {
  LifecycleExecutor,
  RequestAdapterFetch,
  RequestExecutor
} from '@qlover/fe-corekit';
import { injectable } from './Container';
import type {
  ExecutorContextInterface,
  RequestAdapterConfig,
  RequestAdapterResponse
} from '@qlover/fe-corekit';

export interface RequestTransactionInterface<Request, Response> {
  request: Request;
  response: Response;
}

export type AppApiConfig<Request = unknown> = RequestAdapterConfig<Request> & {
  encryptProps?: string | string[];
};

export type AppApiRequesterContext = ExecutorContextInterface<AppApiConfig>;

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
> = RequestAdapterResponse<
  Request,
  {
    data: Response;
  }
>;

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
