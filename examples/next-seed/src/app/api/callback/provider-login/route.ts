import { API_CALLBACK_PROVIDER_LOGIN } from '@config/apiRoutes';
import { UserController } from '@server/controllers/UserController';
import { NextApiServer } from '@server/NextApiServer';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const rawQuery = Object.fromEntries(searchParams.entries());

  rawQuery.origin = origin;

  return await new NextApiServer(API_CALLBACK_PROVIDER_LOGIN).runWithRedirect(
    async ({ parameters: { IOC } }) =>
      IOC(UserController).loginWithProviderCallback(rawQuery)
  );
}
