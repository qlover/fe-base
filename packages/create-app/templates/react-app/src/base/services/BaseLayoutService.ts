import { I } from '@config/IOCIdentifier';
import {
  ExecutorContextInterface,
  LifecycleExecutor,
  LifecyclePluginInterface
} from '@qlover/fe-corekit';
import { injectable, inject } from 'inversify';
import { UserBootstrap } from './UserBootstrap';
import type { RouteServiceInterface } from '../port/RouteServiceInterface';
import type { UserServiceInterface } from '../port/UserServiceInterface';
import type {
  BootstrapPluginOptions,
  IOCContainerInterface
} from '@qlover/corekit-bridge';
import type { LoggerInterface } from '@qlover/logger';

@injectable()
export class BaseLayoutService {
  protected executor: LifecycleExecutor = new LifecycleExecutor();

  constructor(
    @inject(I.Logger) protected logger: LoggerInterface,
    @inject(I.RouteServiceInterface)
    protected routeService: RouteServiceInterface,
    @inject(I.UserServiceInterface)
    protected userService: UserServiceInterface
  ) {
    this.use(new UserBootstrap(userService));
  }

  public use(
    plugin: LifecyclePluginInterface<ExecutorContextInterface<unknown, unknown>>
  ): this {
    this.executor.use(plugin);
    return this;
  }

  public handler(): Promise<{ success: boolean }> {
    return Promise.resolve({
      success: true
    });
  }

  public async starup(ioc: IOCContainerInterface): Promise<unknown> {
    const context: BootstrapPluginOptions = {
      root: {},
      logger: this.logger,
      ioc: ioc
    };

    try {
      const result = await this.executor.exec(context, this.handler.bind(this));
      this.logger.info('BaseLayoutService starup success!');
      return result;
    } catch (err) {
      this.logger.error('BaseLayoutService starup failed!', err);

      this.routeService.gotoLogin();
    }
  }
}
