'use client';

import { AuthButtonUI } from './AuthButtonUI';
import { useUserAuth } from '../hook/useUserAuth';

/**
 * Client component: uses user store from bootstrap (one session fetch in restoreUserService).
 * Avoids ServerAuth/cookies on the server so pages using this can be statically generated.
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
