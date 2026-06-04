import { NextResponse, type NextRequest } from 'next/server';
import {
  API_OAUTH_ACCESS_DENIED,
  API_OAUTH_INVALID_REQUEST
} from '@config/i18n-identifier/api';
import { OAuthController } from '@server/controllers/OAuthController';
import { NextApiServer } from '@server/NextApiServer';

/**
 * OAuth consent submission: allow or deny authorization for a registered client.
 */
export async function POST(req: NextRequest) {
  let requestBody: unknown;
  try {
    requestBody = await req.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        id: API_OAUTH_INVALID_REQUEST,
        message: 'Invalid JSON'
      },
      { status: 400 }
    );
  }

  const server = new NextApiServer('/api/oauth/consent', req);
  const result = await server.run(async ({ parameters: { IOC } }) =>
    IOC(OAuthController).submitConsent(requestBody)
  );

  if (!result.success) {
    const status = result.id === API_OAUTH_ACCESS_DENIED ? 401 : 400;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json({
    success: true,
    data: result.data
  });
}
