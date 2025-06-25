import { AsyncExecutor, ExecutorPlugin } from '@qlover/fe-corekit';
import { IOCIdentifier } from '@/core/IOC';
import { injectable, inject } from 'inversify';
import type { LoggerInterface } from '@qlover/logger';
import { StoreInterface, StoreStateInterface } from '@qlover/corekit-bridge';

class ProcesserServiceState implements StoreStateInterface {
  success: boolean = false;
}

@injectable()
export class ProcesserService extends StoreInterface<ProcesserServiceState> {
  constructor(
    @inject(IOCIdentifier.Logger) private logger: LoggerInterface,
    @inject(AsyncExecutor) private executor: AsyncExecutor
  ) {
    super(() => new ProcesserServiceState());
  }

  selector = {
    success: (state: ProcesserServiceState) => state.success
  };

  use(plugin: ExecutorPlugin): this {
    this.executor.use(plugin);
    return this;
  }

  handler(): Promise<{ success: boolean }> {
    return Promise.resolve({
      success: true
    });
  }

  async starup(): Promise<unknown> {
    this.emit({ success: false });
    try {
      const result = await this.executor.exec(this.handler);
      this.emit({ success: true });
      return result;
    } catch (err) {
      this.logger.error('PageProcesser init failed', err);
      this.emit({ success: false });
    }
  }
}
