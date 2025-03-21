import type {
  InversifyRegisterInterface,
  InversifyRegisterContainer
} from '@/base/port/InversifyIocInterface';

import { localJsonStorage, logger } from '../globals';
import { RouterController } from '@/uikit/controllers/RouterController';
import { JSONStorageController } from '@/uikit/controllers/JSONStorageController';
import { RequestController } from '@/uikit/controllers/RequestController';
import { ProcesserService } from '@/services/processer/ProcesserService';
import { UserController } from '@/uikit/controllers/UserController';
import { ThemeController, OpenAIClient } from '@fe-prod/core';
import { FeApi } from '@/base/apis/feApi/FeApi';
import { base as baseRoutes } from '@config/app.router.json';
import { override as themeOverride } from '@config/theme.json';
import { UserApi } from '@/base/apis/userApi/UserApi';

export class RegisterControllers implements InversifyRegisterInterface {
  register(container: InversifyRegisterContainer): void {
    const routerController = new RouterController({
      config: baseRoutes,
      logger
    });

    const jsonStorageController = new JSONStorageController(localJsonStorage);
    const requestController = new RequestController(
      container.get(OpenAIClient),
      container.get(FeApi),
      container.get(UserApi)
    );

    const themeController = new ThemeController({
      ...themeOverride,
      storage: localJsonStorage
    });

    container.bind(RouterController).toConstantValue(routerController);
    container
      .bind(JSONStorageController)
      .toConstantValue(jsonStorageController);
    container.bind(RequestController).toConstantValue(requestController);

    container.bind(ThemeController).toConstantValue(themeController);

    container.get(ProcesserService).use(container.get(UserController));
  }
}
