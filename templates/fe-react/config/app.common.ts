import { RoutePageProps } from '@/pages/base/type';
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

export const i18nConfig = {
  defaultLanguage: 'en',
  fallbackLanguage: 'en',
  supportedLanguages: ['en', 'zh'],
  commonNamespace: 'common'
} as const;
export type I18nLocale = (typeof i18nConfig.supportedLanguages)[number];

export const defaultBaseRoutePageProps: RoutePageProps = {
  localNamespace: 'common',
  
};
