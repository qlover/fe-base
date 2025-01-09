//! dont't import tsx, only ts file
import { FetchAbortPlugin, FetchURLPlugin } from '@qlover/fe-utils';
import { OpenAIClient } from '@lib/openAiApi';
import { ThemeController } from '@lib/fe-react-theme/ThemeController';
import { ExecutorController } from '@/services/controllers/ExecutorController';
import { JSONStorageController } from '@/services/controllers/JSONStorageController';
import { RequestController } from '@/services/controllers/RequestController';
import { UserController } from '@/services/controllers/UserController';
import { RouterController } from '@/services/controllers/RouterController';
import { FeApi, FeApiMockPlugin } from '@/services/feApi';
import { defaultFeApiConfig, openAiConfig } from '@config/app.common';
import themeConfigJson from '@config/theme.json';
import appRouterConfig from '@config/app.router.json';
import { RequestCommonPlugin } from '@lib/request-common-plugin';
import { localJsonStorage, logger } from './globals';
import { RequestLogger } from '@/utils/RequestLogger';
import { RouteConfig } from '@/types/Page';
import { PageProcesser } from '@/services/pageProcesser';

// common plugins
const requestLogger = new RequestLogger(logger);
export const feApiAbort = new FetchAbortPlugin();

// open ai api
openAiConfig.commonPluginConfig.requestDataSerializer = (data) =>
  JSON.stringify(data);
export const openAiApi = new OpenAIClient(openAiConfig).usePlugin(
  requestLogger
);

export const feApi = new FeApi({
  abortPlugin: feApiAbort,
  config: defaultFeApiConfig.adapter
})
  .usePlugin(new FetchURLPlugin())
  .usePlugin(
    new RequestCommonPlugin({
      ...defaultFeApiConfig.commonPluginConfig,
      token: () => localJsonStorage.getItem('fe_user_token')
    })
  )
  .usePlugin(new FeApiMockPlugin())
  .usePlugin(requestLogger)
  .usePlugin(feApiAbort);

// ui layer controller
export const routerController = new RouterController({
  config: appRouterConfig.base as RouteConfig,
  logger
});

export const jsonStorageController = new JSONStorageController(
  localJsonStorage
);
export const requestController = new RequestController(openAiApi, feApi);
export const executorController = new ExecutorController(feApi);
export const userController = new UserController({
  storageKey: 'fe_user_token',
  storage: localJsonStorage,
  feApi,
  routerController
});
export const themeController = new ThemeController({
  ...themeConfigJson.override,
  storage: localJsonStorage
});

export const pageProcesser = new PageProcesser({
  logger
}).usePlugin(userController);
