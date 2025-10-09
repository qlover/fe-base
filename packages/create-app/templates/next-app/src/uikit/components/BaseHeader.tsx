'use client';

import { clsx } from 'clsx';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { useIOC } from '@/uikit/hook/useIOC';
import { PAGE_HEAD_ADMIN_TITLE } from '@config/Identifier';
import { IOCIdentifier } from '@config/IOCIdentifier';
import { LocaleLink } from './LocaleLink';

export type RenderLeftFunction = (props: {
  locale: string;
  defaultElement: React.ReactNode;
}) => React.ReactNode;

export function BaseHeader(props: {
  href?: string;
  renderLeft?: React.ReactNode | RenderLeftFunction;
  rightActions?: React.ReactNode;
  className?: string;
}) {
  const { href = '/', className, renderLeft, rightActions } = props;
  const appConfig = useIOC(IOCIdentifier.AppConfig);
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
          className="text-lg font-semibold text-text"
        >
          {tt.title}
        </span>
      </LocaleLink>
    ),
    [href, locale, tt.title]
  );

  const RenderLeft = useMemo(() => {
    if (!renderLeft) {
      return leftDefault;
    }

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
      <div
        className={clsx(
          'flex items-center justify-between h-full px-4 mx-auto max-w-7xl',
          className
        )}
      >
        <div className="flex items-center">{RenderLeft}</div>
        <div className="flex items-center gap-2 md:gap-4">{rightActions}</div>
      </div>
    </header>
  );
}
