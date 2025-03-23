import { FeApiTransaction } from './FeApiBootstarp';

export type FeApiGetIpInfo = FeApiTransaction<
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

export type FeApiGetRandomUser = FeApiTransaction<
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

export type FeApiGetUserInfo = FeApiTransaction<
  string,
  {
    name: string;
    email: string;
    picture: string;
  }
>;

export type FeApiLogin = FeApiTransaction<
  { username: string; password: string },
  {
    token: string;
  }
>;
