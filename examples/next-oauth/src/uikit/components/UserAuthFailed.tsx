'use client';

import {
  UserAuthFailed as KitUserAuthFailed,
  type UserAuthFailedProps as KitProps
} from '@qlover/next-kit/client';
import { useLocaleRoutes } from '@config/common';
import { i18nConfig } from '@config/i18n';
import {
  COMMON_USER_AUTH_FAILED_DESCRIPTION,
  COMMON_USER_AUTH_FAILED_GO_TO_LOGIN,
  COMMON_USER_AUTH_FAILED_TITLE
} from '@config/i18n-identifier/common/common';
import { ROUTE_LOGIN } from '@config/route';
import { useWarnTranslations } from '../hook/useWarnTranslations';

export type UserAuthFailedProps = {
  error?: unknown;
  className?: string;
};

/**
 * Fallback UI when client-side user state is unavailable or invalid.
 */
export function UserAuthFailed({ error, className }: UserAuthFailedProps) {
  const t = useWarnTranslations();

  const props: KitProps = {
    error,
    className,
    title: t(COMMON_USER_AUTH_FAILED_TITLE),
    description: t(COMMON_USER_AUTH_FAILED_DESCRIPTION),
    goToLoginLabel: t(COMMON_USER_AUTH_FAILED_GO_TO_LOGIN),
    loginHref: ROUTE_LOGIN,
    fallbackLocale: i18nConfig.fallbackLng,
    useLocaleRoutes,
    defaultLocale: i18nConfig.fallbackLng
  };

  return <KitUserAuthFailed {...props} />;
}
