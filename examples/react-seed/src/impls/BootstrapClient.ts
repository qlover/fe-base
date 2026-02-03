import { browserGlobalsName, omitInjectedGlobals } from '@config/react-seed';
import { Bootstrap } from '@qlover/corekit-bridge/bootstrap';
import { createIOCFunction } from '@qlover/corekit-bridge/ioc';
import { omit } from 'lodash-es';
import * as globals from '@/globals';
import { printBootstrap } from '@/utils/PrintBootstrap';
import type { ReactSeedBootstrapInterface } from '@/interfaces/ReactSeedBootstrapInterface';
import type { ReactSeedConfigInterface } from '@/interfaces/ReactSeedConfigInterface';
import type { IOCIdentifierMap } from '@config/IOCIdentifier';
import type { IOCContainerInterface } from '@qlover/corekit-bridge';
import type { BootstrapExecutorPlugin } from '@qlover/corekit-bridge/bootstrap';
import type { IOCFunctionInterface } from '@qlover/corekit-bridge/ioc';

export class BootstrapClient implements ReactSeedBootstrapInterface {
  protected IOC: IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface>;
  constructor(
    container:
      | IOCContainerInterface
      | IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface>
  ) {
    if (typeof container === 'function') {
      this.IOC = container;
    } else {
      this.IOC = createIOCFunction(container);
    }
  }
  /**
   * Start the client
   *
   * @override
   */
  startup(root?: unknown): Promise<void> {
    const { logger, seedConfig } = globals;

    const bootstrap = new Bootstrap({
      root: root,
      logger: logger,
      globalOptions: {
        sources: omit(globals, omitInjectedGlobals),
        target: browserGlobalsName
      }
    });

    return bootstrap
      .initialize()
      .then(() => {
        const plugins = this.getPlugins(seedConfig);

        if (Array.isArray(plugins) && plugins.length > 0) {
          bootstrap.use(plugins);
          logger.debug(`BootstrapClient Using plugins: ${plugins.length}`);
        }

        bootstrap.start();
      })
      .catch((error) => {
        logger.error(`BootstrapClient error: ${error}`);
      });
  }

  /**
   * @override
   */
  public getPlugins(
    seedConfig: ReactSeedConfigInterface
  ): BootstrapExecutorPlugin[] {
    const result = [];

    if (!seedConfig.isProduction) {
      result.push(printBootstrap);
    }

    return result;
  }
}
