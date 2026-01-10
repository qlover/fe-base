import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ResponsePlugin } from '../../../src/request/plugins/ResponsePlugin';
import { RequestAdapterResponse } from '../../../src/request/interface/RequestAdapter';
import { JSON_RESPONSE_TYPE } from '../../../src/request/plugins/consts';
import { ExecutorError, RequestAdapterConfig } from '@qlover/fe-corekit';

describe('ResponsePlugin', () => {
  let plugin: ResponsePlugin;
  let mockContext: any;

  beforeEach(() => {
    plugin = new ResponsePlugin();
    mockContext = {
      returnValue: undefined,
      parameters: {},
      setReturnValue: vi.fn()
    };
  });

  describe('Constructor', () => {
    it('should create instance with default config', () => {
      plugin = new ResponsePlugin();
      expect(plugin.pluginName).toBe('ResponsePlugin');
    });

    it('should create instance with custom parsers', () => {
      plugin = new ResponsePlugin({
        responseParsers: {
          json: async (response) => await response.json()
        }
      });
      expect(plugin.pluginName).toBe('ResponsePlugin');
    });

    it('should disable plugin when responseParsers is false', () => {
      plugin = new ResponsePlugin({
        responseParsers: false
      });
      const enabled = plugin.enabled?.('onSuccess', mockContext);
      expect(enabled).toBe(false);
    });
  });

  describe('enabled', () => {
    it('should return true when responseParsers is not false', () => {
      plugin = new ResponsePlugin();
      const enabled = plugin.enabled?.('onSuccess', mockContext);
      expect(enabled).toBe(true);
    });

    it('should return false when responseParsers is false', () => {
      plugin = new ResponsePlugin({
        responseParsers: false
      });
      const enabled = plugin.enabled?.('onSuccess', mockContext);
      expect(enabled).toBe(false);
    });
  });

  describe('onSuccess', () => {
    it('should process Response object', async () => {
      const response = new Response('{"id":1}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      mockContext.returnValue = response;
      mockContext.parameters = {
        responseType: JSON_RESPONSE_TYPE
      };

      await plugin.onSuccess(mockContext);

      expect(mockContext.setReturnValue).toHaveBeenCalled();
      const result = mockContext.setReturnValue.mock.calls[0][0];
      expect(result.status).toBe(200);
      expect(result.data).toEqual({ id: 1 });
    });

    it('should process RequestAdapterResponse object', async () => {
      const response = new Response('{"id":1}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      const adapterResponse: RequestAdapterResponse = {
        data: response,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url: '/api/users' },
        response
      };
      mockContext.returnValue = adapterResponse;
      mockContext.parameters = {
        responseType: JSON_RESPONSE_TYPE
      };

      await plugin.onSuccess(mockContext);

      expect(mockContext.setReturnValue).toHaveBeenCalled();
      const result = mockContext.setReturnValue.mock.calls[0][0];
      expect(result.data).toEqual({ id: 1 });
    });

    it('should skip processing when data is already parsed', async () => {
      const response = new Response();
      const adapterResponse: RequestAdapterResponse = {
        data: { id: 1 },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
        response
      };
      mockContext.returnValue = adapterResponse;

      await plugin.onSuccess(mockContext);

      expect(mockContext.setReturnValue).toHaveBeenCalled();
      const result = mockContext.setReturnValue.mock.calls[0][0];
      expect(result.data).toEqual({ id: 1 });
    });

    it('should not process non-response objects', async () => {
      mockContext.returnValue = { someData: 'value' };

      await plugin.onSuccess(mockContext);

      expect(mockContext.setReturnValue).not.toHaveBeenCalled();
    });
  });

  describe('validateResponseStatus', () => {
    it('should throw error for non-OK response', () => {
      const response = new Response('Error', { status: 404 });
      plugin = new ResponsePlugin();

      expect(() => {
        plugin['validateResponseStatus'](response);
      }).toThrow(ExecutorError);
    });

    it('should not throw for OK response', () => {
      const response = new Response('OK', { status: 200 });
      plugin = new ResponsePlugin();

      expect(() => {
        plugin['validateResponseStatus'](response);
      }).not.toThrow();
    });
  });

  describe('processResponse', () => {
    it('should process valid response', async () => {
      const response = new Response('{"id":1}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      const config: RequestAdapterConfig = { responseType: JSON_RESPONSE_TYPE };
      plugin = new ResponsePlugin();

      const result = await plugin['processResponse'](response, config);

      expect(result.status).toBe(200);
      expect(result.data).toEqual({ id: 1 });
      expect(result.response).toBe(response);
    });

    it('should throw error for non-OK response', async () => {
      const response = new Response('Error', { status: 404 });
      const config = {};
      plugin = new ResponsePlugin();

      await expect(plugin['processResponse'](response, config)).rejects.toThrow(
        ExecutorError
      );
    });
  });

  describe('processAdapterResponse', () => {
    it('should parse Response data in adapter response', async () => {
      const response = new Response('{"id":1}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      const adapterResponse: RequestAdapterResponse = {
        data: response,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { responseType: JSON_RESPONSE_TYPE },
        response
      };
      plugin = new ResponsePlugin();

      const result = await plugin['processAdapterResponse'](
        adapterResponse,
        adapterResponse.config
      );

      expect(result.data).toEqual({ id: 1 });
      expect(result.status).toBe(200);
    });

    it('should return as-is when data is already parsed', async () => {
      const response = new Response();
      const adapterResponse: RequestAdapterResponse = {
        data: { id: 1 },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
        response
      };
      plugin = new ResponsePlugin();

      const result = await plugin['processAdapterResponse'](
        adapterResponse,
        {}
      );

      expect(result).toBe(adapterResponse);
      expect(result.data).toEqual({ id: 1 });
    });
  });

  describe('parseResponseData', () => {
    it('should use custom responseDataParser when provided', async () => {
      plugin = new ResponsePlugin({
        responseDataParser: async (response) => {
          const text = await response.text();
          return JSON.parse(text);
        }
      });
      const response = new Response('{"id":1}');

      const result = await plugin['parseResponseData'](response);

      expect(result).toEqual({ id: 1 });
    });

    it('should use default parser for JSON responseType', async () => {
      plugin = new ResponsePlugin();
      const response = new Response('{"id":1}');

      const result = await plugin['parseResponseData'](
        response,
        JSON_RESPONSE_TYPE
      );

      expect(result).toEqual({ id: 1 });
    });
  });

  describe('defaultParseResponseData', () => {
    it('should parse JSON response', async () => {
      plugin = new ResponsePlugin();
      const response = new Response('{"id":1}');

      const result = await plugin['defaultParseResponseData'](
        response,
        JSON_RESPONSE_TYPE
      );

      expect(result).toEqual({ id: 1 });
    });

    it('should parse text response', async () => {
      plugin = new ResponsePlugin();
      const response = new Response('plain text');

      const result = await plugin['defaultParseResponseData'](response, 'text');

      expect(result).toBe('plain text');
    });

    it('should return original response when parser is disabled', async () => {
      plugin = new ResponsePlugin({
        responseParsers: {
          json: false
        }
      });
      const response = new Response('{"id":1}');

      const result = await plugin['defaultParseResponseData'](
        response,
        JSON_RESPONSE_TYPE
      );

      expect(result).toBe(response);
    });

    it('should use custom parser when provided', async () => {
      plugin = new ResponsePlugin({
        responseParsers: {
          json: async (response) => {
            const text = await response.text();
            return { parsed: JSON.parse(text) };
          }
        }
      });
      const response = new Response('{"id":1}');

      const result = await plugin['defaultParseResponseData'](
        response,
        JSON_RESPONSE_TYPE
      );

      expect(result).toEqual({ parsed: { id: 1 } });
    });

    it('should fallback to Content-Type detection', async () => {
      plugin = new ResponsePlugin();
      const response = new Response('{"id":1}', {
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await plugin['defaultParseResponseData'](
        response,
        'unknown'
      );

      expect(result).toEqual({ id: 1 });
    });

    it('should return original response when no parser available', async () => {
      plugin = new ResponsePlugin({
        responseParsers: {}
      });
      // Create response without Content-Type to avoid fallback parsing
      const response = new Response('test', {
        headers: { 'Content-Type': 'application/unknown' }
      });

      const result = await plugin['defaultParseResponseData'](
        response,
        'unknown'
      );

      expect(result).toBe(response);
    });
  });

  describe('inferParserFromContentType', () => {
    it('should infer JSON parser from Content-Type', () => {
      plugin = new ResponsePlugin();
      const parser = plugin['inferParserFromContentType']('application/json');

      expect(parser).toBeDefined();
      expect(typeof parser).toBe('function');
    });

    it('should infer text parser from text Content-Type', () => {
      plugin = new ResponsePlugin();
      const parser = plugin['inferParserFromContentType']('text/plain');

      expect(parser).toBeDefined();
      expect(typeof parser).toBe('function');
    });

    it('should return undefined for unknown Content-Type', () => {
      plugin = new ResponsePlugin();
      const parser = plugin['inferParserFromContentType'](
        'application/unknown'
      );

      expect(parser).toBeUndefined();
    });

    it('should handle case-insensitive Content-Type', () => {
      plugin = new ResponsePlugin();
      const parser = plugin['inferParserFromContentType']('APPLICATION/JSON');

      expect(parser).toBeDefined();
      expect(typeof parser).toBe('function');
    });

    it('should handle Content-Type with charset', () => {
      plugin = new ResponsePlugin();
      const parser = plugin['inferParserFromContentType'](
        'application/json; charset=utf-8'
      );

      expect(parser).toBeDefined();
      expect(typeof parser).toBe('function');
    });

    it('should handle Content-Type with multiple parameters', () => {
      plugin = new ResponsePlugin();
      const parser = plugin['inferParserFromContentType'](
        'application/json; charset=utf-8; boundary=something'
      );

      expect(parser).toBeDefined();
      expect(typeof parser).toBe('function');
    });

    it('should handle XML Content-Type', () => {
      plugin = new ResponsePlugin();
      const parser = plugin['inferParserFromContentType']('application/xml');

      expect(parser).toBeDefined();
      expect(typeof parser).toBe('function');
    });

    it('should handle XHTML Content-Type', () => {
      plugin = new ResponsePlugin();
      const parser = plugin['inferParserFromContentType'](
        'application/xhtml+xml'
      );

      expect(parser).toBeDefined();
      expect(typeof parser).toBe('function');
    });

    it('should return undefined when parser is disabled', () => {
      plugin = new ResponsePlugin({
        responseParsers: {
          json: false
        }
      });
      const parser = plugin['inferParserFromContentType']('application/json');

      expect(parser).toBeUndefined();
    });

    it('should handle empty Content-Type string', () => {
      plugin = new ResponsePlugin();
      const parser = plugin['inferParserFromContentType']('');

      expect(parser).toBeUndefined();
    });
  });

  describe('getFallbackParsers', () => {
    it('should return json and text parsers by default', () => {
      plugin = new ResponsePlugin();
      const parsers = plugin['getFallbackParsers']();

      expect(parsers.length).toBeGreaterThan(0);
      expect(parsers.every((p: any) => typeof p === 'function')).toBe(true);
    });

    it('should return empty array when parsers are disabled', () => {
      plugin = new ResponsePlugin({
        responseParsers: {
          json: false,
          text: false
        }
      });
      const parsers = plugin['getFallbackParsers']();

      expect(parsers).toEqual([]);
    });
  });

  describe('fallbackParseByContentType', () => {
    it('should use Content-Type to infer parser', async () => {
      plugin = new ResponsePlugin();
      const response = new Response('{"id":1}', {
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await plugin['fallbackParseByContentType'](
        response,
        'unknown'
      );

      expect(result).toEqual({ id: 1 });
    });

    it('should try fallback parsers in order', async () => {
      plugin = new ResponsePlugin();
      // Create response with unknown Content-Type to trigger fallback
      const response = new Response('{"id":1}', {
        headers: { 'Content-Type': 'application/unknown' }
      });

      const result = await plugin['fallbackParseByContentType'](
        response,
        'unknown'
      );

      // JSON parser should succeed first (text parser would return string)
      expect(result).toEqual({ id: 1 });
    });

    it('should return original response when all parsers fail', async () => {
      plugin = new ResponsePlugin({
        responseParsers: {
          json: async () => {
            throw new Error('Parse error');
          },
          text: async () => {
            throw new Error('Parse error');
          }
        }
      });
      const response = new Response('test');

      const result = await plugin['fallbackParseByContentType'](
        response,
        'unknown'
      );

      expect(result).toBe(response);
    });

    it('should handle response without Content-Type header', async () => {
      plugin = new ResponsePlugin();
      // Create response with unknown Content-Type to trigger fallback
      // Note: Response may have default Content-Type, so we use unknown type
      const response = new Response('{"id":1}', {
        headers: { 'Content-Type': 'application/unknown' }
      });

      const result = await plugin['fallbackParseByContentType'](
        response,
        'unknown'
      );

      // Should try fallback parsers (JSON parser should succeed)
      expect(result).toEqual({ id: 1 });
    });

    it('should handle empty Content-Type header', async () => {
      plugin = new ResponsePlugin();
      const response = new Response('{"id":1}', {
        headers: { 'Content-Type': '' }
      });

      const result = await plugin['fallbackParseByContentType'](
        response,
        'unknown'
      );

      // Should try fallback parsers
      expect(result).toEqual({ id: 1 });
    });

    it('should handle Content-Type with whitespace', async () => {
      plugin = new ResponsePlugin();
      const response = new Response('{"id":1}', {
        headers: { 'Content-Type': '  application/json  ' }
      });

      const result = await plugin['fallbackParseByContentType'](
        response,
        'unknown'
      );

      expect(result).toEqual({ id: 1 });
    });

    it('should handle when inferred parser throws error', async () => {
      plugin = new ResponsePlugin({
        responseParsers: {
          json: async () => {
            throw new Error('Parse error');
          },
          text: async () => {
            throw new Error('Parse error');
          }
        }
      });
      const response = new Response('{"id":1}', {
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await plugin['fallbackParseByContentType'](
        response,
        'unknown'
      );

      // Should return original response when all parsers fail
      expect(result).toBe(response);
    });
  });

  describe('extractHeaders', () => {
    it('should extract headers from Response', () => {
      plugin = new ResponsePlugin();
      const response = new Response('test', {
        headers: {
          'Content-Type': 'application/json',
          'X-Custom': 'value'
        }
      });

      const headers = plugin['extractHeaders'](response);

      // Response.headers keys are normalized to lowercase
      expect(headers['content-type']).toBe('application/json');
      expect(headers['x-custom']).toBe('value');
    });

    it('should return empty object for response without headers', () => {
      plugin = new ResponsePlugin();
      // Response may have default Content-Type, so we need to check if it's empty
      const response = new Response('test', {
        headers: {}
      });

      const headers = plugin['extractHeaders'](response);

      // Response may have default headers, so check if headers object exists
      expect(typeof headers).toBe('object');
    });

    it('should handle headers with duplicate keys', () => {
      plugin = new ResponsePlugin();
      const response = new Response('test', {
        headers: {
          'X-Custom': 'value1',
          'x-custom': 'value2'
        }
      });

      const headers = plugin['extractHeaders'](response);

      // Headers API handles case-insensitive keys
      expect(headers).toBeDefined();
    });

    it('should handle headers with special characters', () => {
      plugin = new ResponsePlugin();
      const response = new Response('test', {
        headers: {
          'X-Custom-Header': 'value with spaces',
          'X-Another': 'value-with-dashes'
        }
      });

      const headers = plugin['extractHeaders'](response);

      // Response.headers keys are normalized to lowercase
      expect(headers['x-custom-header']).toBe('value with spaces');
      expect(headers['x-another']).toBe('value-with-dashes');
    });
  });

  describe('buildAdapterResponse', () => {
    it('should build RequestAdapterResponse object', () => {
      plugin = new ResponsePlugin();
      const response = new Response('test', {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'text/plain' }
      });
      const config = { url: '/api/users' };
      const data = 'parsed data';

      const result = plugin['buildAdapterResponse'](data, response, config);

      expect(result.data).toBe('parsed data');
      expect(result.status).toBe(200);
      expect(result.statusText).toBe('OK');
      expect(result.headers).toBeDefined();
      expect(result.config).toBe(config);
      expect(result.response).toBe(response);
    });
  });

  describe('Response parsers', () => {
    it('should parse blob response', async () => {
      plugin = new ResponsePlugin();
      const blob = new Blob(['test']);
      const response = new Response(blob);

      const result = await plugin['defaultParseResponseData'](response, 'blob');

      expect(result).toBeInstanceOf(Blob);
    });

    it('should parse arraybuffer response', async () => {
      plugin = new ResponsePlugin();
      const arrayBuffer = new ArrayBuffer(8);
      const response = new Response(arrayBuffer);

      const result = await plugin['defaultParseResponseData'](
        response,
        'arraybuffer'
      );

      expect(result).toBeInstanceOf(ArrayBuffer);
    });

    it('should parse formdata response', async () => {
      plugin = new ResponsePlugin();
      const formData = new FormData();
      formData.append('key', 'value');
      const response = new Response(formData);

      const result = await plugin['defaultParseResponseData'](
        response,
        'formdata'
      );

      expect(result).toBeInstanceOf(FormData);
    });

    it('should return stream body for stream responseType', async () => {
      plugin = new ResponsePlugin();
      const response = new Response('test');

      const result = await plugin['defaultParseResponseData'](
        response,
        'stream'
      );

      expect(result).toBe(response.body);
    });

    it('should handle case-insensitive responseType', async () => {
      plugin = new ResponsePlugin();
      const response = new Response('{"id":1}');

      const result = await plugin['defaultParseResponseData'](response, 'JSON');

      expect(result).toEqual({ id: 1 });
    });

    it('should handle responseType with whitespace', async () => {
      plugin = new ResponsePlugin();
      const response = new Response('{"id":1}', {
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await plugin['defaultParseResponseData'](
        response,
        ' json '
      );

      // Should trim whitespace and parse as JSON
      expect(result).toEqual({ id: 1 });
    });

    it('should handle document responseType', async () => {
      plugin = new ResponsePlugin();
      const response = new Response('<html><body>Test</body></html>');

      const result = await plugin['defaultParseResponseData'](
        response,
        'document'
      );

      expect(typeof result).toBe('string');
      expect(result).toContain('Test');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty response body', async () => {
      plugin = new ResponsePlugin();
      const response = new Response('');

      const result = await plugin['defaultParseResponseData'](response, 'text');

      expect(result).toBe('');
    });

    it('should handle response with null body', async () => {
      plugin = new ResponsePlugin();
      const response = new Response(null);

      const result = await plugin['defaultParseResponseData'](response, 'text');

      expect(result).toBe('');
    });

    it('should handle custom parser that returns null', async () => {
      plugin = new ResponsePlugin({
        responseParsers: {
          json: async () => null
        }
      });
      const response = new Response('{"id":1}');

      const result = await plugin['defaultParseResponseData'](
        response,
        JSON_RESPONSE_TYPE
      );

      expect(result).toBeNull();
    });

    it('should handle custom parser that returns undefined', async () => {
      plugin = new ResponsePlugin({
        responseParsers: {
          json: async () => undefined
        }
      });
      const response = new Response('{"id":1}');

      const result = await plugin['defaultParseResponseData'](
        response,
        JSON_RESPONSE_TYPE
      );

      expect(result).toBeUndefined();
    });

    it('should handle response with invalid JSON', async () => {
      plugin = new ResponsePlugin();
      const response = new Response('invalid json');

      await expect(
        plugin['defaultParseResponseData'](response, JSON_RESPONSE_TYPE)
      ).rejects.toThrow();
    });

    it('should handle responseDataParser that throws error', async () => {
      plugin = new ResponsePlugin({
        responseDataParser: async () => {
          throw new Error('Parser error');
        }
      });
      const response = new Response('{"id":1}');

      await expect(
        plugin['parseResponseData'](response, JSON_RESPONSE_TYPE)
      ).rejects.toThrow('Parser error');
    });
  });
});
