import { UserTokenOptions } from '@/base/cases/UserToken';
import { i18nConfig } from '@config/i18n';
import { OpenAIClientConfig } from '@lib/openAiApi';
import { RequestCommonPluginConfig } from '@lib/request-common-plugin';
import { RequestAdapterFetchConfig } from '@qlover/fe-utils';

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

export const defaultBaseRoutemeta = {
  localNamespace: i18nConfig.defaultNS,
  title: '',
  icon: ''
} as const;

export const defaultLoginInfo = {
  name: 'qlover',
  password: 'q1234566'
};

export const defaultFeApiConfig: {
  adapter: Partial<RequestAdapterFetchConfig>;
  commonPluginConfig: RequestCommonPluginConfig;
} = {
  adapter: {
    responseType: 'json',
    baseURL: 'https://api.example.com/'
  },
  commonPluginConfig: requestCommonPluginConfig
};

export const userTokenOptions: Omit<UserTokenOptions, 'storage'> = {
  storageKey: 'fe_user_token',
  expiresIn: 'month'
};
