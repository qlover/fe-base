import { AdminLocalesController } from '@/server/controllers/AdminLocalesController';
import { NextApiServer } from '@/server/NextApiServer';
import type { BridgeOrderBy } from '@/server/port/DBBridgeInterface';
import { AdminAuthPlugin } from '@/server/services/AdminAuthPlugin';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
  return await new NextApiServer()
    .use(new AdminAuthPlugin())
    .runWithJson(async ({ parameters: { IOC } }) => {
      return IOC(AdminLocalesController).getLocales(
        searchParams as unknown as {
          page: number;
          pageSize: number;
          orders?: BridgeOrderBy;
        }
      );
    });
}
