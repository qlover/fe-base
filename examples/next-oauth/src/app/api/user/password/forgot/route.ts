import { API_USER_PASSWORD_FORGOT } from '@config/route';
import { PasswordResetController } from '@server/controllers/PasswordResetController';
import { NextApiServer } from '@server/NextApiServer';
import type { NextRequest } from 'next/server';

/**
 * @swagger
 * /api/user/password/forgot:
 *   post:
 *     tags:
 *       - User
 *     summary: Request a password reset email
 *     description: Public. Only available with the Supabase upstream, `mail.password_reset_enabled` on and a mail provider other than `disabled`. Responds identically whether or not the email exists. Per-IP cooldown 60s; at most 5 reset mails per email per hour.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               locale:
 *                 type: string
 *                 description: Optional mail language hint (`zh` | `en`).
 *     responses:
 *       200:
 *         description: Accepted (a mail is sent only when the account exists).
 *       400:
 *         description: Feature disabled, invalid email, or rate limited. Error details in envelope.
 */
export async function POST(req: NextRequest) {
  const requestBody = await req.json().catch(() => null);

  return await new NextApiServer(API_USER_PASSWORD_FORGOT, req).runWithJson(
    async ({ parameters: { IOC } }) =>
      IOC(PasswordResetController).forgot(requestBody, req)
  );
}
