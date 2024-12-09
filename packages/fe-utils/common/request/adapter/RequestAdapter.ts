export type RequestAdpaterConfig<D = any> = {
  /**
   * Request URL path
   * Will be combined with baseURL if provided
   *
   * Processed by FetchURLPlugin during request
   *
   * @todo Change to URL | Request, add attribute `input`
   */
  url?: string;
  /**
   * HTTP request methods supported by the executor
   * Follows standard HTTP method definitions
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
   */
  method?: string;

  /**
   * Base URL for all requests
   * Will be prepended to the request URL
   *
   * @example
   * ```typescript
   * baseURL: 'https://api.example.com'
   * // url = /users/1 => https://api.example.com/users/1
   * // url = users/1 => https://api.example.com/users/1
   * ```
   */
  baseURL?: string;

  /**
   * Request body data
   */
  data?: D;

  /**
   * URL query parameters
   * Will be serialized and appended to the URL
   */
  params?: Record<string, unknown>;

  /**
   * Request headers
   */
  headers?: { [key: string]: unknown };

  /**
   * Response type
   */
  responseType?:
    | 'arraybuffer'
    | 'blob'
    | 'document'
    | 'json'
    | 'text'
    | 'stream'
    | 'formdata';

  [key: string]: any;
};

export type RequestAdapterResponse<Req = any, Res = unknown> = {
  data: Res;
  status: number;
  statusText: string;
  headers: { [key: string]: unknown };
  config: RequestAdpaterConfig<Req>;

  [key: string]: unknown;
};

export interface RequestAdapterInterface<Config extends RequestAdpaterConfig> {
  readonly config: Config;

  request<Request, Response>(
    options: RequestAdpaterConfig<Request>
  ): Promise<RequestAdapterResponse<Request, Response>>;

  getConfig: () => Config;
}
