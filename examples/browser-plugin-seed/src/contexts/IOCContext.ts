import type { IOCIdentifierMap } from '@config/ioc-identifier';
import type {
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge';
import { createContext } from 'react';

export const IOCContext = createContext<IOCFunctionInterface<
  IOCIdentifierMap,
  IOCContainerInterface
> | null>(null);
