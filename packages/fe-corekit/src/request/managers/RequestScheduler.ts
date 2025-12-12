import type {
  RequestAdapterResponse,
  RequestAdapterConfig
} from '../interface';
import { RequestManager } from './RequestManager';

/**
 * Represents a scheduler for managing HTTP requests.
 *
 * This class provides a unified API for making HTTP requests with support for plugins,
 * streaming responses, and request cancellation. Future enhancements may include caching,
 * upload/download progress, retries, timeouts, and mock data.
 *
 * @since 1.0.14
 * @example
 *
 * Create a Adapter
 *
 * ```typescript
 * class MockRequestAdapter implements RequestAdapterInterface<any> {
 * config: any;
 *
 * constructor(config: any = {}) {
 *   this.config = config;
 * }
 *
 * getConfig(): any {
 *   return this.config;
 * }
 * async request<Response, Request>(
 *   config: any
 * ): Promise<RequestAdapterResponse<Request, Response>> {
 *   const sendConfig = { ...this.config, ...config };
 *   await new Promise((resolve) => setTimeout(resolve, 1000));
 *
 *   return {
 *     status: 200,
 *     statusText: 'ok',
 *     headers: {},
 *     data: sendConfig.data,
 *     config: sendConfig
 *   };
 * }
 *
 * ```
 *
 * @example
 *
 * Execute a request using the adapter
 *
 * ```typescript
 * const adapter = new MockRequestAdapter();
 * const scheduler = new RequestScheduler();
 * const reqData = 'mock response';
 * const response = await scheduler.request({ url: '/test', data: reqData });
 * // => response.data is 'mock response'
 * ```
 *
 * @template Config - The configuration type extending RequestAdapterConfig.
 */
export class RequestScheduler<
  Config extends RequestAdapterConfig
> extends RequestManager<Config> {
  /**
   * Executes a request with the given configuration.
   *
   * @since 1.0.14
   *
   * @override
   * @param config - The configuration for the request.
   * @returns A promise that resolves to the response of the request.
   */
  public override request<Response, Request>(
    config: RequestAdapterConfig<Request>
  ): Promise<RequestAdapterResponse<Request, Response>> {
    return super.request(config) as Promise<
      RequestAdapterResponse<Request, Response>
    >;
  }

  /**
   * Executes a GET request.
   *
   * @param config - The configuration for the GET request.
   * @returns A promise that resolves to the response of the GET request.
   */
  public async get<Response, Request>(
    url: string,
    config?: RequestAdapterConfig<Request>
  ): Promise<RequestAdapterResponse<Request, Response>> {
    return this.request<Response, Request>({ url, ...config, method: 'GET' });
  }

  /**
   * Executes a POST request.
   *
   * @param config - The configuration for the POST request.
   * @returns A promise that resolves to the response of the POST request.
   */
  public async post<Response, Request>(
    url: string,
    config?: RequestAdapterConfig<Request>
  ): Promise<RequestAdapterResponse<Request, Response>> {
    return this.request<Response, Request>({ url, ...config, method: 'POST' });
  }

  /**
   * Executes a PUT request.
   *
   * @param config - The configuration for the PUT request.
   * @returns A promise that resolves to the response of the PUT request.
   */
  public async put<Response, Request>(
    url: string,
    config?: RequestAdapterConfig<Request>
  ): Promise<RequestAdapterResponse<Request, Response>> {
    return this.request<Response, Request>({ url, ...config, method: 'PUT' });
  }

  /**
   * Executes a DELETE request.
   *
   * @param config - The configuration for the DELETE request.
   * @returns A promise that resolves to the response of the DELETE request.
   */
  public async delete<Response, Request>(
    url: string,
    config?: RequestAdapterConfig<Request>
  ): Promise<RequestAdapterResponse<Request, Response>> {
    return this.request<Response, Request>({
      url,
      ...config,
      method: 'DELETE'
    });
  }

  /**
   * Executes a PATCH request.
   *
   * @param config - The configuration for the PATCH request.
   * @returns A promise that resolves to the response of the PATCH request.
   */
  public async patch<Response, Request>(
    url: string,
    config?: RequestAdapterConfig<Request>
  ): Promise<RequestAdapterResponse<Request, Response>> {
    return this.request<Response, Request>({ url, ...config, method: 'PATCH' });
  }

  /**
   * Executes a HEAD request.
   *
   * @param config - The configuration for the HEAD request.
   * @returns A promise that resolves to the response of the HEAD request.
   */
  public async head<Response, Request>(
    url: string,
    config?: RequestAdapterConfig<Request>
  ): Promise<RequestAdapterResponse<Request, Response>> {
    return this.request<Response, Request>({ url, ...config, method: 'HEAD' });
  }

  /**
   * Executes an OPTIONS request.
   *
   * @param config - The configuration for the OPTIONS request.
   * @returns A promise that resolves to the response of the OPTIONS request.
   */
  public async options<Response, Request>(
    url: string,
    config?: RequestAdapterConfig<Request>
  ): Promise<RequestAdapterResponse<Request, Response>> {
    return this.request<Response, Request>({
      url,
      ...config,
      method: 'OPTIONS'
    });
  }

  /**
   * Executes a TRACE request.
   *
   * @param config - The configuration for the TRACE request.
   * @returns A promise that resolves to the response of the TRACE request.
   */
  public async trace<Response, Request>(
    url: string,
    config?: RequestAdapterConfig<Request>
  ): Promise<RequestAdapterResponse<Request, Response>> {
    return this.request<Response, Request>({ url, ...config, method: 'TRACE' });
  }

  /**
   * Executes a CONNECT request.
   *
   * @param config - The configuration for the CONNECT request.
   * @returns A promise that resolves to the response of the CONNECT request.
   */
  public async connect<Response, Request>(
    url: string,
    config?: RequestAdapterConfig<Request>
  ): Promise<RequestAdapterResponse<Request, Response>> {
    return this.request<Response, Request>({
      url,
      ...config,
      method: 'CONNECT'
    });
  }
}
