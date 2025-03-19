import type {
  InversifyRegisterInterface,
  InversifyRegisterContainer
} from '@/base/port/InversifyIocInterface';

import { localJsonStorage, logger } from '../globals';
import { RouterController } from '@/uikit/controllers/RouterController';
import { JSONStorageController } from '@/uikit/controllers/JSONStorageController';
import { RequestController } from '@/uikit/controllers/RequestController';
import { ProcesserService } from '@/services/processer/ProcesserService';
import { ExecutorController } from '@/uikit/controllers/ExecutorController';
import { UserController } from '@/uikit/controllers/UserController';
import { ThemeController } from '@lib/fe-react-theme/ThemeController';
import { OpenAIClient } from '@lib/openAiApi';
import { FeApi } from '@/base/apis/feApi';
import { base as baseRoutes } from '@config/app.router.json';
import { override as themeOverride } from '@config/theme.json';
import { UserToken } from '@/base/cases/UserToken';

export class RegisterControllers implements InversifyRegisterInterface {
  register(container: InversifyRegisterContainer): void {
    const routerController = new RouterController({
      config: baseRoutes,
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
      ...themeOverride,
      storage: localJsonStorage
    });

    const pageProcesser = new ProcesserService({
      logger
    }).usePlugin(userController);

    container.bind(RouterController).toConstantValue(routerController);
    container
      .bind(JSONStorageController)
      .toConstantValue(jsonStorageController);
    container.bind(RequestController).toConstantValue(requestController);
    container.bind(ExecutorController).toConstantValue(executorController);
    container.bind(UserController).toConstantValue(userController);
    container.bind(ThemeController).toConstantValue(themeController);
    container.bind(ProcesserService).toConstantValue(pageProcesser);
  }
}
