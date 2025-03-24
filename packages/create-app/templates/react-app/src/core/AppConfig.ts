import type { EnvConfigInterface } from '@qlover/fe-prod/core';

export class AppConfigImpl implements EnvConfigInterface {
  readonly appName = '';
  readonly appVersion = '';
  /**
   * vite mode
   *
   */
  readonly env: string = '';

  readonly userTokenStorageKey = '';
  readonly openAiModels = [
    'gpt-4o-mini',
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-2',
    'gpt-4',
    'gpt-4-32k'
  ];
  readonly openAiBaseUrl = '';
  readonly openAiToken = '';
  readonly openAiTokenPrefix = '';
  readonly openAiRequireToken = true;
  readonly loginUser = '';
  readonly loginPassword = '';

  readonly feApiBaseUrl = '';
  readonly userApiBaseUrl = '';

  readonly aiApiBaseUrl = 'https://api.openai.com/v1';
  readonly aiApiToken = '';
  readonly aiApiTokenPrefix = 'Bearer';
  readonly aiApiRequireToken = true;
}

export default new AppConfigImpl();
