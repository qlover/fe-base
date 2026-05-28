'use client';

import { CloseOutlined, MenuOutlined } from '@ant-design/icons';
import { clsx } from 'clsx';
import { useCallback, useEffect, useState } from 'react';
import { ROUTE_DEVELOPER_APPS, ROUTE_DOCS_OAUTH } from '@config/route';
import { headerActionButtonClassName } from './headerStyles';
import type { ReactNode } from 'react';

export interface AppHeaderNavTT {
  navDocs: string;
  navAbout: string;
  navDeveloper: string;
}

type HeaderNavHref =
  | typeof ROUTE_DOCS_OAUTH
  | '/about'
  | typeof ROUTE_DEVELOPER_APPS;

const navLinkClassName =
  'block py-2 text-sm font-medium text-secondary-text hover:text-primary-text transition';

const desktopNavLinkClassName =
  'text-secondary-text hover:text-primary-text transition text-sm font-medium';

export interface AppHeaderNavLinkProps {
  href: HeaderNavHref;
  className: string;
  children: ReactNode;
  title: string;
}

interface AppHeaderNavPanelProps {
  pathname: string;
  tt: AppHeaderNavTT;
  NavLink: (props: AppHeaderNavLinkProps) => ReactNode;
}

export function AppHeaderNavPanel({
  pathname,
  tt,
  NavLink
}: AppHeaderNavPanelProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <nav
        data-testid="AppHeaderNav"
        className="hidden md:flex items-center gap-6 ml-6 lg:ml-8"
        aria-label="Main"
      >
        <NavLink
          href={ROUTE_DOCS_OAUTH}
          className={desktopNavLinkClassName}
          title={tt.navDocs}
        >
          {tt.navDocs}
        </NavLink>
        <NavLink
          href="/about"
          className={desktopNavLinkClassName}
          title={tt.navAbout}
        >
          {tt.navAbout}
        </NavLink>
        <NavLink
          href={ROUTE_DEVELOPER_APPS}
          className={desktopNavLinkClassName}
          title={tt.navDeveloper}
        >
          {tt.navDeveloper}
        </NavLink>
      </nav>

      <button
        type="button"
        data-testid="AppHeaderNavMenuToggle"
        className={clsx(
          headerActionButtonClassName,
          'md:hidden ml-2 shrink-0 px-2.5'
        )}
        aria-expanded={menuOpen}
        aria-controls="AppHeaderNavMobilePanel"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? (
          <CloseOutlined className="text-base" />
        ) : (
          <MenuOutlined className="text-base" />
        )}
      </button>

      <div
        id="AppHeaderNavMobilePanel"
        data-testid="AppHeaderNavMobilePanel"
        className={clsx(
          'md:hidden fixed left-0 right-0 top-16 z-40 border-b border-primary-border bg-primary/95 backdrop-blur-md shadow-sm',
          menuOpen
            ? 'visible opacity-100'
            : 'invisible opacity-0 pointer-events-none'
        )}
      >
        <nav
          className="max-w-7xl mx-auto px-4 py-3 flex flex-col"
          aria-label="Main mobile"
          onClick={closeMenu}
        >
          <NavLink
            href={ROUTE_DOCS_OAUTH}
            className={navLinkClassName}
            title={tt.navDocs}
          >
            {tt.navDocs}
          </NavLink>
          <NavLink
            href="/about"
            className={navLinkClassName}
            title={tt.navAbout}
          >
            {tt.navAbout}
          </NavLink>
          <NavLink
            href={ROUTE_DEVELOPER_APPS}
            className={navLinkClassName}
            title={tt.navDeveloper}
          >
            {tt.navDeveloper}
          </NavLink>
        </nav>
      </div>
    </>
  );
}
