import {
  ExecutorContext,
  ExecutorPlugin,
  Logger,
  PromiseTask,
  RequestAdapterFetchConfig,
  RequestAdapterResponse
} from '@qlover/fe-utils';
import { inject, injectable } from 'inversify';
import mockDataJson from '@config/feapi.mock.json';
import { Thread } from '@/uikit/utils/thread';

@injectable()
export class ApiMockPlugin implements ExecutorPlugin {
  readonly pluginName = 'ApiMockPlugin';

  private readonly mockDataJson = mockDataJson;

  constructor(@inject(Logger) private readonly logger: Logger) {}

  /**
   * @override
   */
  async onExec(
    context: ExecutorContext<RequestAdapterFetchConfig>,
    task: PromiseTask<unknown, unknown>
  ): Promise<RequestAdapterResponse> {
    await Thread.sleep(1000);

    const { parameters } = context;
    const { method = 'GET', url = '', headers, noMock } = parameters;

    // if noMock is true, return the result of the task
    if (noMock) {
      return task(context) as Promise<RequestAdapterResponse>;
    }

    const key = `${method.toUpperCase()} ${url}`;
    const mockData = url
      ? this.mockDataJson[key as keyof typeof this.mockDataJson] ||
        this.mockDataJson._default
      : this.mockDataJson._default;

    const response = new Response(JSON.stringify(mockData), {
      status: 200,
      statusText: 'OK'
    });

    this.logger.log(
      '%c[mock]%c ' + key,
      'color: #dd0;',
      'color: inherit;',
      ['headers:', headers],
      ['response json:', await response.json()]
    );

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
