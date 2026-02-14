import type { IOCIdentifierMapServer } from '@shared/config/ioc-identifiter';
import type {
  ServiceIdentifier,
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge';
import type { ExecutorError, ExecutorAsyncTask } from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';

export interface ServerInterface {
  readonly logger: LoggerInterface;

  getIOC(): IOCFunctionInterface<IOCIdentifierMapServer, IOCContainerInterface>;
  getIOC<T extends keyof IOCIdentifierMapServer>(
    identifier: T
  ): IOCIdentifierMapServer[T];
  getIOC<T>(serviceIdentifier: ServiceIdentifier<T>): T;

  execNoError<Result>(
    task?: ExecutorAsyncTask<Result, unknown>
  ): Promise<Result | ExecutorError>;
}
