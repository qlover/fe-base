import { API_ADMIN_OVERVIEW } from '@config/apiRoutes';
import { AdminOverviewController } from '@server/controllers/AdminOverviewController';
import { NextApiServer } from '@server/NextApiServer';
import { ServerAuthPlugin } from '@server/plugins/ServerAuthPlugin';
import type { NextRequest } from 'next/server';

/**
 * @swagger
 * /api/admin/overview:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Admin home overview metrics
 *     description: |
 *       Authenticated only. Modules are trimmed by permission
 *       (`admin_users_read` / `admin_request_logs_read` / `admin_site_settings_read`).
 *     parameters:
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *           enum: ['1', '7', '30']
 *         description: Stats window in days (default 7).
 *     responses:
 *       200:
 *         description: Success envelope; `data` is AdminOverviewType.
 *       401:
 *         description: Not authenticated.
 */
export async function GET(req: NextRequest) {
  return await new NextApiServer(API_ADMIN_OVERVIEW, req)
    .use(new ServerAuthPlugin())
    .runWithJson(async ({ parameters: { IOC } }) =>
      IOC(AdminOverviewController).getOverview({
        range: req.nextUrl.searchParams.get('range')
      })
    );
}
