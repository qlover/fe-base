import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';
import { useLocaleRoutes } from '@config/common';
import { i18nConfig } from '@config/i18n';
import { ROUTE_LOGIN, ROUTE_REGISTER } from '@config/route';

const locales = i18nConfig.supportedLngs;

export type Locale = (typeof locales)[number];

export const routing = defineRouting({
  locales,

  defaultLocale: i18nConfig.fallbackLng,

  localePrefix: useLocaleRoutes ? undefined : 'as-needed',

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
    }
  }
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
