import { API_USER_PASSWORD } from '@config/route';
import { UserController } from '@server/controllers/UserController';
import { NextApiServer } from '@server/NextApiServer';
import type { NextRequest } from 'next/server';

/**
 * @swagger
 * /api/user/password:
 *   post:
 *     tags:
 *       - User
 *     summary: Change password
 *     description: Verifies the current password and sets a new one for the signed-in user. Both fields are encrypted with the client StringEncryptor (same as login). The current session stays valid.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - current_password
 *               - new_password
 *             properties:
 *               current_password:
 *                 type: string
 *                 description: Encrypted current password.
 *               new_password:
 *                 type: string
 *                 description: Encrypted new password (6–50 chars, no whitespace).
 *     responses:
 *       200:
 *         description: Password changed.
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
 *         description: Request failed (not signed in, wrong current password, invalid new password). Error details in envelope.
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
export async function POST(req: NextRequest) {
  const requestBody = await req.json();

  return await new NextApiServer(API_USER_PASSWORD, req).runWithJson(
    async ({ parameters: { IOC } }) =>
      IOC(UserController).changePassword(requestBody)
  );
}
