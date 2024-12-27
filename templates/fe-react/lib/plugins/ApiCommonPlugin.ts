import { get, isUndefined, set } from 'lodash';
import {
  ExecutorPlugin,
  RequestAdapterConfig,
  ExecutorContext,
  RequestAdapterResponse
} from '@qlover/fe-utils';

export type ApiCommonPluginConfig = {
  token?: string;
  tokenPrefix?: string;
  /**
   * @default `Authorization`
   */
  authKey?: string;
  defaultHeaders?: Record<string, string>;
  requiredToken?: boolean;
  defaultRequestData?: Record<string, unknown>;

  requestDataSerializer?: (
    data: unknown,
    context: ExecutorContext<RequestAdapterConfig>
  ) => unknown;
};

export class ApiCommonPlugin implements ExecutorPlugin<RequestAdapterConfig> {
  readonly pluginName = 'ApiCommonPlugin';

  constructor(readonly config: ApiCommonPluginConfig = {}) {
    if (config.requiredToken && !config.token) {
      throw new Error('Token is required!');
    }
  }

  onBefore(context: ExecutorContext<RequestAdapterConfig>): void {
    const {
      token,
      tokenPrefix,
      defaultHeaders,
      authKey = 'Authorization',
      defaultRequestData,
      requestDataSerializer
    } = this.config;
    const { parameters } = context;

    // append default headers
    parameters.headers = {
      ...defaultHeaders,
      ...parameters.headers
    };

    // append content type header
    if (parameters.responseType === 'json') {
      parameters.headers['Content-Type'] = 'application/json';
    }

    // append token
    const authValue = tokenPrefix ? `${tokenPrefix} ${token}` : token;
    if (authKey && authValue) {
      parameters.headers[authKey] = authValue;
    }

    // merge defaults request data
    if (defaultRequestData) {
      Object.entries(defaultRequestData).forEach(([key, value]) => {
        const prevValue = get(parameters.data, key);
        if (isUndefined(prevValue)) {
          set(parameters.data as Record<string, unknown>, key, value);
        }
      });
    }

    // serialize request data
    if (requestDataSerializer && parameters.data) {
      parameters.data = requestDataSerializer(parameters.data, context);
    }
  }

  async onSuccess(
    context: ExecutorContext<RequestAdapterConfig>
  ): Promise<void> {
    const { parameters, returnValue } = context;
    const response = (returnValue as RequestAdapterResponse<unknown, Response>)
      .data;

    if (response instanceof Response) {
      switch (parameters.responseType) {
        case 'json':
          context.returnValue = await response.json();
          break;
        case 'text':
          context.returnValue = await response.text();
          break;
        case 'blob':
          context.returnValue = await response.blob();
          break;
        // FIXME: adapter support `arraybuffer`
        // @ts-expect-error
        case 'arrayBuffer':
        case 'arraybuffer':
          context.returnValue = await response.arrayBuffer();
          break;
      }
    }
  }
}
