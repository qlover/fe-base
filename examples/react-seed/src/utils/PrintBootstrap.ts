import { browserGlobalsName } from '@config/react-seed';
import { RouteService } from '@/impls/RouteService';
import { UserService } from '@/impls/UserService';
import type { BootstrapExecutorPlugin } from '@qlover/corekit-bridge';

export const printBootstrap: BootstrapExecutorPlugin = {
  pluginName: 'PrintBootstrap',
  onSuccess({ parameters: { logger, ioc } }) {
    const routeService = ioc.get(RouteService);

    logger.debug(routeService === ioc.get(RouteService));
    logger.debug(
      'userService',
      ioc.get<UserService>(UserService).routeService === routeService
    );

    logger.info(
      'bootstrap success!\n\n' +
        `You can use \`%cwindow.${browserGlobalsName}%c\` to access the globals`,
      'color: #0ff; font-weight: bold;',
      'all: unset;'
    );
  }
};
