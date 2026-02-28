'use client';

import { clsx } from 'clsx';
import {
  COMMON_USER_AUTH_FAILED_DESCRIPTION,
  COMMON_USER_AUTH_FAILED_GO_TO_LOGIN,
  COMMON_USER_AUTH_FAILED_TITLE
} from '@shared/config/i18n-identifier/common/common';
import { ROUTE_LOGIN } from '@config/route';
import { LocaleLink } from './LocaleLink';
import { useWarnTranslations } from '../hook/useWarnTranslations';

export interface UserAuthFailedProps {
  /** Error from auth check, optional when used as failedElement in WithUserAuth */
  error?: unknown;
}

/**
 * Shown when user auth check fails (e.g. not signed in or session invalid).
 * Renders a centered message and a link to the login page.
 */
export function UserAuthFailed({ error }: UserAuthFailedProps) {
  const t = useWarnTranslations();

  const title = t(COMMON_USER_AUTH_FAILED_TITLE);
  const description = t(COMMON_USER_AUTH_FAILED_DESCRIPTION);
  const goToLoginLabel = t(COMMON_USER_AUTH_FAILED_GO_TO_LOGIN);

  return (
    <div
      data-testid="UserAuthFailedRoot"
      className={clsx(
        'flex flex-col justify-center items-center min-h-[60vh] px-4',
        'text-center'
      )}
      style={{ backgroundColor: 'var(--fe-color-bg-container, transparent)' }}
    >
      <div
        data-testid="UserAuthFailedCard"
        className={clsx(
          'rounded-lg border p-6 max-w-md w-full',
          'border-(--fe-color-border,#e5e7eb)',
          'bg-(--fe-color-bg-elevated,#fff)'
        )}
      >
        <h2
          className="text-lg font-semibold mb-2"
          style={{ color: 'var(--fe-color-text,inherit)' }}
        >
          {title}
        </h2>
        <p
          className="text-sm mb-4 opacity-90"
          style={{ color: 'var(--fe-color-text-secondary,inherit)' }}
        >
          {description}
        </p>
        {error != null && (
          <p
            data-testid="UserAuthFailedError"
            className="text-xs mb-4 font-mono truncate max-w-full opacity-75"
            style={{ color: 'var(--fe-color-text-tertiary,inherit)' }}
            title={String(error)}
          >
            {String(error)}
          </p>
        )}
        <LocaleLink
          href={ROUTE_LOGIN}
          title={goToLoginLabel}
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
