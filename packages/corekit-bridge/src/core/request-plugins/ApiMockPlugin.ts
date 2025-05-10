import {
  type ExecutorContext,
  type ExecutorPlugin,
  type RequestAdapterFetchConfig,
  type RequestAdapterResponse
} from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';
import { ThreadUtil } from '../thread/ThreadUtil';

export interface ApiMockPluginConfig {
  /**
   * when disabledMock is true, the mock data will not be used
   */
  disabledMock?: boolean;

  /**
   * mock data
   *
   */
  mockData?: unknown;
}

export class ApiMockPlugin implements ExecutorPlugin {
  readonly pluginName = 'ApiMockPlugin';

  constructor(
    private readonly mockDataJson: Record<string, unknown>,
    private readonly logger: LoggerInterface
  ) {}

  /**
   * @override
   */
  enabled(
    _name: keyof ExecutorPlugin,
    context?: ExecutorContext<RequestAdapterFetchConfig & ApiMockPluginConfig>
  ): boolean {
    //  if disabledMock is true, return the result of the task
    return !context?.parameters.disabledMock;
  }

  /**
   * @override
   */
  async onExec(
    context: ExecutorContext<RequestAdapterFetchConfig & ApiMockPluginConfig>
  ): Promise<RequestAdapterResponse> {
    await ThreadUtil.sleep(1000);

    const { parameters } = context;
    const { method = 'GET', url = '', headers, mockData } = parameters;

    let _mockData = mockData;
    // // if disabledMock is true, return the result of the task
    // if (disabledMock) {
    //   return task(context) as Promise<RequestAdapterResponse>;
    // }

    const key = `${method.toUpperCase()} ${url}`;

    if (!_mockData) {
      _mockData = url
        ? this.mockDataJson[key as keyof typeof this.mockDataJson] ||
          this.mockDataJson._default
        : this.mockDataJson._default;
    }

    const response = new Response(JSON.stringify(_mockData), {
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
      headers: {},
      data: _mockData,
      config: parameters,
      response
    };
  }
}
