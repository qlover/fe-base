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
 * Email OTP / Magic Link 登录回调页面
 *
 * 用户点击邮件中的 magic link 后，Supabase 重定向到此页面。
 * 前端 client component 读取 URL hash fragment 中的 tokens 并建立 session。
 *
 * 未来可能增加的回调页面：
 *   - /auth/email-verify-callback  邮箱验证回调
 *   - /auth/register-success       注册成功
 *   - /auth/register-error         注册失败
 */
export const ROUTE_EMAIL_OTP_CALLBACK = '/auth/email-otp-callback' as const;

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
export const ROUTE_OAUTH_USERINFO = '/oauth/userinfo' as const;

/**
 * ─── Auth 相关 API 路由常量 ───
 *
 * 与 apiRoutes.ts 中的通用 API 常量区分，
 * 专门用于 auth 回调流程中的后端接口。
 * 后续如有更多回调 API 可统一放入此区域。
 */

/** Email OTP callback: 后端建立应用级 session 的接口 */
export const API_AUTH_EMAIL_OTP_ESTABLISH =
  '/api/auth/email-otp-callback/establish' as const;

/** OAuth machine endpoints that skip session and locale middleware. */
export const OAUTH_MACHINE_ROUTES = [
  ROUTE_OAUTH_TOKEN,
  ROUTE_OAUTH_REVOKE,
  ROUTE_OAUTH_USERINFO
  // ROUTE_OAUTH_CALLBACK
] as const;

/** Routes that are allowed without authentication (public routes). */
export const AUTH_ROUTES = [
  ROUTE_HOME,
  ROUTE_LOGIN,
  ROUTE_REGISTER,
  ROUTE_EMAIL_OTP_CALLBACK,
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
