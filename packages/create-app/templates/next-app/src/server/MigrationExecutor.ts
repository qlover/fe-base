import { AsyncExecutor } from '@qlover/fe-corekit';

export class MigrationExecutor {
  protected executor: AsyncExecutor;

  constructor() {
    this.executor = new AsyncExecutor();
  }

  exec<T>(callback: () => Promise<T>): Promise<T> {
    return this.executor.exec(callback);
  }
}
