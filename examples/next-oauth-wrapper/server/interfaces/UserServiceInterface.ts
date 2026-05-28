import type { UserSchema } from '@schemas/UserSchema';

export type UserServiceRegisterParams = {
  username?: string;
  email: string;
  password: string;
};

/** Server-only HTTP metadata for audit logs (never trust client JSON for this). */
export type UserLoginContext = {
  userAgent?: string | null;
  ipAddress?: string | null;
};

export type UserLoginParams = {
  email: string;
  password: string;
  authCode?: string;
  loginContext?: UserLoginContext;
};

export interface UserServiceInterface {
  register(params: UserServiceRegisterParams): Promise<UserSchema>;
  login(params: UserLoginParams): Promise<UserSchema>;

  logout(context?: UserLoginContext): Promise<void>;

  refresh(): Promise<UserSchema>;
  getUser(): Promise<UserSchema>;
}
