import type {
  ApiCatchPluginResponse,
  ApiCatchPluginConfig
} from '@/base/cases/apisPlugins/ApiCatchPlugin';
import type {
  RequestAdapterResponse,
  RequestTransactionInterface
} from '@qlover/fe-corekit';
import type { ApiMockPluginConfig } from '@/base/cases/apisPlugins/ApiMockPlugin';
import type { RequestAdapterConfig } from '@qlover/fe-corekit';

/**
 * UserApiConfig
 *
 * @description
 * UserApiConfig is the config for the UserApi.
 *
 * extends:
 * - ApiMockPluginConfig
 * - ApiCatchPluginConfig
 */
export interface UserApiConfig<Request = unknown>
  extends RequestAdapterConfig<Request>,
    ApiMockPluginConfig,
    ApiCatchPluginConfig {}

/**
 * UserApiResponse
 *
 * @description
 * UserApiResponse is the response for the UserApi.
 *
 * extends:
 * - RequestAdapterResponse<Request, Response>
 */
export interface UserApiResponse<Request = unknown, Response = unknown>
  extends RequestAdapterResponse<Request, Response>,
    ApiCatchPluginResponse {}

/**
 * UserApi common transaction
 *
 * FIXME: maybe we can add data to RequestTransactionInterface
 *
 * add data property
 */
export interface UserApiTransaction<Request = unknown, Response = unknown>
  extends RequestTransactionInterface<
    UserApiConfig<Request>,
    UserApiResponse<Request, Response>
  > {
  data: UserApiConfig<Request>['data'];
}

export type GetIpInfoTransaction = UserApiTransaction<
  undefined,
  {
    status: string;
    country: string;
    countryCode: string;
    region: string;
    regionName: string;
    city: string;
    zip: string;
    lat: number;
    lon: number;
    timezone: string;
    isp: string;
    org: string;
    as: string;
    query: string;
  }
>;

export type UserApiGetRandomUser = UserApiTransaction<
  undefined,
  {
    results: unknown[];
    info: {
      seed: string;
      results: number;
      page: number;
      version: string;
    };
  }
>;

export type UserApiGetUserInfoTransaction = UserApiTransaction<
  string,
  {
    name: string;
    email: string;
    picture: string;
  }
>;

export type UserApiLoginTransaction = UserApiTransaction<
  { username: string; password: string },
  {
    token: string;
  }
>;
