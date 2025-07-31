import { EnvConfigInterface } from '@qlover/corekit-bridge';
import { name, version } from '../../package.json';

export class MockAppConfig implements EnvConfigInterface {
  appName = name;

  appVersion = version;

  env: string = import.meta.env.MODE;

  userTokenStorageKey = '__fe_user_token__';

  userInfoStorageKey = '__fe_user_info__';

  openAiModels = [
    'gpt-4o-mini',
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-2',
    'gpt-4',
    'gpt-4-32k'
  ];

  openAiBaseUrl = '';

  openAiToken = '';

  openAiTokenPrefix = '';

  openAiRequireToken = true;

  loginUser = '';

  loginPassword = '';

  feApiBaseUrl = '';

  userApiBaseUrl = '';

  aiApiBaseUrl = 'https://api.openai.com/v1';

  aiApiToken = '';

  aiApiTokenPrefix = 'Bearer';

  aiApiRequireToken = true;

  bootHref = '';
}
