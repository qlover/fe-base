import {
  RequestAdapterInterface,
  RequestAdapterResponse,
  RequestAdapterConfig,
  ExecutorError,
  ExecutorPlugin,
  RequestErrorID,
  PromiseTask
} from '../../../interface';
import { AsyncExecutor } from '../../executor';
import { merge } from 'merge';
import pick from 'lodash/pick';

/**
 * Request adapter fetch configuration
 *
 * This type defines the configuration options for a request adapter.
 * It includes properties for URL, method, headers, and other request details.
 * The main purpose is to provide a flexible structure for configuring HTTP requests.
 *
 * @since 1.0.14
 */
export type RequestAdapterFetchConfig<Request = unknown> = Omit<
  globalThis.RequestInit,
  'headers'
> &
  RequestAdapterConfig<Request> & {
    fetcher?: typeof fetch;

    onStreamProgress?: (progress: number) => void;

    signal?: AbortSignal;

    onAbort?(config: RequestAdapterFetchConfig): void;
  };

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
  readonly config: RequestAdapterFetchConfig;
  private executor: AsyncExecutor;

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

    // use AsyncExecutor
    this.executor = new AsyncExecutor();

    this.config = config as RequestAdapterFetchConfig;
  }

  getConfig(): RequestAdapterFetchConfig {
    return this.config;
  }

  usePlugin(plugin: ExecutorPlugin): void {
    this.executor.use(plugin);
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
  async request<Request, Response>(
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

    const task: PromiseTask<
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

  parametersToRequest(parameters: RequestAdapterFetchConfig): Request {
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
  toAdapterResponse<Request>(
    data: unknown,
    response: Response,
    config: RequestAdapterFetchConfig<Request>
  ): RequestAdapterResponse<Request> {
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
  getResponseHeaders(response: Response): Record<string, string> {
    const headersObj: Record<string, string> = {};

    response.headers.forEach((value, key) => {
      headersObj[key] = value;
    });
    return headersObj;
  }
}
