import {
  apiCorsPreflightResponse,
  buildApiCorsHeaders
} from '@qlover/next-kit/server';
import { OAuthWrapperError } from '@qlover/oauth-wrapper';
import { isEmpty } from 'lodash-es';
import { resolveUserDisplayLabel } from '@shared/utils/userIdentity';
import { ROUTE_OAUTH_USERINFO } from '@config/route';
import { OAuthWrapperController } from '@server/controllers/OAuthWrapperController';
import { NextApiServer } from '@server/NextApiServer';
import { ServerConfig } from '@server/ServerConfig';
import type { NextRequest } from 'next/server';

const corsConfig = new ServerConfig();

export function parseBearerAuthorization(
  header: string | null
): string | undefined {
  if (!header) {
    return undefined;
  }

  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  const token = match?.[1]?.trim();
  return token || undefined;
}

/**
 * CORS preflight for cross-origin userinfo requests.
 */
export function OPTIONS(req: NextRequest) {
  return apiCorsPreflightResponse(req, corsConfig);
}

/**
 * OAuth 2.0 / OIDC userinfo endpoint.
 *
 * Requires `Authorization: Bearer <access_token>` from `POST /oauth/token`.
 * Returns flat OIDC claims (`sub`, `email`, `name`, …) without the app API envelope.
 *
 * Phone-only accounts may have empty `email`; `name` prefers session `name`,
 * then masked phone, then email / id. Optional `phone_number` when present.
 */
export async function GET(req: NextRequest) {
  const corsHeaders = buildApiCorsHeaders(req, corsConfig);

  return await new NextApiServer({
    name: ROUTE_OAUTH_USERINFO,
    nextRequest: req,
    event_type: 'oauth-wrapper'
  }).runWithOAuthJson(
    async ({ parameters: { IOC } }) => {
      const accessToken = parseBearerAuthorization(
        req.headers.get('authorization')
      );

      if (isEmpty(accessToken)) {
        throw new OAuthWrapperError(
          'invalid_token',
          401,
          'Invalid authorization header'
        );
      }

      const user = await IOC(OAuthWrapperController).getUserInfo(accessToken!);
      const email = user.email?.trim() ?? '';
      const phone = user.phone?.trim() || null;
      const name = resolveUserDisplayLabel({
        name: user.name,
        phone,
        email: email || null,
        userId: user.id
      });

      return {
        sub: String(user.id),
        email,
        email_verified: Boolean(email),
        name,
        ...(phone ? { phone_number: phone } : {})
      };
    },
    {
      successHeaders: corsHeaders,
      errorHeaders: corsHeaders
    }
  );
}
