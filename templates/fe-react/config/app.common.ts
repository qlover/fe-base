import { OpenAIClientConfig } from '@lib/openAiApi';
import { ApiCommonPluginConfig } from '@lib/plugins';

export const apiCommonPluginConfig: ApiCommonPluginConfig = {
  tokenPrefix: 'Bearer',
  defaultHeaders: {
    'Content-Type': 'application/json'
  },
  defaultRequestData: {
    model: 'gpt-4o-mini',
    stream: true
  },
  requiredToken: true,
  token: import.meta.env.VITE_OPENAI_API_KEY
};

export const openAiConfig: OpenAIClientConfig = {
  baseURL: import.meta.env.VITE_OPENAI_API_URL,
  apiCommon: apiCommonPluginConfig
};
