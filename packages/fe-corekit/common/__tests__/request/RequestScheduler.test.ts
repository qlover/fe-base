import { describe, it, expect, vi } from 'vitest';
import { RetryPlugin } from '../../executor/plugins';
import {
  RequestError,
  RequestAdapterInterface,
  RequestAdapterResponse,
  RequestAdapterConfig,
  RequestTransaction
} from '../../../interface';
import { RequestScheduler } from '../../request';

class MockRequestAdapter
  implements RequestAdapterInterface<RequestAdapterConfig>
{
  config: RequestAdapterConfig;

  constructor(config: RequestAdapterConfig = {}) {
    this.config = config;
  }

  getConfig(): RequestAdapterConfig {
    return this.config;
  }

  async request<
    Transaction extends RequestTransaction<
      RequestAdapterConfig,
      RequestAdapterResponse<unknown, RequestAdapterConfig>
    >
  >(config: Transaction['request']): Promise<Transaction['response']> {
    const sendConfig = { ...this.config, ...config };
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (sendConfig.url?.includes('/test/fail')) {
      throw new RequestError('Request failed');
    }

    return {
      status: 200,
      statusText: 'ok',
      headers: {},
      data: sendConfig.data as Transaction['response']['data'],
      config: sendConfig,
      response: new Response()
    };
  }
}

describe('RequestScheduler', () => {
  it('should execute a request using the adapter', async () => {
    const adapter = new MockRequestAdapter();
    const scheduler = new RequestScheduler(adapter);
    const reqData = 'mock response';
    const response = await scheduler.request({ url: '/test', data: reqData });

    expect(response.data).toBe(reqData);
  });

  it('should merge configurations correctly', async () => {
    const adapter = new MockRequestAdapter({ data: 'mock response default' });
    const scheduler = new RequestScheduler(adapter);

    const response = await scheduler.request({ url: '/test', method: 'GET' });

    expect(response.data).toBe('mock response default');
  });

  it('should throw an error if the request fails', async () => {
    const adapter = new MockRequestAdapter();
    const scheduler = new RequestScheduler(adapter);

    await expect(
      scheduler.request({ url: '/test/fail', method: 'GET' })
    ).rejects.toThrow();
  });

  it('should return generic type', async () => {
    const adapter = new MockRequestAdapter();
    const scheduler = new RequestScheduler(adapter);

    const response = await scheduler.request({
      url: '/test',
      data: 'string type data'
    });
    expect(typeof response.data === 'string').toBe(true);
  });

  it('should support shortcut method', async () => {
    const adapter = new MockRequestAdapter();
    const scheduler = new RequestScheduler(adapter);
    const response = await scheduler.get('/test', {
      data: 'string type data'
    });
    expect(typeof response.data === 'string').toBe(true);
  });

  it('should support use plugin', async () => {
    const adapter = new MockRequestAdapter();
    const scheduler = new RequestScheduler(adapter);
    const shouldRetry = vi.fn();

    shouldRetry.mockImplementationOnce(() => {
      return true;
    });

    scheduler.usePlugin(
      new RetryPlugin({
        maxRetries: 2,
        retryDelay: 100,
        shouldRetry: shouldRetry
      })
    );

    await expect(scheduler.request({ url: '/test/fail' })).rejects.toThrow();
    expect(shouldRetry).toHaveBeenCalledTimes(2);
  });

  it('should support use plugin with shortcut method', async () => {
    const adapter = new MockRequestAdapter();
    const scheduler = new RequestScheduler(adapter);
    const shouldRetry = vi.fn();

    shouldRetry.mockImplementationOnce(() => {
      return true;
    });

    scheduler.usePlugin(
      new RetryPlugin({
        maxRetries: 2,
        retryDelay: 100,
        shouldRetry: shouldRetry
      })
    );
    await expect(scheduler.get('/test/fail')).rejects.toThrow();
    expect(shouldRetry).toHaveBeenCalledTimes(2);
  });
});
