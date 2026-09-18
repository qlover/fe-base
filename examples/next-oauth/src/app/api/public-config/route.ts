import { NextResponse, type NextRequest } from 'next/server';
import { API_PUBLIC_CONFIG } from '@config/route';
import { SiteSettingsController } from '@server/controllers/SiteSettingsController';
import { NextApiServer } from '@server/NextApiServer';

/** Login feature flags must reflect DB immediately after Admin saves. */
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const result = await new NextApiServer(API_PUBLIC_CONFIG, req).run(
    async ({ parameters: { IOC } }) =>
      IOC(SiteSettingsController).getPublicConfig()
  );

  if (!result.success) {
    return NextResponse.json({
      auth: {
        phoneLoginEnabled: false,
        githubOauthEnabled: false,
        googleOauthEnabled: false
      }
    });
  }

  const response = NextResponse.json(result.data);
  response.headers.set(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, max-age=0'
  );
  return response;
}
