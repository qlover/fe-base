import { z } from 'zod';

/**
 * @deprecated
 */
export const OAuthUserInfoResponseSchema = z.object({
  sub: z.string(),
  /** Business email when present; empty string when the account has none. */
  email: z.union([z.email(), z.literal('')]),
  name: z.string(),
  phone_number: z.string().optional(),
  email_verified: z.boolean().optional(),
  roles: z.array(z.string()).optional()
});

/**
 * @deprecated
 */
export type OAuthUserInfoResponse = z.infer<typeof OAuthUserInfoResponseSchema>;

/**
 * @deprecated
 */
export const OAuthUserInfoErrorResponseSchema = z.object({
  error: z.string(),
  error_id: z.string().optional()
});

/**
 * @deprecated
 */
export type OAuthUserInfoErrorResponse = z.infer<
  typeof OAuthUserInfoErrorResponseSchema
>;
