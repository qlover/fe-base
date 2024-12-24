import { get, isUndefined, set } from 'lodash';
import {
  ExecutorPlugin,
  RequestAdpaterConfig,
  ExecutorContext,
  RequestAdapterResponse
} from 'packages/fe-utils/common';

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
    context: ExecutorContext<RequestAdpaterConfig>
  ) => unknown;
};

export class ApiCommonPlugin
  implements ExecutorPlugin<RequestAdpaterConfig, void>
{
  readonly pluginName = 'ApiCommonPlugin';

  constructor(readonly config: ApiCommonPluginConfig = {}) {
    if (config.requiredToken && !config.token) {
      throw new Error('Token is required!');
    }
  }

  onBefore(context: ExecutorContext<RequestAdpaterConfig>): void {
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

  async onSuccess({
    returnValue,
    parameters
  }: ExecutorContext<RequestAdpaterConfig>): Promise<void> {
    const response = (returnValue as RequestAdapterResponse<unknown, Response>)
      .data;

    if (response instanceof Response) {
      if (parameters.responseType === 'json') {
        returnValue = await response.json();
      }
    }
  }
}
