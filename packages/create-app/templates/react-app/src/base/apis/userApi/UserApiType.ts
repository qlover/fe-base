import { UserApiTransaction } from './UserApiTransaction';

export type UserApiGetIpInfo = UserApiTransaction<
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

export type UserApiGetUserInfo = UserApiTransaction<
  string,
  {
    name: string;
    email: string;
    picture: string;
  }
>;

export type UserApiLogin = UserApiTransaction<
  { username: string; password: string },
  {
    token: string;
  }
>;
