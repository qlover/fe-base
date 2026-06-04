import { i18nConfig } from './i18n';

/**
 * 登录页面路由地址
 */
export const ROUTE_LOGIN = '/auth/login' as const;

/**
 * 注册页面路由地址
 */
export const ROUTE_REGISTER = '/auth/register' as const;

/**
 * Current-user request / activity log viewer (requires auth). Pages Router: `src/pages/[locale]/admin/request-logs.tsx`.
 */
export const ROUTE_REQUEST_LOGS = '/admin/request-logs' as const;

export const ROUTE_HOME = '/' as const;

/** Developer console app list (PRD default post-login redirect). */
export const ROUTE_DEVELOPER_APPS = '/developer/apps' as const;

/** OAuth 2.0 authorization consent page. */
export const ROUTE_OAUTH_AUTHORIZE = '/oauth/authorize' as const;

/** In-app OAuth flow playground (developer testing). */
export const ROUTE_OAUTH_PLAYGROUND = '/oauth/playground' as const;

/** OAuth integration guide (public documentation). */
export const ROUTE_DOCS_OAUTH = '/docs/oauth' as const;

/** OAuth 2.0 token endpoint (machine-to-machine, no locale prefix). */
export const ROUTE_OAUTH_TOKEN = '/oauth/token' as const;

/** RFC 7009 token revocation endpoint (machine-to-machine, no locale prefix). */
export const ROUTE_OAUTH_REVOKE = '/oauth/revoke' as const;

export const ROUTE_OAUTH_CALLBACK = '/oauth/callback' as const;

/** OAuth 2.0 / OIDC userinfo endpoint (machine-to-machine, no locale prefix). */
export const ROUTE_USERINFO = '/userinfo' as const;

/** OAuth machine endpoints that skip session and locale middleware. */
export const OAUTH_MACHINE_ROUTES = [
  ROUTE_OAUTH_TOKEN,
  ROUTE_OAUTH_REVOKE,
  ROUTE_USERINFO
  // ROUTE_OAUTH_CALLBACK
] as const;

/** Routes that are allowed without authentication (public routes). */
export const AUTH_ROUTES = [
  ROUTE_HOME,
  ROUTE_LOGIN,
  ROUTE_REGISTER,
  ROUTE_DOCS_OAUTH
] as const;

/**
 * Returns true if pathname is an OAuth machine endpoint (token, userinfo, etc.).
 */
export function isOAuthMachinePath(pathname: string): boolean {
  return OAUTH_MACHINE_ROUTES.some(
    (route) => pathname === route || pathname.endsWith(route)
  );
}

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
    // Use suffix match so /auth/login does not match longer auth paths incorrectly
    return pathname === route || pathname.endsWith(route);
  });
}
