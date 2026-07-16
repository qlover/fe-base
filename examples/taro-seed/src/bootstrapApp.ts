import { BootstrapClient } from './impls/BootstrapClient';
import type { IOCIdentifierMap } from './config/ioc-identifier';
import type { IOCContainerInterface } from '@qlover/corekit-bridge';
import type { IOCFunctionInterface } from '@qlover/corekit-bridge/ioc';

export function bootstrapApp(
  IOC: IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface>,
  root?: unknown
) {
  return new BootstrapClient(IOC).startup(root);
}
