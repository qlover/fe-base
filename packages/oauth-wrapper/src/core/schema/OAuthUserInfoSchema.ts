import { z } from 'zod';

export const OAuthUserInfoResponseSchema = z.object({
  sub: z.string(),
  email: z.email(),
  name: z.string(),
  roles: z.array(z.string()).optional()
});

export type OAuthUserInfoResponse = z.infer<typeof OAuthUserInfoResponseSchema>;

export const OAuthUserInfoErrorResponseSchema = z.object({
  error: z.string(),
  error_id: z.string().optional()
});

export type OAuthUserInfoErrorResponse = z.infer<
  typeof OAuthUserInfoErrorResponseSchema
>;
