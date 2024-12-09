import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  RequestAdapterInterface,
  RequestAdapterResponse
} from './RequestAdapter';

/**
 * Axios request adapter
 *
 * Only base config is supported
 *
 * @since 1.0.14
 */
export class RequestAdapterAxios
  implements RequestAdapterInterface<AxiosRequestConfig>
{
  readonly config: AxiosRequestConfig;
  private axiosInstance: AxiosInstance;

  constructor(config: Partial<AxiosRequestConfig> = {}) {
    this.axiosInstance = axios.create(config);

    this.config = config as AxiosRequestConfig;
  }

  getConfig(): AxiosRequestConfig {
    return this.config;
  }

  async request<Request, Response>(
    config: AxiosRequestConfig<Request>
  ): Promise<RequestAdapterResponse<Request, Response>> {
    return this.axiosInstance.request(config) as unknown as Promise<
      RequestAdapterResponse<Request, Response>
    >;
  }
}
