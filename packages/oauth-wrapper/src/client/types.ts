import { z } from 'zod';

export const OAuthUserInfoSchema = z.object({
  sub: z.string(),
  email: z.email(),
  name: z.string(),
  roles: z.array(z.string()).optional()
});

export type OAuthUserInfo = z.infer<typeof OAuthUserInfoSchema>;

export const OAuthTokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.literal('Bearer').optional(),
  expires_in: z.number().optional(),
  refresh_token: z.string().optional(),
  scope: z.string().optional()
});

export type OAuthTokenResponse = z.infer<typeof OAuthTokenResponseSchema>;

export const OAuthTokenErrorSchema = z.object({
  error: z.string(),
  error_description: z.string().optional(),
  error_id: z.string().optional()
});

export type OAuthCallbackParams = {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
};

export type OAuthUserMapper = (
  userinfo: OAuthUserInfo,
  accessToken: string,
  refreshToken?: string
) => unknown | Promise<unknown>;
