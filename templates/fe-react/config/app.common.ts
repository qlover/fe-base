import { i18nConfig } from '@config/i18n';
import { OpenAIClientConfig } from '@lib/openAiApi';
import { RequestCommonPluginConfig } from '@lib/request-common-plugin';

export const openAiModels = [
  'gpt-3.5-turbo',
  'gpt-3.5-turbo-2',
  'gpt-4',
  'gpt-4-32k'
];

export const requestCommonPluginConfig: RequestCommonPluginConfig = {
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
  models: openAiModels,
  commonPluginConfig: requestCommonPluginConfig
};

export const defaultBaseRoutePageProps = {
  localNamespace: i18nConfig.defaultNS,
  title: '',
  icon: ''
} as const;
