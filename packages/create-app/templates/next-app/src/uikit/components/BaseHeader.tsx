'use client';

import { TeamOutlined } from '@ant-design/icons';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { PAGE_HEAD_ADMIN_TITLE } from '@config/Identifier';
import { IOCIdentifier } from '@config/IOCIdentifier';
import { useIOC } from '@/uikit/hook/useIOC';
import { LanguageSwitcher } from './LanguageSwitcher';
import { LocaleLink } from './LocaleLink';
import { LogoutButton } from './LogoutButton';
import { ThemeSwitcher } from './ThemeSwitcher';

export type RenderLeftFunction = (props: {
  locale: string;
  defaultElement: React.ReactNode;
}) => React.ReactNode;

export function BaseHeader(props: {
  href?: string;
  showLogoutButton?: boolean;
  showAdminButton?: boolean;
  renderLeft?: React.ReactNode | RenderLeftFunction;
}) {
  const { href = '/', showLogoutButton, showAdminButton, renderLeft } = props;
  const appConfig = useIOC(IOCIdentifier.AppConfig);
  const i18nService = useIOC(IOCIdentifier.I18nServiceInterface);
  const locale = useLocale();
  const t = useTranslations();

  const tt = {
    title: appConfig.appName,
    admin: t(PAGE_HEAD_ADMIN_TITLE)
  };

  const leftDefault = useMemo(
    () => (
      <LocaleLink
        data-testid="BaseHeaderLogo"
        title={tt.title}
        href={href}
        locale={locale}
        className="flex items-center hover:opacity-80 transition-opacity"
      >
        <span
          data-testid="base-header-app-name"
          className="ml-2 text-lg font-semibold text-text"
        >
          {tt.title}
        </span>
      </LocaleLink>
    ),
    [href, locale, tt.title]
  );

  const RenderLeft = useMemo(() => {
    if (typeof renderLeft === 'function') {
      return renderLeft({ locale, defaultElement: leftDefault });
    }
    return renderLeft;
  }, [renderLeft, locale, leftDefault]);

  return (
    <header
      data-testid="BaseHeader"
      className="h-14 bg-secondary border-b border-c-border sticky top-0 z-50"
    >
      <div className="flex items-center justify-between h-full px-4 mx-auto max-w-7xl">
        <div className="flex items-center">{RenderLeft}</div>
        <div className="flex items-center gap-2 md:gap-4">
          {showAdminButton && (
            <LocaleLink
              href="/admin"
              title={tt.admin}
              locale={locale}
              className="text-text hover:text-text-hover cursor-pointer text-lg transition-colors"
            >
              <TeamOutlined className="text-lg text-text" />
            </LocaleLink>
          )}

          <LanguageSwitcher i18nService={i18nService} />
          <ThemeSwitcher />
          {showLogoutButton && <LogoutButton />}
        </div>
      </div>
    </header>
  );
}
