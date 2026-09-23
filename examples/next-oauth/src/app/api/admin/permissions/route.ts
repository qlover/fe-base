import { PermissionKey } from '@shared/auth/permissionKeys';
import { API_ADMIN_PERMISSIONS } from '@config/apiRoutes';
import { AdminPermissionsController } from '@server/controllers/AdminPermissionsController';
import { NextApiServer } from '@server/NextApiServer';
import { RequirePermissionPlugin } from '@server/plugins/RequirePermissionPlugin';
import { ServerAuthPlugin } from '@server/plugins/ServerAuthPlugin';
import type { NextRequest } from 'next/server';

/**
 * @swagger
 * /api/admin/permissions:
 *   get:
 *     tags:
 *       - Admin
 *     summary: List permission catalog
 *     description: Requires `admin_permissions_read`.
 *   post:
 *     tags:
 *       - Admin
 *     summary: Create permission catalog entry
 *     description: Requires `admin_permissions_write`.
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Update permission catalog entry
 *     description: Requires `admin_permissions_write`. Key cannot change.
 */
export async function GET(req: NextRequest) {
  return await new NextApiServer(API_ADMIN_PERMISSIONS, req)
    .use(new ServerAuthPlugin())
    .use(new RequirePermissionPlugin(PermissionKey.admin_permissions_read))
    .runWithJson(async ({ parameters: { IOC } }) =>
      IOC(AdminPermissionsController).list()
    );
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return await new NextApiServer(API_ADMIN_PERMISSIONS, req)
    .use(new ServerAuthPlugin())
    .use(new RequirePermissionPlugin(PermissionKey.admin_permissions_write))
    .runWithJson(async ({ parameters: { IOC } }) =>
      IOC(AdminPermissionsController).create(body)
    );
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  return await new NextApiServer(API_ADMIN_PERMISSIONS, req)
    .use(new ServerAuthPlugin())
    .use(new RequirePermissionPlugin(PermissionKey.admin_permissions_write))
    .runWithJson(async ({ parameters: { IOC } }) =>
      IOC(AdminPermissionsController).update(body)
    );
}
