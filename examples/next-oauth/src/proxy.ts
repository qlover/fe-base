// Import your routing configuration which contains all locales, defaultLocale, and pathnames
import createMiddleware from 'next-intl/middleware';
import { supabaseProxySession } from '@shared/supabase/proxy';
import { isOAuthMachinePath } from '@config/route';
import { routing } from './i18n/routing';
import type { NextRequest } from 'next/server';

/**
 * Check if the request should be skipped by the proxy.
 * @param request - The request to check.
 * @returns True if the request should be skipped by the proxy, false otherwise.
 */
function hasSkipProxySession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  return isOAuthMachinePath(pathname);
}

export default async function proxy(request: NextRequest) {
  /**
   * 当跳过session检查的时候，直接返回createMiddleware(routing)(request)
   */
  if (hasSkipProxySession(request)) {
    console.log('Proxy(skip) request', request.nextUrl.pathname);
    return createMiddleware(routing)(request);
  }

  await supabaseProxySession(request);

  return createMiddleware(routing)(request);
}

// Next.js middleware configuration object
export const config = {
  matcher: [
    '/', // Match the root path explicitly

    // Match all paths except for:
    // - API routes
    // - Next.js internals (_next/*)
    // - Static files (*.svg, *.png, *.jpg, *.jpeg, *.gif, *.ico)
    // - Other static assets and special files
    // - Manifest file (manifest.webmanifest)
    '/((?!api|_next|.*\\.(?:svg|png|jpg|jpeg|gif|ico)|favicon.ico|sitemap.xml|sitemap-0.xml|manifest.webmanifest).*)'
  ]
};
