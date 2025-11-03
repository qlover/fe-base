import { TeamOutlined } from '@ant-design/icons';
import { useLocale } from 'next-intl';
import { useMemo, type HTMLAttributes } from 'react';
import { COMMON_ADMIN_TITLE } from '@config/Identifier';
import { BaseHeader } from './BaseHeader';
import { LanguageSwitcher } from './LanguageSwitcher';
import { LocaleLink } from './LocaleLink';
import { LogoutButton } from './LogoutButton';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useWarnTranslations } from '../hook/useWarnTranslations';

export interface BaseLayoutProps extends HTMLAttributes<HTMLDivElement> {
  showLogoutButton?: boolean;
  showAdminButton?: boolean;
  mainProps?: HTMLAttributes<HTMLElement>;
}

export function BaseLayout({
  children,
  showLogoutButton,
  showAdminButton,
  mainProps,
  ...props
}: BaseLayoutProps) {
  const locale = useLocale();
  const t = useWarnTranslations();

  const tt = {
    admin: t(COMMON_ADMIN_TITLE)
  };

  const actions = useMemo(
    () =>
      [
        showAdminButton && (
          <LocaleLink
            key="admin-button"
            href="/admin"
            title={tt.admin}
            locale={locale}
            className="text-text hover:text-text-hover cursor-pointer text-lg transition-colors"
          >
            <TeamOutlined className="text-lg text-text" />
          </LocaleLink>
        ),
        <LanguageSwitcher key="language-switcher" />,
        <ThemeSwitcher key="theme-switcher" />,
        showLogoutButton && <LogoutButton key="logout-button" />
      ].filter(Boolean),
    [showAdminButton, tt.admin, locale, showLogoutButton]
  );

  return (
    <div
      data-testid="BaseLayout"
      className="flex flex-col min-h-screen"
      {...props}
    >
      <BaseHeader rightActions={actions} />
      <main className="flex flex-1 flex-col bg-primary" {...mainProps}>
        {children}
      </main>
    </div>
  );
}
