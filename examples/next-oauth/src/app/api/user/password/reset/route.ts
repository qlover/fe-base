import { API_USER_PASSWORD_RESET } from '@config/route';
import { PasswordResetController } from '@server/controllers/PasswordResetController';
import { NextApiServer } from '@server/NextApiServer';
import type { NextRequest } from 'next/server';

/**
 * @swagger
 * /api/user/password/reset:
 *   get:
 *     tags:
 *       - User
 *     summary: Verify a password reset token
 *     description: Public. Returns whether the `token` from the emailed link is still usable (unused and not expired).
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: "`{ valid: boolean }`."
 *   post:
 *     tags:
 *       - User
 *     summary: Reset the password with an emailed token
 *     description: Public. `new_password` is encrypted with the client StringEncryptor (same as login). Success revokes every session of the user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - new_password
 *             properties:
 *               token:
 *                 type: string
 *               new_password:
 *                 type: string
 *                 description: Encrypted new password (6–50 chars, no whitespace).
 *               locale:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset.
 *       400:
 *         description: Invalid or expired token, invalid password, or feature disabled.
 */
export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get('token');

  return await new NextApiServer(API_USER_PASSWORD_RESET, req).runWithJson(
    async ({ parameters: { IOC } }) =>
      IOC(PasswordResetController).verify(token)
  );
}

export async function POST(req: NextRequest) {
  const requestBody = await req.json().catch(() => null);

  return await new NextApiServer(API_USER_PASSWORD_RESET, req).runWithJson(
    async ({ parameters: { IOC } }) =>
      IOC(PasswordResetController).reset(requestBody, req)
  );
}
