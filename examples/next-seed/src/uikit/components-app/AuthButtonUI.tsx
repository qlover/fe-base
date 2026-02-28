'use client';

import { Link } from '@/i18n/routing';
import { ROUTE_LOGIN, ROUTE_REGISTER } from '@config/route';
import { LogoutButton } from './LogoutButton';

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
export function AuthButtonUI(props: { hasAuth: boolean }) {
  const { hasAuth } = props;

  if (hasAuth) {
    return <LogoutButton data-testid="logout-button" />;
  }

  return (
    <div data-testid="AuthButton" className="flex gap-2" data-auth={hasAuth}>
      <Link href={ROUTE_LOGIN}>Sign in</Link>
      <Link href={ROUTE_REGISTER}>Sign up</Link>
    </div>
  );
}
