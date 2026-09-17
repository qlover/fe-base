import { PermissionKey } from '@shared/auth/permissionKeys';
import { API_ADMIN_USERS_SYSTEM_ROLE } from '@config/apiRoutes';
import { AdminUsersController } from '@server/controllers/AdminUsersController';
import { NextApiServer } from '@server/NextApiServer';
import { RequirePermissionPlugin } from '@server/plugins/RequirePermissionPlugin';
import { ServerAuthPlugin } from '@server/plugins/ServerAuthPlugin';
import type { NextRequest } from 'next/server';

/**
 * @swagger
 * /api/admin/users/{userId}/system-role:
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Set platform system role for a user
 *     description: Requires `admin_users_system_role`. Body `{ systemRole }`.
 *     responses:
 *       200:
 *         description: Updated AdminUserListItem.
 *       401:
 *         description: Not authenticated or missing permission.
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params;
  const body = await req.json();

  return await new NextApiServer(
    API_ADMIN_USERS_SYSTEM_ROLE.replace(':userId', userId),
    req
  )
    .use(new ServerAuthPlugin())
    .use(new RequirePermissionPlugin(PermissionKey.admin_users_system_role))
    .runWithJson(async ({ parameters: { IOC } }) =>
      IOC(AdminUsersController).setSystemRole(userId, body)
    );
}
