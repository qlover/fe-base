import { z } from 'zod';

/**
 * Accepts HTTPS/HTTP URLs and custom URL schemes (e.g. mobile deep links).
 */
export function isOAuthRedirectUri(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return Boolean(parsed.protocol && parsed.protocol.endsWith(':'));
  } catch {
    return /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed);
  }
}

const oauthRedirectUriSchema = z
  .string()
  .min(1)
  .refine(isOAuthRedirectUri, { message: 'Invalid redirect URI' });

export const OAuthClientRowSchema = z.object({
  id: z.string(),
  client_id: z.string(),
  client_secret_hash: z.string().nullable().optional(),
  client_name: z.string(),
  client_uri: z.string().nullable().optional(),
  logo_uri: z.string().nullable().optional(),
  redirect_uris: z.array(z.string()),
  grant_types: z.array(z.string()),
  scopes: z.array(z.string()),
  confidential: z.boolean(),
  owner_user_id: z.string(),
  created_at: z.string(),
  updated_at: z.string()
});

export type OAuthClientRow = z.infer<typeof OAuthClientRowSchema>;

// Developer Console Schemas
export const OAuthClientListItemSchema = z.object({
  client_id: z.string(),
  client_name: z.string(),
  client_uri: z.string().nullable().optional(),
  logo_uri: z.string().nullable().optional(),
  redirect_uris: z.array(z.string()),
  confidential: z.boolean(),
  created_at: z.string(),
  updated_at: z.string()
});

export type OAuthClientListItem = z.infer<typeof OAuthClientListItemSchema>;

export const OAuthClientDetailSchema = z.object({
  client_id: z.string(),
  client_name: z.string(),
  client_uri: z.string().nullable().optional(),
  logo_uri: z.string().nullable().optional(),
  redirect_uris: z.array(z.string()),
  grant_types: z.array(z.string()),
  scopes: z.array(z.string()),
  confidential: z.boolean(),
  created_at: z.string(),
  updated_at: z.string()
});

export type OAuthClientDetail = z.infer<typeof OAuthClientDetailSchema>;

export const OAuthClientCreateSchema = z.object({
  client_name: z.string().min(1).max(100),
  client_uri: z.string().url().optional().or(z.literal('')),
  redirect_uris: z.array(oauthRedirectUriSchema).min(1),
  /** `true` = confidential (client_secret); `false` = public (PKCE required). */
  confidential: z.boolean().default(true)
});

export type OAuthClientCreate = z.infer<typeof OAuthClientCreateSchema>;

export const OAuthClientUpdateSchema = z.object({
  client_name: z.string().min(1).max(100),
  client_uri: z.string().url().optional().or(z.literal('')),
  redirect_uris: z.array(oauthRedirectUriSchema).min(1)
});

export type OAuthClientUpdate = z.infer<typeof OAuthClientUpdateSchema>;

export const OAuthClientCreateResponseSchema = z.object({
  client_id: z.string(),
  client_secret: z.string().optional(),
  confidential: z.boolean(),
  client_name: z.string(),
  client_uri: z.string().nullable().optional(),
  redirect_uris: z.array(z.string()),
  created_at: z.string()
});

export type OAuthClientCreateResponse = z.infer<
  typeof OAuthClientCreateResponseSchema
>;

export const OAuthClientSecretRotateResponseSchema = z.object({
  client_id: z.string(),
  client_secret: z.string()
});

export type OAuthClientSecretRotateResponse = z.infer<
  typeof OAuthClientSecretRotateResponseSchema
>;

export const OAuthAuthorizeQuerySchema = z.object({
  response_type: z.literal('code'),
  client_id: z.string().min(1),
  redirect_uri: oauthRedirectUriSchema,
  scope: z.string().optional(),
  state: z.string().optional(),
  code_challenge: z.string().min(43).max(128).optional(),
  code_challenge_method: z.literal('S256').optional()
});

export type OAuthAuthorizeQuery = z.infer<typeof OAuthAuthorizeQuerySchema>;

export const OAuthConsentBodySchema = z.object({
  action: z.enum(['allow', 'deny']),
  client_id: z.string().min(1),
  redirect_uri: oauthRedirectUriSchema,
  scope: z.string().optional(),
  state: z.string().optional(),
  trust: z.boolean().optional(),
  code_challenge: z.string().min(43).max(128).optional(),
  code_challenge_method: z.literal('S256').optional()
});

export type OAuthConsentBody = z.infer<typeof OAuthConsentBodySchema>;

export const OAuthAuthorizationCodeRowSchema = z.object({
  code: z.string(),
  client_id: z.string(),
  user_id: z.string(),
  redirect_uri: z.string(),
  scope: z.string().nullable().optional(),
  code_challenge: z.string().nullable().optional(),
  code_challenge_method: z.string().nullable().optional(),
  expires_at: z.string(),
  used: z.boolean(),
  created_at: z.string()
});

export type OAuthAuthorizationCodeRow = z.infer<
  typeof OAuthAuthorizationCodeRowSchema
>;
