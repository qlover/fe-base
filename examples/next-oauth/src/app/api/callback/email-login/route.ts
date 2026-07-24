/**
 * ─── Email OTP / Magic Link callback ───
 *
 * GET  /api/callback/email-login?code=...&next=/developer/apps
 *   Supabase PKCE redirect target (same exchange as provider-login SSO).
 *   exchangeCodeForSession → loginWithSession → redirect.
 *
 * POST /api/callback/email-login
 *   Legacy / page-driven establish: body has access_token + refresh_token
 *   after client setSession / exchangeCodeForSession.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { API_CALLBACK_EMAIL_LOGIN } from '@config/apiRoutes';
import { I } from '@config/ioc-identifiter';
import { BootstrapServer } from '@server/BootstrapServer';
import { UserController } from '@server/controllers/UserController';
import type { OAuthWrapperProviderInterface } from '@server/interfaces/OAuthWrapperProviderInterface';
import { NextApiServer } from '@server/NextApiServer';
import type { Session } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const rawQuery = Object.fromEntries(searchParams.entries());
  rawQuery.origin = origin;

  return await new NextApiServer(API_CALLBACK_EMAIL_LOGIN).runWithRedirect(
    async ({ parameters: { IOC } }) =>
      IOC(UserController).loginWithProviderCallback(rawQuery)
  );
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid JSON' },
      { status: 400 }
    );
  }

  const accessToken = body.access_token as string | undefined;
  const refreshToken = body.refresh_token as string | undefined;

  if (!accessToken || !refreshToken) {
    return NextResponse.json(
      {
        success: false,
        message: 'access_token and refresh_token are required'
      },
      { status: 400 }
    );
  }

  try {
    const server = new BootstrapServer();
    const provider = server.getIOC(
      I.OAuthWrapperProviderInterface
    ) as OAuthWrapperProviderInterface;

    if (!provider.loginWithSession) {
      return NextResponse.json(
        {
          success: false,
          message: 'Current provider does not support session establishment'
        },
        { status: 501 }
      );
    }

    await provider.loginWithSession({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: parseInt(String(body.expires_in ?? '3600'), 10),
      token_type: String(body.token_type ?? 'bearer'),
      user: null
    } as unknown as Session);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
