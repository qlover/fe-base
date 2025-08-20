import {
  AsyncExecutor,
  ExecutorContext,
  ExecutorPlugin
} from '@qlover/fe-corekit';
import { IOCIdentifier } from '@config/IOCIdentifier';
import { injectable, inject } from 'inversify';
import type { LoggerInterface } from '@qlover/logger';
import type { ProcesserExecutorInterface } from '../port/ProcesserExecutorInterface';
import type { BootstrapContextValue } from '@qlover/corekit-bridge';
import type { RouteServiceInterface } from '../port/RouteServiceInterface';

@injectable()
export class ProcesserExecutor implements ProcesserExecutorInterface {
  pluginName = 'ProcesserExecutor';
  protected executor: AsyncExecutor = new AsyncExecutor();

  constructor(
    @inject(IOCIdentifier.Logger) protected logger: LoggerInterface,
    @inject(IOCIdentifier.RouteServiceInterface)
    protected routeService: RouteServiceInterface
  ) {}

  /**
   * @override
   */
  onBefore({
    parameters: { ioc }
  }: ExecutorContext<BootstrapContextValue>): void | Promise<void> {
    this.use(ioc.get(IOCIdentifier.I18nKeyErrorPlugin));
    this.use(ioc.get(IOCIdentifier.UserServiceInterface));
  }

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
