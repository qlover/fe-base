import { z } from 'zod';

/**
 * @deprecated
 */
export const OAuthUserInfoResponseSchema = z.object({
  sub: z.string(),
  email: z.email(),
  name: z.string(),
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
