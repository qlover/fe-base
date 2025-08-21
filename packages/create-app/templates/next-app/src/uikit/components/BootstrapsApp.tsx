'use client';

import { BootstrapClient } from '@/core/bootstraps/BootstrapClient';
import { IOC } from '@/core/IOC';
import { useEffect } from 'react';

export function BootstrapsApp(props: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      BootstrapClient.main({
        root: window,
        IOC: IOC
      });
    }
  }, []);

  return <>{props.children}</>;
}
