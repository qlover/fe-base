import { RoutePageProps } from '@/pages/base/type';
import { OpenAIClientConfig } from '@lib/openAiApi';
import { ApiCommonPluginConfig } from '@lib/plugins';
import { InitOptions } from 'i18next';

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

/** @type {import('i18next').InitOptions} */
export const i18nConfig = {
  /**
   * default language
   */
  fallbackLng: 'en',
  debug: process.env.NODE_ENV === 'development',
  interpolation: {
    escapeValue: false // React already does escaping
  },
  ns: ['common'],
  defaultNS: 'common',
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json'
  },
  supportedLngs: ['en', 'zh']
} as const;
export type I18nLocale = (typeof i18nConfig.supportedLngs)[number];

export const defaultBaseRoutePageProps = {
  localNamespace: i18nConfig.defaultNS,
  title: '',
  icon: ''
} as const;
