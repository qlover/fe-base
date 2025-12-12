import type {
  ExecutorPlugin,
  RequestAdapterConfig,
  ExecutorContext,
  RequestAdapterResponse
} from '@qlover/fe-corekit';

export type RequestCommonPluginConfig = {
  token?: string | (() => string | null);

  /**
   * token prefix.
   *
   * eg. `Bearer xxx`, `Token xxx`
   */
  tokenPrefix?: string;

  /**
   * auth key.
   *
   * - If is `false`, will not append auth header.
   *
   * @default `Authorization`
   */
  authKey?: string | false;

  /**
   * default request headers
   */
  defaultHeaders?: Record<string, string>;

  /**
   * Whether the token is required.
   *
   * if not token provided, throw error.
   *
   * @default `false`
   */
  requiredToken?: boolean;

  /**
   * defualt request data
   */
  defaultRequestData?: Record<string, unknown>;

  /**
   * transform request data before sending.
   *
   * @param data - request data
   * @param context - executor context
   * @returns - request data
   */
  requestDataSerializer?: (
    data: unknown,
    context: ExecutorContext<RequestAdapterConfig>
  ) => unknown;
};

/**
 * Represents a plugin for handling common request configurations and behaviors.
 *
 * The RequestCommonPlugin is designed to manage request headers, token handling,
 * and data serialization before sending requests. It ensures that the necessary
 * configurations are applied to each request, enhancing the flexibility and
 * reusability of request handling in the application.
 *
 * Main functions include:
 * - Appending default headers and token to requests.
 * - Merging default request data with provided parameters.
 * - Serializing request data before sending.
 *
 * @example
 * const plugin = new RequestCommonPlugin({
 *   token: 'your-token',
 *   tokenPrefix: 'Bearer',
 *   defaultHeaders: { 'Custom-Header': 'value' },
 *   requiredToken: true,
 * });
 */
export class RequestCommonPlugin
  implements ExecutorPlugin<RequestAdapterConfig>
{
  public readonly pluginName = 'RequestCommonPlugin';

  constructor(readonly config: RequestCommonPluginConfig = {}) {
    if (config.requiredToken && !config.token) {
      throw new Error('Token is required!');
    }
  }

  /**
   * Safely merges default data with the provided data
   * @param defaultData - The default data to merge
   * @param targetData - The target data to merge into
   * @returns The merged data
   */
  private mergeRequestData(
    defaultData: Record<string, unknown>,
    targetData: unknown
  ): unknown {
    // If target is not an object, return as is
    if (!targetData || typeof targetData !== 'object') {
      return targetData;
    }

    // Handle array case
    if (Array.isArray(targetData)) {
      return targetData;
    }

    // Create a new object to avoid mutations
    const result = { ...(targetData as Record<string, unknown>) };

    // Only merge top-level properties that are explicitly undefined or don't exist
    Object.entries(defaultData).forEach(([key, value]) => {
      if (result[key] === undefined) {
        result[key] = value;
      }
    });

    return result;
  }

  public onBefore(context: ExecutorContext<RequestAdapterConfig>): void {
    const {
      tokenPrefix,
      defaultHeaders,
      authKey = 'Authorization',
      defaultRequestData,
      requestDataSerializer
    } = { ...this.config, ...context.parameters };
    const { parameters } = context;

    // append default headers
    parameters.headers = {
      ...defaultHeaders,
      ...parameters.headers
    };

    // append content type header
    if (
      !parameters.headers['Content-Type'] &&
      parameters.responseType === 'json'
    ) {
      parameters.headers['Content-Type'] = 'application/json';
    }

    // append token
    if (
      authKey &&
      typeof authKey === 'string' &&
      !parameters.headers[authKey]
    ) {
      const authToken = this.getAuthToken(context.parameters);
      if (authToken) {
        const authValue = tokenPrefix
          ? `${tokenPrefix} ${authToken}`
          : authToken;
        parameters.headers[authKey] = authValue;
      }
    }

    // merge defaults request data
    if (defaultRequestData) {
      parameters.data = this.mergeRequestData(
        defaultRequestData,
        parameters.data
      );
    }

    // serialize request data
    if (requestDataSerializer && parameters.data) {
      parameters.data = requestDataSerializer(parameters.data, context);
    }
  }

  public async onSuccess(
    context: ExecutorContext<RequestAdapterConfig>
  ): Promise<void> {
    const { parameters, returnValue } = context;
    const response = (returnValue as RequestAdapterResponse<unknown, Response>)
      .data;

    if (response instanceof Response) {
      switch (parameters.responseType) {
        case 'json':
          (context.returnValue as RequestAdapterResponse).data =
            await response.json();
          break;
        case 'text':
          (context.returnValue as RequestAdapterResponse).data =
            await response.text();
          break;
        case 'blob':
          (context.returnValue as RequestAdapterResponse).data =
            await response.blob();
          break;
        // FIXME: adapter support `arraybuffer`
        // @ts-expect-error
        case 'arrayBuffer':
        case 'arraybuffer':
          (context.returnValue as RequestAdapterResponse).data =
            await response.arrayBuffer();
          break;
      }
    }
  }

  public getAuthToken(mergeConfig?: Partial<RequestAdapterConfig>): string {
    const { token } = { ...this.config, ...mergeConfig };
    return typeof token === 'function' ? (token() ?? '') : (token ?? '');
  }
}
