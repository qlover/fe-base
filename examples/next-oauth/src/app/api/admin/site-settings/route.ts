import { type NextRequest } from 'next/server';
import { PermissionKey } from '@shared/auth/permissionKeys';
import { API_ADMIN_SITE_SETTINGS } from '@config/apiRoutes';
import { SiteSettingsController } from '@server/controllers/SiteSettingsController';
import { NextApiServer } from '@server/NextApiServer';
import { RequirePermissionPlugin } from '@server/plugins/RequirePermissionPlugin';
import { ServerAuthPlugin } from '@server/plugins/ServerAuthPlugin';

/**
 * @swagger
 * /api/admin/site-settings:
 *   get:
 *     tags:
 *       - Admin
 *     summary: List site settings
 *     description: Requires `admin_site_settings_read`. Sensitive values are masked.
 *     responses:
 *       200:
 *         description: Success envelope; `data` is FeAdminSiteSettingEntry[].
 *       401:
 *         description: Not authenticated or missing permission.
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Update site settings
 *     description: Requires `admin_site_settings_write`.
 *     responses:
 *       200:
 *         description: Updated FeAdminSiteSettingEntry[].
 *       401:
 *         description: Not authenticated or missing permission.
 */
export async function GET(req: NextRequest) {
  return await new NextApiServer(API_ADMIN_SITE_SETTINGS, req)
    .use(new ServerAuthPlugin())
    .use(new RequirePermissionPlugin(PermissionKey.admin_site_settings_read))
    .runWithJson(async ({ parameters: { IOC } }) =>
      IOC(SiteSettingsController).getAdminSettings()
    );
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  return await new NextApiServer(API_ADMIN_SITE_SETTINGS, req)
    .use(new ServerAuthPlugin())
    .use(new RequirePermissionPlugin(PermissionKey.admin_site_settings_write))
    .runWithJson(async ({ parameters: { IOC } }) =>
      IOC(SiteSettingsController).patchAdminSettings(body)
    );
}

export async function PUT(req: NextRequest) {
  return PATCH(req);
}
