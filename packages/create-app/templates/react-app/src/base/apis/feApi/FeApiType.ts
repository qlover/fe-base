import { ApiCatchResult } from './ApiCatchPlugin';
import { RequestAdapterResponse } from '@qlover/fe-utils';

/**
 * extends RequestAdapterResponse
 * 
 * - add catchError
 */
export interface WrapperFeApiResponse<Request, Response>
  extends RequestAdapterResponse<Request, Response> {
  /**
   * ApiCatchPlugin returns value
   */
  catchError?: ApiCatchResult;
}

export type FeApiType<Request, Response> = {
  request: Request;
  response: WrapperFeApiResponse<Request, Response>;
};

export type FeApiGetIpInfo = FeApiType<
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

export type FeApiGetRandomUser = FeApiType<
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

export type FeApiGetUserInfo = FeApiType<
  string,
  {
    name: string;
    email: string;
    picture: string;
  }
>;

export type FeApiLogin = FeApiType<
  { username: string; password: string },
  {
    token: string;
  }
>;
