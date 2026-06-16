import jwt from 'jsonwebtoken';
import { NextResponse, type NextRequest } from 'next/server';
import { isPublicPath, redirectToPath } from '@config/route';
import { ServerConfig } from '@server/ServerConfig';
import type { OAuthSessionPayload } from '@qlover/oauth-wrapper';

export function parseOAuthAppSessionCookie(
  raw: string | undefined,
  secret: string | undefined
): OAuthSessionPayload | null {
  if (!raw || !secret) {
    return null;
  }
  try {
    return jwt.verify(raw, secret) as OAuthSessionPayload;
  } catch {
    return null;
  }
}

/**
 * Next OAuth Wrapper session gate: validates signed session cookie and redirects unauthenticated users.
 */
export async function oauthWrapperProxySession(request: NextRequest) {
  const response = NextResponse.next({
    request
  });

  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    return response;
  }

  const serverConfig = new ServerConfig();
  const pathname = request.nextUrl.pathname;
  const raw = request.cookies.get(serverConfig.oauthSessionKey)?.value;
  const session = parseOAuthAppSessionCookie(raw, sessionSecret);

  if (!session && !isPublicPath(pathname)) {
    return NextResponse.redirect(redirectToPath(request));
  }

  return response;
}
