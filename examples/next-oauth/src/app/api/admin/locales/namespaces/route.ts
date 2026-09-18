import { PermissionKey } from '@shared/auth/permissionKeys';
import { API_ADMIN_LOCALES_NAMESPACES } from '@config/apiRoutes';
import { AdminLocalesController } from '@server/controllers/AdminLocalesController';
import { NextApiServer } from '@server/NextApiServer';
import { RequirePermissionPlugin } from '@server/plugins/RequirePermissionPlugin';
import { ServerAuthPlugin } from '@server/plugins/ServerAuthPlugin';
import type { NextRequest } from 'next/server';

/**
 * @swagger
 * /api/admin/locales/namespaces:
 *   get:
 *     tags:
 *       - Admin
 *     summary: List distinct locale namespaces
 *     description: Requires `admin_locales_read`.
 *     responses:
 *       200:
 *         description: Success envelope; `data` is string[].
 *       401:
 *         description: Not authenticated or missing permission.
 */
export async function GET(req: NextRequest) {
  return await new NextApiServer(API_ADMIN_LOCALES_NAMESPACES, req)
    .use(new ServerAuthPlugin())
    .use(new RequirePermissionPlugin(PermissionKey.admin_locales_read))
    .runWithJson(async ({ parameters: { IOC } }) =>
      IOC(AdminLocalesController).listNamespaces()
    );
}
