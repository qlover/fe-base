'use client';

import { useUserAuth } from '../hook/useUserAuth';

/**
 * Client component: uses user store from bootstrap (one session fetch in restoreUserService).
 * Used on the static home page so the page itself does not call cookies()/ServerAuth.
 */
export function HomeAuthUserEmail() {
  const { user, loading } = useUserAuth();

  if (loading || !user?.email) return null;
  return (
    <p data-testid="AuthUserEmail" className="text-lg text-primary-text">
      {user.email}
    </p>
  );
}
