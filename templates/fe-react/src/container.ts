import { OpenAIClient } from './../lib/aiApi/OpenAIClient';
import { JSONStorage, SyncStorage } from '@qlover/fe-utils';

const storage = localStorage as SyncStorage<string, string>;
export const localJsonStorage = new JSONStorage(storage);

export const openAIClient = new OpenAIClient({
  baseURL: import.meta.env.VITE_OPENAI_API_URL
});
