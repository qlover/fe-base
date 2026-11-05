import { PermissionKey } from '@shared/auth/permissionKeys';
import { API_ADMIN_FEEDBACK } from '@config/apiRoutes';
import { UserFeedbackController } from '@server/controllers/UserFeedbackController';
import { NextApiServer } from '@server/NextApiServer';
import { RequirePermissionPlugin } from '@server/plugins/RequirePermissionPlugin';
import { ServerAuthPlugin } from '@server/plugins/ServerAuthPlugin';
import type { NextRequest } from 'next/server';

/**
 * @swagger
 * /api/admin/feedback:
 *   get:
 *     tags:
 *       - Admin
 *     summary: List all user feedback
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Update feedback status
 */
export async function GET(req: NextRequest) {
  return await new NextApiServer(API_ADMIN_FEEDBACK, req)
    .use(new ServerAuthPlugin())
    .use(new RequirePermissionPlugin(PermissionKey.admin_feedback_read))
    .runWithJson(async ({ parameters: { IOC } }) =>
      IOC(UserFeedbackController).listAdmin()
    );
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);

  return await new NextApiServer(API_ADMIN_FEEDBACK, req)
    .use(new ServerAuthPlugin())
    .use(new RequirePermissionPlugin(PermissionKey.admin_feedback_write))
    .runWithJson(async ({ parameters: { IOC } }) =>
      IOC(UserFeedbackController).patchStatus(body)
    );
}
