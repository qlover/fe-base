import { localJsonStorage, logger } from '../globals';
import { RouteService } from '@/base/services/RouteService';
import { JSONStorageController } from '@/uikit/controllers/JSONStorageController';
import { ProcesserService } from '@/base/services/ProcesserService';
import { UserService } from '@/base/services/UserService';
import { base as baseRoutes } from '@config/app.router.json';
import { InversifyRegisterInterface } from '../IOC';
import { InversifyContainer } from '../IOC';
export class RegisterControllers implements InversifyRegisterInterface {
  register(container: InversifyContainer): void {
    const routerController = new RouteService({
      config: baseRoutes,
      logger
    });

    const jsonStorageController = new JSONStorageController(localJsonStorage);

    container.bind(RouteService, routerController);
    container.bind(JSONStorageController, jsonStorageController);

    container.get(ProcesserService).use(container.get(UserService));
  }
}
