import { API_USER_BIND_EMAIL_SEND } from '@config/route';
import { UserController } from '@server/controllers/UserController';
import { NextApiServer } from '@server/NextApiServer';
import type { NextRequest } from 'next/server';

/**
 * @swagger
 * /api/user/bind-email/send:
 *   post:
 *     tags:
 *       - User
 *     summary: Send bind-email OTP
 *     description: Phone-only accounts request an email OTP to bind a business email. Rate-limited by client IP.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: OTP accepted for delivery.
 *       400:
 *         description: Already bound, unsupported upstream, or rate limited.
 */
export async function POST(req: NextRequest) {
  const requestBody = await req.json().catch(() => null);

  return await new NextApiServer(API_USER_BIND_EMAIL_SEND, req).runWithJson(
    async ({ parameters: { IOC } }) =>
      IOC(UserController).bindEmailSend(requestBody, req)
  );
}
