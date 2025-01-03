import { OpenAIClient } from '@lib/openAiApi';
import { RequestLogger } from '@lib/plugins';
import {
  FetchAbortPlugin,
  JSONSerializer,
  JSONStorage,
  Logger,
  SyncStorage
} from '@qlover/fe-utils';
import {
  ExecutorController,
  JSONStorageController,
  RequestController
} from './controllers';
import { FeApi } from './services';
import { openAiConfig } from '@config/app.common';

// common api
export const logger = new Logger({
  silent: import.meta.env.NODE_ENV === 'production'
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
openAiConfig.apiCommon.requestDataSerializer = (data) => JSON.stringify(data);
export const openAiApi = new OpenAIClient(openAiConfig).usePlugin(
  requestLogger
);

export const feApi = new FeApi(feApiAbort)
  .usePlugin(requestLogger)
  .usePlugin(feApiAbort);

// ui layer controller
export const jsonStorageController = new JSONStorageController(
  localJsonStorage
);

export const requestController = new RequestController(openAiApi, feApi);
export const executorController = new ExecutorController(feApi);
