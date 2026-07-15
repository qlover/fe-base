'use client';

import { Link } from '@/i18n/routing';
import { buttonClassName } from '@/uikit/components/Button';
import {
  COMMON_AUTH_NAV_SIGN_UP,
  COMMON_USER_AUTH_FAILED_GO_TO_LOGIN
} from '@config/i18n-identifier/common/common';
import { ROUTE_LOGIN, ROUTE_REGISTER } from '@config/route';
import { LogoutButton } from './LogoutButton';
import { useWarnTranslations } from '../hook/useWarnTranslations';

/**
 * Client-only auth UI: shows either LogoutButton or Sign in/Sign up links.
 *
 * Why this component exists:
 *
 * - AuthButton is a Server Component that computes `hasAuth` (via ServerAuth/cookies).
 *   If it directly returned <LogoutButton /> when hasAuth is true, LogoutButton (a Client
 *   Component that uses useIOC()) could be rendered in a different React subtree than the
 *   layout's IOCProvider (e.g. when RSC streams the page segment separately). That leads
 *   to "IOC is not found" because useContext(IOCContext) is null.
 *
 * - By having the Server Component only pass `hasAuth` and letting this Client Component
 *   render LogoutButton, we ensure LogoutButton is always rendered inside the same client
 *   tree as the root layout (IOCProvider → … → AppRoutePage → AuthButtonUI → LogoutButton).
 *   So useIOC() always has access to the IOC context.
 */
const linkSecondary = buttonClassName({
  variant: 'header',
  className:
    'focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-0'
});
const linkPrimary = buttonClassName({
  variant: 'header',
  className:
    'bg-brand text-on-brand border-transparent hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-0'
});

export function AuthButtonUI(props: {
  hasAuth: boolean;
  loginOnly?: boolean;
  showLogoutLabel?: boolean;
}) {
  const { hasAuth, loginOnly = false, showLogoutLabel = false } = props;
  const t = useWarnTranslations();

  if (hasAuth) {
    return (
      <div
        data-testid="AuthButton"
        className="flex items-center gap-2"
        data-auth={hasAuth}
      >
        <LogoutButton data-testid="logout-button" showLabel={showLogoutLabel} />
      </div>
    );
  }

  return (
    <div
      data-testid="AuthButton"
      className="flex items-center gap-1.5"
      data-auth={hasAuth}
    >
      <Link
        href={ROUTE_LOGIN}
        className={`${linkPrimary} max-w-22 sm:max-w-none`}
        title={t(COMMON_USER_AUTH_FAILED_GO_TO_LOGIN)}
      >
        <span className="truncate sm:whitespace-normal">
          {t(COMMON_USER_AUTH_FAILED_GO_TO_LOGIN)}
        </span>
      </Link>
      {!loginOnly && (
        <Link href={ROUTE_REGISTER} className={linkSecondary}>
          {t(COMMON_AUTH_NAV_SIGN_UP)}
        </Link>
      )}
    </div>
  );
}
