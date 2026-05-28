'use client';

import { useRouter } from 'next/router';
import { useLocale } from 'next-intl';
import { useMemo } from 'react';
import { headerNavI18n } from '@config/i18n-mapping/headerNavI18n';
import {
  AppHeaderNavPanel,
  type AppHeaderNavLinkProps
} from './AppHeaderNavPanel';
import { LocaleLink } from '../components/LocaleLink';
import { useI18nMapping } from '../hook/useI18nMapping';

function PagesNavLink({
  href,
  className,
  children,
  title
}: AppHeaderNavLinkProps) {
  const locale = useLocale();

  return (
    <LocaleLink href={href} locale={locale} className={className} title={title}>
      {children}
    </LocaleLink>
  );
}

/** Pages Router header navigation (docs, about, developer console). */
export function AppHeaderNavPages() {
  const router = useRouter();
  const tt = useI18nMapping(headerNavI18n);
  const NavLink = useMemo(() => PagesNavLink, []);
  const pathname = router.isReady ? router.asPath.split('?')[0] : '';

  return <AppHeaderNavPanel pathname={pathname} tt={tt} NavLink={NavLink} />;
}
