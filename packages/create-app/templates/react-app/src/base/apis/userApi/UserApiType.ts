import { UserApiTransaction } from './UserApiBootstarp';

export type UserInfo = {
  name: string;
  email: string;
  picture: string;
};

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
  UserInfo
>;

export type UserApiLoginTransaction = UserApiTransaction<
  { username: string; password: string },
  {
    token: string;
  }
>;

export type UserApiTestApiCatchResultTransaction = UserApiGetRandomUser;

export type UserApiRegisterTransaction = UserApiTransaction<
  {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
  },
  UserApiTransaction['response']['data']
>;
