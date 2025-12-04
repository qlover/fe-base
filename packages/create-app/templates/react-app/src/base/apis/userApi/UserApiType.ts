import type { LoginParams } from '@qlover/corekit-bridge';
import type { UserApiTransaction } from './UserApiBootstarp';

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

export type UserCredential = {
  token: string;
};

export type UserApiLoginTransaction = UserApiTransaction<
  LoginParams & { username?: string },
  UserCredential
>;

export type UserApiTestApiCatchResultTransaction = UserApiGetRandomUser;

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export type UserApiRegisterTransaction = UserApiTransaction<
  RegisterFormData,
  UserInfo
>;
