import type { IOCContainerInterface } from './IOCContainerInterface';
import { Logger, SyncExecutor } from '@qlover/fe-utils';
import {
  BootstrapContext,
  BootstrapExecutorPlugin
} from './BootstrapExecutorPlugin';

export class Bootstrap extends SyncExecutor {
  constructor(
    private IOCContainer: IOCContainerInterface,
    private logger: Logger
  ) {
    super();
  }

  getIOCContainer(): IOCContainerInterface {
    return this.IOCContainer;
  }

  use(plugin: BootstrapExecutorPlugin | BootstrapExecutorPlugin[]): this {
    if (Array.isArray(plugin)) {
      plugin.forEach((p) => super.use(p));
      return this;
    }

    super.use(plugin);

    return this;
  }

  start(root: unknown): void {
    this.exec(
      { root, ioc: this.IOCContainer, logger: this.logger },
      // nothing to do
      () => {}
    );
  }

  startNoError(root: unknown): void {
    this.execNoError(
      { root, ioc: this.IOCContainer, logger: this.logger },
      // nothing to do
      () => {}
    );
  }
}
