import { API_USER_REQUEST_LOGS } from '@config/apiRoutes';
import { UserController } from '@server/controllers/UserController';
import { NextApiServer } from '@server/NextApiServer';
import type { NextRequest } from 'next/server';

/**
 * @swagger
 * /api/user/request-logs:
 *   get:
 *     tags:
 *       - User
 *     summary: List current user request logs
 *     description: Returns recent `request_logs` rows for the signed-in user (RLS). Requires session cookies.
 *     responses:
 *       200:
 *         description: Success envelope with log rows.
 *       400:
 *         description: Not authenticated or query failed.
 */
export async function GET(req: NextRequest) {
  return await new NextApiServer(API_USER_REQUEST_LOGS, req).runWithJson(
    async ({ parameters: { IOC } }) =>
      IOC(UserController).listRequestLogsForCurrentUser(200)
  );
}
