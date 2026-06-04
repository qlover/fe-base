import { NextResponse, type NextRequest } from 'next/server';
import { API_OAUTH_VERIFY } from '@config/apiRoutes';
import {
  API_OAUTH_WRAPPER_AUTH_FAILED,
  API_OAUTH_INVALID_REQUEST
} from '@config/i18n-identifier/api';
import { OAuthController } from '@server/controllers/OAuthController';
import { NextApiServer } from '@server/NextApiServer';

/**
 * OAuth wrapper email/password login — establishes session and provider credentials.
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

  const server = new NextApiServer(API_OAUTH_VERIFY, req);
  const result = await server.run(async ({ parameters: { IOC } }) =>
    IOC(OAuthController).verifyLogin(requestBody)
  );

  if (!result.success) {
    const status = result.id === API_OAUTH_WRAPPER_AUTH_FAILED ? 401 : 400;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}
