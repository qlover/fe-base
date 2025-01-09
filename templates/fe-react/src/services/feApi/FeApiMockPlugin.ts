import {
  ExecutorContext,
  ExecutorPlugin,
  RequestAdapterFetchConfig,
  RequestAdapterResponse
} from '@qlover/fe-utils';
import mockDataJson from '@config/feapi.mock.json';
import { sleep } from '@/utils/thread';

export class FeApiMockPlugin implements ExecutorPlugin {
  readonly pluginName = 'FeApiMockPlugin';

  async onExec({
    parameters
  }: ExecutorContext<RequestAdapterFetchConfig>): Promise<RequestAdapterResponse> {
    const { method = 'GET', url = '', headers } = parameters;
    const key = `${method.toUpperCase()} ${url}`;

    const mockData = url
      ? mockDataJson[key as keyof typeof mockDataJson] || mockDataJson._default
      : mockDataJson._default;

    const response = new Response(JSON.stringify(mockData), {
      status: 200,
      statusText: 'OK'
    });

    console.log('jj [mock]', key, mockData, headers);

    await sleep(1000);

    return {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: mockData,
      config: parameters,
      response
    };
  }
}
