'use client';

import { createContext } from 'react';
import type { IOCIdentifierMap } from '@config/ioc-identifiter';
import type {
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge';

export const IOCContext = createContext<IOCFunctionInterface<
  IOCIdentifierMap,
  IOCContainerInterface
> | null>(null);
