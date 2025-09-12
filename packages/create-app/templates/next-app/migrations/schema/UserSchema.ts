export interface UserSchema {
  id: number;
  role: string;
  email: string;
  password: string;
  /**
   * 加密的token, 包含token, 过期时间
   */
  reauthentication_token: string;
  email_confirmed_at: number;
  created_at?: number;
  updated_at?: number;
}
