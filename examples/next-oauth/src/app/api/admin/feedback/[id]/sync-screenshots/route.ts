import { PermissionKey } from '@shared/auth/permissionKeys';
import { UserFeedbackController } from '@server/controllers/UserFeedbackController';
import { NextApiServer } from '@server/NextApiServer';
import { RequirePermissionPlugin } from '@server/plugins/RequirePermissionPlugin';
import { ServerAuthPlugin } from '@server/plugins/ServerAuthPlugin';
import type { NextRequest } from 'next/server';

/**
 * 管理端补同步反馈截图到 GitHub Issue 评论。
 */
export async function POST(
  req: NextRequest,
  context: { readonly params: Promise<{ readonly id: string }> }
) {
  const { id } = await context.params;
  const path = `/api/admin/feedback/${id}/sync-screenshots`;
  return await new NextApiServer(path, req)
    .use(new ServerAuthPlugin())
    .use(new RequirePermissionPlugin(PermissionKey.admin_feedback_write))
    .runWithJson(async ({ parameters: { IOC } }) => {
      return IOC(UserFeedbackController).syncAdminScreenshots({ id });
    });
}
