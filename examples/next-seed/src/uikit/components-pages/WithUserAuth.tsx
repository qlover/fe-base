import { AsyncStoreStatus } from '@qlover/corekit-bridge';
import { isFunction } from 'lodash';
import { Loading } from '../components/Loading';
import { useUserAuth } from '../hook/useUserAuth';
import type { ReactNode } from 'react';

export function WithUserAuth({
  fallback,
  failedElement,
  children
}: {
  children: ReactNode;
  failedElement: ReactNode | ((props: { error?: unknown }) => ReactNode);
  fallback?: ReactNode;
}) {
  const { loading, success, error, status } = useUserAuth();

  if (
    loading ||
    status === AsyncStoreStatus.DRAFT ||
    status === AsyncStoreStatus.PENDING
  ) {
    return fallback ?? <Loading fullscreen />;
  }

  if (error !== null || !success) {
    return isFunction(failedElement) ? failedElement({ error }) : failedElement;
  }

  return children;
}
