import { ROUTE_OAUTH_REVOKE } from '@config/route';
import { OAuthWrapperController } from '@server/controllers/OAuthWrapperController';
import { NextApiServer } from '@server/NextApiServer';
import { ServerConfig } from '@server/ServerConfig';
import {
  apiCorsPreflightResponse,
  buildApiCorsHeaders
} from '@server/utils/apiCors';
import { parseOAuthTokenRequest } from '../token/route';
import type { NextRequest } from 'next/server';

const corsConfig = new ServerConfig();

/**
 * CORS preflight for cross-origin OAuth revocation requests.
 */
export async function OPTIONS(req: NextRequest) {
  return apiCorsPreflightResponse(req, corsConfig);
}

/**
 * OAuth 2.0 token revocation endpoint (RFC 7009).
 */
export async function POST(req: NextRequest) {
  const corsHeaders = buildApiCorsHeaders(req, corsConfig);

  return await new NextApiServer({
    name: ROUTE_OAUTH_REVOKE,
    nextRequest: req,
    event_category: 'oauth-wrapper'
  }).runWithJson(
    async ({ parameters: { IOC } }) =>
      IOC(OAuthWrapperController).revokeToken(
        await parseOAuthTokenRequest(req)
      ),
    corsHeaders
      ? { successHeaders: corsHeaders, errorHeaders: corsHeaders }
      : undefined
  );
}
