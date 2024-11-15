import { AsyncExecutor, ExecutorConfig } from '../index';

export type RequestMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'HEAD'
  | 'OPTIONS';

/**
 * predefined request config
 */
export interface RequestConfig {
  url: string;
  method?: RequestMethod;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string>;
  timeout?: number;
  executor?: ExecutorConfig;
  [key: string]: unknown;
}

export class RequestExecutor<Cfg extends RequestConfig> {
  public readonly executor: AsyncExecutor;

  constructor(readonly config: Cfg) {
    this.executor = new AsyncExecutor(config.executor);
  }

  getConfig(): Cfg {
    return this.config;
  }

  /**
   * allow any response type
   * @param config
   */
  async request(config: Cfg): Promise<unknown> {
    throw new Error('Method not implemented.');
  }

  get(options: Cfg): Promise<unknown> {
    return this.request({ ...options, method: 'GET' });
  }

  post(options: Cfg): Promise<unknown> {
    return this.request({ ...options, method: 'POST' });
  }

  put(options: Cfg): Promise<unknown> {
    return this.request({ ...options, method: 'PUT' });
  }

  delete(options: Cfg): Promise<unknown> {
    return this.request({ ...options, method: 'DELETE' });
  }

  patch(options: Cfg): Promise<unknown> {
    return this.request({ ...options, method: 'PATCH' });
  }

  head(options: Cfg): Promise<unknown> {
    return this.request({ ...options, method: 'HEAD' });
  }

  options(options: Cfg): Promise<unknown> {
    return this.request({ ...options, method: 'OPTIONS' });
  }
}
