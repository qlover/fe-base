import { z } from 'zod';
import {
  OAuthTokenErrorSchema,
  OAuthTokenResponseSchema,
  OAuthUserInfoSchema,
  type OAuthTokenResponse,
  type OAuthUserInfo
} from './types';

const OAuthAppApiSuccessSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    requestId: z.string().optional(),
    data: dataSchema
  });

const OAuthAppApiErrorSchema = z.object({
  success: z.literal(false),
  id: z.string().optional(),
  message: z.string().optional(),
  requestId: z.string().optional()
});

function formatAppApiError(json: unknown, fallback: string): string {
  const wrapped = OAuthAppApiErrorSchema.safeParse(json);
  if (wrapped.success) {
    return wrapped.data.message?.trim() || wrapped.data.id || fallback;
  }
  const oauth = OAuthTokenErrorSchema.safeParse(json);
  if (oauth.success) {
    return oauth.data.error_description?.trim() || oauth.data.error;
  }
  return fallback;
}

export function parseOAuthTokenResponse(json: unknown): OAuthTokenResponse {
  const direct = OAuthTokenResponseSchema.safeParse(json);
  if (direct.success) {
    return direct.data;
  }

  const wrapped = OAuthAppApiSuccessSchema(OAuthTokenResponseSchema).safeParse(
    json
  );
  if (wrapped.success) {
    return wrapped.data.data;
  }

  throw new Error(
    formatAppApiError(json, 'Invalid token response from authorization server')
  );
}

export function parseOAuthTokenError(json: unknown, fallback: string): string {
  return formatAppApiError(json, fallback);
}

export function parseOAuthUserInfoResponse(json: unknown): OAuthUserInfo {
  const direct = OAuthUserInfoSchema.safeParse(json);
  if (direct.success) {
    return direct.data;
  }

  const wrapped = OAuthAppApiSuccessSchema(OAuthUserInfoSchema).safeParse(json);
  if (wrapped.success) {
    return wrapped.data.data;
  }

  throw new Error(
    formatAppApiError(json, 'Invalid userinfo response from authorization server')
  );
}
