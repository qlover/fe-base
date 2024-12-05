import { AsyncExecutor, ExecutorPlugin } from '../executor';
import {
  RequestAdapterInterface,
  RequestAdapterResponse,
  RequestAdpaterConfig,
  RequestSchedulerInterface
} from '../interface';
import merge from 'lodash/merge';

export class RequestScheduler<Config extends RequestAdpaterConfig>
  implements RequestSchedulerInterface<Config>
{
  readonly executor: AsyncExecutor;

  constructor(readonly adapter: RequestAdapterInterface<Config>) {
    this.executor = new AsyncExecutor();
  }

  usePlugin(plugin: ExecutorPlugin): this {
    this.executor.use(plugin);
    return this;
  }

  async request<Request, Response>(
    config: RequestAdpaterConfig<Request>
  ): Promise<RequestAdapterResponse<Response, Request>> {
    const thisConfig = this.adapter.getConfig();
    const mergedConfig = merge({}, thisConfig, config);
    return this.executor.exec(
      mergedConfig,
      () =>
        this.adapter.request<Request, Response>(
          mergedConfig
        ) as unknown as Promise<RequestAdapterResponse<Response, Request>>
    );
  }

  async get<Request, Response>(
    config: RequestAdpaterConfig<Request>
  ): Promise<RequestAdapterResponse<Response, Request>> {
    return this.request<Request, Response>({ ...config, method: 'GET' });
  }

  async post<Request, Response>(
    config: RequestAdpaterConfig<Request>
  ): Promise<RequestAdapterResponse<Response, Request>> {
    return this.request<Request, Response>({ ...config, method: 'POST' });
  }

  async put<Request, Response>(
    config: RequestAdpaterConfig<Request>
  ): Promise<RequestAdapterResponse<Response, Request>> {
    return this.request<Request, Response>({ ...config, method: 'PUT' });
  }

  async delete<Request, Response>(
    config: RequestAdpaterConfig<Request>
  ): Promise<RequestAdapterResponse<Response, Request>> {
    return this.request<Request, Response>({ ...config, method: 'DELETE' });
  }

  async patch<Request, Response>(
    config: RequestAdpaterConfig<Request>
  ): Promise<RequestAdapterResponse<Response, Request>> {
    return this.request<Request, Response>({ ...config, method: 'PATCH' });
  }

  async head<Request, Response>(
    config: RequestAdpaterConfig<Request>
  ): Promise<RequestAdapterResponse<Response, Request>> {
    return this.request<Request, Response>({ ...config, method: 'HEAD' });
  }

  async options<Request, Response>(
    config: RequestAdpaterConfig<Request>
  ): Promise<RequestAdapterResponse<Response, Request>> {
    return this.request<Request, Response>({ ...config, method: 'OPTIONS' });
  }

  async trace<Request, Response>(
    config: RequestAdpaterConfig<Request>
  ): Promise<RequestAdapterResponse<Response, Request>> {
    return this.request<Request, Response>({ ...config, method: 'TRACE' });
  }

  async connect<Request, Response>(
    config: RequestAdpaterConfig<Request>
  ): Promise<RequestAdapterResponse<Response, Request>> {
    return this.request<Request, Response>({ ...config, method: 'CONNECT' });
  }
}
