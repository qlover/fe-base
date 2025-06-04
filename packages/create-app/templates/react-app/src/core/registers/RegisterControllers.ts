import { localJsonStorage, logger } from '../globals';
import { RouterController } from '@/uikit/controllers/RouterController';
import { JSONStorageController } from '@/uikit/controllers/JSONStorageController';
import { ProcesserService } from '@/base/services/ProcesserService';
import { UserController } from '@/uikit/controllers/UserController';
import { base as baseRoutes } from '@config/app.router.json';
import { InversifyRegisterInterface } from '../IOC';
import { InversifyContainer } from '../IOC';

export class RegisterControllers implements InversifyRegisterInterface {
  register(container: InversifyContainer): void {
    const routerController = new RouterController({
      config: baseRoutes,
      logger
    });

    const jsonStorageController = new JSONStorageController(localJsonStorage);

    container.bind(RouterController, routerController);
    container.bind(JSONStorageController, jsonStorageController);

    container.get(ProcesserService).use(container.get(UserController));
  }
}
