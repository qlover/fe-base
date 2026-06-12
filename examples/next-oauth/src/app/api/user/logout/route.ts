import { API_USER_LOGOUT } from '@config/apiRoutes';
import { UserController } from '@server/controllers/UserController';
import { NextApiServer } from '@server/NextApiServer';
import { ServerConfig } from '@server/ServerConfig';
import {
  apiCorsPreflightResponse,
  buildApiCorsHeaders
} from '@server/utils/apiCors';
import type { NextRequest } from 'next/server';

const corsConfig = new ServerConfig();

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
  return apiCorsPreflightResponse(req, corsConfig, { credentials: true });
}

export async function POST(req: NextRequest) {
  const corsHeaders = buildApiCorsHeaders(req, corsConfig, {
    credentials: true
  });

  return await new NextApiServer(API_USER_LOGOUT, req).runWithJson(
    async ({ parameters: { IOC, ctx } }) => IOC(UserController).logout(ctx),
    corsHeaders
      ? { successHeaders: corsHeaders, errorHeaders: corsHeaders }
      : undefined
  );
}
