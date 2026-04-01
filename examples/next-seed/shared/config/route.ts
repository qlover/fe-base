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

/** Routes that are allowed without authentication (public routes). */
export const AUTH_ROUTES = [ROUTE_HOME, ROUTE_LOGIN, ROUTE_REGISTER] as const;

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
