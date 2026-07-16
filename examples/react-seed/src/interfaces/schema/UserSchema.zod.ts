import { z } from 'zod';
import { UserRole } from './UserSchema.types';
import type { UserCredential, UserSchema, WebUser } from './UserSchema.types';
import type { ZodSafeParseResult } from 'zod';

export const userSchema = z.object({
  id: z.string().or(z.number()),
  role: z.enum(UserRole),
  email: z.email(),
  password: z.string(),
  credential_token: z.string(),
  email_confirmed_at: z.number().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string().nullable().optional()
});

export const userCredentialSchema = z.object({
  token: z.string(),
  refresh_token: z.string().optional()
});

export type { UserSchema, UserCredential, WebUser };

export function isWebUserSchema(value: unknown): ZodSafeParseResult<WebUser> {
  return userSchema.omit({ password: true }).safeParse(value);
}
