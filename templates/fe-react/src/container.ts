import { OpenAIClient } from '../lib/openAiApi/OpenAIClient';
import { JSONStorage, Logger, SyncStorage } from '@qlover/fe-utils';
import { JSONStorageController, RequestController } from './controllers';
import { AiApi } from './services';

// common api
export const localJsonStorage = new JSONStorage(
  localStorage as SyncStorage<string, string>
);

export const logger = new Logger({ silent: false });

// open ai api
export const openAiApi = new OpenAIClient({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  baseURL: import.meta.env.VITE_OPENAI_API_URL,
  model: 'gpt-4o-mini',
  stream: false
});

export const aiApi = new AiApi(openAiApi);

// ui layer controller
export const jsonStorageController = new JSONStorageController(
  localJsonStorage
);

export const requestController = new RequestController(aiApi);
