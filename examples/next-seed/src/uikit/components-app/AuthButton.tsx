'use client';

import { AuthButtonUI } from './AuthButtonUI';
import { useUserAuth } from '../hook/useUserAuth';

/**
 * Client component: uses user store from bootstrap (one session fetch in restoreUserService).
 * Avoids ServerAuth/cookies on the server so pages using this can be statically generated.
 */
export function AuthButton() {
  const { success, loading } = useUserAuth();

  if (loading) return null;
  return <AuthButtonUI hasAuth={success} />;
}
