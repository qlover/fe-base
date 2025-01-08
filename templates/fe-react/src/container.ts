/**
 * **dont't import tsx, only ts file**
 */

import {
  FetchAbortPlugin,
  JSONSerializer,
  JSONStorage,
  Logger,
  SyncStorage
} from '@qlover/fe-utils';

import { OpenAIClient } from '@lib/openAiApi';
import { ThemeController } from '@lib/fe-react-theme/ThemeController';

import { RequestLogger } from '@/utils';
import {
  ExecutorController,
  JSONStorageController,
  RequestController,
  UserController
} from '@/controllers';
import { FeApi } from '@/services';

import { openAiConfig } from '@config/app.common';
import themeConfigJson from '@config/theme.json';
import { PageProcesser } from './services/pageProcesser';
import { RouterController } from './controllers/RouterController';

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

export const feApi = new FeApi(feApiAbort)
  .usePlugin(requestLogger)
  .usePlugin(feApiAbort);



// ui layer controller
export const routerController = new RouterController();

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
