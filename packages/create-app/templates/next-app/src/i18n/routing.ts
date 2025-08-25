// src/i18n/routing.ts

// Import helpers to define i18n routing and navigation from next-intl
import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';
import { i18nConfig } from '@config/i18n';

// List of all supported locales for the application
const locales = i18nConfig.supportedLngs;

// Type for allowed locale strings (used for type safety)
export type Locale = (typeof locales)[number];

// Define the i18n routing configuration
export const routing = defineRouting({
  // All supported locales for this project
  locales,

  // Fallback locale if no match is found
  defaultLocale: 'en',

  // Define localized pathnames for important routes
  pathnames: {
    '/': {
      en: '/',
      zh: '/'
    },
    '/about': {
      en: '/about',
      zh: '/about'
    }
  }
});

// Export i18n-aware navigation helpers for usage throughout the app
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
