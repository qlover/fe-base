import { API_USER_LOGOUT } from '@config/route';
import { UserController } from '@server/controllers/UserController';
import { NextApiServer } from '@server/NextApiServer';
import { ApiCorsPlugin } from '@server/plugins/ApiCorsPlugin';
import type { NextRequest } from 'next/server';

/**
 * @swagger
 * /api/user/logout:
 *   post:
 *     tags:
 *       - User
 *     summary: User logout
 *     description: Clears the current session. Returns unified success envelope with no payload.
 *     responses:
 *       200:
 *         description: Logout success.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - success
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   nullable: true
 *                   description: No payload.
 *       400:
 *         description: Request failed. Error details in envelope.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - success
 *                 - id
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 id:
 *                   type: string
 *                 message:
 *                   type: string
 *                   nullable: true
 */
export async function OPTIONS(req: NextRequest) {
  return new ApiCorsPlugin({
    path: API_USER_LOGOUT,
    credentials: true
  }).preflight(req);
}

export async function POST(req: NextRequest) {
  return await new NextApiServer(API_USER_LOGOUT, req)
    .use(
      new ApiCorsPlugin({
        path: API_USER_LOGOUT,
        credentials: true,
        request: req
      })
    )
    .runWithJson(async ({ parameters: { IOC, ctx } }) =>
      IOC(UserController).logout(ctx)
    );
}
