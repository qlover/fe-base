import { PermissionKey } from '@shared/auth/permissionKeys';
import { API_ADMIN_USERS } from '@config/apiRoutes';
import { AdminUsersController } from '@server/controllers/AdminUsersController';
import { NextApiServer } from '@server/NextApiServer';
import { RequirePermissionPlugin } from '@server/plugins/RequirePermissionPlugin';
import { ServerAuthPlugin } from '@server/plugins/ServerAuthPlugin';
import type { NextRequest } from 'next/server';

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Search platform users (`fe_users`)
 *     description: Requires `admin_users_read`. Query `q`, `limit`, `offset`.
 *     responses:
 *       200:
 *         description: Success envelope; `data` is AdminUserListItem[].
 *       401:
 *         description: Not authenticated or missing permission.
 */
export async function GET(req: NextRequest) {
  return await new NextApiServer(API_ADMIN_USERS, req)
    .use(new ServerAuthPlugin())
    .use(new RequirePermissionPlugin(PermissionKey.admin_users_read))
    .runWithJson(async ({ parameters: { IOC } }) =>
      IOC(AdminUsersController).search({
        q: req.nextUrl.searchParams.get('q'),
        limit: req.nextUrl.searchParams.get('limit'),
        offset: req.nextUrl.searchParams.get('offset')
      })
    );
}
