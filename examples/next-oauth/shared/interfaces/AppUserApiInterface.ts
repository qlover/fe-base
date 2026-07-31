import type { AppApiTransaction } from '@/impls/appApi/AppApiRequester';
import type { OAuthConsentPayload } from './UserServiceInterface';
import type { LoginSchema } from '@qlover/next-kit/common';
import type { UserSchema } from '@qlover/next-kit/common';

export type UserApiLoginTransaction = AppApiTransaction<
  LoginSchema,
  UserSchema
>;

export type UserApiRegisterTransaction = AppApiTransaction<
  LoginSchema,
  UserSchema
>;

export type UserSubmitOAuthConsentTransaction = AppApiTransaction<
  OAuthConsentPayload,
  { redirectUrl: string }
>;

export type UserApiLogoutTransaction = AppApiTransaction<unknown, void>;

export interface AppUserApiInterface {
  login(
    params: UserApiLoginTransaction['data']
  ): Promise<UserApiLoginTransaction['response']>;

  register(
    params: UserApiRegisterTransaction['data']
  ): Promise<UserApiRegisterTransaction['response']>;

  logout(params?: unknown): Promise<UserApiLogoutTransaction['response']>;
}
