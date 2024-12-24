import { OpenAIClient } from '@lib/openAiApi';
import { RequestLogger } from '@lib/plugins';
import {
  JSONSerializer,
  JSONStorage,
  Logger,
  SyncStorage
} from 'packages/fe-utils/common';
import {
  ExecutorController,
  JSONStorageController,
  RequestController
} from './controllers';
import { FeApi } from './services';

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

// open ai api
export const openAiApi = new OpenAIClient({
  baseURL: import.meta.env.VITE_OPENAI_API_URL,
  apiCommon: {
    tokenPrefix: 'Bearer',
    defaultHeaders: {
      'Content-Type': 'application/json'
    },
    defaultRequestData: {
      model: 'gpt-4o-mini',
      stream: true
    },
    requiredToken: true,
    token: import.meta.env.VITE_OPENAI_API_KEY,
    requestDataSerializer(data) {
      return JSON.stringify(data);
    }
  }
}).usePlugin(requestLogger);

export const feApi = new FeApi().usePlugin(requestLogger);

// ui layer controller
export const jsonStorageController = new JSONStorageController(
  localJsonStorage
);

export const requestController = new RequestController(openAiApi, feApi);
export const executorController = new ExecutorController(feApi);
