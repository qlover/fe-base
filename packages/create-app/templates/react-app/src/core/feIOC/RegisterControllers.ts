import { IOCInterface, IOCRegisterInterface } from '@/base/port/IOCInterface';
import { localJsonStorage, logger } from '../globals';
import { RouterController } from '@/uikit/controllers/RouterController';
import { JSONStorageController } from '@/uikit/controllers/JSONStorageController';
import { RequestController } from '@/uikit/controllers/RequestController';
import { ProcesserService } from '@/services/processer/ProcesserService';
import { ExecutorController } from '@/uikit/controllers/ExecutorController';
import { UserController } from '@/uikit/controllers/UserController';
import { ThemeController } from '@lib/fe-react-theme/ThemeController';
import { RouteConfig } from '@/base/types/Page';
import { OpenAIClient } from '@lib/openAiApi';
import { FeApi } from '@/base/apis/feApi';

import appRouterConfig from '@config/app.router.json';
import themeConfigJson from '@config/theme.json';
import { UserToken } from '@/base/cases/UserToken';

export class RegisterControllers implements IOCRegisterInterface {
  register(container: IOCInterface): void {
    const routerController = new RouterController({
      config: appRouterConfig.base as RouteConfig,
      logger
    });

    const jsonStorageController = new JSONStorageController(localJsonStorage);
    const requestController = new RequestController(
      container.get(OpenAIClient),
      container.get(FeApi)
    );
    const executorController = new ExecutorController(container.get(FeApi));
    const userController = new UserController({
      userToken: container.get(UserToken),
      feApi: container.get(FeApi),
      routerController
    });
    const themeController = new ThemeController({
      ...themeConfigJson.override,
      storage: localJsonStorage
    });

    const pageProcesser = new ProcesserService({
      logger
    }).usePlugin(userController);

    container.bind(RouterController, routerController);
    container.bind(JSONStorageController, jsonStorageController);
    container.bind(RequestController, requestController);
    container.bind(ExecutorController, executorController);
    container.bind(UserController, userController);
    container.bind(ThemeController, themeController);
    container.bind(ProcesserService, pageProcesser);
  }
}
