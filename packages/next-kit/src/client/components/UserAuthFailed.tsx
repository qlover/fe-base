'use client';

import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { LocaleLink, type LocaleLinkProps } from './LocaleLink';

export type UserAuthFailedProps = {
  /** Optional error detail when session/API auth fails. */
  error?: unknown;
  title: ReactNode;
  description: ReactNode;
  goToLoginLabel: string;
  loginHref: LocaleLinkProps['href'];
  /** Passed through to {@link LocaleLink}. */
  fallbackLocale: string;
  useLocaleRoutes?: boolean;
  defaultLocale?: string;
  locale?: string;
  className?: string;
};

/**
 * Fallback UI when client-side user state is unavailable or invalid.
 * Copy / routes / locale link options are injected by the app.
 */
export function UserAuthFailed({
  error,
  title,
  description,
  goToLoginLabel,
  loginHref,
  fallbackLocale,
  useLocaleRoutes,
  defaultLocale,
  locale,
  className
}: UserAuthFailedProps) {
  return (
    <div
      data-testid="UserAuthFailedRoot"
      className={clsx(
        'flex flex-col justify-center items-center min-h-[60vh] px-4',
        'text-center',
        className
      )}
      style={{ backgroundColor: 'var(--fe-color-bg-container, transparent)' }}
    >
      <div
        data-testid="UserAuthFailedCard"
        className={clsx(
          'rounded-lg border p-6 max-w-md w-full',
          'border-primary-border',
          'bg-(--fe-color-elevated,#fff)'
        )}
      >
        <h2
          className="text-lg font-semibold mb-2"
          style={{ color: 'var(--fe-color-text,inherit)' }}
        >
          {title}
        </h2>
        <p className="text-sm mb-4 opacity-90 text-secondary-text">
          {description}
        </p>
        {error != null && (
          <p
            data-testid="UserAuthFailedError"
            className="text-md text-red-600 mb-4 font-mono truncate max-w-full"
            title={String(error)}
          >
            {String(error)}
          </p>
        )}
        <LocaleLink
          href={loginHref}
          title={goToLoginLabel}
          fallbackLocale={fallbackLocale}
          useLocaleRoutes={useLocaleRoutes}
          defaultLocale={defaultLocale}
          locale={locale}
          className={clsx(
            'inline-flex items-center justify-center px-4 py-2 rounded-md font-medium',
            'bg-(--fe-color-primary,#1976d2) text-white',
            'hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2',
            'focus:ring-(--fe-color-primary,#1976d2)'
          )}
        >
          {goToLoginLabel}
        </LocaleLink>
      </div>
    </div>
  );
}
