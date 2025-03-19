import type { EnvConfigInterface } from '@lib/bootstrap';

class AppConfig implements EnvConfigInterface {
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
}

export default new AppConfig();
