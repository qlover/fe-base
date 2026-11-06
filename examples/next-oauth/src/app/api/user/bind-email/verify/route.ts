import { API_USER_BIND_EMAIL_VERIFY } from '@config/route';
import { UserController } from '@server/controllers/UserController';
import { NextApiServer } from '@server/NextApiServer';
import type { NextRequest } from 'next/server';

/**
 * @swagger
 * /api/user/bind-email/verify:
 *   post:
 *     tags:
 *       - User
 *     summary: Verify bind-email OTP
 *     description: Binds the email to the current phone account, or merges into an existing email account when the address is already registered.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, token]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: "`{ merged, user }` — session cookie is refreshed."
 *       400:
 *         description: Invalid OTP, phone conflict, or already bound.
 */
export async function POST(req: NextRequest) {
  const requestBody = await req.json().catch(() => null);

  return await new NextApiServer(API_USER_BIND_EMAIL_VERIFY, req).runWithJson(
    async ({ parameters: { IOC } }) =>
      IOC(UserController).bindEmailVerify(requestBody)
  );
}
