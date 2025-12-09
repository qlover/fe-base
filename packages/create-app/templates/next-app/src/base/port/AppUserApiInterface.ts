import type { LoginValidatorData } from '@/server/validators/LoginValidator';
import type { UserSchema } from '@migrations/schema/UserSchema';
import type { AppApiTransaction } from '../services/appApi/AppApiRequester';

export type UserApiLoginTransaction = AppApiTransaction<
  LoginValidatorData,
  UserSchema
>;

export type UserApiRegisterTransaction = AppApiTransaction<
  LoginValidatorData,
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
