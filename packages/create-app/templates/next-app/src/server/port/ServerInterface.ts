import { type ExecutorError, type PromiseTask } from '@qlover/fe-corekit';
import { type IOCIdentifierMapServer } from '@config/IOCIdentifier';
import type {
  ServiceIdentifier,
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge';
import type { LoggerInterface } from '@qlover/logger';

export interface ServerInterface {
  readonly logger: LoggerInterface;

  getIOC(): IOCFunctionInterface<IOCIdentifierMapServer, IOCContainerInterface>;
  getIOC<T extends keyof IOCIdentifierMapServer>(
    identifier: T
  ): IOCIdentifierMapServer[T];
  getIOC<T>(serviceIdentifier: ServiceIdentifier<T>): T;

  execNoError<Result>(
    task?: PromiseTask<Result, unknown>
  ): Promise<Result | ExecutorError>;
}
