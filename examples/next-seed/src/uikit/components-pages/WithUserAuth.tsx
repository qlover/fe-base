import { Loading } from '../components/Loading';
import { useUserAuth } from '../hook/useUserAuth';
import type { ReactNode } from 'react';

export function WithUserAuth({
  fallback,
  failedElement,
  children
}: {
  children: ReactNode;
  failedElement?: ReactNode | ((props: { error?: unknown }) => ReactNode);
  fallback?: ReactNode;
}) {
  const { loading, success, error } = useUserAuth();

  if (loading) {
    return fallback ?? <Loading fullscreen />;
  }

  if (error !== null || !success) {
    return typeof failedElement === 'function'
      ? failedElement({ error })
      : failedElement;
  }

  return children;
}
