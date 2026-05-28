import type { AppApiTransaction } from '@/impls/appApi/AppApiRequester';
import type { LoginSchema } from '@schemas/LoginSchema';
import type { UserSchema } from '@schemas/UserSchema';

export type UserApiLoginTransaction = AppApiTransaction<
  LoginSchema,
  UserSchema
>;

export type UserApiRegisterTransaction = AppApiTransaction<
  LoginSchema,
  UserSchema
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
