'use client';

import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/uikit/components/Button';
import { ROUTE_ADMIN } from '@config/route';
import type { ReactNode } from 'react';

export interface AppHeaderNavTT {
  navAdmin: string;
}

type HeaderNavHref = typeof ROUTE_ADMIN;

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
          href={ROUTE_ADMIN}
          className={desktopNavLinkClassName}
          title={tt.navAdmin}
        >
          {tt.navAdmin}
        </NavLink>
      </nav>

      <Button
        variant="header"
        data-testid="AppHeaderNavMenuToggle"
        className="md:hidden ml-2 shrink-0 px-2.5"
        aria-expanded={menuOpen}
        aria-controls="AppHeaderNavMobilePanel"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? (
          <XMarkIcon className="h-4 w-4" />
        ) : (
          <Bars3Icon className="h-4 w-4" />
        )}
      </Button>

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
            href={ROUTE_ADMIN}
            className={navLinkClassName}
            title={tt.navAdmin}
          >
            {tt.navAdmin}
          </NavLink>
        </nav>
      </div>
    </>
  );
}
