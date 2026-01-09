import {
  ExecutorAsyncTask,
  ExecutorContextInterface,
  ExecutorError,
  LifecycleExecutor,
  LifecyclePluginInterface
} from '../../executor';
import {
  type RequestAdapterConfig,
  type RequestAdapterInterface,
  type RequestAdapterResponse,
  RequestErrorID
} from '../interface';
import { merge, pick } from 'lodash-es';

/**
 * Request adapter fetch configuration
 *
 * This type defines the configuration options for a request adapter.
 * It includes properties for URL, method, headers, and other request details.
 * The main purpose is to provide a flexible structure for configuring HTTP requests.
 *
 * @since 1.0.14
 */
export interface RequestAdapterFetchConfig<Request = unknown>
  extends RequestAdapterConfig<Request>,
    Omit<globalThis.RequestInit, 'headers'> {
  /**
   * The fetcher function
   *
   * You can override the default fetch function
   *
   * Some environments may not have a global fetch function, or you may want to override the default fetch logic.
   *
   * @example
   * ```typescript
   * const fetchRequest = new FetchRequest({ fetcher: customFetch });
   * ```
   *
   * @example Or configure it for each request
   * ```typescript
   * const fetchRequest = new FetchRequest();
   * fetchRequest.request({ url: '/data', fetcher: customFetch });
   * ```
   */
  fetcher?: typeof fetch;
}

export type RequestAdapterFetchContext = ExecutorContextInterface<
  RequestAdapterFetchConfig,
  unknown
>;

const reqInitAttrs = [
  'cache',
  'credentials',
  'headers',
  'integrity',
  'keepalive',
  'mode',
  'priority',
  'redirect',
  'referrer',
  'referrerPolicy',
  'signal'
];
export class RequestAdapterFetch
  implements RequestAdapterInterface<RequestAdapterFetchConfig>
{
  /**
   * Default configuration for the request adapter
   */
  public readonly config: RequestAdapterFetchConfig;

  /**
   * Allows extending RequestAdapterFetch to get the executor instance
   */
  protected executor: LifecycleExecutor<RequestAdapterFetchContext>;

  /**
   * Creates a new FetchRequest instance
   * Automatically detects and configures fetch implementation
   *
   * - Core Idea: Simplify HTTP requests with built-in fetch support.
   * - Main Function: Initialize fetch requests with optional configuration.
   * - Main Purpose: Provide a flexible and extensible HTTP request utility.
   *
   * @param config - Request configuration options
   * @throws {FetchRequestError} When fetch is not available
   *
   * @example
   * ```typescript
   * const fetchRequest = new FetchRequest({ baseURL: 'https://api.example.com' });
   * ```
   */
  constructor(config: Partial<RequestAdapterFetchConfig> = {}) {
    if (!config.fetcher) {
      if (typeof fetch !== 'function') {
        throw new ExecutorError(RequestErrorID.ENV_FETCH_NOT_SUPPORT);
      }

      config.fetcher = fetch;
    }

    this.executor = new LifecycleExecutor<RequestAdapterFetchContext>();

    this.config = config as RequestAdapterFetchConfig;
  }

  /**
   * @override
   */
  public getConfig(): RequestAdapterFetchConfig {
    return this.config;
  }

  /**
   * @since 2.4.0
   * @override
   */
  public setConfig(
    config: RequestAdapterFetchConfig | Partial<RequestAdapterFetchConfig>
  ): void {
    Object.assign(this.config, config);
  }

  /**
   *
   * @deprecated use `use` method instead
   * @param plugin
   */
  public usePlugin(
    plugin: LifecyclePluginInterface<RequestAdapterFetchContext>
  ): this {
    return this.use(plugin);
  }

  /**
   * Adds a plugin to the executor.
   *
   * @example Chaining usage
   * ```typescript
   * const fetchRequest = new FetchRequest()
   *   .use(new LogPlugin())
   *   .use(new ErrorPlugin())
   *   .use(new SuccessPlugin())
   * ```
   *
   * @since 3.0.0
   * @param plugin - The plugin to be used by the executor.
   * @returns The current instance of RequestAdapterFetch for chaining.
   */
  public use(
    plugin: LifecyclePluginInterface<RequestAdapterFetchContext>
  ): this {
    this.executor.use(plugin);

    return this;
  }

  /**
   * Core request implementation
   * Merges configurations and executes fetch request
   *
   * - Core Idea: Execute HTTP requests with merged configurations.
   * - Main Function: Perform fetch requests using provided configurations.
   * - Main Purpose: Facilitate HTTP communication with error handling.
   *
   * @override
   * @param config - Request configuration
   * @returns Promise resolving to Response object
   * @throws {FetchRequestError} When fetcher is not available
   *
   * @example
   * ```typescript
   * const response = await fetchRequest.request({ url: '/data' });
   * ```
   */
  public async request<Request, Response>(
    config: RequestAdapterFetchConfig<Request>
  ): Promise<RequestAdapterResponse<Request, Response>> {
    const thisConfig = this.getConfig();
    const mergedConfig = merge(
      {},
      thisConfig,
      config
    ) as RequestAdapterFetchConfig<Request>;
    const { fetcher, ...rest } = mergedConfig;

    if (typeof fetcher !== 'function') {
      throw new ExecutorError(RequestErrorID.FETCHER_NONE);
    }

    if (!rest.url) {
      throw new ExecutorError(RequestErrorID.URL_NONE);
    }

    const task: ExecutorAsyncTask<
      RequestAdapterResponse<Request, Response>,
      RequestAdapterFetchConfig<Request>
    > = async (context) => {
      const response = await fetcher(
        this.parametersToRequest(context.parameters)
      );

      const result = this.toAdapterResponse(
        response,
        response,
        context.parameters
      );

      return result as RequestAdapterResponse<Request, Response>;
    };

    return this.executor.exec(rest, task);
  }

  protected parametersToRequest(
    parameters: RequestAdapterFetchConfig
  ): Request {
    const { url = '/', method = 'GET', data } = parameters;
    const init = pick(parameters, reqInitAttrs);
    return new Request(
      url,
      Object.assign(init, {
        // FIXME: data is unknown type
        body: data as BodyInit,
        method: method.toUpperCase()
      })
    );
  }

  /**
   * Converts the raw fetch response into a standardized adapter response.
   *
   * @param data The data extracted from the response based on the response type.
   * @param response The original fetch Response object.
   * @param config The configuration used for the fetch request.
   * @returns A RequestAdapterResponse containing the processed response data.
   */
  protected toAdapterResponse<Request, Res = unknown>(
    data: Res,
    response: Response,
    config: RequestAdapterFetchConfig<Request>
  ): RequestAdapterResponse<Request, Res> {
    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: this.getResponseHeaders(response),
      config,
      response
    };
  }

  /**
   * Extracts headers from the fetch Response object and returns them as a record.
   *
   * @param response The fetch Response object from which headers are extracted.
   * @returns A record of headers with header names as keys and header values as values.
   */
  protected getResponseHeaders(response: Response): Record<string, string> {
    const headersObj: Record<string, string> = {};

    response.headers.forEach((value, key) => {
      headersObj[key] = value;
    });
    return headersObj;
  }
}
