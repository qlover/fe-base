// src/middleware.ts

// Import the Next.js middleware helper from next-intl
import createMiddleware from 'next-intl/middleware';

// Import your routing configuration which contains all locales, defaultLocale, and pathnames
import { updateSession } from '@shared/supabase/proxy';
import { routing } from './i18n/routing';
import type { NextRequest } from 'next/server';

// Export the middleware created by next-intl
// This middleware will handle locale detection, redirects, and internationalized routing automatically
// export default createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  await updateSession(request);
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
