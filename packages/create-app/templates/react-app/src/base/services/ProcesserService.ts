import { AsyncExecutor, ExecutorPlugin } from '@qlover/fe-corekit';
import { IOCIdentifier } from '@/core/IOC';
import { injectable, inject } from 'inversify';
import type { LoggerInterface } from '@qlover/logger';

@injectable()
export class ProcesserService {
  constructor(
    @inject(IOCIdentifier.Logger) private logger: LoggerInterface,
    @inject(AsyncExecutor) private executor: AsyncExecutor
  ) {}

  use(plugin: ExecutorPlugin): this {
    this.executor.use(plugin);
    return this;
  }

  handler(): Promise<{ success: boolean }> {
    return Promise.resolve({
      success: true
    });
  }

  init(): Promise<unknown> {
    return this.executor.exec(this.handler).catch((err) => {
      this.logger.error('PageProcesser init failed', err);
    });
  }
}
