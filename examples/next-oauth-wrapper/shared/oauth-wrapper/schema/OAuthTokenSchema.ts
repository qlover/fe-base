import { z } from 'zod';

export const OAuthTokenAuthorizationCodeSchema = z.object({
  grant_type: z.literal('authorization_code'),
  code: z.string().min(1),
  redirect_uri: z.string().min(1),
  client_id: z.string().min(1),
  client_secret: z.string().min(1).optional(),
  code_verifier: z.string().min(43).max(128).optional()
});

export type OAuthTokenAuthorizationCodeRequest = z.infer<
  typeof OAuthTokenAuthorizationCodeSchema
>;

export const OAuthTokenRefreshSchema = z.object({
  grant_type: z.literal('refresh_token'),
  refresh_token: z.string().min(1),
  client_id: z.string().min(1),
  client_secret: z.string().min(1).optional()
});

export type OAuthTokenRefreshRequest = z.infer<typeof OAuthTokenRefreshSchema>;

export const OAuthTokenRequestSchema = z.discriminatedUnion('grant_type', [
  OAuthTokenAuthorizationCodeSchema,
  OAuthTokenRefreshSchema
]);

export type OAuthTokenRequest = z.infer<typeof OAuthTokenRequestSchema>;

export const OAuthTokenErrorResponseSchema = z.object({
  error: z.string(),
  error_id: z.string().optional(),
  error_description: z.string().optional()
});

export type OAuthTokenErrorResponse = z.infer<
  typeof OAuthTokenErrorResponseSchema
>;
