import { API_USER_LOGOUT } from '@config/apiRoutes';
import { UserController } from '@server/controllers/UserController';
import { NextApiServer } from '@server/NextApiServer';

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
export async function POST() {
  return await new NextApiServer(API_USER_LOGOUT).runWithJson(
    async ({ parameters: { IOC } }) => IOC(UserController).logout()
  );
}
