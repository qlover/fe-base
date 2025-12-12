import { AdminLocalesController } from '@/server/controllers/AdminLocalesController';
import { NextApiServer } from '@/server/NextApiServer';
import { AdminAuthPlugin } from '@/server/services/AdminAuthPlugin';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const requestBody = await req.json();
  return await new NextApiServer()
    .use(new AdminAuthPlugin())
    .runWithJson(async ({ parameters: { IOC } }) =>
      IOC(AdminLocalesController).createLocale(requestBody)
    );
}
