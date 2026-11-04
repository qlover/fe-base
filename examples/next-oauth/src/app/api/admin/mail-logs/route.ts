import { PermissionKey } from '@shared/auth/permissionKeys';
import { API_ADMIN_MAIL_LOGS } from '@config/apiRoutes';
import { AdminMailController } from '@server/controllers/AdminMailController';
import { NextApiServer } from '@server/NextApiServer';
import { RequirePermissionPlugin } from '@server/plugins/RequirePermissionPlugin';
import { ServerAuthPlugin } from '@server/plugins/ServerAuthPlugin';
import type { NextRequest } from 'next/server';

/**
 * @swagger
 * /api/admin/mail-logs:
 *   get:
 *     tags:
 *       - Admin
 *     summary: List transactional mail logs
 *     description: Requires `admin_mail_logs_read`. Optional `email` (fuzzy) and `template` filters. Body text is only kept for the memory provider.
 */
export async function GET(req: NextRequest) {
  return await new NextApiServer(API_ADMIN_MAIL_LOGS, req)
    .use(new ServerAuthPlugin())
    .use(new RequirePermissionPlugin(PermissionKey.admin_mail_logs_read))
    .runWithJson(async ({ parameters: { IOC } }) => {
      const url = new URL(req.url);
      return IOC(AdminMailController).listLogs({
        email: url.searchParams.get('email'),
        template: url.searchParams.get('template')
      });
    });
}
