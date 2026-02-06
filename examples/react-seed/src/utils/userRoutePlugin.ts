import { RouteService } from '@/impls/RouteService';
import { UserService } from '@/impls/UserService';
import type { BootstrapExecutorPlugin } from '@qlover/corekit-bridge/bootstrap';

export const userRoutePlugin: BootstrapExecutorPlugin = {
  pluginName: 'userRoute',
  onBefore({ parameters: { ioc, logger } }) {
    const userService = ioc.get<UserService>(UserService);

    userService
      .refreshUser()
      .then((success) => {
        if (!success) {
          ioc.get<RouteService>(RouteService).useAuthRoutes();
          logger.debug('userRoute fail!');
          return;
        }
        ioc.get<RouteService>(RouteService).useMainRoutes();
        logger.debug('userRoute success!');
      })
      .catch((error) => {
        ioc.get<RouteService>(RouteService).useAuthRoutes();

        throw error;
      });
  }
};
