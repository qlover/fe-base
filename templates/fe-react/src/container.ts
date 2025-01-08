/**
 * **dont't import tsx, only ts file**
 */

import {
  FetchAbortPlugin,
  FetchURLPlugin,
  JSONSerializer,
  JSONStorage,
  Logger,
  SyncStorage
} from '@qlover/fe-utils';

import { OpenAIClient } from '@lib/openAiApi';
import { ThemeController } from '@lib/fe-react-theme/ThemeController';

import {
  ExecutorController,
  JSONStorageController,
  RequestController,
  UserController
} from '@/controllers';
import { FeApi, FeApiMockPlugin } from '@/services';

import { defaultFeApiConfig, openAiConfig } from '@config/app.common';
import themeConfigJson from '@config/theme.json';
import { PageProcesser } from './services/pageProcesser';
import { RouterController } from './controllers/RouterController';
import appRouterConfig from '@config/app.router.json';
import { RouteConfig } from './types/Page';
import { RequestLogger } from './utils/RequestLogger';
import { RequestCommonPlugin } from '@lib/request-common-plugin';

const isProduction = import.meta.env.NODE_ENV === 'production';

// common api
export const logger = new Logger({
  silent: isProduction,
  debug: !isProduction
});
export const JSON = new JSONSerializer();
export const localJsonStorage = new JSONStorage(
  localStorage as SyncStorage<string, string>,
  JSON
);

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
  config: defaultFeApiConfig
})
  .usePlugin(new FetchURLPlugin())
  .usePlugin(new RequestCommonPlugin())
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
