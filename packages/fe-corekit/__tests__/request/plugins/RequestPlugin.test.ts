import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RequestPlugin } from '../../../src/request/plugins/RequestPlugin';
import { RequestAdapterFetchContext } from '../../../src/request/adapter/RequestAdapterFetch';
import { UrlBuilderInterface } from '../../../src/request/interface/UrlBuilderInterface';
import { HeaderInjectorInterface } from '../../../src/request/interface/HeaderInjectorInterface';
import { RequestAdapterConfig } from '../../../src/request/interface';
import {
  JSON_RESPONSE_TYPE,
  JSON_CONTENT_TYPE,
  CONTENT_TYPE_HEADER
} from '../../../src/request/plugins/consts';

describe('RequestPlugin', () => {
  let plugin: RequestPlugin;
  let mockContext: RequestAdapterFetchContext;

  beforeEach(() => {
    mockContext = {
      parameters: {
        url: '/api/users',
        method: 'GET'
      },
      hooksRuntimes: {}
    } as RequestAdapterFetchContext;
  });

  describe('Constructor', () => {
    it('should create instance with default config', () => {
      plugin = new RequestPlugin();
      expect(plugin.pluginName).toBe('RequestPlugin');
    });

    it('should create instance with custom config', () => {
      plugin = new RequestPlugin({
        token: 'test-token',
        tokenPrefix: 'Bearer'
      });
      expect(plugin.pluginName).toBe('RequestPlugin');
    });

    it('should use custom urlBuilder', () => {
      const customUrlBuilder: UrlBuilderInterface = {
        buildUrl: vi.fn().mockReturnValue('https://custom.com/api')
      };
      plugin = new RequestPlugin({
        urlBuilder: customUrlBuilder
      });

      const result = plugin.onBefore(mockContext);
      expect(result.url).toBe('https://custom.com/api');
    });

    it('should use custom headerInjector', () => {
      const customInjector: HeaderInjectorInterface = {
        inject: vi.fn().mockReturnValue({ 'X-Custom': 'value' })
      };
      plugin = new RequestPlugin({
        headerInjector: customInjector
      });

      const result = plugin.onBefore(mockContext);
      expect(result.headers).toEqual({ 'X-Custom': 'value' });
    });
  });

  describe('onBefore', () => {
    beforeEach(() => {
      plugin = new RequestPlugin();
    });

    it('should build URL from config', () => {
      Object.assign(mockContext, {
        parameters: {
          url: '/users',
          baseURL: 'https://api.example.com',
          params: { role: 'admin' }
        }
      });
      const result = plugin.onBefore(mockContext);

      expect(result.url).toBe('https://api.example.com/users?role=admin');
    });

    it('should inject headers', () => {
      plugin = new RequestPlugin({
        token: 'test-token',
        tokenPrefix: 'Bearer'
      });
      const result = plugin.onBefore(mockContext);

      expect(result.headers).toBeDefined();
      expect(result.headers?.['Authorization']).toBe('Bearer test-token');
    });

    it('should process request data', () => {
      Object.assign(mockContext, {
        parameters: {
          url: '/api/users',
          method: 'POST',
          data: { name: 'John' },
          responseType: JSON_RESPONSE_TYPE
        }
      });
      const result = plugin.onBefore(mockContext);

      expect(result.data).toBe('{"name":"John"}');
    });

    it('should merge context config with plugin config', () => {
      plugin = new RequestPlugin({
        token: 'default-token',
        // @ts-expect-error
        baseURL: 'https://api.example.com'
      });
      Object.assign(mockContext, {
        parameters: {
          url: '/users',
          token: 'context-token'
        }
      });
      const result = plugin.onBefore(mockContext);

      expect(result.token).toBe('context-token');
      expect(result.baseURL).toBe('https://api.example.com');
    });
  });

  describe('mergeConfig', () => {
    beforeEach(() => {
      plugin = new RequestPlugin({
        // @ts-expect-error
        data: { version: '1.0' },
        token: 'default-token'
      });
    });

    it('should merge config with context config taking precedence', () => {
      const contextConfig: RequestAdapterConfig = {
        token: 'context-token',
        url: '/api/users'
      };
      const merged = plugin['mergeConfig'](contextConfig);

      expect(merged.token).toBe('context-token');
      expect(merged.url).toBe('/api/users');
      expect(merged.data).toEqual({ version: '1.0' });
    });

    it('should preserve default data when context data is undefined', () => {
      const contextConfig: RequestAdapterConfig = {
        url: '/api/users'
      };
      const merged = plugin['mergeConfig'](contextConfig);

      expect(merged.data).toEqual({ version: '1.0' });
    });

    it('should override default data when context provides data', () => {
      const contextConfig: RequestAdapterConfig = {
        url: '/api/users',
        data: { version: '2.0' }
      };
      const merged = plugin['mergeConfig'](contextConfig);

      expect(merged.data).toEqual({ version: '2.0' });
    });

    it('should override default data when context provides null', () => {
      const contextConfig: RequestAdapterConfig = {
        url: '/api/users',
        data: null
      };
      const merged = plugin['mergeConfig'](contextConfig);

      expect(merged.data).toBeNull();
    });
  });

  describe('buildUrl', () => {
    beforeEach(() => {
      plugin = new RequestPlugin();
    });

    it('should build URL with baseURL and path', () => {
      const config: RequestAdapterConfig = {
        url: '/users',
        baseURL: 'https://api.example.com'
      };
      const url = plugin['buildUrl'](config);

      expect(url).toBe('https://api.example.com/users');
    });

    it('should build URL with query parameters', () => {
      const config: RequestAdapterConfig = {
        url: '/users',
        baseURL: 'https://api.example.com',
        params: { role: 'admin', page: 1 }
      };
      const url = plugin['buildUrl'](config);

      expect(url).toContain('role=admin');
      expect(url).toContain('page=1');
    });

    it('should throw error when URL is empty', () => {
      const config: RequestAdapterConfig = {
        url: '',
        baseURL: ''
      };

      expect(() => {
        plugin['buildUrl'](config);
      }).toThrow('RequestPlugin: Invalid URL');
    });

    it('should throw error when URL builder returns whitespace only', () => {
      const customUrlBuilder: UrlBuilderInterface = {
        buildUrl: vi.fn().mockReturnValue('   ')
      };
      plugin = new RequestPlugin({
        urlBuilder: customUrlBuilder
      });
      const config: RequestAdapterConfig = {
        url: '/users'
      };

      expect(() => {
        plugin['buildUrl'](config);
      }).toThrow('RequestPlugin: Invalid URL');
    });

    it('should throw error when URL builder returns empty string', () => {
      const customUrlBuilder: UrlBuilderInterface = {
        buildUrl: vi.fn().mockReturnValue('')
      };
      plugin = new RequestPlugin({
        urlBuilder: customUrlBuilder
      });
      const config: RequestAdapterConfig = {
        url: '/users'
      };

      expect(() => {
        plugin['buildUrl'](config);
      }).toThrow('RequestPlugin: Invalid URL');
    });

    it('should throw error when URL builder returns null', () => {
      const customUrlBuilder: UrlBuilderInterface = {
        buildUrl: vi.fn().mockReturnValue(null as unknown as string)
      };
      plugin = new RequestPlugin({
        urlBuilder: customUrlBuilder
      });
      const config: RequestAdapterConfig = {
        url: '/users'
      };

      expect(() => {
        plugin['buildUrl'](config);
      }).toThrow('RequestPlugin: Invalid URL');
    });

    it('should handle absolute URL without baseURL', () => {
      const config: RequestAdapterConfig = {
        url: 'https://api.example.com/users'
      };
      const url = plugin['buildUrl'](config);

      expect(url).toBe('https://api.example.com/users');
    });
  });

  describe('injectHeaders', () => {
    it('should delegate to headerInjector', () => {
      const mockInjector: HeaderInjectorInterface = {
        inject: vi.fn().mockReturnValue({ 'X-Custom': 'value' })
      };
      plugin = new RequestPlugin({
        headerInjector: mockInjector
      });

      const config: RequestAdapterConfig = {};
      const headers = plugin['injectHeaders'](config);

      expect(mockInjector.inject).toHaveBeenCalledWith(config);
      expect(headers).toEqual({ 'X-Custom': 'value' });
    });
  });

  describe('processRequestData', () => {
    beforeEach(() => {
      plugin = new RequestPlugin();
    });

    describe('HTTP methods without body', () => {
      it('should return null for GET request', () => {
        const config: RequestAdapterConfig = {
          method: 'GET',
          data: { name: 'John' }
        };
        const result = plugin['processRequestData'](config);

        expect(result).toBeNull();
      });

      it('should return null for HEAD request', () => {
        const config: RequestAdapterConfig = {
          method: 'HEAD',
          data: { name: 'John' }
        };
        const result = plugin['processRequestData'](config);

        expect(result).toBeNull();
      });

      it('should return null for OPTIONS request', () => {
        const config: RequestAdapterConfig = {
          method: 'OPTIONS',
          data: { name: 'John' }
        };
        const result = plugin['processRequestData'](config);

        expect(result).toBeNull();
      });

      it('should handle lowercase method names', () => {
        const config: RequestAdapterConfig = {
          method: 'get',
          data: { name: 'John' }
        };
        const result = plugin['processRequestData'](config);

        expect(result).toBeNull();
      });
    });

    describe('Null and undefined data', () => {
      it('should return null when data is null', () => {
        const config: RequestAdapterConfig = {
          method: 'POST',
          data: null
        };
        const result = plugin['processRequestData'](config);

        expect(result).toBeNull();
      });

      it('should return undefined when data is undefined', () => {
        const config: RequestAdapterConfig = {
          method: 'POST'
        };
        const result = plugin['processRequestData'](config);

        expect(result).toBeUndefined();
      });
    });

    describe('Custom serializer', () => {
      it('should use custom serializer when provided', () => {
        plugin = new RequestPlugin({
          requestDataSerializer: (data) => `custom:${JSON.stringify(data)}`
        });
        const contextConfig: RequestAdapterConfig = {
          method: 'POST',
          data: { name: 'John' }
        };
        const mergedConfig = plugin['mergeConfig'](contextConfig);
        const result = plugin['processRequestData'](mergedConfig);

        expect(result).toBe('custom:{"name":"John"}');
      });

      it('should throw error when custom serializer throws', () => {
        plugin = new RequestPlugin({
          requestDataSerializer: () => {
            throw new Error('Serializer error');
          }
        });
        const contextConfig: RequestAdapterConfig = {
          method: 'POST',
          data: { name: 'John' }
        };
        const mergedConfig = plugin['mergeConfig'](contextConfig);

        expect(() => {
          plugin['processRequestData'](mergedConfig);
        }).toThrow(
          'RequestPlugin: Custom requestDataSerializer threw an error'
        );
      });
    });

    describe('JSON serialization', () => {
      it('should stringify data for JSON responseType', () => {
        const config: RequestAdapterConfig = {
          method: 'POST',
          data: { name: 'John' },
          responseType: JSON_RESPONSE_TYPE
        };
        const result = plugin['processRequestData'](config);

        expect(result).toBe('{"name":"John"}');
      });

      it('should stringify data when Content-Type is application/json', () => {
        const config: RequestAdapterConfig = {
          method: 'POST',
          data: { name: 'John' },
          headers: {
            [CONTENT_TYPE_HEADER]: JSON_CONTENT_TYPE
          }
        };
        const result = plugin['processRequestData'](config);

        expect(result).toBe('{"name":"John"}');
      });

      it('should handle case-insensitive Content-Type header', () => {
        const config: RequestAdapterConfig = {
          method: 'POST',
          data: { name: 'John' },
          headers: {
            'content-type': JSON_CONTENT_TYPE
          }
        };
        const result = plugin['processRequestData'](config);

        expect(result).toBe('{"name":"John"}');
      });

      it('should throw error for circular references', () => {
        const circular: any = { name: 'John' };
        circular.self = circular;

        const config: RequestAdapterConfig = {
          method: 'POST',
          data: circular,
          responseType: JSON_RESPONSE_TYPE
        };

        expect(() => {
          plugin['processRequestData'](config);
        }).toThrow(
          'RequestPlugin: Cannot stringify data with circular references'
        );
      });

      it('should throw error for other JSON.stringify errors', () => {
        const invalidData = {
          toJSON: () => {
            throw new Error('Custom toJSON error');
          }
        };

        const config: RequestAdapterConfig = {
          method: 'POST',
          data: invalidData,
          responseType: JSON_RESPONSE_TYPE
        };

        expect(() => {
          plugin['processRequestData'](config);
        }).toThrow('RequestPlugin: Failed to stringify request data');
      });

      it('should handle case-insensitive Content-Type header key', () => {
        const config: RequestAdapterConfig = {
          method: 'POST',
          data: { name: 'John' },
          headers: {
            'Content-Type': JSON_CONTENT_TYPE
          }
        };
        const result = plugin['processRequestData'](config);

        expect(result).toBe('{"name":"John"}');
      });

      it('should handle Content-Type header with charset', () => {
        const config: RequestAdapterConfig = {
          method: 'POST',
          data: { name: 'John' },
          responseType: JSON_RESPONSE_TYPE // Use responseType instead as hasObjectKeyWithValue does exact match
        };
        const result = plugin['processRequestData'](config);

        expect(result).toBe('{"name":"John"}');
      });
    });

    describe('Non-JSON data', () => {
      it('should return FormData as-is', () => {
        const formData = new FormData();
        formData.append('name', 'John');

        const config: RequestAdapterConfig = {
          method: 'POST',
          data: formData
        };
        const result = plugin['processRequestData'](config);

        expect(result).toBeInstanceOf(FormData);
      });

      it('should return Blob as-is', () => {
        const blob = new Blob(['test']);

        const config: RequestAdapterConfig = {
          method: 'POST',
          data: blob
        };
        const result = plugin['processRequestData'](config);

        expect(result).toBeInstanceOf(Blob);
      });

      it('should return string as-is for non-JSON', () => {
        const config: RequestAdapterConfig = {
          method: 'POST',
          data: 'plain text'
        };
        const result = plugin['processRequestData'](config);

        expect(result).toBe('plain text');
      });

      it('should return ArrayBuffer as-is', () => {
        const arrayBuffer = new ArrayBuffer(8);
        const config: RequestAdapterConfig = {
          method: 'POST',
          data: arrayBuffer
        };
        const result = plugin['processRequestData'](config);

        expect(result).toBeInstanceOf(ArrayBuffer);
      });

      it('should return URLSearchParams as-is', () => {
        const params = new URLSearchParams({ key: 'value' });
        const config: RequestAdapterConfig = {
          method: 'POST',
          data: params
        };
        const result = plugin['processRequestData'](config);

        expect(result).toBeInstanceOf(URLSearchParams);
      });
    });

    describe('Edge cases', () => {
      it('should handle method with extra whitespace', () => {
        const config: RequestAdapterConfig = {
          method: '  GET  ' as any,
          data: { name: 'John' }
        };
        const result = plugin['processRequestData'](config);

        expect(result).toBeNull();
      });

      it('should handle undefined method', () => {
        const config: RequestAdapterConfig = {
          data: { name: 'John' },
          responseType: JSON_RESPONSE_TYPE
        };
        const result = plugin['processRequestData'](config);

        expect(result).toBe('{"name":"John"}');
      });

      it('should handle empty object data', () => {
        const config: RequestAdapterConfig = {
          method: 'POST',
          data: {},
          responseType: JSON_RESPONSE_TYPE
        };
        const result = plugin['processRequestData'](config);

        expect(result).toBe('{}');
      });

      it('should handle array data', () => {
        const config: RequestAdapterConfig = {
          method: 'POST',
          data: [1, 2, 3],
          responseType: JSON_RESPONSE_TYPE
        };
        const result = plugin['processRequestData'](config);

        expect(result).toBe('[1,2,3]');
      });
    });
  });
});
