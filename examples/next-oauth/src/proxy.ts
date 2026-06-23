import { type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { ServerConfig } from '@server/ServerConfig';
import { OAuthSessionService } from '@server/services/OAuthSessionService';
import { routing } from './i18n/routing';

/**
 * 中间件主逻辑
 * 1. 处理国际化路径前缀（使用 next-intl）
 * 2. 检查是否需要登录，若未登录则重定向到登录页
 */
export default async function proxy(request: NextRequest) {
  // ---------- 第一步：处理国际化 ----------
  const localPathResponse = createMiddleware(routing)(request);

  // 如果国际化中间件已经返回了重定向（例如自动将根路径重定向到默认语言），
  // 则直接返回，不再进行登录检查（避免干扰）
  if (localPathResponse.status >= 300 && localPathResponse.status < 400) {
    return localPathResponse;
  }

  const oauthSession = new OAuthSessionService(new ServerConfig());
  // ---------- 第二步：登录检查 ----------
  if (oauthSession.hasNeedProxy(request)) {
    // 将国际化响应作为“通过”时的返回值传给 oauthSession
    return await oauthSession.sessionProxy(request, localPathResponse);
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
