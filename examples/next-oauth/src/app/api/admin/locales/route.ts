import { PermissionKey } from '@shared/auth/permissionKeys';
import { API_ADMIN_LOCALES } from '@config/apiRoutes';
import { AdminLocalesController } from '@server/controllers/AdminLocalesController';
import { NextApiServer } from '@server/NextApiServer';
import { RequirePermissionPlugin } from '@server/plugins/RequirePermissionPlugin';
import { ServerAuthPlugin } from '@server/plugins/ServerAuthPlugin';
import type { NextRequest } from 'next/server';

/**
 * @swagger
 * /api/admin/locales:
 *   get:
 *     tags:
 *       - Admin
 *     summary: List locale dictionary rows
 *     description: Requires `admin_locales_read`. Single-language list via `locale` query.
 *     responses:
 *       200:
 *         description: Success envelope; `data` is ResourceSearchResult of AdminLocaleItem.
 *       401:
 *         description: Not authenticated or missing permission.
 *   post:
 *     tags:
 *       - Admin
 *     summary: Create a locale dictionary row
 *     description: Requires `admin_locales_write`.
 *     responses:
 *       200:
 *         description: Created AdminLocaleItem or null.
 *       401:
 *         description: Not authenticated or missing permission.
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Update a locale dictionary row
 *     description: Requires `admin_locales_write`.
 *     responses:
 *       200:
 *         description: `{ ok: true }`.
 *       401:
 *         description: Not authenticated or missing permission.
 */
export async function GET(req: NextRequest) {
  return await new NextApiServer(API_ADMIN_LOCALES, req)
    .use(new ServerAuthPlugin())
    .use(new RequirePermissionPlugin(PermissionKey.admin_locales_read))
    .runWithJson(async ({ parameters: { IOC } }) =>
      IOC(AdminLocalesController).search(req.nextUrl.searchParams)
    );
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return await new NextApiServer(API_ADMIN_LOCALES, req)
    .use(new ServerAuthPlugin())
    .use(new RequirePermissionPlugin(PermissionKey.admin_locales_write))
    .runWithJson(async ({ parameters: { IOC } }) =>
      IOC(AdminLocalesController).create(body)
    );
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  return await new NextApiServer(API_ADMIN_LOCALES, req)
    .use(new ServerAuthPlugin())
    .use(new RequirePermissionPlugin(PermissionKey.admin_locales_write))
    .runWithJson(async ({ parameters: { IOC } }) =>
      IOC(AdminLocalesController).update(body)
    );
}
