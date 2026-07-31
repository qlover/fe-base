'use client';

import type { ReactNode } from 'react';
import { useMountedClient } from '../hooks/useMountedClient';

export interface ClientRenderProviderProps {
  children: ReactNode;
  /** Accessible label for the pre-mount overlay. */
  loadingLabel?: string;
}

/**
 * Keeps children in the tree and covers the viewport until the client has
 * mounted, reducing flash when switching locale / hydrating client-only shells.
 */
export function ClientRenderProvider({
  children,
  loadingLabel = 'Loading...'
}: ClientRenderProviderProps) {
  const mounted = useMountedClient();

  return (
    <>
      {children}

      {!mounted && (
        <div
          role="status"
          aria-label={loadingLabel}
          aria-busy="true"
          style={{
            zIndex: '99999 !important'
          }}
          className="fixed inset-0 overflow-hidden cursor-wait no-scrollbar bg-primary pointer-events-none"
        />
      )}
    </>
  );
}
