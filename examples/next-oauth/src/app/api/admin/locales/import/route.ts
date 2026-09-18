import { PermissionKey } from '@shared/auth/permissionKeys';
import { API_ADMIN_LOCALES_IMPORT } from '@config/apiRoutes';
import { AdminLocalesController } from '@server/controllers/AdminLocalesController';
import { NextApiServer } from '@server/NextApiServer';
import { RequirePermissionPlugin } from '@server/plugins/RequirePermissionPlugin';
import { ServerAuthPlugin } from '@server/plugins/ServerAuthPlugin';
import type { NextRequest } from 'next/server';

/**
 * @swagger
 * /api/admin/locales/import:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Import locales from bundled static JSON
 *     description: Requires `admin_locales_write`. Seeds/refreshes DB from `@locales/{en,zh}.json`.
 *     responses:
 *       200:
 *         description: Success envelope; `data` is AdminLocalesImportResult.
 *       401:
 *         description: Not authenticated or missing permission.
 */
export async function POST(req: NextRequest) {
  return await new NextApiServer(API_ADMIN_LOCALES_IMPORT, req)
    .use(new ServerAuthPlugin())
    .use(new RequirePermissionPlugin(PermissionKey.admin_locales_write))
    .runWithJson(async ({ parameters: { IOC } }) =>
      IOC(AdminLocalesController).importFromStatic()
    );
}
