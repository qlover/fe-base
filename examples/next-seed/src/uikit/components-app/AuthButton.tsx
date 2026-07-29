'use client';

import { AuthButtonUI } from './AuthButtonUI';
import { useUserAuth } from '../hook/useUserAuth';

/**
 * Header auth control: local UI only (login / logout).
 *
 * Page entry is gated by middleware; this reads the client user store from
 * bootstrap (`restoreUserService`) and shows a compact skeleton while loading
 * so the rest of the page is never blocked.
 */
export function AuthButton(props: {
  loginOnly?: boolean;
  showLogoutLabel?: boolean;
}) {
  const { loginOnly = false, showLogoutLabel = false } = props;
  const { success, loading } = useUserAuth();

  if (loading) {
    return (
      <div
        data-testid="AuthButton"
        className="h-8 w-10 sm:h-9 sm:w-16 animate-pulse rounded-lg bg-elevated border border-primary-border/60"
        aria-hidden
      />
    );
  }

  return (
    <AuthButtonUI
      hasAuth={success}
      loginOnly={loginOnly}
      showLogoutLabel={showLogoutLabel}
    />
  );
}
