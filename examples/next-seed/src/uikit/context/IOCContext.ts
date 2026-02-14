'use client';

import {
  type IOCContainerInterface,
  type IOCFunctionInterface
} from '@qlover/corekit-bridge';
import { createContext } from 'react';
import { ClientIOC } from '@/impls/clientIoc/ClientIOC';
import type { IOCIdentifierMap } from '@shared/config/ioc-identifiter';

// export const IOCInstance = new ClientIOC();

// export const IOCContext =
//   createContext<IOCInterface<IOCIdentifierMap, IOCContainerInterface>>(
//     IOCInstance
//   );

export const clientIOC = new ClientIOC();

export const IOCInstance = clientIOC.create();

export const IOCContext = createContext<IOCFunctionInterface<
  IOCIdentifierMap,
  IOCContainerInterface
> | null>(null);
