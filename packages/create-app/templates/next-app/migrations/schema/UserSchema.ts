export const UserRoleType = {
  ADMIN: 0,
  USER: 1
} as const;

export type UserRoleType = (typeof UserRoleType)[keyof typeof UserRoleType];

export interface UserSchema {
  id: number;
  role: UserRoleType;
  email: string;
  password: string;
  /**
   * 加密的token, 包含token, 过期时间
   */
  credential_token: string;
  email_confirmed_at: number;
  created_at?: number;
  updated_at?: number;
}
