import {
  type IOCContainerInterface,
  type IOCFunctionInterface
} from '@qlover/corekit-bridge';
import { type IOCIdentifierMapServer } from '@config/IOCIdentifier';

export interface ServerInterface {
  getIOC(): IOCFunctionInterface<IOCIdentifierMapServer, IOCContainerInterface>;
  getIOC<T extends keyof IOCIdentifierMapServer>(
    identifier: T
  ): IOCIdentifierMapServer[T];
}
