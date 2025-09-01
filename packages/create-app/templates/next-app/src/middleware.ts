// src/middleware.ts

// Import the Next.js middleware helper from next-intl
import createMiddleware from 'next-intl/middleware';

// Import your routing configuration which contains all locales, defaultLocale, and pathnames
import { routing } from './i18n/routing';

// Export the middleware created by next-intl
// This middleware will handle locale detection, redirects, and internationalized routing automatically
export default createMiddleware(routing);

// Next.js middleware configuration object
export const config = {
  matcher: [
    '/', // Match the root path explicitly

    // Match all paths except for:
    // - API routes
    // - Next.js internals (_next/*)
    // - Static files (*.svg, *.png, *.jpg, *.jpeg, *.gif, *.ico)
    // - Other static assets and special files
    '/((?!api|_next|.*\\.(?:svg|png|jpg|jpeg|gif|ico)|favicon.ico|sitemap.xml|sitemap-0.xml).*)'
  ]
};
