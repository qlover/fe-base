import { API_USER_DISPLAY_NAME } from '@config/route';
import { UserController } from '@server/controllers/UserController';
import { NextApiServer } from '@server/NextApiServer';
import type { NextRequest } from 'next/server';

/**
 * @swagger
 * /api/user/display-name:
 *   post:
 *     tags:
 *       - User
 *     summary: Update display name
 *     description: Updates `fe_users.display_name` for the signed-in user and syncs the session cookie `user.name`. Name must be 1–32 Unicode letters, numbers, or underscores.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - display_name
 *             properties:
 *               display_name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 32
 *     responses:
 *       200:
 *         description: Updated session user (includes new `name`).
 *       400:
 *         description: Invalid display name or not signed in.
 */
export async function POST(req: NextRequest) {
  const requestBody = await req.json().catch(() => null);

  return await new NextApiServer(API_USER_DISPLAY_NAME, req).runWithJson(
    async ({ parameters: { IOC } }) =>
      IOC(UserController).updateDisplayName(requestBody)
  );
}
