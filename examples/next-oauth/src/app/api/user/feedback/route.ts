import { API_USER_FEEDBACK } from '@config/apiRoutes';
import { UserFeedbackController } from '@server/controllers/UserFeedbackController';
import { NextApiServer } from '@server/NextApiServer';
import { ServerAuthPlugin } from '@server/plugins/ServerAuthPlugin';
import type { NextRequest } from 'next/server';

/**
 * @swagger
 * /api/user/feedback:
 *   get:
 *     tags:
 *       - User
 *     summary: List current user feedback
 *   post:
 *     tags:
 *       - User
 *     summary: Submit feedback
 */
export async function GET(req: NextRequest) {
  return await new NextApiServer(API_USER_FEEDBACK, req)
    .use(new ServerAuthPlugin())
    .runWithJson(async ({ parameters: { IOC } }) =>
      IOC(UserFeedbackController).listMine()
    );
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const userAgent = req.headers.get('user-agent');

  return await new NextApiServer(API_USER_FEEDBACK, req)
    .use(new ServerAuthPlugin())
    .runWithJson(async ({ parameters: { IOC } }) =>
      IOC(UserFeedbackController).create(body, { userAgent })
    );
}
