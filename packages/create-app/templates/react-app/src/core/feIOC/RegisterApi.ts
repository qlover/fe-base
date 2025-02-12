import { IOCInterface, IOCRegisterInterface } from '@/base/port/IOCInterface';
import { RequestLogger } from '@/uikit/utils/RequestLogger';
import { localJsonStorage } from '../globals';
import { FetchAbortPlugin, FetchURLPlugin } from '@qlover/fe-utils';
import { FeApiMockPlugin } from '@/base/apis/feApi';
import { defaultFeApiConfig } from '@config/app.common';
import { OpenAIClient } from '@lib/openAiApi';
import { openAiConfig } from '@config/app.common';
import { FeApi } from '@/base/apis/feApi';
import { RequestCommonPlugin } from '@lib/request-common-plugin';
import mockDataJson from '@config/feapi.mock.json';

export class RegisterApi implements IOCRegisterInterface {
  register(container: IOCInterface): void {
    const openAiApi = new OpenAIClient({
      ...openAiConfig,
      commonPluginConfig: {
        ...openAiConfig.commonPluginConfig,
        requestDataSerializer: (data) => JSON.stringify(data)
      }
    }).usePlugin(container.get(RequestLogger));

    const feApi = new FeApi({
      abortPlugin: container.get(FetchAbortPlugin),
      config: defaultFeApiConfig.adapter
    })
      .usePlugin(new FetchURLPlugin())
      .usePlugin(
        new RequestCommonPlugin({
          ...defaultFeApiConfig.commonPluginConfig,
          token: () => localJsonStorage.getItem('fe_user_token')
        })
      )
      .usePlugin(new FeApiMockPlugin(mockDataJson))
      .usePlugin(container.get(RequestLogger))
      .usePlugin(container.get(FetchAbortPlugin));

    container.bind(OpenAIClient, openAiApi);
    container.bind(FeApi, feApi);
  }
}
