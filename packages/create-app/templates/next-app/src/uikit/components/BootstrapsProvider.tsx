'use client';
import '@ant-design/v5-patch-for-react-19';
import { useEffect } from 'react';
import { BootstrapClient } from '@/core/bootstraps/BootstrapClient';
import { IOCContext } from '../context/IOCContext';

export function BootstrapsProvider(props: { children: React.ReactNode }) {
  const IOC = BootstrapClient.createSingletonIOC();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      BootstrapClient.main({
        root: window,
        pathname: window.location.pathname,
        IOC: IOC
      });
    }
  }, [IOC]);

  return (
    <IOCContext.Provider value={IOC}>{props.children}</IOCContext.Provider>
  );
}
