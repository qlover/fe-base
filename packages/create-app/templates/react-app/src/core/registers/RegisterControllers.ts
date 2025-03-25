import type {
  InversifyRegisterInterface,
  InversifyRegisterContainer
} from '@/base/port/InversifyIocInterface';

import { localJsonStorage, logger } from '../globals';
import { RouterController } from '@/uikit/controllers/RouterController';
import { JSONStorageController } from '@/uikit/controllers/JSONStorageController';
import { ProcesserService } from '@/base/services/ProcesserService';
import { UserController } from '@/uikit/controllers/UserController';
import { ThemeService } from '@qlover/corekit-bridge';
import { base as baseRoutes } from '@config/app.router.json';
import { override as themeOverride } from '@config/theme.json';

export class RegisterControllers implements InversifyRegisterInterface {
  register(container: InversifyRegisterContainer): void {
    const routerController = new RouterController({
      config: baseRoutes,
      logger
    });

    const jsonStorageController = new JSONStorageController(localJsonStorage);

    const themeController = new ThemeService({
      ...themeOverride,
      storage: localJsonStorage
    });

    container.bind(RouterController).toConstantValue(routerController);
    container
      .bind(JSONStorageController)
      .toConstantValue(jsonStorageController);

    container.bind(ThemeService).toConstantValue(themeController);

    container.get(ProcesserService).use(container.get(UserController));
  }
}
