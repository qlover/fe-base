import { API_OAUTH_PLAYGROUND_VALIDATE } from '@config/route';
import { OAuthWrapperController } from '@server/controllers/OAuthWrapperController';
import { NextApiServer } from '@server/NextApiServer';
import type { NextRequest } from 'next/server';

/**
 * Validates OAuth authorize query parameters against registered clients (playground).
 */
export async function GET(req: NextRequest) {
  const rawQuery = Object.fromEntries(req.nextUrl.searchParams.entries());

  return await new NextApiServer(
    API_OAUTH_PLAYGROUND_VALIDATE,
    req
  ).runWithJson(async ({ parameters: { IOC } }) => {
    const resolved = await IOC(OAuthWrapperController).resolveAuthorizePage(
      rawQuery
    );
    if (!resolved.ok) {
      return {
        valid: false as const,
        error: resolved.error
      };
    }
    return {
      valid: true as const,
      data: resolved.data
    };
  });
}
