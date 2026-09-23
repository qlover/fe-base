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
 *     summary: List phone OTP send records
 *     description: Requires `admin_otp_monitor_read`. Optional `phone` query. memory channel may include plaintext codes.
 */
export async function GET(req: NextRequest) {
  return await new NextApiServer(API_ADMIN_OTP_MONITOR, req)
    .use(new ServerAuthPlugin())
    .use(new RequirePermissionPlugin(PermissionKey.admin_otp_monitor_read))
    .runWithJson(async ({ parameters: { IOC } }) => {
      const url = new URL(req.url);
      return IOC(AdminOtpMonitorController).list({
        phone: url.searchParams.get('phone')
      });
    });
}
