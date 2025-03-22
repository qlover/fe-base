import { AxiosInstance, AxiosRequestConfig, AxiosStatic } from 'axios';
import {
  RequestAdapterInterface,
  RequestAdapterResponse,
  RequestTransaction
} from '../../../interface';

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

  getConfig(): AxiosRequestConfig {
    return this.config;
  }

  async request<
    Transaction extends RequestTransaction<
      AxiosRequestConfig<unknown>,
      RequestAdapterResponse<unknown, unknown>
    >
  >(config: Transaction['request']): Promise<Transaction['response']> {
    return this.axiosInstance.request(config);
  }
}
