'use client';

import { useMemo } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { headerNavI18n } from '@config/i18n-mapping/headerNavI18n';
import {
  AppHeaderNavPanel,
  type AppHeaderNavLinkProps
} from './AppHeaderNavPanel';
import { useI18nMapping } from '../hook/useI18nMapping';

function AppNavLink({
  href,
  className,
  children,
  title
}: AppHeaderNavLinkProps) {
  return (
    <Link href={href} className={className} title={title}>
      {children}
    </Link>
  );
}

/** App Router header navigation (docs, about, developer console). */
export function AppHeaderNav() {
  const pathname = usePathname();
  const tt = useI18nMapping(headerNavI18n);
  const NavLink = useMemo(() => AppNavLink, []);

  return <AppHeaderNavPanel pathname={pathname} tt={tt} NavLink={NavLink} />;
}

/** @deprecated Use AppHeaderNav instead. */
export const HomeHeaderNav = AppHeaderNav;
