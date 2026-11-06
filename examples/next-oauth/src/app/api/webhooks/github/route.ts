import { API_WEBHOOKS_GITHUB } from '@config/apiRoutes';
import { GithubWebhookController } from '@server/controllers/GithubWebhookController';
import { NextApiServer } from '@server/NextApiServer';
import type { NextRequest } from 'next/server';

/**
 * GitHub App Webhook：无会话鉴权，由 Controller 校验签名。
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  return await new NextApiServer(API_WEBHOOKS_GITHUB, req).runWithJson(
    async ({ parameters: { IOC } }) => {
      return IOC(GithubWebhookController).handle(rawBody, {
        event: req.headers.get('x-github-event'),
        signature: req.headers.get('x-hub-signature-256')
      });
    }
  );
}
