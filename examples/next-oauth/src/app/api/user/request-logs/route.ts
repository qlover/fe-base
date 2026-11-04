import { API_USER_REQUEST_LOGS } from '@config/route';
import { UserController } from '@server/controllers/UserController';
import { NextApiServer } from '@server/NextApiServer';
import { ServerAuthPlugin } from '@server/plugins/ServerAuthPlugin';
import type { NextRequest } from 'next/server';

/**
 * @swagger
 * /api/user/request-logs:
 *   get:
 *     tags:
 *       - User
 *     summary: List current user request logs
 *     description: |
 *       Paged `fe_request_logs` owned by the signed-in user only.
 *       Admin unscoped listing is `/api/admin/request-logs`.
 *     responses:
 *       200:
 *         description: Success envelope; `data` is ResourceSearchResult.
 *       401:
 *         description: Not authenticated.
 *   delete:
 *     tags:
 *       - User
 *     summary: Clear current user request logs
 *     description: Deletes only rows owned by the signed-in user.
 *     responses:
 *       200:
 *         description: Success envelope; `data` is `{ deleted: number }`.
 *       401:
 *         description: Not authenticated.
 */
export async function GET(req: NextRequest) {
  return await new NextApiServer(API_USER_REQUEST_LOGS, req)
    .use(new ServerAuthPlugin())
    .runWithJson(async ({ parameters: { IOC } }) =>
      IOC(UserController).searchRequestLogsForCurrentUser(
        req.nextUrl.searchParams
      )
    );
}

export async function DELETE(req: NextRequest) {
  return await new NextApiServer(API_USER_REQUEST_LOGS, req)
    .use(new ServerAuthPlugin())
    .runWithJson(async ({ parameters: { IOC } }) =>
      IOC(UserController).clearOwnRequestLogs()
    );
}
