import { z } from 'zod';

export const OAuthUserCredentialsSchema = z.object({
  user_id: z.string(),
  provider_refresh_token: z.string().nullable().optional(),
  provider_session_token: z.string().nullable().optional(),
  updated_at: z.string()
});

export type OAuthUserCredentialsRow = z.infer<
  typeof OAuthUserCredentialsSchema
>;

export const OAuthRefreshTokenSchema = z.object({
  id: z.string(),
  refresh_token: z.string(),
  client_id: z.string(),
  user_id: z.string(),
  expires_at: z.string(),
  revoked: z.boolean(),
  created_at: z.string()
});

export type OAuthRefreshTokenRow = z.infer<typeof OAuthRefreshTokenSchema>;

export const OAuthTokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  refresh_token: z.string().optional(),
  scope: z.string().optional()
});

export type OAuthTokenResponse = z.infer<typeof OAuthTokenResponseSchema>;
