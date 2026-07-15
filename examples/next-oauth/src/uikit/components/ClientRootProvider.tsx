'use client';

import { BootstrapsProvider } from '@/uikit/components/BootstrapsProvider';
import { DialogUIHost } from '@/uikit/components/DialogUIHost';

/**
 * Client root shell: bootstraps + toast/confirm host.
 * Ant Design theme/registry are scoped to demo-ui via {@link AntdDemoProvider}.
 */
export function ClientRootProvider(props: { children: React.ReactNode }) {
  const { children } = props;

  return (
    <BootstrapsProvider>
      <DialogUIHost />
      {children}
    </BootstrapsProvider>
  );
}
