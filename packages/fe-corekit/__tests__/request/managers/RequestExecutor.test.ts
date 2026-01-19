import {
  RequestAdapterFetch,
  type RequestAdapterFetchConfig
} from '../../../src/request/adapter/RequestAdapterFetch';
import { RequestExecutor } from '../../../src/request/managers/RequestExecutor';
import { LifecycleExecutor } from '../../../src/executor/impl/LifecycleExecutor';
import { type ExecutorContextImpl } from '../../../src/executor/impl/ExecutorContextImpl';

describe('RequestExecutor', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should create executor with adapter', () => {
      const adapter = new RequestAdapterFetch({
        baseURL: 'https://api.example.com'
      });
      const executor = new RequestExecutor(adapter);

      expect(executor).toBeDefined();
    });

    it('should create executor with adapter and lifecycle executor', () => {
      const adapter = new RequestAdapterFetch({
        baseURL: 'https://api.example.com'
      });
      const executor = new RequestExecutor(
        adapter,
        new LifecycleExecutor<ExecutorContextImpl<RequestAdapterFetchConfig>>()
      );

      expect(executor).toBeDefined();
    });
  });

  describe('HTTP Method Shortcuts', () => {
    it('should execute GET request', async () => {
      const adapter = new RequestAdapterFetch({
        baseURL: 'https://api.example.com',
        fetcher: fetchMock
      });
      const executor = new RequestExecutor(adapter);

      const mockResponse = new Response(JSON.stringify({ id: 1 }));
      fetchMock.mockResolvedValueOnce(mockResponse);

      const result = await executor.get('/users');

      expect(fetchMock).toHaveBeenCalled();
      const callArg = fetchMock.mock.calls[0][0];
      expect(callArg).toBeInstanceOf(Request);
      expect(callArg.method).toBe('GET');
      expect(result.status).toBe(200);
    });

    it('should execute POST request with data', async () => {
      const adapter = new RequestAdapterFetch({
        baseURL: 'https://api.example.com',
        fetcher: fetchMock
      });
      const executor = new RequestExecutor(adapter);

      const mockResponse = new Response(JSON.stringify({ id: 1 }));
      fetchMock.mockResolvedValueOnce(mockResponse);

      const requestData = { name: 'John' };
      const result = await executor.post('/users', requestData);

      expect(fetchMock).toHaveBeenCalled();
      const callArg = fetchMock.mock.calls[0][0];
      expect(callArg).toBeInstanceOf(Request);
      expect(callArg.method).toBe('POST');
      expect(result.status).toBe(200);
    });

    it('should execute PUT request with data', async () => {
      const adapter = new RequestAdapterFetch({
        baseURL: 'https://api.example.com',
        fetcher: fetchMock
      });
      const executor = new RequestExecutor(adapter);

      const mockResponse = new Response(JSON.stringify({ id: 1 }));
      fetchMock.mockResolvedValueOnce(mockResponse);

      await executor.put('/users/1', { name: 'Jane' });

      expect(fetchMock).toHaveBeenCalled();
      const callArg = fetchMock.mock.calls[0][0];
      expect(callArg).toBeInstanceOf(Request);
      expect(callArg.method).toBe('PUT');
    });

    it('should execute PATCH request with data', async () => {
      const adapter = new RequestAdapterFetch({
        baseURL: 'https://api.example.com',
        fetcher: fetchMock
      });
      const executor = new RequestExecutor(adapter);

      const mockResponse = new Response(JSON.stringify({ id: 1 }));
      fetchMock.mockResolvedValueOnce(mockResponse);

      await executor.patch('/users/1', { name: 'Jane' });

      expect(fetchMock).toHaveBeenCalled();
      const callArg = fetchMock.mock.calls[0][0];
      expect(callArg).toBeInstanceOf(Request);
      expect(callArg.method).toBe('PATCH');
    });

    it('should execute DELETE request', async () => {
      const adapter = new RequestAdapterFetch({
        baseURL: 'https://api.example.com',
        fetcher: fetchMock
      });
      const executor = new RequestExecutor(adapter);

      const mockResponse = new Response(JSON.stringify({ success: true }));
      fetchMock.mockResolvedValueOnce(mockResponse);

      await executor.delete('/users/1');

      expect(fetchMock).toHaveBeenCalled();
      const callArg = fetchMock.mock.calls[0][0];
      expect(callArg).toBeInstanceOf(Request);
      expect(callArg.method).toBe('DELETE');
    });

    it('should execute HEAD request', async () => {
      const adapter = new RequestAdapterFetch({
        baseURL: 'https://api.example.com',
        fetcher: fetchMock
      });
      const executor = new RequestExecutor(adapter);

      const mockResponse = new Response(null);
      fetchMock.mockResolvedValueOnce(mockResponse);

      await executor.head('/users/1');

      expect(fetchMock).toHaveBeenCalled();
      const callArg = fetchMock.mock.calls[0][0];
      expect(callArg).toBeInstanceOf(Request);
      expect(callArg.method).toBe('HEAD');
    });

    it('should execute OPTIONS request', async () => {
      const adapter = new RequestAdapterFetch({
        baseURL: 'https://api.example.com',
        fetcher: fetchMock
      });
      const executor = new RequestExecutor(adapter);

      const mockResponse = new Response(null);
      fetchMock.mockResolvedValueOnce(mockResponse);

      await executor.options('/users');

      expect(fetchMock).toHaveBeenCalled();
      const callArg = fetchMock.mock.calls[0][0];
      expect(callArg).toBeInstanceOf(Request);
      expect(callArg.method).toBe('OPTIONS');
    });
  });

  describe('Configuration Merging', () => {
    it('should merge adapter config with request config', async () => {
      const adapter = new RequestAdapterFetch({
        baseURL: 'https://api.example.com',
        headers: { Authorization: 'Bearer token' },
        fetcher: fetchMock
      });
      const executor = new RequestExecutor(adapter);

      const mockResponse = new Response(JSON.stringify({ id: 1 }));
      fetchMock.mockResolvedValueOnce(mockResponse);

      await executor.get('/users', {
        headers: { 'X-Custom': 'value' }
      });

      expect(fetchMock).toHaveBeenCalled();
      const callArg = fetchMock.mock.calls[0][0];
      expect(callArg).toBeInstanceOf(Request);
      expect(callArg.headers.get('Authorization')).toBe('Bearer token');
      expect(callArg.headers.get('X-Custom')).toBe('value');
    });

    it('should allow request config to override adapter config', async () => {
      const adapter = new RequestAdapterFetch({
        baseURL: 'https://api.example.com',
        headers: { Authorization: 'Bearer old-token' },
        fetcher: fetchMock
      });
      const executor = new RequestExecutor(adapter);

      const mockResponse = new Response(JSON.stringify({ id: 1 }));
      fetchMock.mockResolvedValueOnce(mockResponse);

      await executor.get('/users', {
        headers: { Authorization: 'Bearer new-token' }
      });

      expect(fetchMock).toHaveBeenCalled();
      const callArg = fetchMock.mock.calls[0][0];
      expect(callArg).toBeInstanceOf(Request);
      expect(callArg.headers.get('Authorization')).toBe('Bearer new-token');
    });
  });

  describe('Plugin System', () => {
    it('should support lifecycle plugins', async () => {
      const adapter = new RequestAdapterFetch({
        baseURL: 'https://api.example.com',
        fetcher: fetchMock
      });
      const executor = new RequestExecutor(
        adapter,
        new LifecycleExecutor<ExecutorContextImpl<RequestAdapterFetchConfig>>()
      );

      const beforeHook = vi.fn();
      const successHook = vi.fn();

      executor.use({
        pluginName: 'test-plugin',
        onBefore: async (ctx) => {
          beforeHook();
          return {
            ...ctx.parameters,
            headers: {
              ...ctx.parameters.headers,
              'X-Custom-Header': 'test'
            }
          };
        },
        onSuccess: async () => {
          successHook();
        }
      });

      const mockResponse = new Response(JSON.stringify({ id: 1 }));
      fetchMock.mockResolvedValueOnce(mockResponse);

      await executor.get('/users');

      expect(beforeHook).toHaveBeenCalled();
      expect(successHook).toHaveBeenCalled();
    });

    it('should execute plugins in registration order', async () => {
      const adapter = new RequestAdapterFetch({
        baseURL: 'https://api.example.com',
        fetcher: fetchMock
      });
      const executor = new RequestExecutor(
        adapter,
        new LifecycleExecutor<ExecutorContextImpl<RequestAdapterFetchConfig>>()
      );

      const executionOrder: string[] = [];

      executor
        .use({
          pluginName: 'plugin1',
          onBefore: async () => {
            executionOrder.push('plugin1-before');
          },
          onSuccess: async () => {
            executionOrder.push('plugin1-success');
          }
        })
        .use({
          pluginName: 'plugin2',
          onBefore: async () => {
            executionOrder.push('plugin2-before');
          },
          onSuccess: async () => {
            executionOrder.push('plugin2-success');
          }
        });

      const mockResponse = new Response(JSON.stringify({ id: 1 }));
      fetchMock.mockResolvedValueOnce(mockResponse);

      await executor.get('/users');

      expect(executionOrder).toEqual([
        'plugin1-before',
        'plugin2-before',
        'plugin1-success',
        'plugin2-success'
      ]);
    });

    it('should allow plugins to modify request config', async () => {
      const adapter = new RequestAdapterFetch({
        baseURL: 'https://api.example.com',
        fetcher: fetchMock
      });
      const executor = new RequestExecutor(
        adapter,
        new LifecycleExecutor<ExecutorContextImpl<RequestAdapterFetchConfig>>()
      );

      executor.use({
        pluginName: 'auth-plugin',
        onBefore: async (ctx) => {
          return {
            ...ctx.parameters,
            headers: {
              ...ctx.parameters.headers,
              Authorization: 'Bearer injected-token'
            }
          };
        }
      });

      const mockResponse = new Response(JSON.stringify({ id: 1 }));
      fetchMock.mockResolvedValueOnce(mockResponse);

      await executor.get('/users');

      expect(fetchMock).toHaveBeenCalled();
      const callArg = fetchMock.mock.calls[0][0];
      expect(callArg).toBeInstanceOf(Request);
      expect(callArg.headers.get('Authorization')).toBe(
        'Bearer injected-token'
      );
    });

    it('should allow plugins to transform response', async () => {
      const adapter = new RequestAdapterFetch({
        baseURL: 'https://api.example.com',
        fetcher: fetchMock
      });
      const executor = new RequestExecutor(
        adapter,
        new LifecycleExecutor<ExecutorContextImpl<RequestAdapterFetchConfig>>()
      );

      executor.use({
        pluginName: 'transform-plugin',
        onExec: async (ctx, task) => {
          const response = await task(ctx);
          return { customData: 'transformed', original: response };
        }
      });

      const mockResponse = new Response(JSON.stringify({ id: 1 }));
      fetchMock.mockResolvedValueOnce(mockResponse);

      const result = await executor.get('/users');

      expect(result).toHaveProperty('customData', 'transformed');
      expect(result).toHaveProperty('original');
    });

    it('should throw error when using plugin without lifecycle executor', () => {
      const adapter = new RequestAdapterFetch({
        baseURL: 'https://api.example.com',
        fetcher: fetchMock
      });
      const executor = new RequestExecutor(adapter);

      expect(() => {
        executor.use({
          pluginName: 'test-plugin',
          onBefore: async () => {}
        });
      }).toThrow('RequestExecutor: Executor is not set');
    });

    it('should handle errors in onBefore hooks', async () => {
      const adapter = new RequestAdapterFetch({
        baseURL: 'https://api.example.com',
        fetcher: fetchMock
      });
      const executor = new RequestExecutor(
        adapter,
        new LifecycleExecutor<ExecutorContextImpl<RequestAdapterFetchConfig>>()
      );

      executor.use({
        pluginName: 'error-plugin',
        onBefore: async () => {
          throw new Error('Plugin error in onBefore hook');
        }
      });

      const mockResponse = new Response(JSON.stringify({ id: 1 }));
      fetchMock.mockResolvedValueOnce(mockResponse);

      await expect(executor.get('/users')).rejects.toThrow(
        'Plugin error in onBefore hook'
      );
    });

    it('should handle errors in onSuccess hooks', async () => {
      const adapter = new RequestAdapterFetch({
        baseURL: 'https://api.example.com',
        fetcher: fetchMock
      });
      const executor = new RequestExecutor(
        adapter,
        new LifecycleExecutor<ExecutorContextImpl<RequestAdapterFetchConfig>>()
      );

      executor.use({
        pluginName: 'error-plugin',
        onSuccess: async () => {
          throw new Error('Plugin error in onSuccess hook');
        }
      });

      const mockResponse = new Response(JSON.stringify({ id: 1 }));
      fetchMock.mockResolvedValueOnce(mockResponse);

      await expect(executor.get('/users')).rejects.toThrow(
        'Plugin error in onSuccess hook'
      );
    });
  });

  describe('Request Method', () => {
    it('should execute request with custom config', async () => {
      const adapter = new RequestAdapterFetch({
        baseURL: 'https://api.example.com',
        fetcher: fetchMock
      });
      const executor = new RequestExecutor(adapter);

      const mockResponse = new Response(JSON.stringify({ id: 1 }));
      fetchMock.mockResolvedValueOnce(mockResponse);

      await executor.request({
        url: '/users',
        method: 'GET',
        headers: { 'X-Custom': 'value' }
      });

      expect(fetchMock).toHaveBeenCalled();
      const callArg = fetchMock.mock.calls[0][0];
      expect(callArg).toBeInstanceOf(Request);
      expect(callArg.method).toBe('GET');
      expect(callArg.headers.get('X-Custom')).toBe('value');
    });

    it('should work without lifecycle executor', async () => {
      const adapter = new RequestAdapterFetch({
        baseURL: 'https://api.example.com',
        fetcher: fetchMock
      });
      const executor = new RequestExecutor(adapter);

      const mockResponse = new Response(JSON.stringify({ id: 1 }));
      fetchMock.mockResolvedValueOnce(mockResponse);

      const result = await executor.request({
        url: '/users',
        method: 'GET'
      });

      expect(result.status).toBe(200);
      expect(fetchMock).toHaveBeenCalled();
    });

    it('should work with lifecycle executor', async () => {
      const adapter = new RequestAdapterFetch({
        baseURL: 'https://api.example.com',
        fetcher: fetchMock
      });
      const executor = new RequestExecutor(
        adapter,
        new LifecycleExecutor<ExecutorContextImpl<RequestAdapterFetchConfig>>()
      );

      const mockResponse = new Response(JSON.stringify({ id: 1 }));
      fetchMock.mockResolvedValueOnce(mockResponse);

      const result = await executor.request({
        url: '/users',
        method: 'GET'
      });

      expect(result.status).toBe(200);
      expect(fetchMock).toHaveBeenCalled();
    });
  });

  describe('Method Chaining', () => {
    it('should support chaining use() calls', () => {
      const adapter = new RequestAdapterFetch({
        baseURL: 'https://api.example.com',
        fetcher: fetchMock
      });
      const executor = new RequestExecutor(
        adapter,
        new LifecycleExecutor<ExecutorContextImpl<RequestAdapterFetchConfig>>()
      );

      const result = executor
        .use({
          pluginName: 'plugin1',
          onBefore: async () => {}
        })
        .use({
          pluginName: 'plugin2',
          onBefore: async () => {}
        })
        .use({
          pluginName: 'plugin3',
          onBefore: async () => {}
        });

      expect(result).toBe(executor);
    });
  });
});
