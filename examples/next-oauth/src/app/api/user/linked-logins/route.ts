import { API_USER_LINKED_LOGINS } from '@config/route';
import { UserController } from '@server/controllers/UserController';
import { NextApiServer } from '@server/NextApiServer';
import { ServerAuthPlugin } from '@server/plugins/ServerAuthPlugin';
import type { NextRequest } from 'next/server';

/**
 * @swagger
 * /api/user/linked-logins:
 *   get:
 *     tags:
 *       - User
 *     summary: List third-party logins linked to the current user
 *     description: |
 *       Brain links from `fe_oauth_user_links` plus GitHub / Google identities from Supabase Auth.
 *       `data` is an array of `{ provider, account, env, linked_at, last_login_at }`.
 *     responses:
 *       200:
 *         description: Success envelope; `data` is LinkedLoginType[].
 *       400:
 *         description: Not authenticated.
 */
export async function GET(req: NextRequest) {
  return await new NextApiServer(API_USER_LINKED_LOGINS, req)
    .use(new ServerAuthPlugin())
    .runWithJson(async ({ parameters: { IOC } }) =>
      IOC(UserController).listLinkedLogins()
    );
}
