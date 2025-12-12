import { NextResponse, type NextRequest } from 'next/server';
import { LocalesController } from '@/server/controllers/LocalesController';
import { NextApiServer } from '@/server/NextApiServer';
import type { LocalesControllerJsonQuery } from '@/server/port/LocalesControllerInterface';
import type { LocaleType } from '@config/i18n';
import { i18nConfig } from '@config/i18n';

// Use literal value instead of imported config to ensure static analysis
export const revalidate = 60; // Cache time in seconds (matches i18nConfig.localeCacheTime)

export async function GET(req: NextRequest) {
  const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
  const locale = searchParams.locale as LocaleType;

  const result = await new NextApiServer().run(
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
