import { name, version } from '../../package.json';
import type { EnvConfigInterface } from '@qlover/corekit-bridge';

export class MockAppConfig implements EnvConfigInterface {
  public appName = name;

  public appVersion = version;

  public env: string = 'test';

  public userTokenStorageKey = '__fe_user_token__';

  public userInfoStorageKey = '__fe_user_info__';

  public openAiModels = [
    'gpt-4o-mini',
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-2',
    'gpt-4',
    'gpt-4-32k'
  ];

  public openAiBaseUrl = '';

  public openAiToken = '';

  public openAiTokenPrefix = '';

  public openAiRequireToken = true;

  public loginUser = '';

  public loginPassword = '';

  public feApiBaseUrl = '';

  public userApiBaseUrl = '';

  public aiApiBaseUrl = 'https://api.openai.com/v1';

  public aiApiToken = '';

  public aiApiTokenPrefix = 'Bearer';

  public aiApiRequireToken = true;

  public bootHref = '';
}
