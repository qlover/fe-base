import jwt from 'jsonwebtoken';
import { NextResponse, type NextRequest } from 'next/server';
import type { OAuthSessionPayload } from '@shared/oauth-wrapper';
import { isPublicPath, ROUTE_LOGIN } from '@config/route';

export const OAUTH_APP_SESSION_COOKIE = 'n_oauth_wrapper__session';

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

  const pathname = request.nextUrl.pathname;
  const raw = request.cookies.get(OAUTH_APP_SESSION_COOKIE)?.value;
  const session = parseOAuthAppSessionCookie(raw, sessionSecret);

  if (!session && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    const returnPath = `${pathname}${request.nextUrl.search}`;
    url.pathname = ROUTE_LOGIN;
    url.search = `redirect=${encodeURIComponent(returnPath)}`;
    return NextResponse.redirect(url);
  }

  return response;
}
