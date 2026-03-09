import { createContext } from 'react';
import type { IOCIdentifierMap } from '@/config/ioc-identifier';
import type {
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge/ioc';

export const IOCContext = createContext<IOCFunctionInterface<
  IOCIdentifierMap,
  IOCContainerInterface
> | null>(null);
