import { AdminUserController } from '@/server/controllers/AdminUserController';
import { NextApiServer } from '@/server/NextApiServer';
import type { BridgeOrderBy } from '@/server/port/DBBridgeInterface';
import { AdminAuthPlugin } from '@/server/services/AdminAuthPlugin';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());

  return await new NextApiServer().use(new AdminAuthPlugin()).runWithJson(
    async ({ parameters: { IOC } }) =>
      await IOC(AdminUserController).getUsers(
        searchParams as unknown as {
          page: number;
          pageSize: number;
          orderBy?: BridgeOrderBy;
        }
      )
  );
}
