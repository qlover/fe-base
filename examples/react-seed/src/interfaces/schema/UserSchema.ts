import { z, type ZodSafeParseResult } from 'zod';

export const UserRole = {
  ADMIN: 0,
  USER: 1
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export const userSchema = z.object({
  id: z.string().or(z.number()),
  role: z.enum(UserRole),
  email: z.email(),
  password: z.string(),
  /**
   * 加密的token, 包含token, 过期时间
   */
  credential_token: z.string(),
  email_confirmed_at: z.number().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string().nullable().optional()
});

export const userCredentialSchema = z.object({
  token: z.string()
});

export type UserSchema = z.infer<typeof userSchema>;
export type UserCredential = z.infer<typeof userCredentialSchema>;

export function isWebUserSchema(
  value: unknown
): ZodSafeParseResult<Omit<UserSchema, 'password'>> {
  return userSchema.omit({ password: true }).safeParse(value);
}
