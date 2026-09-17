import { PermissionKey } from '@shared/auth/permissionKeys';
import { API_ADMIN_ROLES } from '@config/apiRoutes';
import { AdminRolesController } from '@server/controllers/AdminRolesController';
import { NextApiServer } from '@server/NextApiServer';
import { RequirePermissionPlugin } from '@server/plugins/RequirePermissionPlugin';
import { ServerAuthPlugin } from '@server/plugins/ServerAuthPlugin';
import type { NextRequest } from 'next/server';

/**
 * @swagger
 * /api/admin/roles:
 *   get:
 *     tags:
 *       - Admin
 *     summary: List platform roles and permission catalog
 *     description: Requires `admin_roles_read`. In-memory seed for the template.
 *     responses:
 *       200:
 *         description: Success envelope; `data` is AdminRolesResponse.
 *       401:
 *         description: Not authenticated or missing permission.
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Replace role permission assignments
 *     description: Requires `admin_roles_write`. Body `{ roleId, permissionKeys }`.
 *     responses:
 *       200:
 *         description: Updated AdminRolesResponse.
 *       401:
 *         description: Not authenticated or missing permission.
 */
export async function GET(req: NextRequest) {
  return await new NextApiServer(API_ADMIN_ROLES, req)
    .use(new ServerAuthPlugin())
    .use(new RequirePermissionPlugin(PermissionKey.admin_roles_read))
    .runWithJson(async ({ parameters: { IOC } }) =>
      IOC(AdminRolesController).list()
    );
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  return await new NextApiServer(API_ADMIN_ROLES, req)
    .use(new ServerAuthPlugin())
    .use(new RequirePermissionPlugin(PermissionKey.admin_roles_write))
    .runWithJson(async ({ parameters: { IOC } }) =>
      IOC(AdminRolesController).replaceAssignments(body)
    );
}
