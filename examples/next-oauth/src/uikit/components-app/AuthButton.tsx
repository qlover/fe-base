'use client';

import { useMountedClient } from '@qlover/next-kit/client';
import { AuthButtonUI } from './AuthButtonUI';
import { useUserAuth } from '../hook/useUserAuth';

const skeleton = (
  <div
    data-testid="AuthButton"
    className="h-8 w-10 sm:h-9 sm:w-16 animate-pulse rounded-lg bg-elevated border border-primary-border/60"
    aria-hidden
  />
);

/**
 * Header auth control: local UI only (login / logout).
 *
 * Renders a skeleton on the server pass and the first client render (before
 * hydration) so SSG HTML matches the first client paint. After mount, show
 * auth state; keep the skeleton while restoreUser is still loading.
 */
export function AuthButton(props: {
  loginOnly?: boolean;
  showLogoutLabel?: boolean;
}) {
  const { loginOnly = false, showLogoutLabel = false } = props;
  const { success, loading, user } = useUserAuth();
  const mounted = useMountedClient();

  if (!mounted || loading) {
    return skeleton;
  }

  return (
    <AuthButtonUI
      hasAuth={success}
      userEmail={user?.email}
      loginOnly={loginOnly}
      showLogoutLabel={showLogoutLabel}
    />
  );
}
