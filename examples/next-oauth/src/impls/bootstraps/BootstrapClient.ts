import { Bootstrap } from '@qlover/corekit-bridge';
import { browserGlobalsName } from '@config/common';
import { I, type IOCIdentifierMap } from '@config/ioc-identifiter';
import { isAuthCallbackPath } from '@config/route';
import type { UserService } from '../UserService';
import * as globals from '../globals';
import { exampleBackgroundTask } from './ExampleBackgroundTask';
import { IocIdentifierTest } from './IocIdentifierTest';
import { printBootstrap } from './PrintBootstrap';
import { restoreUserService } from './RestoreUserService';
import { UserScopeResetService } from './UserScopeResetService';
import type {
  BootstrapExecutorPlugin,
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge';
import type {
  SeedConfigInterface,
  BootstrapInterface
} from '@qlover/corekit-bridge/bootstrap';

export class BootstrapClient implements BootstrapInterface<BootstrapExecutorPlugin> {
  constructor(
    protected IOC: IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface>
  ) {}
  /**
   * @override
   */
  public startup(root?: unknown, pathname?: string): Promise<unknown> {
    const { logger, appConfig } = globals;

    const bootstrap = new Bootstrap({
      root,
      logger: logger,
      ioc: { manager: this.IOC },
      globalOptions: {
        sources: globals,
        target: browserGlobalsName
      }
    });

    return bootstrap
      .initialize()
      .then(() => {
        const plugins = this.getPlugins(appConfig, pathname);

        if (Array.isArray(plugins) && plugins.length > 0) {
          bootstrap.use(plugins);
          logger.debug(`BootstrapClient Using plugins: ${plugins.length}`);
        }

        return bootstrap.start();
      })
      .catch((error) => {
        logger.error('BootstrapClient startup failed!', error);
        return undefined;
      });
  }
  /**
   * @override
   */
  public getPlugins(
    appConfig: SeedConfigInterface,
    pathname?: string
  ): BootstrapExecutorPlugin[] {
    const i18nService = this.IOC(I.I18nServiceInterface);
    i18nService.setPathname(pathname ?? '');

    const bootstrapList: BootstrapExecutorPlugin[] = [
      i18nService,
      this.createUserScopeReset()
    ];

    // Auth callback pages (/callback/*) establish session first;
    // skip premature /api/user/session restore.
    if (!isAuthCallbackPath(pathname ?? '')) {
      bootstrapList.push(restoreUserService);
    }

    // Memory background tasks (start/stop + enqueue); see docs/client-background-plugin.md
    bootstrapList.push(exampleBackgroundTask);

    if (!appConfig.isProduction) {
      bootstrapList.push(printBootstrap);
    }

    bootstrapList.push(IocIdentifierTest);

    return bootstrapList;
  }

  /**
   * 登记用户作用域可重置对象（权限 store 等）；退出 / 失效 / 换号时清空。
   */
  protected createUserScopeReset(): UserScopeResetService {
    const userService = this.IOC(I.UserServiceInterface) as UserService;
    return new UserScopeResetService(userService, [userService]);
  }
}
