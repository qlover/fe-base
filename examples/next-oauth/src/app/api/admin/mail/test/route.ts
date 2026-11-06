import { PermissionKey } from '@shared/auth/permissionKeys';
import { API_ADMIN_MAIL_TEST } from '@config/apiRoutes';
import { AdminMailController } from '@server/controllers/AdminMailController';
import { NextApiServer } from '@server/NextApiServer';
import { RequirePermissionPlugin } from '@server/plugins/RequirePermissionPlugin';
import { ServerAuthPlugin } from '@server/plugins/ServerAuthPlugin';
import type { NextRequest } from 'next/server';

/**
 * @swagger
 * /api/admin/mail/test:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Send a test email
 *     description: Requires `admin_mail_test`. Sends through the channel configured in site settings `mail.provider` and records the attempt in mail logs.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Sent (or captured by the memory provider).
 */
export async function POST(req: NextRequest) {
  const requestBody = await req.json().catch(() => null);

  return await new NextApiServer(API_ADMIN_MAIL_TEST, req)
    .use(new ServerAuthPlugin())
    .use(new RequirePermissionPlugin(PermissionKey.admin_mail_test))
    .runWithJson(async ({ parameters: { IOC } }) =>
      IOC(AdminMailController).sendTest(requestBody, req)
    );
}
