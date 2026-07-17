import { i18nConfig } from './i18n';
import type { LocaleType } from './i18n';
import type { NextURL } from 'next/dist/server/web/next-url';
import type { NextRequest } from 'next/server';

export * from './apiRoutes';

/** Login page */
export const ROUTE_LOGIN = '/auth/login' as const;

/** Register page */
export const ROUTE_REGISTER = '/auth/register' as const;

/**
 * Email OTP / Magic Link login callback.
 * After the user clicks the magic link, Supabase redirects here.
 */
export const ROUTE_CALLBACK_EMAIL_LOGIN = '/callback/email-login' as const;

export const ROUTE_HOME = '/' as const;

/** Simple admin dashboard template (Pages Router). */
export const ROUTE_ADMIN = '/admin' as const;

/** Routes that skip locale middleware (callbacks). */
export const NON_LOCALIZED_ROUTES = [ROUTE_CALLBACK_EMAIL_LOGIN] as const;

/** Routes that are allowed without authentication (public routes). */
export const AUTH_ROUTES = [
  ROUTE_HOME,
  ROUTE_LOGIN,
  ROUTE_REGISTER,
  ROUTE_CALLBACK_EMAIL_LOGIN
] as const;

/** Pages that require login. */
export const LOGINED_PAGES = [ROUTE_ADMIN] as const;

/** Auth pages for unauthenticated users only (signed-in users should redirect away). */
export const GUEST_ONLY_AUTH_PAGES = [ROUTE_LOGIN, ROUTE_REGISTER] as const;

/**
 * Returns true if pathname is a public route (no auth required).
 * Handles locale-prefixed paths (e.g. /en/auth/login).
 */
export function isPublicPath(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => {
    if (route === ROUTE_HOME) {
      if (pathname === '/' || pathname === '') return true;
      const localeSegment = pathname.match(/^\/([^/]+)\/?$/);
      return (
        localeSegment != null &&
        i18nConfig.supportedLngs.includes(localeSegment[1] as 'en' | 'zh')
      );
    }
    return pathname === route || pathname.endsWith(route);
  });
}

export function localePage(route: string, locale: LocaleType): string {
  return locale + route;
}

/**
 * Whether the path requires an authenticated session.
 */
export function hasSessionPath(pathname: string): boolean {
  return LOGINED_PAGES.some(
    (route) => pathname === route || pathname.endsWith(route)
  );
}

/**
 * Whether the path is an auth page that signed-in users should not visit.
 */
export function isAuthGuestOnlyPath(pathname: string): boolean {
  return GUEST_ONLY_AUTH_PAGES.some(
    (route) => pathname === route || pathname.endsWith(route)
  );
}

/**
 * Whether the path should include a locale prefix.
 */
export function hasLocalPath(pathname: string): boolean {
  return !NON_LOCALIZED_ROUTES.some(
    (route) => pathname === route || pathname.endsWith(route)
  );
}

/**
 * Redirect to a path (default: login), carrying the current pathname for return.
 */
export function redirectToPath(
  request: NextRequest,
  pathnmae?: string,
  targetRoute: string = ROUTE_LOGIN
): NextURL {
  const pathnmae2 = pathnmae || request.nextUrl.pathname;

  const url = request.nextUrl.clone();
  const returnPath = `${pathnmae2}${request.nextUrl.search}`;
  url.pathname = targetRoute;
  url.search = `redirect=${encodeURIComponent(returnPath)}`;
  return url;
}
