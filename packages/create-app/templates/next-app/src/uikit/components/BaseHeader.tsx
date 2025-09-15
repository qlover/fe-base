'use client';

import Link from 'next/link';
import { IOCIdentifier } from '@config/IOCIdentifier';
import { useIOC } from '@/uikit/hook/useIOC';
import { LanguageSwitcher } from './LanguageSwitcher';
import { LogoutButton } from './LogoutButton';
import { ThemeSwitcher } from './ThemeSwitcher';

export function BaseHeader(props: { showLogoutButton?: boolean }) {
  const { showLogoutButton } = props;
  const appConfig = useIOC(IOCIdentifier.AppConfig);
  const i18nService = useIOC(IOCIdentifier.I18nServiceInterface);

  return (
    <header
      data-testid="BaseHeader"
      className="h-14 bg-secondary border-b border-c-border sticky top-0 z-50"
    >
      <div className="flex items-center justify-between h-full px-4 mx-auto max-w-7xl">
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <span
              data-testid="base-header-app-name"
              className="ml-2 text-lg font-semibold text-text"
            >
              {appConfig.appName}
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <LanguageSwitcher i18nService={i18nService} />
          <ThemeSwitcher />
          {showLogoutButton && <LogoutButton />}
        </div>
      </div>
    </header>
  );
}
