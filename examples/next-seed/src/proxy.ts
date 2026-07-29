import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { isAuthGuestOnlyPath, ROUTE_HOME } from '@config/route';
import { ServerConfig } from '@server/ServerConfig';
import { SessionService } from '@server/services/SessionService';
import { routing } from './i18n/routing';

/**
 * Middleware main logic
 *
 * Auth layering:
 * 1. next-intl locale prefix handling
 * 2. Page-entry gate for LOGINED_PAGES via SessionService
 * 3. Redirect signed-in users away from guest-only auth pages
 *
 * Client `useUserAuth` is not an entry gate — only local UI / user store.
 */
export default async function proxy(request: NextRequest) {
  // ---------- 第一步：处理国际化 ----------
  const localPathResponse = createMiddleware(routing)(request);

  // 如果国际化中间件已经返回了重定向（例如自动将根路径重定向到默认语言），
  // 则直接返回，不再进行登录检查（避免干扰）
  if (localPathResponse.status >= 300 && localPathResponse.status < 400) {
    return localPathResponse;
  }

  const session = new SessionService(new ServerConfig());
  // ---------- 第二步：登录检查 ----------
  if (session.hasNeedProxy(request)) {
    // 将国际化响应作为“通过”时的返回值传给 session
    return await session.sessionProxy(request, localPathResponse);
  }

  // ---------- 第三步：已登录用户不应再访问 login / register ----------
  const pathname = request.nextUrl.pathname;
  if (isAuthGuestOnlyPath(pathname) && session.hasSessionFromRequest(request)) {
    const url = request.nextUrl.clone();
    // Keep locale prefix, e.g. /en/auth/login → /en
    const localeMatch = pathname.match(/^\/([^/]+)\/auth\//);
    url.pathname = localeMatch ? `/${localeMatch[1]}` : ROUTE_HOME;
    url.search = '';
    return NextResponse.redirect(url);
  }

  // 不需要登录：返回国际化处理后的响应
  return localPathResponse;
}

// Next.js middleware configuration object
export const config = {
  matcher: [
    '/',
    '/((?!api|_next|.*\\.(?:svg|png|jpg|jpeg|gif|ico)|favicon.ico|sitemap.xml|sitemap-0.xml|manifest.webmanifest).*)'
  ]
};
