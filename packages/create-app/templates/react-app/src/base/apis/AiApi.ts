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
import { IOCIdentifier } from '@/core/IOC';
import { appConfig } from '@/core/globals';

const apiApiAdapter = new RequestAdapterFetch({
  baseURL: appConfig.aiApiBaseUrl
});

// 使用 RequestScheduler
const apiApi = new RequestScheduler(apiApiAdapter);

// 直接使用 adapter
// const apiApi = apiApiAdapter;

export const AiApiBootstarp: BootstrapExecutorPlugin = {
  pluginName: 'AiApiBootstarp',
  onBefore({ parameters: { ioc } }) {
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
    typeof data,
    {
      id: string;
      object: string;
      created: number;
      choices: { message: { role: string; content: string } }[];
    }
  >({
    url: '/chat/completions',
    method: 'POST',
    data
  });
}
