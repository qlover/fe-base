'use client';

import {
  LocaleLink as KitLocaleLink,
  type LocaleLinkProps
} from '@qlover/next-kit/client';
import { useLocaleRoutes } from '@config/common';
import { i18nConfig } from '@config/i18n';

type AppLocaleLinkProps = Omit<
  LocaleLinkProps,
  'fallbackLocale' | 'useLocaleRoutes'
> & {
  fallbackLocale?: string;
  useLocaleRoutes?: boolean;
};

/**
 * App LocaleLink — injects i18n / routing defaults from config.
 */
export function LocaleLink(props: AppLocaleLinkProps) {
  const {
    fallbackLocale = i18nConfig.fallbackLng,
    useLocaleRoutes: useLocaleRoutesProp = useLocaleRoutes,
    ...rest
  } = props;

  return (
    <KitLocaleLink
      {...rest}
      fallbackLocale={fallbackLocale}
      useLocaleRoutes={useLocaleRoutesProp}
    />
  );
}
