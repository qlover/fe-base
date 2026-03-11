'use client';
import 'reflect-metadata';
import {
  createIOCFunction,
  ReflectionIOCContainer
} from '@qlover/corekit-bridge/ioc';
import { useState } from 'react';
import { ClientIOCRegister } from '@/impls/ClientIOCRegister';
import { logger } from '@/impls/globals';
import type { IOCIdentifierMap } from '@config/ioc-identifiter';
import { IOCContext } from '../context/IOCContext';
import type {
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge/ioc';

export function IOCProvider(props: { children: React.ReactNode }) {
  const [IOC] = useState(() => {
    const containerImpl: IOCContainerInterface = new ReflectionIOCContainer(
      logger
    );
    const IOC: IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface> =
      createIOCFunction<IOCIdentifierMap>(containerImpl);

    ClientIOCRegister.register(IOC.implemention!, IOC);

    return IOC;
  });

  return (
    <IOCContext.Provider value={IOC}>{props.children}</IOCContext.Provider>
  );
}
