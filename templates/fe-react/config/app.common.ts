import { i18nConfig } from '@/services/i18n/config';
import { OpenAIClientConfig } from '@lib/openAiApi';
import { ApiCommonPluginConfig } from '@lib/plugins';
import themeConfigJson from './theme.json';
export * from '@/services/i18n/config';

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

export const defaultBaseRoutePageProps = {
  localNamespace: i18nConfig.defaultNS,
  title: '',
  icon: ''
} as const;
