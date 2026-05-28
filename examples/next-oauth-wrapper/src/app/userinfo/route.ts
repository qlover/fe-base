import { isEmpty } from 'lodash';
import { OAuthWrapperError } from '@shared/oauth-wrapper';
import { ROUTE_USERINFO } from '@config/route';
import { OAuthWrapperController } from '@server/controllers/OAuthWrapperController';
import { NextApiServer } from '@server/NextApiServer';
import type { NextRequest } from 'next/server';

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
 * OAuth 2.0 / OIDC userinfo endpoint.
 *
 * Requires `Authorization: Bearer <access_token>` from `POST /oauth/token`.
 */
export async function GET(req: NextRequest) {
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
      successHeaders: { 'Cache-Control': 'no-store', Pragma: 'no-cache' }
    }
  );
}
