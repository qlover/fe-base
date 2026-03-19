import { API_USER_REGISTER } from '@config/apiRoutes';
import { UserController } from '@server/controllers/UserController';
import { NextApiServer } from '@server/NextApiServer';
import type { NextRequest } from 'next/server';

/**
 * @swagger
 * /api/user/register:
 *   post:
 *     tags:
 *       - User
 *     summary: User registration
 *     description: Registers a new user with email and password. Password may be client-side encrypted. Returns user in unified envelope.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email.
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 50
 *                 description: User password (optionally encrypted before send).
 *     responses:
 *       200:
 *         description: Registration success. Returns user data in success envelope.
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
 *                   description: Created user (UserSchema).
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
 *         description: Registration failed (validation or duplicate). Error details in envelope.
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
 *                   example: encrypt_password_failed
 *                 message:
 *                   type: string
 *                   nullable: true
 */
export async function POST(req: NextRequest) {
  const requestBody = await req.json();

  return await new NextApiServer(API_USER_REGISTER).runWithJson(
    async ({ parameters: { IOC } }) => IOC(UserController).register(requestBody)
  );
}
