import { API_CLIENTS_2 } from './apiRoutes';
import { i18nConfig } from './i18n';
import type { LocaleType } from './i18n';
import type { NextURL } from 'next/dist/server/web/next-url';
import type { NextRequest } from 'next/server';

export * from './apiRoutes';

/**
 * 登录页面路由地址
 */
export const ROUTE_LOGIN = '/auth/login' as const;

/**
 * 注册页面路由地址
 */
export const ROUTE_REGISTER = '/auth/register' as const;

/**
 * Email OTP / Magic Link callback page.
 * Shows loading UI, exchanges PKCE ?code=, then POSTs to /api/callback/email-login.
 */
export const ROUTE_CALLBACK_EMAIL_LOGIN = '/callback/email-login' as const;

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

export const ROUTE_ABOUT = '/about' as const;

/** UI showcase / kit preview (Pages Router). */
export const ROUTE_DEMO_UI = '/demo-ui' as const;

/** OAuth integration guide (public documentation). */
export const ROUTE_DOCS_OAUTH = '/docs/oauth' as const;

/** OAuth 2.0 token endpoint (machine-to-machine, no locale prefix). */
export const ROUTE_OAUTH_TOKEN = '/oauth/token' as const;

/** RFC 7009 token revocation endpoint (machine-to-machine, no locale prefix). */
export const ROUTE_OAUTH_REVOKE = '/oauth/revoke' as const;

/** OAuth 2.0 / OIDC userinfo endpoint (machine-to-machine, no locale prefix). */
export const ROUTE_OAUTH_USERINFO = '/oauth/userinfo' as const;

/**
 * ─── Auth 相关 API 路由常量 ───
 *
 * 与 apiRoutes.ts 中的通用 API 常量区分，
 * 专门用于 auth 回调流程中的后端接口。
 * 后续如有更多回调 API 可统一放入此区域。
 */

/** OAuth machine endpoints that skip session and locale middleware. */
export const OAUTH_MACHINE_ROUTES = [
  ROUTE_OAUTH_TOKEN,
  ROUTE_OAUTH_REVOKE,
  ROUTE_OAUTH_USERINFO,
  ROUTE_CALLBACK_EMAIL_LOGIN
] as const;

/** Routes that are allowed without authentication (public routes). */
export const AUTH_ROUTES = [
  ROUTE_HOME,
  ROUTE_LOGIN,
  ROUTE_REGISTER,
  ROUTE_CALLBACK_EMAIL_LOGIN,
  ROUTE_DOCS_OAUTH,
  ROUTE_ABOUT,
  ROUTE_DEMO_UI
] as const;

/** 需要登陆才能访问的页面 */
export const LOGINED_PAGES = [
  ROUTE_REQUEST_LOGS,
  ROUTE_DEVELOPER_APPS,
  ROUTE_OAUTH_PLAYGROUND
] as const;

/**
 * Returns true if pathname is an OAuth machine endpoint (token, userinfo, etc.).
 */
export function isOAuthMachinePath(pathname: string): boolean {
  return OAUTH_MACHINE_ROUTES.some(
    (route) => pathname === route || pathname.endsWith(route)
  );
}

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
    // Use suffix match so /auth/login does not match longer auth paths incorrectly
    return pathname === route || pathname.endsWith(route);
  });
}

export function apiClientDetail<T extends string>(
  clientId: T
): `/api/clients/${T}` {
  return API_CLIENTS_2.replace(
    ':clientId',
    encodeURIComponent(clientId)
  ) as `/api/clients/${T}`;
}

export function apiClientRotateSecret(clientId: string): string {
  return apiClientDetail(clientId).replace(
    ':clientId',
    encodeURIComponent(clientId)
  );
}

export function localePage(route: string, locale: LocaleType): string {
  return locale + route;
}

/**
 * 是否是 oauth 认证服务的路由
 * @param pathname
 */
export function isOAuthRoutePath(pathname: string): boolean {
  return OAUTH_MACHINE_ROUTES.some(
    (route) => pathname === route || pathname.endsWith(route)
  );
}

/**
 * Whether the path is an auth callback page under `/callback/*`
 * (e.g. `/en/callback/email-login`). These pages establish session first,
 * so bootstrap must not call `/api/user/session` prematurely.
 */
export function isAuthCallbackPath(pathname: string): boolean {
  return /(?:^|\/)callback(?:\/|$)/.test(pathname);
}

/**
 * 是否需要登录才能访问的页面
 * @param pathname
 */
export function hasSessionPath(pathname: string): boolean {
  return LOGINED_PAGES.some(
    (route) => pathname === route || pathname.endsWith(route)
  );
}

/**
 * Whether the path is an auth page that signed-in users should not visit.
 * @param pathname
 */
export function isAuthGuestOnlyPath(pathname: string): boolean {
  return GUEST_ONLY_AUTH_PAGES.some(
    (route) => pathname === route || pathname.endsWith(route)
  );
}

/**
 * 是否需要携带国际化路由的路径
 *
 * 一般来说，除了 isOAuthRoutePath 的 path 其余都需要带上
 * @param pathname
 */
export function hasLocalPath(pathname: string): boolean {
  return !isOAuthRoutePath(pathname);
}

/**
 * 用于将请求重定向到某个路径，但是会携带当前 pathnmae 参数，用于重定向回来
 *
 * **默认重定向到 login 页面**
 *
 * 常见场景为访问了需要登陆的页面时没有登陆则会重定向到登陆页面，当登陆成功后可以在根据参数重定向回来
 *
 * @param request
 * @param pathnmae
 * @param targetRoute
 * @returns
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
