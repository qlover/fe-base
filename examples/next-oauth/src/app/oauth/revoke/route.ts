import { ROUTE_OAUTH_REVOKE } from '@config/route';
import { OAuthWrapperController } from '@server/controllers/OAuthWrapperController';
import { NextApiServer } from '@server/NextApiServer';
import { ApiCorsPlugin } from '@server/plugins/ApiCorsPlugin';
import { parseOAuthTokenRequest } from '../token/route';
import type { NextRequest } from 'next/server';

/**
 * CORS preflight for cross-origin OAuth revocation requests.
 */
export async function OPTIONS(req: NextRequest) {
  return new ApiCorsPlugin({ path: ROUTE_OAUTH_REVOKE }).preflight(req);
}

/**
 * OAuth 2.0 token revocation endpoint (RFC 7009).
 */
export async function POST(req: NextRequest) {
  return await new NextApiServer({
    name: ROUTE_OAUTH_REVOKE,
    nextRequest: req,
    event_type: 'oauth-wrapper'
  })
    .use(new ApiCorsPlugin({ path: ROUTE_OAUTH_REVOKE, request: req }))
    .runWithOAuthJson(async ({ parameters: { IOC } }) =>
      IOC(OAuthWrapperController).revokeToken(await parseOAuthTokenRequest(req))
    );
}
