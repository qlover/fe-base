import {
  FetchURLPlugin,
  RequestAdapterFetch,
  RequestScheduler
} from '@qlover/fe-corekit';
import {
  type BootstrapExecutorPlugin,
  RequestCommonPlugin
} from '@qlover/corekit-bridge';
import { RequestLogger } from '../cases/RequestLogger';
import { IOCIdentifier } from '@config/IOCIdentifier';
import type { AppConfig } from '../cases/AppConfig';

const apiApiAdapter = new RequestAdapterFetch({
  responseType: 'json'
});

// 使用 RequestScheduler
const apiApi = new RequestScheduler(apiApiAdapter);

// 直接使用 adapter
// const apiApi = apiApiAdapter;

export const AiApiBootstarp: BootstrapExecutorPlugin = {
  pluginName: 'AiApiBootstarp',
  onBefore({ parameters: { ioc } }) {
    const appConfig = ioc.get<AppConfig>(IOCIdentifier.AppConfig);

    // dynamic set baseURL
    apiApiAdapter.config.baseURL = appConfig.aiApiBaseUrl;

    apiApiAdapter.usePlugin(new FetchURLPlugin());
    apiApiAdapter.usePlugin(
      new RequestCommonPlugin({
        tokenPrefix: appConfig.aiApiTokenPrefix,
        token: appConfig.aiApiToken
      })
    );
    apiApiAdapter.usePlugin(ioc.get(IOCIdentifier.ApiMockPlugin));
    apiApiAdapter.usePlugin(ioc.get(RequestLogger));
  }
};

export function aiHello(data: {
  messages: { role: string; content: string }[];
}) {
  return apiApi.request<
    {
      id: string;
      object: string;
      created: number;
      choices: { message: { role: string; content: string } }[];
    },
    typeof data
  >({
    url: '/chat/completions',
    method: 'POST',
    data
  });
}
