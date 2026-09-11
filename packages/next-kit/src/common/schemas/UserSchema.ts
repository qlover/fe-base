import { z } from 'zod';

export const UserRole = {
  ADMIN: 0,
  USER: 1
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

/**
 * App session user.
 *
 * Identity primary key is `id`. `email` / `phone` are optional contact channels
 * (phone-only accounts may have an empty `email`).
 */
export const userSchema = z.object({
  id: z.string(),
  role: z.enum(UserRole),
  /**
   * Business email when present; empty string when the account has none.
   */
  email: z.union([z.email(), z.literal('')]),
  /** Optional display name (e.g. OIDC `name` / IdP display_name). */
  name: z.string().optional(),
  /** Optional phone (E.164 or provider format). */
  phone: z.string().optional(),
  /**
   * Encrypted token payload (token + expiry).
   */
  credential_token: z.string(),
  email_confirmed_at: z.number().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string().nullable().optional()
});

export type UserSchema = z.infer<typeof userSchema>;

export type UserCredential = {
  credential_token: string;
};
