import type { UserSchema } from '@migrations/schema/UserSchema';

export type UserServiceRegisterParams = {
  username?: string;
  email: string;
  password: string;
};

export interface UserServiceInterface {
  register(params: UserServiceRegisterParams): Promise<UserSchema>;
  login(params: { email: string; password: string }): Promise<UserSchema>;

  logout(): Promise<void>;
}
