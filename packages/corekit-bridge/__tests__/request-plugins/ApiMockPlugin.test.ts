import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ApiMockPlugin,
  type MockDataJson,
  type ApiMockPluginContext
} from '../../src/core/request-plugins/ApiMockPlugin';
import type { LoggerInterface } from '@qlover/logger';
import { ThreadUtil } from '../../src/core/thread/ThreadUtil';

type MockPluginParams = ApiMockPluginContext['parameters'];

/**
 * Mock logger implementation for testing
 */
class MockLogger implements LoggerInterface {
  public log = vi.fn();
  public fatal = vi.fn();
  public trace = vi.fn();
  public debug = vi.fn();
  public info = vi.fn();
  public warn = vi.fn();
  public error = vi.fn();
  public addAppender = vi.fn();
  /**
   * @override
   */
  public context<Value>(value?: Value): {
    log: ReturnType<typeof vi.fn>;
    fatal: ReturnType<typeof vi.fn>;
    trace: ReturnType<typeof vi.fn>;
    debug: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    value?: Value;
  } {
    return {
      log: vi.fn(),
      fatal: vi.fn(),
      trace: vi.fn(),
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      value
    };
  }
}

describe('ApiMockPlugin', () => {
  let plugin: ApiMockPlugin;
  let mockLogger: MockLogger;
  let mockContext: ApiMockPluginContext;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogger = new MockLogger();
    mockContext = {
      parameters: {
        method: 'GET',
        url: '/api/test',
        headers: {}
      },
      hooksRuntimes: {}
    };
  });

  describe('Plugin Initialization', () => {
    it('should create plugin with mockData and logger', () => {
      const mockDataJson: MockDataJson = {
        '/api/test': { data: 'test' },
        _default: { error: 'Not found' }
      };
      plugin = new ApiMockPlugin({
        mockData: mockDataJson,
        logger: mockLogger
      });

      expect(plugin.pluginName).toBe('ApiMockPlugin');
    });

    it('should create plugin with only mockData', () => {
      const mockDataJson: MockDataJson = {
        _default: { error: 'Not found' }
      };
      plugin = new ApiMockPlugin({
        mockData: mockDataJson
      });

      expect(plugin.pluginName).toBe('ApiMockPlugin');
    });

    it('should create plugin with mockDelay option', () => {
      const mockDataJson: MockDataJson = {
        _default: { error: 'Not found' }
      };
      plugin = new ApiMockPlugin({
        mockData: mockDataJson,
        mockDelay: 500,
        logger: mockLogger
      });

      expect(plugin.pluginName).toBe('ApiMockPlugin');
    });
  });

  describe('enabled', () => {
    it('should return true when disabledMock is false', () => {
      const mockDataJson: MockDataJson = { _default: {} };
      plugin = new ApiMockPlugin({
        mockData: mockDataJson,
        logger: mockLogger
      });

      mockContext.parameters.disabledMock = false;
      const result = plugin.enabled('onExec', mockContext);

      expect(result).toBe(true);
    });

    it('should return true when disabledMock is undefined', () => {
      const mockDataJson: MockDataJson = { _default: {} };
      plugin = new ApiMockPlugin({
        mockData: mockDataJson,
        logger: mockLogger
      });

      mockContext.parameters.disabledMock = undefined;
      const result = plugin.enabled('onExec', mockContext);

      expect(result).toBe(true);
    });

    it('should return false when disabledMock is true', () => {
      const mockDataJson: MockDataJson = { _default: {} };
      plugin = new ApiMockPlugin({
        mockData: mockDataJson,
        logger: mockLogger
      });

      mockContext.parameters.disabledMock = true;
      const result = plugin.enabled('onExec', mockContext);

      expect(result).toBe(false);
    });

    it('should return true when context is undefined', () => {
      const mockDataJson: MockDataJson = { _default: {} };
      plugin = new ApiMockPlugin({
        mockData: mockDataJson,
        logger: mockLogger
      });

      const result = plugin.enabled('onExec', undefined);

      expect(result).toBe(true);
    });
  });

  describe('onExec', () => {
    let sleepSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      sleepSpy = vi
        .spyOn(ThreadUtil, 'sleep')
        .mockResolvedValue(undefined) as ReturnType<typeof vi.spyOn>;
    });

    describe('Mock Data Matching', () => {
      it('should match mock data using method + url format', async () => {
        const mockDataJson: MockDataJson = {
          'GET /api/users': { users: [] },
          'POST /api/users': { success: true },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.url = '/api/users';
        mockContext.parameters.method = 'GET';

        const result = await plugin.onExec(mockContext);

        expect(result.data).toEqual({ users: [] });
      });

      it('should match mock data using method + url format for POST request', async () => {
        const mockDataJson: MockDataJson = {
          'POST /api/users': { success: true, id: 123 },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.url = '/api/users';
        mockContext.parameters.method = 'POST';

        const result = await plugin.onExec(mockContext);

        expect(result.data).toEqual({ success: true, id: 123 });
      });

      it('should use default mock data when no match found', async () => {
        const mockDataJson: MockDataJson = {
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.url = '/api/unknown';
        mockContext.parameters.method = 'GET';

        const result = await plugin.onExec(mockContext);

        expect(result.data).toEqual({ error: 'Not found' });
      });

      it('should prioritize method + full URL match over method + URL path match', async () => {
        const mockDataJson: MockDataJson = {
          'GET https://api.example.com/api/test': {
            priority: 'method-full-url'
          },
          'GET /api/test': { priority: 'method-url-path' },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.baseURL = 'https://api.example.com';
        mockContext.parameters.url = '/api/test';
        mockContext.parameters.method = 'GET';

        const result = await plugin.onExec(mockContext);

        expect(result.data).toEqual({ priority: 'method-full-url' });
      });

      it('should match mock data using method + full URL (baseURL + url)', async () => {
        const mockDataJson: MockDataJson = {
          'GET https://api.example.com/api/users': {
            users: [{ id: 1, name: 'User 1' }]
          },
          'GET https://api2.example.com/api/users': {
            users: [{ id: 2, name: 'User 2' }]
          },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.baseURL = 'https://api.example.com';
        mockContext.parameters.url = '/api/users';
        mockContext.parameters.method = 'GET';

        const result = await plugin.onExec(mockContext);

        expect(result.data).toEqual({ users: [{ id: 1, name: 'User 1' }] });
      });

      it('should distinguish same URL path with different baseURL', async () => {
        const mockDataJson: MockDataJson = {
          'GET https://api.example.com/api/users': {
            source: 'api1',
            users: []
          },
          'GET https://api2.example.com/api/users': {
            source: 'api2',
            users: [{ id: 1 }]
          },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        // Test first baseURL
        mockContext.parameters.baseURL = 'https://api.example.com';
        mockContext.parameters.url = '/api/users';
        mockContext.parameters.method = 'GET';
        let result = await plugin.onExec(mockContext);
        expect(result.data).toEqual({ source: 'api1', users: [] });

        // Test second baseURL
        mockContext.parameters.baseURL = 'https://api2.example.com';
        result = await plugin.onExec(mockContext);
        expect(result.data).toEqual({ source: 'api2', users: [{ id: 1 }] });
      });

      it('should match mock data using method + full URL format', async () => {
        const mockDataJson: MockDataJson = {
          'GET https://api.example.com/api/users': { users: [{ id: 1 }] },
          'POST https://api.example.com/api/users': { success: true, id: 123 },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.baseURL = 'https://api.example.com';
        mockContext.parameters.url = '/api/users';
        mockContext.parameters.method = 'POST';

        const result = await plugin.onExec(mockContext);

        expect(result.data).toEqual({ success: true, id: 123 });
      });

      it('should prioritize method + full URL match over method + URL path match', async () => {
        const mockDataJson: MockDataJson = {
          'GET https://api.example.com/api/users': {
            priority: 'method-full-url'
          },
          'GET /api/users': { priority: 'method-url-path' },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.baseURL = 'https://api.example.com';
        mockContext.parameters.url = '/api/users';
        mockContext.parameters.method = 'GET';

        const result = await plugin.onExec(mockContext);

        expect(result.data).toEqual({ priority: 'method-full-url' });
      });

      it('should handle baseURL without trailing slash and url with leading slash', async () => {
        const mockDataJson: MockDataJson = {
          'GET https://api.example.com/api/users': { users: [] },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.baseURL = 'https://api.example.com';
        mockContext.parameters.url = '/api/users';
        mockContext.parameters.method = 'GET';

        const result = await plugin.onExec(mockContext);

        expect(result.data).toEqual({ users: [] });
      });

      it('should handle baseURL with trailing slash and url without leading slash', async () => {
        const mockDataJson: MockDataJson = {
          'GET https://api.example.com/api/users': { users: [] },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.baseURL = 'https://api.example.com/';
        mockContext.parameters.url = 'api/users';
        mockContext.parameters.method = 'GET';

        const result = await plugin.onExec(mockContext);

        expect(result.data).toEqual({ users: [] });
      });

      it('should fallback to method + URL path match when method + full URL match not found', async () => {
        const mockDataJson: MockDataJson = {
          'GET /api/users': { users: [{ id: 1 }] },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.baseURL = 'https://api.example.com';
        mockContext.parameters.url = '/api/users';
        mockContext.parameters.method = 'GET';

        const result = await plugin.onExec(mockContext);

        expect(result.data).toEqual({ users: [{ id: 1 }] });
      });

      it('should handle different HTTP methods correctly', async () => {
        const mockDataJson: MockDataJson = {
          'GET /api/resource': { method: 'GET' },
          'POST /api/resource': { method: 'POST' },
          'PUT /api/resource': { method: 'PUT' },
          'DELETE /api/resource': { method: 'DELETE' },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        const methods = ['GET', 'POST', 'PUT', 'DELETE'] as const;
        for (const method of methods) {
          // Create a fresh context for each iteration
          const testContext: ApiMockPluginContext = {
            parameters: {
              method: method.toLowerCase() as 'get' | 'post' | 'put' | 'delete',
              url: '/api/resource',
              headers: {}
            },
            hooksRuntimes: {}
          };
          const result = await plugin.onExec(testContext);
          expect(result.data).toEqual({ method });
        }
      });

      it('should handle uppercase method correctly', async () => {
        const mockDataJson: MockDataJson = {
          'GET /api/test': { data: 'test' },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.method = 'GET';
        const result = await plugin.onExec(mockContext);

        expect(result.data).toEqual({ data: 'test' });
      });

      it('should handle lowercase method correctly', async () => {
        const mockDataJson: MockDataJson = {
          'GET /api/test': { data: 'test' },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.method = 'get';
        const result = await plugin.onExec(mockContext);

        expect(result.data).toEqual({ data: 'test' });
      });
    });

    describe('Mock Data from Parameters', () => {
      it('should use mockData from parameters when provided', async () => {
        const mockDataJson: MockDataJson = {
          'GET /api/test': { fromJson: true },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.url = '/api/test';
        mockContext.parameters.method = 'GET';
        // Parameters mockData should override options mockData for the same URL
        mockContext.parameters.mockData = {
          'GET /api/test': { fromParams: true },
          _default: { error: 'Not found' }
        };

        const result = await plugin.onExec(mockContext);

        expect(result.data).toEqual({ fromParams: true });
      });

      it('should merge mockData from parameters with options.mockData', async () => {
        const optionsMockData: MockDataJson = {
          'GET /api/test': { fromOptions: true },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: optionsMockData,
          logger: mockLogger
        });

        mockContext.parameters.url = '/api/test';
        mockContext.parameters.method = 'GET';
        mockContext.parameters.mockData = {
          'GET /api/test': { fromParams: true },
          _default: { error: 'Not found' }
        };

        const result = await plugin.onExec(mockContext);

        // Parameters mockData should override options mockData
        expect(result.data).toEqual({ fromParams: true });
      });

      it('should use options.mockData when parameters.mockData is not provided', async () => {
        const optionsMockData: MockDataJson = {
          'GET /api/test': { fromOptions: true },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: optionsMockData,
          logger: mockLogger
        });

        mockContext.parameters.url = '/api/test';
        mockContext.parameters.method = 'GET';

        const result = await plugin.onExec(mockContext);

        expect(result.data).toEqual({ fromOptions: true });
      });

      it('should use default mockData when options.mockData is not provided', async () => {
        plugin = new ApiMockPlugin({
          logger: mockLogger
        });

        mockContext.parameters.url = '/api/test';
        mockContext.parameters.method = 'GET';

        const result = await plugin.onExec(mockContext);

        expect(result.data).toEqual({});
      });

      it('should use mockData from parameters even when url match exists', async () => {
        const mockDataJson: MockDataJson = {
          'GET /api/test': { fromJson: true },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.url = '/api/test';
        mockContext.parameters.method = 'GET';
        mockContext.parameters.mockData = {
          'GET /api/test': { override: true },
          _default: { error: 'Not found' }
        };

        const result = await plugin.onExec(mockContext);

        expect(result.data).toEqual({ override: true });
      });

      it('should support function mockData from parameters', async () => {
        const mockDataJson: MockDataJson = {
          'GET /api/test': { fromJson: true },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.url = '/api/test';
        mockContext.parameters.method = 'GET';
        mockContext.parameters.data = { userId: 123 };
        mockContext.parameters.mockData = {
          'GET /api/test': (params: MockPluginParams) => ({
            fromFunction: true,
            userId: (params.data as { userId?: number })?.userId
          }),
          _default: { error: 'Not found' }
        };

        const result = await plugin.onExec(mockContext);

        expect(result.data).toEqual({
          fromFunction: true,
          userId: 123
        });
      });

      it('should support async function mockData from parameters', async () => {
        const mockDataJson: MockDataJson = {
          'GET /api/test': { fromJson: true },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.url = '/api/test';
        mockContext.parameters.method = 'GET';
        mockContext.parameters.mockData = {
          'GET /api/test': async (params: MockPluginParams) => {
            await new Promise((resolve) => setTimeout(resolve, 10));
            return { async: true, url: params.url };
          },
          _default: { error: 'Not found' }
        };

        const result = await plugin.onExec(mockContext);

        expect(result.data).toEqual({
          async: true,
          url: '/api/test'
        });
      });
    });

    describe('Function Mock Data', () => {
      it('should support function mock data in mockDataJson', async () => {
        const mockDataJson: MockDataJson = {
          'GET /api/users': (params: MockPluginParams) => ({
            users: [{ id: (params.data as { userId?: number })?.userId || 1 }]
          }),
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.url = '/api/users';
        mockContext.parameters.method = 'GET';
        mockContext.parameters.data = { userId: 456 };

        const result = await plugin.onExec(mockContext);

        expect(result.data).toEqual({ users: [{ id: 456 }] });
      });

      it('should support function mock data with method + url format', async () => {
        const mockDataJson: MockDataJson = {
          'POST /api/users': (params: MockPluginParams) => ({
            success: true,
            method: params.method,
            data: params.data
          }),
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.url = '/api/users';
        mockContext.parameters.method = 'POST';
        mockContext.parameters.data = { name: 'John' };

        const result = await plugin.onExec(mockContext);

        expect(result.data).toEqual({
          success: true,
          method: 'POST',
          data: { name: 'John' }
        });
      });

      it('should support function _default mock data', async () => {
        const mockDataJson: MockDataJson = {
          _default: (params: MockPluginParams) => ({
            error: 'Not found',
            requestedUrl: params.url,
            requestedMethod: params.method
          })
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.url = '/api/unknown';
        mockContext.parameters.method = 'GET';

        const result = await plugin.onExec(mockContext);

        expect(result.data).toEqual({
          error: 'Not found',
          requestedUrl: '/api/unknown',
          requestedMethod: 'GET'
        });
      });

      it('should support async function mock data', async () => {
        const mockDataJson: MockDataJson = {
          'GET /api/users': async (params: MockPluginParams) => {
            await new Promise((resolve) => setTimeout(resolve, 10));
            return {
              users: [{ id: 1, name: 'User' }],
              url: params.url
            };
          },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.url = '/api/users';
        mockContext.parameters.method = 'GET';

        const result = await plugin.onExec(mockContext);

        expect(result.data).toEqual({
          users: [{ id: 1, name: 'User' }],
          url: '/api/users'
        });
      });

      it('should prioritize method + full URL match over method + URL path match', async () => {
        const mockDataJson: MockDataJson = {
          'GET https://api.example.com/api/test': { static: 'full-url' },
          'GET /api/test': (params: MockPluginParams) => ({
            dynamic: params.url
          }),
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.baseURL = 'https://api.example.com';
        mockContext.parameters.url = '/api/test';
        mockContext.parameters.method = 'GET';

        const result = await plugin.onExec(mockContext);

        // Should use method + full URL match (static value) instead of method + URL path function
        expect(result.data).toEqual({ static: 'full-url' });
      });

      it('should pass all parameters to function mock data', async () => {
        const mockFn = vi.fn((params: MockPluginParams) => ({
          receivedParams: {
            method: params.method,
            url: params.url,
            headers: params.headers,
            data: params.data
          }
        }));

        const mockDataJson: MockDataJson = {
          'POST /api/test': mockFn,
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.url = '/api/test';
        mockContext.parameters.method = 'POST';
        mockContext.parameters.headers = { 'X-Custom': 'value' };
        mockContext.parameters.data = { key: 'value' };

        await plugin.onExec(mockContext);

        expect(mockFn).toHaveBeenCalledWith(mockContext.parameters);
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty url', async () => {
        const mockDataJson = {
          _default: { default: true }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.url = '';

        const result = await plugin.onExec(mockContext);

        expect(result.data).toEqual({ default: true });
      });

      it('should handle undefined url', async () => {
        const mockDataJson = {
          _default: { default: true }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.url = undefined as unknown as string;

        const result = await plugin.onExec(mockContext);

        expect(result.data).toEqual({ default: true });
      });

      it('should handle undefined method', async () => {
        const mockDataJson: MockDataJson = {
          'GET /api/test': { data: 'test' },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.method = undefined as unknown as 'get';
        mockContext.parameters.url = '/api/test';

        const result = await plugin.onExec(mockContext);

        expect(result.data).toEqual({ data: 'test' });
      });

      it('should handle when default mock data is undefined', async () => {
        const mockDataJson: MockDataJson = {
          _default: undefined
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.url = '/api/unknown';

        const result = await plugin.onExec(mockContext);

        expect(result.data).toBeUndefined();
        expect(result.status).toBe(200);
      });
    });

    describe('Response Structure', () => {
      it('should return correct response structure', async () => {
        const mockDataJson: MockDataJson = {
          'GET /api/test': { data: 'test' },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.url = '/api/test';
        mockContext.parameters.method = 'GET';
        mockContext.parameters.headers = { 'X-Custom': 'value' };

        const result = await plugin.onExec(mockContext);

        expect(result).toHaveProperty('status', 200);
        expect(result).toHaveProperty('statusText', 'OK');
        expect(result).toHaveProperty('headers', {});
        expect(result).toHaveProperty('data', { data: 'test' });
        expect(result).toHaveProperty('config', mockContext.parameters);
        expect(result).toHaveProperty('response');
        expect(result.response).toBeInstanceOf(Response);
      });

      it('should create Response with correct JSON string', async () => {
        const mockDataJson: MockDataJson = {
          'GET /api/test': { id: 1, name: 'test' },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.url = '/api/test';
        mockContext.parameters.method = 'GET';

        const result = await plugin.onExec(mockContext);

        const responseText = await result.response.text();
        expect(JSON.parse(responseText)).toEqual({ id: 1, name: 'test' });
      });
    });

    describe('Logging', () => {
      it('should log mock request information', async () => {
        const mockDataJson: MockDataJson = {
          'GET /api/test': { data: 'test' },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.url = '/api/test';
        mockContext.parameters.method = 'GET';
        mockContext.parameters.headers = { 'X-Custom': 'value' };

        await plugin.onExec(mockContext);

        expect(mockLogger.log).toHaveBeenCalled();
        const logCall = mockLogger.log.mock.calls[0];
        expect(logCall[0]).toContain('[mock]');
        expect(logCall[1]).toBe('color: #dd0;');
        expect(logCall[2]).toBe('color: inherit;');
      });
    });

    describe('ThreadUtil.sleep', () => {
      it('should call ThreadUtil.sleep with default 1000ms when delay is not specified', async () => {
        const mockDataJson: MockDataJson = {
          'GET /api/test': { data: 'test' },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        sleepSpy.mockClear();
        mockContext.parameters = {
          method: 'GET',
          url: '/api/test',
          headers: {}
        };

        await plugin.onExec(mockContext);

        expect(sleepSpy).toHaveBeenCalledWith(1000);
      });

      it('should call ThreadUtil.sleep with options.mockDelay when specified', async () => {
        const mockDataJson: MockDataJson = {
          'GET /api/test': { data: 'test' },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          mockDelay: 2000,
          logger: mockLogger
        });

        sleepSpy.mockClear();
        mockContext.parameters = {
          method: 'GET',
          url: '/api/test',
          headers: {}
        };

        await plugin.onExec(mockContext);

        expect(sleepSpy).toHaveBeenCalledWith(2000);
      });

      it('should prioritize parameters.mockDelay over options.mockDelay', async () => {
        const mockDataJson: MockDataJson = {
          'GET /api/test': { data: 'test' },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          mockDelay: 2000,
          logger: mockLogger
        });

        sleepSpy.mockClear();
        mockContext.parameters = {
          method: 'GET',
          url: '/api/test',
          headers: {},
          mockDelay: 500
        };

        await plugin.onExec(mockContext);

        expect(sleepSpy).toHaveBeenCalledWith(500);
      });

      it('should call ThreadUtil.sleep with custom delay when specified', async () => {
        const mockDataJson: MockDataJson = {
          '/api/test': { data: 'test' },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        sleepSpy.mockClear();
        mockContext.parameters = {
          method: 'GET',
          url: '/api/test',
          headers: {},
          mockDelay: 500
        };

        await plugin.onExec(mockContext);

        expect(sleepSpy).toHaveBeenCalledWith(500);
      });

      it('should not call ThreadUtil.sleep when delay is 0', async () => {
        const mockDataJson: MockDataJson = {
          'GET /api/test': { data: 'test' },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        sleepSpy.mockClear();
        mockContext.parameters = {
          method: 'GET',
          url: '/api/test',
          headers: {},
          mockDelay: 0
        };

        await plugin.onExec(mockContext);

        expect(sleepSpy).not.toHaveBeenCalled();
      });

      it('should not call ThreadUtil.sleep when delay is negative', async () => {
        const mockDataJson: MockDataJson = {
          'GET /api/test': { data: 'test' },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        sleepSpy.mockClear();
        mockContext.parameters = {
          method: 'GET',
          url: '/api/test',
          headers: {},
          mockDelay: -100
        };

        await plugin.onExec(mockContext);

        expect(sleepSpy).not.toHaveBeenCalled();
      });

      it('should not call ThreadUtil.sleep when options.mockDelay is 0', async () => {
        const mockDataJson: MockDataJson = {
          'GET /api/test': { data: 'test' },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          mockDelay: 0,
          logger: mockLogger
        });

        sleepSpy.mockClear();
        mockContext.parameters = {
          method: 'GET',
          url: '/api/test',
          headers: {}
        };

        await plugin.onExec(mockContext);

        expect(sleepSpy).not.toHaveBeenCalled();
      });
    });

    describe('Integration Tests', () => {
      it('should handle complete flow with method + url match', async () => {
        const mockDataJson: MockDataJson = {
          'GET /api/users': { users: [{ id: 1 }] },
          'POST /api/users': { success: true },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.url = '/api/users';
        mockContext.parameters.method = 'GET';
        mockContext.parameters.headers = { Authorization: 'Bearer token' };

        const result = await plugin.onExec(mockContext);

        expect(result.data).toEqual({ users: [{ id: 1 }] });
        expect(result.status).toBe(200);
        expect(mockLogger.log).toHaveBeenCalled();
      });

      it('should handle complete flow with method + url match', async () => {
        const mockDataJson: MockDataJson = {
          'POST /api/users': { success: true, id: 123 },
          _default: { error: 'Not found' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.url = '/api/users';
        mockContext.parameters.method = 'POST';

        const result = await plugin.onExec(mockContext);

        expect(result.data).toEqual({ success: true, id: 123 });
        expect(result.status).toBe(200);
      });

      it('should handle complete flow with default fallback', async () => {
        const mockDataJson: MockDataJson = {
          _default: { message: 'Default response' }
        };
        plugin = new ApiMockPlugin({
          mockData: mockDataJson,
          logger: mockLogger
        });

        mockContext.parameters.url = '/api/unknown';
        mockContext.parameters.method = 'GET';

        const result = await plugin.onExec(mockContext);

        expect(result.data).toEqual({ message: 'Default response' });
        expect(result.status).toBe(200);
      });
    });
  });
});
