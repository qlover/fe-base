import type { AppApiResponse } from '@/base/port/AppApiInterface';
import type {
  RequestAdapterConfig,
  RequestAdapterResponse,
  RequestTransactionInterface
} from '@qlover/fe-corekit';

export type UserApiConfig<Request = unknown> = RequestAdapterConfig<Request>;

/**
 * UserApiResponse
 *
 * @description
 * UserApiResponse is the response for the UserApi.
 *
 * extends:
 * - RequestAdapterResponse<Request, Response>
 */
export type UserApiResponse<
  Request = unknown,
  Response = unknown
> = RequestAdapterResponse<Request, AppApiResponse<Response>>;

/**
 * UserApi common transaction
 */
export interface UserApiTransaction<Request = unknown, Response = unknown>
  extends RequestTransactionInterface<
    UserApiConfig<Request>,
    UserApiResponse<Request, Response>
  > {
  data: UserApiConfig<Request>['data'];
}

export type UserApiLoginTransaction = UserApiTransaction<
  { email: string; password: string },
  {
    token: string;
  }
>;

export type UserApiRegisterTransaction = UserApiTransaction<
  {
    email: string;
    password: string;
  },
  UserApiTransaction['response']['data']
>;
