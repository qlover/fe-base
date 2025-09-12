import { type ExecutorError, type PromiseTask } from '@qlover/fe-corekit';
import { type IOCIdentifierMapServer } from '@config/IOCIdentifier';
import type {
  ServiceIdentifier,
  IOCContainerInterface,
  IOCFunctionInterface,
  LoggerInterface
} from '@qlover/corekit-bridge';

export interface ServerInterface {
  readonly logger: LoggerInterface;

  getIOC(): IOCFunctionInterface<IOCIdentifierMapServer, IOCContainerInterface>;
  getIOC<T>(serviceIdentifier: ServiceIdentifier<T>): T;
  getIOC<T extends keyof IOCIdentifierMapServer>(
    identifier: T
  ): IOCIdentifierMapServer[T];

  execNoError<Result>(
    task?: PromiseTask<Result, unknown>
  ): Promise<Result | ExecutorError>;
}
