import {
  RequestAdapterFetch,
  type RequestAdapterFetchConfig
} from '../../../src/request/adapter/RequestAdapterFetch';
import { RequestExecutor } from '../../../src/request/impl/RequestExecutor';
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

    it('should trigger onError when onSuccess throws error (simulating AppUserApi.login scenario)', async () => {
      const adapter = new RequestAdapterFetch({
        baseURL: 'https://api.example.com',
        fetcher: fetchMock
      });
      const executor = new RequestExecutor(
        adapter,
        new LifecycleExecutor<ExecutorContextImpl<RequestAdapterFetchConfig>>()
      );

      const onErrorMock = vi.fn();
      const onSuccessMock = vi.fn();

      // First plugin: simulates AppApiPlugin behavior
      // When response has success: false, throw error in onSuccess
      executor.use({
        pluginName: 'app-api-plugin',
        onSuccess: async (ctx) => {
          onSuccessMock();

          // Need to parse the response body first
          const response = ctx.returnValue as any;

          // For fetch adapter, response.data is a Response object
          // We need to parse it to get the JSON
          let jsonData;
          if (response?.data instanceof Response) {
            const clonedResponse = response.data.clone();
            jsonData = await clonedResponse.json();
          } else {
            jsonData = response;
          }

          // Simulate checking for API error response
          if (jsonData?.success === false) {
            throw new Error(jsonData.message || 'API Error');
          }
        },
        onError: async (ctx) => {
          onErrorMock(ctx.error);
        }
      });

      // Mock a failed API response (success: false)
      const mockResponse = new Response(
        JSON.stringify({
          success: false,
          id: 'LOGIN_FAILED',
          message: 'Invalid credentials'
        }),
        { status: 200 }
      );
      fetchMock.mockResolvedValueOnce(mockResponse);

      // Execute request and expect it to throw
      await expect(
        executor.post('/user/login', {
          username: 'test',
          password: 'wrong'
        })
      ).rejects.toThrow('Invalid credentials');

      // Verify that onSuccess was called
      expect(onSuccessMock).toHaveBeenCalledTimes(1);

      // CRITICAL: Verify that onError was also triggered
      expect(onErrorMock).toHaveBeenCalledTimes(1);
      expect(onErrorMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid credentials'
        })
      );
    });

    it('should trigger onError in second plugin when first plugin onSuccess throws', async () => {
      const adapter = new RequestAdapterFetch({
        baseURL: 'https://api.example.com',
        fetcher: fetchMock
      });
      const executor = new RequestExecutor(
        adapter,
        new LifecycleExecutor<ExecutorContextImpl<RequestAdapterFetchConfig>>()
      );

      const firstPluginOnError = vi.fn();
      const secondPluginOnError = vi.fn();

      // First plugin throws error in onSuccess
      executor.use({
        pluginName: 'first-plugin',
        onSuccess: async (ctx) => {
          const response = ctx.returnValue as any;

          // Parse response if it's a Response object
          let jsonData;
          if (response?.data instanceof Response) {
            const clonedResponse = response.data.clone();
            jsonData = await clonedResponse.json();
          } else {
            jsonData = response;
          }

          if (jsonData?.success === false) {
            throw new Error('First plugin error');
          }
        },
        onError: async (ctx) => {
          firstPluginOnError(ctx.error);
        }
      });

      // Second plugin should also receive the error
      executor.use({
        pluginName: 'second-plugin',
        onError: async (ctx) => {
          secondPluginOnError(ctx.error);
        }
      });

      const mockResponse = new Response(JSON.stringify({ success: false }), {
        status: 200
      });
      fetchMock.mockResolvedValueOnce(mockResponse);

      await expect(executor.get('/test')).rejects.toThrow('First plugin error');

      // Both plugins' onError should be triggered
      expect(firstPluginOnError).toHaveBeenCalledTimes(1);
      expect(secondPluginOnError).toHaveBeenCalledTimes(1);
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
