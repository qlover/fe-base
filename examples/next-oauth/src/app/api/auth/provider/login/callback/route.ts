import { API_AUTH_PROVIDER_LOGIN_CALLBACK } from '@config/apiRoutes';
import { UserController } from '@server/controllers/UserController';
import { NextApiServer } from '@server/NextApiServer';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const rawQuery = Object.fromEntries(searchParams.entries());

  rawQuery.origin = origin;

  return await new NextApiServer(
    API_AUTH_PROVIDER_LOGIN_CALLBACK
  ).runWithRedirect(async ({ parameters: { IOC } }) =>
    IOC(UserController).loginWithProviderCallback(rawQuery)
  );
}
