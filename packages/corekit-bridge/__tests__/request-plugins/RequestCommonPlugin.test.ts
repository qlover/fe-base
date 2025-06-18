import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RequestCommonPlugin } from '../../src/core/request-plugins/RequestCommonPlugin';
import type {
  ExecutorContext,
  RequestAdapterConfig,
  RequestAdapterResponse
} from '@qlover/fe-corekit';

/**
 * RequestCommonPlugin 单元测试
 *
 * 测试范围：
 * - 插件初始化和配置
 * - token 处理和认证头添加
 * - 默认请求头合并
 * - 默认请求数据合并
 * - 请求数据序列化
 * - 响应数据处理
 */
describe('RequestCommonPlugin', () => {
  let plugin: RequestCommonPlugin;
  let mockContext: ExecutorContext<RequestAdapterConfig>;

  beforeEach(() => {
    // 重置 mock context
    mockContext = {
      parameters: {
        headers: {},
        responseType: 'json'
      },
      hooksRuntimes: {}
    };
  });

  describe('Plugin Initialization', () => {
    it('should create plugin with default config', () => {
      plugin = new RequestCommonPlugin();
      expect(plugin.pluginName).toBe('RequestCommonPlugin');
      expect(plugin.config).toEqual({});
    });

    it('should create plugin with custom config', () => {
      const config = {
        token: 'test-token',
        tokenPrefix: 'Bearer',
        authKey: 'Authorization',
        defaultHeaders: { 'Custom-Header': 'value' }
      };

      plugin = new RequestCommonPlugin(config);
      expect(plugin.config).toEqual(config);
    });

    it('should throw error when token is required but not provided', () => {
      expect(() => {
        new RequestCommonPlugin({ requiredToken: true });
      }).toThrow('Token is required!');
    });

    it('should not throw error when token is required and provided', () => {
      expect(() => {
        new RequestCommonPlugin({
          requiredToken: true,
          token: 'test-token'
        });
      }).not.toThrow();
    });
  });

  describe('Token Handling', () => {
    it('should get token from string', () => {
      plugin = new RequestCommonPlugin({ token: 'test-token' });
      expect(plugin.getAuthToken()).toBe('test-token');
    });

    it('should get token from function', () => {
      const tokenFn = vi.fn().mockReturnValue('dynamic-token');
      plugin = new RequestCommonPlugin({ token: tokenFn });

      expect(plugin.getAuthToken()).toBe('dynamic-token');
      expect(tokenFn).toHaveBeenCalled();
    });

    it('should return empty string when token function returns null', () => {
      const tokenFn = vi.fn().mockReturnValue(null);
      plugin = new RequestCommonPlugin({ token: tokenFn });

      expect(plugin.getAuthToken()).toBe('');
    });

    it('should return empty string when no token provided', () => {
      plugin = new RequestCommonPlugin();
      expect(plugin.getAuthToken()).toBe('');
    });
  });

  describe('onBefore Hook', () => {
    describe('Headers Handling', () => {
      it('should merge default headers with existing headers', () => {
        plugin = new RequestCommonPlugin({
          defaultHeaders: {
            'X-Custom': 'default-value',
            'X-Another': 'another'
          }
        });

        mockContext.parameters.headers = { 'X-Existing': 'existing-value' };

        plugin.onBefore(mockContext);

        expect(mockContext.parameters.headers).toEqual({
          'Content-Type': 'application/json',
          'X-Custom': 'default-value',
          'X-Another': 'another',
          'X-Existing': 'existing-value'
        });
      });

      it('should prioritize existing headers over defaults', () => {
        plugin = new RequestCommonPlugin({
          defaultHeaders: { 'X-Custom': 'default-value' }
        });

        mockContext.parameters.headers = { 'X-Custom': 'override-value' };

        plugin.onBefore(mockContext);

        expect(mockContext.parameters.headers['X-Custom']).toBe(
          'override-value'
        );
      });

      it('should add Content-Type header for json response type', () => {
        plugin = new RequestCommonPlugin();
        mockContext.parameters.responseType = 'json';

        plugin.onBefore(mockContext);

        expect(mockContext.parameters.headers!['Content-Type']).toBe(
          'application/json'
        );
      });

      it('should not override existing Content-Type header', () => {
        plugin = new RequestCommonPlugin();
        mockContext.parameters.headers = { 'Content-Type': 'application/xml' };
        mockContext.parameters.responseType = 'json';

        plugin.onBefore(mockContext);

        expect(mockContext.parameters.headers['Content-Type']).toBe(
          'application/xml'
        );
      });

      it('should not add Content-Type for non-json response types', () => {
        plugin = new RequestCommonPlugin();
        mockContext.parameters.responseType = 'text';

        plugin.onBefore(mockContext);

        expect(mockContext.parameters.headers!['Content-Type']).toBeUndefined();
      });
    });

    describe('Authentication Header', () => {
      it('should add Authorization header with token', () => {
        plugin = new RequestCommonPlugin({ token: 'test-token' });

        plugin.onBefore(mockContext);

        expect(mockContext.parameters.headers!['Authorization']).toBe(
          'test-token'
        );
      });

      it('should add Authorization header with token prefix', () => {
        plugin = new RequestCommonPlugin({
          token: 'test-token',
          tokenPrefix: 'Bearer'
        });

        plugin.onBefore(mockContext);

        expect(mockContext.parameters.headers!['Authorization']).toBe(
          'Bearer test-token'
        );
      });

      it('should use custom auth key', () => {
        plugin = new RequestCommonPlugin({
          token: 'test-token',
          authKey: 'X-Auth-Token'
        });

        plugin.onBefore(mockContext);

        expect(mockContext.parameters.headers!['X-Auth-Token']).toBe(
          'test-token'
        );
        expect(
          mockContext.parameters.headers!['Authorization']
        ).toBeUndefined();
      });

      it('should not add auth header when authKey is false', () => {
        plugin = new RequestCommonPlugin({
          token: 'test-token',
          authKey: false
        });

        plugin.onBefore(mockContext);

        expect(
          mockContext.parameters.headers!['Authorization']
        ).toBeUndefined();
      });

      it('should not override existing auth header', () => {
        plugin = new RequestCommonPlugin({ token: 'test-token' });
        mockContext.parameters.headers = { Authorization: 'existing-auth' };

        plugin.onBefore(mockContext);

        expect(mockContext.parameters.headers['Authorization']).toBe(
          'existing-auth'
        );
      });

      it('should not add auth header when no token provided', () => {
        plugin = new RequestCommonPlugin();

        plugin.onBefore(mockContext);

        expect(
          mockContext.parameters.headers!['Authorization']
        ).toBeUndefined();
      });
    });

    describe('Request Data Merging', () => {
      it('should merge default request data with object data', () => {
        plugin = new RequestCommonPlugin({
          defaultRequestData: { defaultKey: 'defaultValue', shared: 'default' }
        });

        mockContext.parameters.data = { userKey: 'userValue', shared: 'user' };

        plugin.onBefore(mockContext);

        expect(mockContext.parameters.data).toEqual({
          defaultKey: 'defaultValue',
          userKey: 'userValue',
          shared: 'user' // user data should override default
        });
      });

      it('should only add default properties that are undefined in target', () => {
        plugin = new RequestCommonPlugin({
          defaultRequestData: { key1: 'default1', key2: 'default2' }
        });

        mockContext.parameters.data = { key1: 'user1', key3: 'user3' };

        plugin.onBefore(mockContext);

        expect(mockContext.parameters.data).toEqual({
          key1: 'user1', // should not be overridden
          key2: 'default2', // should be added
          key3: 'user3' // should remain
        });
      });

      it('should handle non-object data gracefully', () => {
        plugin = new RequestCommonPlugin({
          defaultRequestData: { defaultKey: 'defaultValue' }
        });

        // Test with string data
        mockContext.parameters.data = 'string-data';
        plugin.onBefore(mockContext);
        expect(mockContext.parameters.data).toBe('string-data');

        // Test with number data
        mockContext.parameters.data = 123;
        plugin.onBefore(mockContext);
        expect(mockContext.parameters.data).toBe(123);

        // Test with null data
        mockContext.parameters.data = null;
        plugin.onBefore(mockContext);
        expect(mockContext.parameters.data).toBe(null);
      });

      it('should handle array data without merging', () => {
        plugin = new RequestCommonPlugin({
          defaultRequestData: { defaultKey: 'defaultValue' }
        });

        const arrayData = [1, 2, 3];
        mockContext.parameters.data = arrayData;

        plugin.onBefore(mockContext);

        expect(mockContext.parameters.data).toBe(arrayData);
      });

      it('should not mutate original data objects', () => {
        plugin = new RequestCommonPlugin({
          defaultRequestData: { defaultKey: 'defaultValue' }
        });

        const originalData = { userKey: 'userValue' };
        mockContext.parameters.data = originalData;

        plugin.onBefore(mockContext);

        // Original data should not be mutated
        expect(originalData).toEqual({ userKey: 'userValue' });
        // But parameters.data should have merged data
        expect(mockContext.parameters.data).toEqual({
          defaultKey: 'defaultValue',
          userKey: 'userValue'
        });
      });
    });

    describe('Request Data Serialization', () => {
      it('should serialize request data when serializer provided', () => {
        const serializer = vi.fn((data) => ({ serialized: data }));
        plugin = new RequestCommonPlugin({ requestDataSerializer: serializer });

        mockContext.parameters.data = { original: 'data' };

        plugin.onBefore(mockContext);

        expect(serializer).toHaveBeenCalledWith(
          { original: 'data' },
          mockContext
        );
        expect(mockContext.parameters.data).toEqual({
          serialized: { original: 'data' }
        });
      });

      it('should not serialize when no data provided', () => {
        const serializer = vi.fn();
        plugin = new RequestCommonPlugin({ requestDataSerializer: serializer });

        plugin.onBefore(mockContext);

        expect(serializer).not.toHaveBeenCalled();
      });

      it('should serialize after merging default data', () => {
        const serializer = vi.fn((data) => ({ serialized: true, ...data }));
        plugin = new RequestCommonPlugin({
          defaultRequestData: { default: 'value' },
          requestDataSerializer: serializer
        });

        mockContext.parameters.data = { user: 'data' };

        plugin.onBefore(mockContext);

        expect(serializer).toHaveBeenCalledWith(
          { default: 'value', user: 'data' },
          mockContext
        );
        expect(mockContext.parameters.data).toEqual({
          serialized: true,
          default: 'value',
          user: 'data'
        });
      });
    });

    describe('Config Parameter Override', () => {
      it('should allow context parameters to override plugin config', () => {
        plugin = new RequestCommonPlugin({
          tokenPrefix: 'Bearer',
          defaultHeaders: { 'X-Default': 'default' }
        });

        // Override config through context parameters
        mockContext.parameters.tokenPrefix = 'Token';
        mockContext.parameters.defaultHeaders = { 'X-Override': 'override' };
        mockContext.parameters.token = 'context-token';

        plugin.onBefore(mockContext);

        expect(mockContext.parameters.headers).toEqual({
          'X-Override': 'override',
          Authorization: 'Token context-token',
          'Content-Type': 'application/json'
        });
      });
    });
  });

  describe('onSuccess Hook', () => {
    let mockResponse: Response;

    beforeEach(() => {
      plugin = new RequestCommonPlugin();

      // Create a proper Response mock
      mockResponse = new Response('{"test": "data"}', {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' }
      });

      mockContext.returnValue = {
        data: mockResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: mockContext.parameters
      } as RequestAdapterResponse<unknown, Response>;
    });

    it('should parse JSON response when responseType is json', async () => {
      mockContext.parameters.responseType = 'json';

      await plugin.onSuccess(mockContext);

      const result = mockContext.returnValue as RequestAdapterResponse<
        unknown,
        Response
      >;
      expect(result.data).toEqual({ test: 'data' });
    });

    it('should parse text response when responseType is text', async () => {
      mockResponse = new Response('plain text', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });

      mockContext.returnValue = {
        data: mockResponse,
        status: 200,
        statusText: 'OK'
      } as RequestAdapterResponse<unknown, Response>;

      mockContext.parameters.responseType = 'text';

      await plugin.onSuccess(mockContext);

      const result = mockContext.returnValue as RequestAdapterResponse<
        unknown,
        Response
      >;
      expect(result.data).toBe('plain text');
    });

    it('should parse blob response when responseType is blob', async () => {
      const blobData = new Blob(['blob content'], { type: 'text/plain' });
      mockResponse = new Response(blobData, { status: 200 });

      mockContext.returnValue = {
        data: mockResponse,
        status: 200,
        statusText: 'OK'
      } as RequestAdapterResponse<unknown, Response>;

      mockContext.parameters.responseType = 'blob';

      await plugin.onSuccess(mockContext);

      const result = mockContext.returnValue as RequestAdapterResponse<
        unknown,
        Response
      >;
      expect(result.data).toBeInstanceOf(Blob);
    });

    it('should parse arrayBuffer response when responseType is arraybuffer', async () => {
      const buffer = new ArrayBuffer(8);
      mockResponse = new Response(buffer, { status: 200 });

      mockContext.returnValue = {
        data: mockResponse,
        status: 200,
        statusText: 'OK'
      } as RequestAdapterResponse<unknown, Response>;

      mockContext.parameters.responseType = 'arraybuffer';

      await plugin.onSuccess(mockContext);

      const result = mockContext.returnValue as RequestAdapterResponse<
        unknown,
        Response
      >;
      expect(result.data).toBeInstanceOf(ArrayBuffer);
    });

    it('should handle arrayBuffer with alternative spelling', async () => {
      const buffer = new ArrayBuffer(8);
      mockResponse = new Response(buffer, { status: 200 });

      mockContext.returnValue = {
        data: mockResponse,
        status: 200,
        statusText: 'OK'
      } as RequestAdapterResponse<unknown, Response>;

      // @ts-expect-error Testing alternative spelling
      mockContext.parameters.responseType = 'arrayBuffer';

      await plugin.onSuccess(mockContext);

      const result = mockContext.returnValue as RequestAdapterResponse<
        unknown,
        Response
      >;
      expect(result.data).toBeInstanceOf(ArrayBuffer);
    });

    it('should not process response when data is not a Response object', async () => {
      mockContext.returnValue = {
        data: { already: 'parsed' },
        status: 200,
        statusText: 'OK'
      } as unknown as RequestAdapterResponse<unknown, Response>;

      mockContext.parameters.responseType = 'json';

      await plugin.onSuccess(mockContext);

      const result = mockContext.returnValue as RequestAdapterResponse<
        unknown,
        Response
      >;
      expect(result.data).toEqual({ already: 'parsed' });
    });

    it('should handle response parsing errors gracefully', async () => {
      // Create a response that will fail JSON parsing
      mockResponse = new Response('invalid json {', {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

      mockContext.returnValue = {
        data: mockResponse,
        status: 200,
        statusText: 'OK'
      } as RequestAdapterResponse<unknown, Response>;

      mockContext.parameters.responseType = 'json';

      await expect(plugin.onSuccess(mockContext)).rejects.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete request flow with all features', () => {
      const serializer = vi.fn((data) => ({ ...data, serialized: true }));

      plugin = new RequestCommonPlugin({
        token: 'auth-token',
        tokenPrefix: 'Bearer',
        defaultHeaders: { 'X-App': 'test-app' },
        defaultRequestData: { version: '1.0' },
        requestDataSerializer: serializer
      });

      mockContext.parameters = {
        headers: { 'X-Custom': 'custom-value' },
        data: { userId: 123 },
        responseType: 'json'
      };

      plugin.onBefore(mockContext);

      expect(mockContext.parameters.headers).toEqual({
        'X-App': 'test-app',
        'X-Custom': 'custom-value',
        Authorization: 'Bearer auth-token',
        'Content-Type': 'application/json'
      });

      expect(serializer).toHaveBeenCalledWith(
        { version: '1.0', userId: 123 },
        mockContext
      );

      expect(mockContext.parameters.data).toEqual({
        version: '1.0',
        userId: 123,
        serialized: true
      });
    });

    it('should work with minimal configuration', () => {
      plugin = new RequestCommonPlugin();

      plugin.onBefore(mockContext);

      expect(mockContext.parameters.headers).toEqual({
        'Content-Type': 'application/json'
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined parameters gracefully', () => {
      plugin = new RequestCommonPlugin({
        defaultHeaders: { 'X-Test': 'test' }
      });

      mockContext.parameters.headers = undefined;

      expect(() => plugin.onBefore(mockContext)).not.toThrow();
      expect(mockContext.parameters.headers).toEqual({
        'X-Test': 'test',
        'Content-Type': 'application/json'
      });
    });

    it('should handle empty token gracefully', () => {
      plugin = new RequestCommonPlugin({ token: '' });

      plugin.onBefore(mockContext);

      expect(mockContext.parameters.headers!['Authorization']).toBeUndefined();
    });

    it('should handle function token that returns empty string', () => {
      plugin = new RequestCommonPlugin({
        token: () => '',
        tokenPrefix: 'Bearer'
      });

      plugin.onBefore(mockContext);

      expect(mockContext.parameters.headers!['Authorization']).toBeUndefined();
    });

    it('should not append auth header when authKey is false', () => {
      plugin = new RequestCommonPlugin({
        token: () => 'test-token',
        authKey: false,
        tokenPrefix: 'Bearer'
      });

      plugin.onBefore(mockContext);

      expect(mockContext.parameters.headers!['Authorization']).toBeUndefined();
    });

    it('should not append auth header when token is not provided', () => {
      plugin = new RequestCommonPlugin({
        token: () => '',
        authKey: 'Authorization',
        tokenPrefix: 'Bearer'
      });

      plugin.onBefore(mockContext);

      expect(mockContext.parameters.headers!['Authorization']).toBeUndefined();
    });
  });
});
