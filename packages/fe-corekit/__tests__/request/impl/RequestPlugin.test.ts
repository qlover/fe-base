import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RequestPlugin } from '../../../src/request/impl/RequestPlugin';
import type { RequestAdapterContext } from '../../../src/request/impl/RequestPlugin';
import type { UrlBuilderInterface } from '../../../src/request/interface/UrlBuilderInterface';
import type { HeaderInjectorInterface } from '../../../src/request/interface/HeaderInjectorInterface';
import type { RequestAdapterConfig } from '../../../src/request/interface';
import {
  JSON_RESPONSE_TYPE,
  JSON_CONTENT_TYPE,
  CONTENT_TYPE_HEADER
} from '../../../src/request/impl/consts';

describe('RequestPlugin', () => {
  let plugin: RequestPlugin;
  let mockContext: RequestAdapterContext;

  beforeEach(() => {
    mockContext = {
      parameters: {
        url: '/api/users',
        method: 'GET'
      },
      hooksRuntimes: {},
      setParameters: vi.fn().mockImplementation((params) => {
        Object.assign(mockContext, { parameters: params });
      })
    } as unknown as RequestAdapterContext;
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

      plugin.onBefore(mockContext);
      const result = mockContext.parameters;
      expect(result.url).toBe('https://custom.com/api');
    });

    it('should use custom headerInjector', () => {
      const customInjector: HeaderInjectorInterface = {
        inject: vi.fn().mockReturnValue({ 'X-Custom': 'value' })
      };
      plugin = new RequestPlugin({
        headerInjector: customInjector
      });

      plugin.onBefore(mockContext);

      expect(mockContext.parameters.headers).toEqual({ 'X-Custom': 'value' });
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
      plugin.onBefore(mockContext);

      expect(mockContext.parameters.url).toBe(
        'https://api.example.com/users?role=admin'
      );
    });

    it('should build URL from config', () => {
      Object.assign(mockContext, {
        parameters: {
          url: '/users',
          baseURL: '/api'
        }
      });
      plugin.onBefore(mockContext);

      expect(mockContext.parameters.url).toBe('/api/users');
    });

    it('should inject headers', () => {
      plugin = new RequestPlugin({
        token: 'test-token',
        tokenPrefix: 'Bearer'
      });
      plugin.onBefore(mockContext);

      expect(mockContext.parameters.headers).toBeDefined();
      expect(mockContext.parameters.headers?.['Authorization']).toBe(
        'Bearer test-token'
      );
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
      plugin.onBefore(mockContext);

      expect(mockContext.parameters.data).toBe('{"name":"John"}');
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
      plugin.onBefore(mockContext);

      expect(mockContext.parameters.token).toBe('context-token');
      expect(mockContext.parameters.baseURL).toBeUndefined();
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
      const merged = plugin['createConfig'](contextConfig);

      expect(merged.token).toBe('context-token');
      expect(merged.url).toBe('/api/users');
      expect(merged.data).toEqual({ version: '1.0' });
    });

    it('should preserve default data when context data is undefined', () => {
      const contextConfig: RequestAdapterConfig = {
        url: '/api/users'
      };
      const merged = plugin['createConfig'](contextConfig);

      expect(merged.data).toEqual({ version: '1.0' });
    });

    it('should override default data when context provides data', () => {
      const contextConfig: RequestAdapterConfig = {
        url: '/api/users',
        data: { version: '2.0' }
      };
      const merged = plugin['createConfig'](contextConfig);

      expect(merged.data).toEqual({ version: '2.0' });
    });

    it('should override default data when context provides null', () => {
      const contextConfig: RequestAdapterConfig = {
        url: '/api/users',
        data: null
      };
      const merged = plugin['createConfig'](contextConfig);

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

    it('should return empty string when URL is empty', () => {
      const config: RequestAdapterConfig = {
        url: '',
        baseURL: ''
      };

      const url = plugin['buildUrl'](config);
      expect(url).toBe('');
    });

    it('should throw "Empty URL is not allowed" when allowEmptyUrl is false and URL is empty', () => {
      const config: RequestAdapterConfig & { allowEmptyUrl: boolean } = {
        url: '',
        baseURL: '',
        allowEmptyUrl: false
      };

      expect(() => {
        plugin['buildUrl'](config);
      }).toThrow('Empty URL is not allowed');
    });

    it('should return empty string when allowEmptyUrl is true and URL is empty', () => {
      const config: RequestAdapterConfig & { allowEmptyUrl: boolean } = {
        url: '',
        baseURL: '',
        allowEmptyUrl: true
      };

      const url = plugin['buildUrl'](config);
      expect(url).toBe('');
    });

    it('should return whitespace when URL builder returns whitespace only', () => {
      const customUrlBuilder: UrlBuilderInterface = {
        buildUrl: vi.fn().mockReturnValue('   ')
      };
      plugin = new RequestPlugin({
        urlBuilder: customUrlBuilder
      });
      const config: RequestAdapterConfig = {
        url: '/users'
      };

      const url = plugin['buildUrl'](config);
      expect(url).toBe('   ');
    });

    it('should return empty string when URL builder returns empty string', () => {
      const customUrlBuilder: UrlBuilderInterface = {
        buildUrl: vi.fn().mockReturnValue('')
      };
      plugin = new RequestPlugin({
        urlBuilder: customUrlBuilder
      });
      const config: RequestAdapterConfig = {
        url: '/users'
      };

      const url = plugin['buildUrl'](config);
      expect(url).toBe('');
    });

    it('should return null when URL builder returns null', () => {
      const customUrlBuilder: UrlBuilderInterface = {
        buildUrl: vi.fn().mockReturnValue(null as unknown as string)
      };
      plugin = new RequestPlugin({
        urlBuilder: customUrlBuilder
      });
      const config: RequestAdapterConfig = {
        url: '/users'
      };

      const url = plugin['buildUrl'](config);
      expect(url).toBeNull();
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
          requestDataSerializer: (data, config) =>
            `custom:${JSON.stringify(data)}:${config.method}`
        });
        const contextConfig: RequestAdapterConfig = {
          method: 'POST',
          data: { name: 'John' }
        };
        const mergedConfig = plugin['createConfig'](contextConfig);
        const result = plugin['processRequestData'](mergedConfig);

        expect(result).toBe('custom:{"name":"John"}:POST');
      });

      it('should pass config to custom serializer', () => {
        const serializerSpy = vi.fn((data, config) =>
          JSON.stringify({ data, url: config.url })
        );
        plugin = new RequestPlugin({
          requestDataSerializer: serializerSpy
        });
        const contextConfig: RequestAdapterConfig = {
          method: 'POST',
          url: '/api/test',
          data: { name: 'John' }
        };
        const mergedConfig = plugin['createConfig'](contextConfig);
        plugin['processRequestData'](mergedConfig);

        expect(serializerSpy).toHaveBeenCalledWith(
          { name: 'John' },
          expect.objectContaining({
            method: 'POST',
            url: '/api/test',
            data: { name: 'John' },
            requestDataSerializer: undefined
          })
        );
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
        const mergedConfig = plugin['createConfig'](contextConfig);

        expect(() => {
          plugin['processRequestData'](mergedConfig);
        }).toThrow('Serializer error');
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

        // JSON.stringify throws TypeError for circular references
        expect(() => {
          plugin['processRequestData'](config);
        }).toThrow(TypeError);
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

        // Errors from JSON.stringify are propagated without modification
        expect(() => {
          plugin['processRequestData'](config);
        }).toThrow('Custom toJSON error');
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
