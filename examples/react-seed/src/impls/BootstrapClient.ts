import {
  Bootstrap,
  type BootstrapExecutorPlugin
} from '@qlover/corekit-bridge/bootstrap';
import * as globals from '@/globals';
import { omit } from 'lodash-es';
import { browserGlobalsName, omitInjectedGlobals } from '@config/react-seed';
import { printBootstrap } from '@/utils/PrintBootstrap';
import type { ReactSeedConfigInterface } from '@/interfaces/ReactSeedConfigInterface';
import type { ReactSeedBootstrapInterface } from '@/interfaces/ReactSeedBootstrapInterface';

export class BootstrapClient implements ReactSeedBootstrapInterface {
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
