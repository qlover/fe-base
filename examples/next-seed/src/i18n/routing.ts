import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';
import { useLocaleRoutes } from '@config/common';
import { i18nConfig } from '@config/i18n';
import {
  ROUTE_ADMIN,
  ROUTE_CALLBACK_EMAIL_LOGIN,
  ROUTE_LOGIN,
  ROUTE_REGISTER
} from '@config/route';

const locales = i18nConfig.supportedLngs;

export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,

  defaultLocale: i18nConfig.fallbackLng,

  localePrefix: useLocaleRoutes ? 'always' : 'as-needed',

  localeDetection: i18nConfig.localeDetection,

  // Persist preference; without maxAge next-intl uses a session cookie.
  localeCookie: {
    name: i18nConfig.storageKey,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365
  },

  pathnames: {
    '/': {
      en: '/',
      zh: '/'
    },
    [ROUTE_LOGIN]: {
      en: '/auth/login',
      zh: '/auth/login'
    },
    [ROUTE_REGISTER]: {
      en: '/auth/register',
      zh: '/auth/register'
    },
    [ROUTE_CALLBACK_EMAIL_LOGIN]: {
      en: '/callback/email-login',
      zh: '/callback/email-login'
    },
    [ROUTE_ADMIN]: {
      en: '/admin',
      zh: '/admin'
    }
  }
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
