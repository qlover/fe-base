import { API_CALLBACK_UPSTREAM_OAUTH } from '@config/apiRoutes';
import { UpstreamOAuthController } from '@server/controllers/UpstreamOAuthController';
import { NextApiServer } from '@server/NextApiServer';

/**
 * 上游 OAuth/PKCE 回调：换票建会话后回首页或登录页。
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = Object.fromEntries(searchParams.entries());

  return await new NextApiServer(API_CALLBACK_UPSTREAM_OAUTH).runWithRedirect(
    async ({ parameters: { IOC } }) =>
      IOC(UpstreamOAuthController).completeCallback(rawQuery)
  );
}
