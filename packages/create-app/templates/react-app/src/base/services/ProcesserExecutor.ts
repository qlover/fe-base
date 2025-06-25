import { AsyncExecutor, ExecutorPlugin } from '@qlover/fe-corekit';
import { IOCIdentifier } from '@/core/IOC';
import { injectable, inject } from 'inversify';
import type { LoggerInterface } from '@qlover/logger';
import { RouteService } from './RouteService';

@injectable()
export class ProcesserExecutor {
  protected executor: AsyncExecutor = new AsyncExecutor();

  constructor(
    @inject(IOCIdentifier.Logger) private logger: LoggerInterface,
    @inject(RouteService) private routeService: RouteService
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

  async starup(): Promise<unknown> {
    this.logger.info('PageProcesser startup');

    try {
      const result = await this.executor.exec(this.handler);
      return result;
    } catch (err) {
      this.logger.error('PageProcesser init failed', err);

      this.routeService.gotoLogin();
    }
  }
}
