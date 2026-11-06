import { API_USER_LOGIN_UPSTREAM_OAUTH } from '@config/apiRoutes';
import { UpstreamOAuthController } from '@server/controllers/UpstreamOAuthController';
import { NextApiServer } from '@server/NextApiServer';
import type { NextRequest } from 'next/server';

/**
 * 发起上游 OAuth/PKCE 授权（302 到 IdP）。
 */
export async function GET(req: NextRequest) {
  return await new NextApiServer(
    API_USER_LOGIN_UPSTREAM_OAUTH,
    req
  ).runWithRedirect(async ({ parameters: { IOC } }) =>
    IOC(UpstreamOAuthController).startAuthorization()
  );
}
