'use client';

import { ReflectionIOCContainer } from '@qlover/corekit-bridge/ioc';
import { ClientIOCRegister } from '@/impls/ClientIOCRegister';
import { logger } from '@/impls/globals';
import { IOCProvider as KitIOCProvider } from '../ioc';
import type { ReactNode } from 'react';

export function IOCProvider(props: { children: ReactNode }) {
  return (
    <KitIOCProvider
      register={ClientIOCRegister}
      logger={logger}
      createContainer={(iocLogger) => new ReflectionIOCContainer(iocLogger)}
    >
      {props.children}
    </KitIOCProvider>
  );
}
