import { PermissionKey } from '@shared/auth/permissionKeys';
import { API_ADMIN_REQUEST_LOGS } from '@config/apiRoutes';
import { AdminRequestLogsController } from '@server/controllers/AdminRequestLogsController';
import { NextApiServer } from '@server/NextApiServer';
import { RequirePermissionPlugin } from '@server/plugins/RequirePermissionPlugin';
import { ServerAuthPlugin } from '@server/plugins/ServerAuthPlugin';
import type { NextRequest } from 'next/server';

/**
 * @swagger
 * /api/admin/request-logs:
 *   get:
 *     tags:
 *       - Admin
 *     summary: List all request logs
 *     description: |
 *       Paged `fe_request_logs` for administrators (service-role, no user filter).
 *       Requires `admin_request_logs_read`.
 *     responses:
 *       200:
 *         description: Success envelope; `data` is ResourceSearchResult.
 *       401:
 *         description: Not authenticated or missing permission.
 *   delete:
 *     tags:
 *       - Admin
 *     summary: Clear all request logs
 *     description: Permanently deletes all rows in `fe_request_logs`. Requires `admin_request_logs_write`.
 *     responses:
 *       200:
 *         description: Success envelope; `data` is `{ deleted: number }`.
 *       401:
 *         description: Not authenticated or missing permission.
 */
export async function GET(req: NextRequest) {
  return await new NextApiServer(API_ADMIN_REQUEST_LOGS, req)
    .use(new ServerAuthPlugin())
    .use(new RequirePermissionPlugin(PermissionKey.admin_request_logs_read))
    .runWithJson(async ({ parameters: { IOC } }) =>
      IOC(AdminRequestLogsController).searchAll(req.nextUrl.searchParams)
    );
}

export async function DELETE(req: NextRequest) {
  return await new NextApiServer(API_ADMIN_REQUEST_LOGS, req)
    .use(new ServerAuthPlugin())
    .use(new RequirePermissionPlugin(PermissionKey.admin_request_logs_write))
    .runWithJson(async ({ parameters: { IOC } }) =>
      IOC(AdminRequestLogsController).clearAll()
    );
}
