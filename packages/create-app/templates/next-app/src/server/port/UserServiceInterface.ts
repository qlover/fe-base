import type { UserSchema } from '@migrations/schema/UserSchema';

export interface UserServiceInterface {
  register(params: { email: string; password: string }): Promise<UserSchema>;
  login(params: { email: string; password: string }): Promise<unknown>;

  logout(): Promise<void>;
}
