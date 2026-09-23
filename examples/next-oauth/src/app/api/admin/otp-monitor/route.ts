import { PermissionKey } from '@shared/auth/permissionKeys';
import { API_ADMIN_OTP_MONITOR } from '@config/apiRoutes';
import { AdminOtpMonitorController } from '@server/controllers/AdminOtpMonitorController';
import { NextApiServer } from '@server/NextApiServer';
import { RequirePermissionPlugin } from '@server/plugins/RequirePermissionPlugin';
import { ServerAuthPlugin } from '@server/plugins/ServerAuthPlugin';
import type { NextRequest } from 'next/server';

/**
 * @swagger
 * /api/admin/otp-monitor:
 *   get:
 *     tags:
 *       - Admin
 *     summary: List OTP send rate-limit KV entries
 *     description: Requires `admin_otp_monitor_read`. Optional `ip` query.
 *   post:
 *     tags:
 *       - Admin
 *     summary: Clear OTP send rate-limit entries
 *     description: Requires `admin_otp_monitor_write`. Body `{ key }` or `{ all: true }`.
 */
export async function GET(req: NextRequest) {
  return await new NextApiServer(API_ADMIN_OTP_MONITOR, req)
    .use(new ServerAuthPlugin())
    .use(new RequirePermissionPlugin(PermissionKey.admin_otp_monitor_read))
    .runWithJson(async ({ parameters: { IOC } }) => {
      const url = new URL(req.url);
      return IOC(AdminOtpMonitorController).list({
        ip: url.searchParams.get('ip')
      });
    });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return await new NextApiServer(API_ADMIN_OTP_MONITOR, req)
    .use(new ServerAuthPlugin())
    .use(new RequirePermissionPlugin(PermissionKey.admin_otp_monitor_write))
    .runWithJson(async ({ parameters: { IOC } }) =>
      IOC(AdminOtpMonitorController).purge(body)
    );
}
