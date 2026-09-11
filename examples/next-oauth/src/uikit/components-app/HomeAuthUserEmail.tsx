'use client';

import { resolveUserDisplayLabel } from '@shared/utils/userIdentity';
import { useUserAuth } from '../hook/useUserAuth';

/**
 * Client component: uses user store from bootstrap (one session fetch in restoreUserService).
 * Used on the static home page so the page itself does not call cookies()/ServerAuth.
 */
export function HomeAuthUserEmail() {
  const { user, loading } = useUserAuth();
  const label = user
    ? resolveUserDisplayLabel({
        name: user.name,
        phone: user.phone,
        email: user.email,
        userId: user.id
      })
    : '';

  if (loading || !label) return null;
  return (
    <p data-testid="AuthUserEmail" className="text-lg text-primary-text">
      {label}
    </p>
  );
}
