import { type IOCIdentifierMapServer } from '@config/IOCIdentifier';
import type {
  ServiceIdentifier,
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge';

export interface ServerInterface {
  getIOC(): IOCFunctionInterface<IOCIdentifierMapServer, IOCContainerInterface>;
  getIOC<T>(serviceIdentifier: ServiceIdentifier<T>): T;
  getIOC<T extends keyof IOCIdentifierMapServer>(
    identifier: T
  ): IOCIdentifierMapServer[T];
}
