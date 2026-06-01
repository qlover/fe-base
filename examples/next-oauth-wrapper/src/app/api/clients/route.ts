import { OAuthClientCreateSchema } from '@qlover/oauth-wrapper';
import { OAuthClientsController } from '@server/controllers/OAuthClientsController';
import { NextApiServer } from '@server/NextApiServer';
import { ServerAuthPlugin } from '@server/plugins/ServerAuthPlugin';
import type { NextRequest } from 'next/server';

/**
 * @swagger
 * /api/clients:
 *   get:
 *     tags:
 *       - OAuth Clients
 *     summary: List OAuth clients for current user
 *     description: Returns all OAuth clients owned by the authenticated user
 *     responses:
 *       200:
 *         description: List of OAuth clients
 *       401:
 *         description: Not authenticated
 */
export async function GET(req: NextRequest) {
  return await new NextApiServer('/api/clients', req)
    .use(new ServerAuthPlugin())
    .runWithJson(async ({ parameters: { IOC } }) => {
      const controller = IOC(OAuthClientsController);
      return controller.list();
    });
}

/**
 * @swagger
 * /api/clients:
 *   post:
 *     tags:
 *       - OAuth Clients
 *     summary: Create a new OAuth client
 *     description: Creates a new OAuth 2.0 client application
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - client_name
 *               - redirect_uris
 *             properties:
 *               client_name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               client_uri:
 *                 type: string
 *                 format: uri
 *               redirect_uris:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 minItems: 1
 *     responses:
 *       201:
 *         description: Created OAuth client with credentials
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Not authenticated
 */
export async function POST(req: NextRequest) {
  return await new NextApiServer('/api/clients', req)
    .use(new ServerAuthPlugin())
    .runWithJson(async ({ parameters: { IOC } }) => {
      const body = await req.json();
      const validated = OAuthClientCreateSchema.parse(body);
      const controller = IOC(OAuthClientsController);
      return controller.create(validated);
    });
}
