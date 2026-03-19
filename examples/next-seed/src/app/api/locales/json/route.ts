import { NextResponse, type NextRequest } from 'next/server';
import { API_LOCALES_JSON } from '@config/apiRoutes';
import type { LocaleType } from '@config/i18n';
import { i18nConfig } from '@config/i18n';
import { LocalesController } from '@server/controllers/LocalesController';
import type { LocalesControllerJsonQuery } from '@server/interfaces/LocalesControllerInterface';
import { NextApiServer } from '@server/NextApiServer';

// Use literal value instead of imported config to ensure static analysis
export const revalidate = 60; // Cache time in seconds (matches i18nConfig.localeCacheTime)

/**
 * @swagger
 * /api/locales/json:
 *   get:
 *     tags:
 *       - Locales
 *     summary: Get locale JSON
 *     description: |
 *       Returns translation key-value map for the given locale. Response is cached per `revalidate`.
 *       On invalid or unsupported locale, returns empty object. Sets `Cache-Control` and `x-cache-tag` headers.
 *     parameters:
 *       - in: query
 *         name: locale
 *         required: true
 *         schema:
 *           type: string
 *         description: Locale code (e.g. en, zh). Must be in supported locales.
 *       - in: query
 *         name: orderBy
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional sort order for locale entries.
 *     responses:
 *       200:
 *         description: Locale key-value map or empty object.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: string
 *               description: Translation keys to localized strings.
 */
export async function GET(req: NextRequest) {
  const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
  const locale = searchParams.locale as LocaleType;

  const result = await new NextApiServer(API_LOCALES_JSON).run(
    async ({ parameters: { IOC } }) =>
      IOC(LocalesController).json(
        searchParams as unknown as LocalesControllerJsonQuery
      )
  );

  if (!result.success) {
    return NextResponse.json({});
  }

  const response = NextResponse.json(result.data);
  response.headers.set(
    'Cache-Control',
    `s-maxage=${i18nConfig.localeCacheTime}`
  );
  response.headers.set('x-cache-tag', `i18n-${locale}`);
  return response;
}
