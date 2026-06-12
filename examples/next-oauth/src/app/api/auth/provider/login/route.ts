import { API_AUTH_PROVIDER_LOGIN } from '@config/apiRoutes';
import { UserController } from '@server/controllers/UserController';
import { NextApiServer } from '@server/NextApiServer';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const rawQuery = Object.fromEntries(req.nextUrl.searchParams.entries());

  return await new NextApiServer(API_AUTH_PROVIDER_LOGIN, req).runWithJson(
    async ({ parameters: { IOC } }) =>
      IOC(UserController).loginWithProvider(rawQuery)
  );
}
