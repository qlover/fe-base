import { API_USER_SESSION } from '@config/apiRoutes';
import { UserController } from '@server/controllers/UserController';
import { NextApiServer } from '@server/NextApiServer';

/**
 * @swagger
 * /api/user/session:
 *   get:
 *     tags:
 *       - User
 *     summary: Get current user session
 *     description: Returns the currently authenticated user from session. Uses `NextApiServer` and unified API envelope.
 *     responses:
 *       200:
 *         description: Success. Returns user data in success envelope.
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
 *                   type: object
 *                   description: Current user (UserSchema). Omitted if not logged in.
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: string
 *                     role:
 *                       type: integer
 *                       enum: [0, 1]
 *                     email:
 *                       type: string
 *                       format: email
 *                     credential_token:
 *                       type: string
 *                     email_confirmed_at:
 *                       type: number
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                     updated_at:
 *                       type: string
 *                       nullable: true
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
export async function GET() {
  return await new NextApiServer(API_USER_SESSION).runWithJson(
    async ({ parameters: { IOC } }) => IOC(UserController).getUser()
  );
}
