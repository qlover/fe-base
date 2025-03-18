import type { IOCContainerInterface } from '@/base/port/IOCContainerInterface';
import { SyncExecutor } from '@qlover/fe-utils';
import { BootstrapExecutorPlugin } from './BootstrapExecutorPlugin';

export class Bootstrap extends SyncExecutor {
  constructor(private IOCContainer: IOCContainerInterface) {
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
    this.exec({ root, ioc: this.IOCContainer }, () => {
      // nothing to do
    });
  }

  startNoError(root: unknown): void {
    this.execNoError({ root, ioc: this.IOCContainer }, () => {
      // nothing to do
    });
  }
}
