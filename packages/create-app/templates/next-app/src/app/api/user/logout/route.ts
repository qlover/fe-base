import { UserController } from '@/server/controllers/UserController';
import { NextApiServer } from '@/server/NextApiServer';

export async function POST() {
  return await new NextApiServer().runWithJson(
    async ({ parameters: { IOC } }) => IOC(UserController).logout()
  );
}
