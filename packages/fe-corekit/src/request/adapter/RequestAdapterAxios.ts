import type {
  RequestAdapterInterface,
  RequestAdapterResponse
} from '../interface';
import type { AxiosInstance, AxiosRequestConfig, AxiosStatic } from 'axios';

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
  private axiosInstance: AxiosInstance;
  constructor(
    axios: AxiosStatic,
    readonly config: AxiosRequestConfig = {}
  ) {
    this.axiosInstance = axios.create(config);
  }

  /**
   * @override
   */
  public getConfig(): AxiosRequestConfig {
    return this.config;
  }

  /**
   * @since 2.4.0
   * @override
   */
  public setConfig(
    config: AxiosRequestConfig | Partial<AxiosRequestConfig>
  ): void {
    Object.assign(this.config, config);
  }

  /**
   * @override
   */
  public async request<Request, Response>(
    config: AxiosRequestConfig<Request>
  ): Promise<RequestAdapterResponse<Request, Response>> {
    return this.axiosInstance.request(config);
  }
}
