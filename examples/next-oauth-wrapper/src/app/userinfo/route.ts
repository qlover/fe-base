import { OAuthWrapperError } from '@qlover/oauth-wrapper';
import { isEmpty } from 'lodash';
import { ROUTE_USERINFO } from '@config/route';
import { OAuthWrapperController } from '@server/controllers/OAuthWrapperController';
import { NextApiServer } from '@server/NextApiServer';
import { ServerConfig } from '@server/ServerConfig';
import {
  apiCorsPreflightResponse,
  buildApiCorsHeaders
} from '@server/utils/apiCors';
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
export async function OPTIONS(req: NextRequest) {
  return apiCorsPreflightResponse(req, corsConfig);
}

/**
 * OAuth 2.0 / OIDC userinfo endpoint.
 *
 * Requires `Authorization: Bearer <access_token>` from `POST /oauth/token`.
 */
export async function GET(req: NextRequest) {
  const corsHeaders = buildApiCorsHeaders(req, corsConfig);

  return await new NextApiServer({
    name: ROUTE_USERINFO,
    nextRequest: req,
    event_category: 'oauth-wrapper'
  }).runWithJson(
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

      return await IOC(OAuthWrapperController).getUserInfo(accessToken!);
    },
    {
      successHeaders: {
        'Cache-Control': 'no-store',
        Pragma: 'no-cache',
        ...corsHeaders
      },
      errorHeaders: corsHeaders
    }
  );
}
