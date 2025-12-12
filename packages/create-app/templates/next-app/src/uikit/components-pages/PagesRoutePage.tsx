import { TeamOutlined } from '@ant-design/icons';
import { clsx } from 'clsx';
import { useLocale } from 'next-intl';
import { useMemo } from 'react';
import { LanguageSwitcher } from './LanguageSwitcher';
import { LocaleLink } from '../components/LocaleLink';
import { ThemeSwitcher } from '../components-app/ThemeSwitcher';
import type { AppRoutePageProps } from '../components-app/AppRoutePage';

/**
 * App Route Page
 *
 * 主要用于 /src/app 目录下页面的基础布局，包含头部、主体内容等
 *
 * @description
 * - /src/app/[locale]/page.tsx
 * - /src/app/[locale]/login/page.tsx
 *
 */
export function PagesRoutePage({
  children,
  showAdminButton,
  mainProps,
  headerClassName,
  tt,
  headerHref = '/',
  ...props
}: AppRoutePageProps) {
  const locale = useLocale();
  const adminTitle = tt.adminTitle;

  const actions = useMemo(() => {
    return [
      showAdminButton && (
        <LocaleLink
          key="admin-button"
          href="/admin"
          title={adminTitle}
          locale={locale}
          className="text-text hover:text-text-hover cursor-pointer text-lg transition-colors"
        >
          <TeamOutlined className="text-lg text-text" />
        </LocaleLink>
      ),

      <LanguageSwitcher key="language-switcher" />,

      <ThemeSwitcher key="theme-switcher" />
    ].filter(Boolean);
  }, [adminTitle, showAdminButton, locale]);

  return (
    <div
      data-testid="AppRoutePage"
      className="flex flex-col min-h-screen"
      {...props}
    >
      <header
        data-testid="BaseHeader"
        className="h-14 bg-secondary border-b border-c-border sticky top-0 z-50"
      >
        <div
          className={clsx(
            'flex items-center justify-between h-full px-4 mx-auto max-w-7xl',
            headerClassName
          )}
        >
          <div className="flex items-center">
            <LocaleLink
              data-testid="BaseHeaderLogo"
              title={tt.title}
              href={headerHref}
              locale={locale}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <span
                data-testid="base-header-app-name"
                className="text-lg font-semibold text-text"
              >
                {tt.title}
              </span>
            </LocaleLink>
          </div>
          <div className="flex items-center gap-2 md:gap-4">{actions}</div>
        </div>
      </header>

      <main className="flex flex-1 flex-col bg-primary" {...mainProps}>
        {children}
      </main>
    </div>
  );
}
