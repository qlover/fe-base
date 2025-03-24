import { OpenAIClient } from '@qlover/fe-prod/core/openAiApi';
import type {
  InversifyRegisterInterface,
  InversifyRegisterContainer
} from '@/base/port/InversifyIocInterface';

import { RequestLogger } from '@/uikit/utils/RequestLogger';
import AppConfig from '@/core/AppConfig';

export class RegisterApi implements InversifyRegisterInterface {
  register(container: InversifyRegisterContainer): void {
    const openAiApi = new OpenAIClient({
      baseURL: AppConfig.openAiBaseUrl,
      models: AppConfig.openAiModels,
      commonPluginConfig: {
        tokenPrefix: AppConfig.openAiTokenPrefix,
        token: AppConfig.openAiToken,
        defaultHeaders: {
          'Content-Type': 'application/json'
        },
        defaultRequestData: {
          model: AppConfig.openAiModels[0],
          stream: true
        },
        requiredToken: true,
        requestDataSerializer: (data) => JSON.stringify(data)
      }
    }).usePlugin(container.get(RequestLogger));

    container.bind(OpenAIClient).toConstantValue(openAiApi);
  }
}
