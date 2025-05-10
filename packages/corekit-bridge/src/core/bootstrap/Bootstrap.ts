import type { IOCContainerInterface } from '../ioc/IOCContainerInterface';
import { SyncExecutor } from '@qlover/fe-corekit';
import type {
  BootstrapArgs,
  BootstrapExecutorPlugin
} from './BootstrapExecutorPlugin';
import type { LoggerInterface } from '@qlover/logger';
export class Bootstrap extends SyncExecutor {
  constructor(
    private root: unknown,
    private IOCContainer: IOCContainerInterface,
    private logger: LoggerInterface
  ) {
    super();
  }

  getIOCContainer(): IOCContainerInterface {
    return this.IOCContainer;
  }

  getContext(): BootstrapArgs {
    return { root: this.root, ioc: this.IOCContainer, logger: this.logger };
  }

  use(plugin: BootstrapExecutorPlugin | BootstrapExecutorPlugin[]): this {
    if (Array.isArray(plugin)) {
      plugin.forEach((p) => super.use(p));
      return this;
    }

    super.use(plugin);

    return this;
  }

  start(): void {
    this.exec(this.getContext(), () => {});
  }

  startNoError(): void {
    this.execNoError(this.getContext(), () => {});
  }
}
