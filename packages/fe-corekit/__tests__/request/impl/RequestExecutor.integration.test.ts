import {
  RequestAdapterFetch,
  type RequestAdapterFetchConfig
} from '../../../src/request/adapter/RequestAdapterFetch';
import { RequestExecutor } from '../../../src/request/impl/RequestExecutor';
import { LifecycleExecutor } from '../../../src/executor/impl/LifecycleExecutor';
import { type ExecutorContextImpl } from '../../../src/executor/impl/ExecutorContextImpl';
import { ExecutorError } from '../../../src/executor/interface';

/**
 * Integration test simulating AppUserApi.login scenario
 *
 * This test simulates the exact scenario described:
 * - GatewayExecutor calls a method that uses RequestExecutor
 * - RequestExecutor's onSuccess checks response and throws error if success: false
 * - We verify that RequestExecutor's onError is triggered
 */
describe('RequestExecutor Integration Test - AppUserApi.login Scenario', () => {
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

  it('should trigger RequestExecutor onError when onSuccess throws error', async () => {
    // Setup: Create RequestExecutor with AppApiPlugin-like behavior
    const adapter = new RequestAdapterFetch({
      baseURL: 'https://api.example.com',
      fetcher: fetchMock
    });

    const requestExecutor = new RequestExecutor(
      adapter,
      new LifecycleExecutor<ExecutorContextImpl<RequestAdapterFetchConfig>>()
    );

    // Track hook executions
    const hookExecutions: string[] = [];

    // Plugin 1: Simulates AppApiPlugin behavior
    requestExecutor.use({
      pluginName: 'AppApiPlugin',
      onSuccess: async (ctx) => {
        hookExecutions.push('AppApiPlugin.onSuccess');

        const response = ctx.returnValue as any;

        // Parse response body
        let jsonData;
        if (response?.data instanceof Response) {
          const clonedResponse = response.data.clone();
          jsonData = await clonedResponse.json();
        } else {
          jsonData = response;
        }

        // Check for API error and throw
        if (jsonData?.success === false) {
          throw new Error(jsonData.message || jsonData.id);
        }
      },
      onError: async (ctx) => {
        hookExecutions.push('AppApiPlugin.onError');

        // Log error for debugging
        console.log('AppApiPlugin.onError triggered:', ctx.error);
      }
    });

    // Plugin 2: Additional plugin to verify error propagation
    requestExecutor.use({
      pluginName: 'LoggerPlugin',
      onError: async (ctx) => {
        hookExecutions.push('LoggerPlugin.onError');
        console.log('LoggerPlugin.onError triggered:', ctx.error);
      }
    });

    // Mock failed API response
    const mockResponse = new Response(
      JSON.stringify({
        success: false,
        id: 'LOGIN_FAILED',
        message: 'Invalid credentials'
      }),
      { status: 200 }
    );
    fetchMock.mockResolvedValueOnce(mockResponse);

    // Execute: Simulate AppUserApi.login call
    try {
      await requestExecutor.post('/user/login', {
        username: 'test',
        password: 'wrong'
      });

      // Should not reach here
      expect.fail('Expected request to throw error');
    } catch (error) {
      // Verify error was thrown
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain('Invalid credentials');
    }

    // Verify: Check that hooks were executed in correct order
    expect(hookExecutions).toEqual([
      'AppApiPlugin.onSuccess', // onSuccess runs first
      'AppApiPlugin.onError', // onError triggered after onSuccess throws
      'LoggerPlugin.onError' // Second plugin's onError also triggered
    ]);

    console.log('Hook execution order:', hookExecutions);
  });

  it('should handle nested executor scenario (GatewayExecutor -> RequestExecutor)', async () => {
    // Setup: Create RequestExecutor (inner executor)
    const adapter = new RequestAdapterFetch({
      baseURL: 'https://api.example.com',
      fetcher: fetchMock
    });

    const requestExecutor = new RequestExecutor(
      adapter,
      new LifecycleExecutor<ExecutorContextImpl<RequestAdapterFetchConfig>>()
    );

    // Track hook executions
    const hookExecutions: string[] = [];

    // RequestExecutor plugin
    requestExecutor.use({
      pluginName: 'AppApiPlugin',
      onSuccess: async (ctx) => {
        hookExecutions.push('RequestExecutor.onSuccess');

        const response = ctx.returnValue as any;
        let jsonData;
        if (response?.data instanceof Response) {
          const clonedResponse = response.data.clone();
          jsonData = await clonedResponse.json();
        } else {
          jsonData = response;
        }

        if (jsonData?.success === false) {
          throw new Error(jsonData.message || jsonData.id);
        }
      },
      onError: async () => {
        hookExecutions.push('RequestExecutor.onError');
      }
    });

    // Create outer executor (simulating GatewayExecutor)
    const gatewayExecutor = new LifecycleExecutor();

    // GatewayExecutor plugin
    gatewayExecutor.use({
      pluginName: 'GatewayPlugin',
      onError: async () => {
        hookExecutions.push('GatewayExecutor.onError');
      }
    });

    // Mock failed API response
    const mockResponse = new Response(
      JSON.stringify({
        success: false,
        id: 'LOGIN_FAILED',
        message: 'Invalid credentials'
      }),
      { status: 200 }
    );
    fetchMock.mockResolvedValueOnce(mockResponse);

    // Execute: Simulate nested execution
    try {
      await gatewayExecutor.exec({}, async () => {
        // This simulates calling gateway.login() which internally uses requestExecutor
        return await requestExecutor.post('/user/login', {
          username: 'test',
          password: 'wrong'
        });
      });

      expect.fail('Expected request to throw error');
    } catch (error) {
      expect(error).toBeInstanceOf(ExecutorError);
    }

    // Verify: Both executors' onError should be triggered
    expect(hookExecutions).toContain('RequestExecutor.onSuccess');
    expect(hookExecutions).toContain('RequestExecutor.onError');
    expect(hookExecutions).toContain('GatewayExecutor.onError');

    console.log('Nested executor hook execution order:', hookExecutions);
  });

  it('should demonstrate that onError is always triggered when onSuccess throws', async () => {
    const adapter = new RequestAdapterFetch({
      baseURL: 'https://api.example.com',
      fetcher: fetchMock
    });

    const requestExecutor = new RequestExecutor(
      adapter,
      new LifecycleExecutor<ExecutorContextImpl<RequestAdapterFetchConfig>>()
    );

    let onErrorCalled = false;
    let onSuccessCalled = false;

    requestExecutor.use({
      pluginName: 'TestPlugin',
      onSuccess: async () => {
        onSuccessCalled = true;
        throw new Error('Error from onSuccess');
      },
      onError: async () => {
        onErrorCalled = true;
      }
    });

    const mockResponse = new Response(JSON.stringify({ data: 'test' }));
    fetchMock.mockResolvedValueOnce(mockResponse);

    try {
      await requestExecutor.get('/test');
      expect.fail('Should throw error');
    } catch {
      // Expected
    }

    // CRITICAL ASSERTION: onError MUST be called when onSuccess throws
    expect(onSuccessCalled).toBe(true);
    expect(onErrorCalled).toBe(true);
  });
});
