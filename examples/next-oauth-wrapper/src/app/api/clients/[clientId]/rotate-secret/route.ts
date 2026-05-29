import { OAuthClientsController } from '@server/controllers/OAuthClientsController';
import { NextApiServer } from '@server/NextApiServer';
import { ServerAuthPlugin } from '@server/plugins/ServerAuthPlugin';
import type { NextRequest } from 'next/server';

/**
 * @swagger
 * /api/clients/{clientId}/rotate-secret:
 *   post:
 *     tags:
 *       - OAuth Clients
 *     summary: Rotate OAuth client secret
 *     description: Generates a new client secret and invalidates the old one
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: New client secret (shown only once)
 *       404:
 *         description: Client not found
 *       401:
 *         description: Not authenticated
 */
type ClientIdRouteContext = {
  params: Promise<{ clientId: string }>;
};

export async function POST(req: NextRequest, context: ClientIdRouteContext) {
  const { clientId } = await context.params;

  return await new NextApiServer('/api/clients/[clientId]/rotate-secret', req)
    .use(new ServerAuthPlugin())
    .runWithJson(async ({ parameters: { IOC } }) => {
      const controller = IOC(OAuthClientsController);
      return controller.rotateSecret(clientId);
    });
}
