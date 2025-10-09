import { z } from 'zod';

export const UserRole = {
  ADMIN: 0,
  USER: 1
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export const userSchema = z.object({
  id: z.number(),
  role: z.nativeEnum(UserRole),
  email: z.string().email(),
  password: z.string(),
  /**
   * 加密的token, 包含token, 过期时间
   */
  credential_token: z.string(),
  email_confirmed_at: z.number(),
  created_at: z.number(),
  updated_at: z.number()
});

export type UserSchema = z.infer<typeof userSchema>;
