'use client';

import { clsx } from 'clsx';
import { Link } from '@/i18n/routing';
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
const linkBase =
  'inline-flex items-center justify-center rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0';
const linkPrimary =
  'bg-brand text-(--login-button-text) hover:bg-brand-hover focus:ring-brand';
const linkSecondary =
  'border border-primary-border text-primary-text hover:bg-elevated focus:ring-brand';

export function AuthButtonUI(props: { hasAuth: boolean }) {
  const { hasAuth } = props;
  const t = useWarnTranslations();

  if (hasAuth) {
    return <LogoutButton data-testid="logout-button" />;
  }

  return (
    <div
      data-testid="AuthButton"
      className="flex items-center gap-1.5"
      data-auth={hasAuth}
    >
      <Link href={ROUTE_LOGIN} className={clsx(linkBase, linkPrimary)}>
        {t(COMMON_USER_AUTH_FAILED_GO_TO_LOGIN)}
      </Link>
      <Link href={ROUTE_REGISTER} className={clsx(linkBase, linkSecondary)}>
        {t(COMMON_AUTH_NAV_SIGN_UP)}
      </Link>
    </div>
  );
}
