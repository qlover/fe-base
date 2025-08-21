'use client';
import '@ant-design/v5-patch-for-react-19';
import type { EnvConfigInterface } from '@qlover/corekit-bridge';
import { createIOC } from '@/core/IOC';
import { IOCContext } from '../context/IOCContext';
import { useEffect } from 'react';
import { BootstrapClient } from '@/core/bootstraps/BootstrapClient';
import { IocRegisterImpl } from '@/core/IocRegisterImpl';
import { appConfig } from '@/core/globals';

export function BootstrapsProvider(props: { children: React.ReactNode }) {
  const IOC = createIOC();

  useEffect(() => {
    BootstrapClient.registerIoc(
      IOC,
      new IocRegisterImpl({
        appConfig: appConfig as EnvConfigInterface
      })
    );

    if (typeof window !== 'undefined') {
      BootstrapClient.main({
        root: window,
        IOC: IOC
      });
    }
  }, []);

  return (
    <IOCContext.Provider value={IOC}>{props.children}</IOCContext.Provider>
  );
}
