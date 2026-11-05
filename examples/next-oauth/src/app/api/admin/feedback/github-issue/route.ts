import { PermissionKey } from '@shared/auth/permissionKeys';
import { API_ADMIN_FEEDBACK_GITHUB_ISSUE } from '@config/apiRoutes';
import { UserFeedbackController } from '@server/controllers/UserFeedbackController';
import { NextApiServer } from '@server/NextApiServer';
import { RequirePermissionPlugin } from '@server/plugins/RequirePermissionPlugin';
import { ServerAuthPlugin } from '@server/plugins/ServerAuthPlugin';
import type { NextRequest } from 'next/server';

/**
 * 管理端手动为反馈创建 GitHub Issue。
 */
export async function POST(req: NextRequest) {
  return await new NextApiServer(API_ADMIN_FEEDBACK_GITHUB_ISSUE, req)
    .use(new ServerAuthPlugin())
    .use(new RequirePermissionPlugin(PermissionKey.admin_feedback_write))
    .runWithJson(async ({ parameters: { IOC } }) =>
      IOC(UserFeedbackController).createAdminGithubIssue(await req.json())
    );
}
