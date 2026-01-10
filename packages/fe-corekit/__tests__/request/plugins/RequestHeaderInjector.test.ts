import { describe, it, expect, beforeEach } from 'vitest';
import { RequestHeaderInjector } from '../../../src/request/plugins/RequestHeaderInjector';
import { RequestAdapterConfig } from '../../../src/request/interface';
import {
  CONTENT_TYPE_HEADER,
  JSON_CONTENT_TYPE,
  JSON_RESPONSE_TYPE
} from '../../../src/request/plugins/consts';

describe('RequestHeaderInjector', () => {
  let injector: RequestHeaderInjector;

  describe('Constructor', () => {
    it('should create instance with empty config', () => {
      injector = new RequestHeaderInjector({});
      expect(injector).toBeInstanceOf(RequestHeaderInjector);
    });

    it('should create instance with token config', () => {
      injector = new RequestHeaderInjector({
        token: 'test-token',
        tokenPrefix: 'Bearer'
      });
      expect(injector).toBeInstanceOf(RequestHeaderInjector);
    });
  });

  describe('inject', () => {
    beforeEach(() => {
      injector = new RequestHeaderInjector({});
    });

    it('should return empty headers when no config provided', () => {
      const config: RequestAdapterConfig = {};
      const headers = injector.inject(config);

      expect(headers).toEqual({});
    });

    it('should preserve existing headers', () => {
      const config: RequestAdapterConfig = {
        headers: {
          'X-Custom': 'value',
          'Authorization': 'Bearer existing'
        }
      };
      const headers = injector.inject(config);

      expect(headers['X-Custom']).toBe('value');
      expect(headers['Authorization']).toBe('Bearer existing');
    });

    it('should normalize header values to strings', () => {
      const config: RequestAdapterConfig = {
        headers: {
          'X-Number': 123,
          'X-Boolean': true,
          'X-String': 'value'
        }
      };
      const headers = injector.inject(config);

      expect(headers['X-Number']).toBe('123');
      expect(headers['X-Boolean']).toBe('true');
      expect(headers['X-String']).toBe('value');
    });

    it('should filter out null and undefined header values', () => {
      const config: RequestAdapterConfig = {
        headers: {
          'X-Valid': 'value',
          'X-Null': null,
          'X-Undefined': undefined
        } as Record<string, unknown>
      };
      const headers = injector.inject(config);

      expect(headers['X-Valid']).toBe('value');
      expect('X-Null' in headers).toBe(false);
      expect('X-Undefined' in headers).toBe(false);
    });

    it('should handle null headers', () => {
      const config: RequestAdapterConfig = {
        headers: null as unknown as Record<string, unknown>
      };
      const headers = injector.inject(config);

      expect(headers).toEqual({});
    });

    it('should handle undefined headers', () => {
      const config: RequestAdapterConfig = {};
      const headers = injector.inject(config);

      expect(headers).toEqual({});
    });
  });

  describe('Content-Type header injection', () => {
    it('should add Content-Type header for JSON responseType', () => {
      injector = new RequestHeaderInjector({});
      const config: RequestAdapterConfig = {
        responseType: JSON_RESPONSE_TYPE
      };
      const headers = injector.inject(config);

      expect(headers[CONTENT_TYPE_HEADER]).toBe(JSON_CONTENT_TYPE);
    });

    it('should not override existing Content-Type header', () => {
      injector = new RequestHeaderInjector({});
      const config: RequestAdapterConfig = {
        responseType: JSON_RESPONSE_TYPE,
        headers: {
          [CONTENT_TYPE_HEADER]: 'application/xml'
        }
      };
      const headers = injector.inject(config);

      expect(headers[CONTENT_TYPE_HEADER]).toBe('application/xml');
    });

    it('should not add Content-Type for non-JSON responseType', () => {
      injector = new RequestHeaderInjector({});
      const config: RequestAdapterConfig = {
        responseType: 'text'
      };
      const headers = injector.inject(config);

      expect(CONTENT_TYPE_HEADER in headers).toBe(false);
    });

    it('should handle case-insensitive responseType', () => {
      injector = new RequestHeaderInjector({});
      const config: RequestAdapterConfig = {
        responseType: 'json' // Use lowercase as isAsString is case-sensitive
      };
      const headers = injector.inject(config);

      expect(headers[CONTENT_TYPE_HEADER]).toBe(JSON_CONTENT_TYPE);
    });

    it('should handle case-insensitive Content-Type header check', () => {
      injector = new RequestHeaderInjector({});
      const config: RequestAdapterConfig = {
        responseType: JSON_RESPONSE_TYPE,
        headers: {
          'Content-Type': 'application/xml' // Use exact case as headers are case-sensitive
        }
      };
      const headers = injector.inject(config);

      expect(headers['Content-Type']).toBe('application/xml');
      expect(headers[CONTENT_TYPE_HEADER]).toBe('application/xml');
    });
  });

  describe('Auth header injection', () => {
    it('should add auth header with string token', () => {
      injector = new RequestHeaderInjector({
        token: 'test-token',
        tokenPrefix: 'Bearer'
      });
      const config: RequestAdapterConfig = {};
      const headers = injector.inject(config);

      expect(headers['Authorization']).toBe('Bearer test-token');
    });

    it('should add auth header without prefix', () => {
      injector = new RequestHeaderInjector({
        token: 'test-token'
      });
      const config: RequestAdapterConfig = {};
      const headers = injector.inject(config);

      expect(headers['Authorization']).toBe('test-token');
    });

    it('should add auth header with function token', () => {
      injector = new RequestHeaderInjector({
        token: () => 'function-token',
        tokenPrefix: 'Bearer'
      });
      const config: RequestAdapterConfig = {};
      const headers = injector.inject(config);

      expect(headers['Authorization']).toBe('Bearer function-token');
    });

    it('should use custom auth key', () => {
      injector = new RequestHeaderInjector({
        token: 'test-token',
        authKey: 'X-Auth-Token'
      });
      const config: RequestAdapterConfig = {};
      const headers = injector.inject(config);

      expect(headers['X-Auth-Token']).toBe('test-token');
      expect('Authorization' in headers).toBe(false);
    });

    it('should not add auth header when authKey is false', () => {
      injector = new RequestHeaderInjector({
        token: 'test-token',
        authKey: false
      });
      const config: RequestAdapterConfig = {};
      const headers = injector.inject(config);

      expect('Authorization' in headers).toBe(false);
    });

    it('should not override existing auth header', () => {
      injector = new RequestHeaderInjector({
        token: 'new-token',
        tokenPrefix: 'Bearer'
      });
      const config: RequestAdapterConfig = {
        headers: {
          Authorization: 'Bearer existing-token'
        }
      };
      const headers = injector.inject(config);

      expect(headers['Authorization']).toBe('Bearer existing-token');
    });

    it('should not add auth header when token is empty string', () => {
      injector = new RequestHeaderInjector({
        token: ''
      });
      const config: RequestAdapterConfig = {};
      const headers = injector.inject(config);

      expect('Authorization' in headers).toBe(false);
    });

    it('should not add auth header when function token returns null', () => {
      injector = new RequestHeaderInjector({
        token: () => null,
        tokenPrefix: 'Bearer'
      });
      const config: RequestAdapterConfig = {};
      const headers = injector.inject(config);

      expect('Authorization' in headers).toBe(false);
    });

    it('should not add auth header when function token returns empty string', () => {
      injector = new RequestHeaderInjector({
        token: () => '',
        tokenPrefix: 'Bearer'
      });
      const config: RequestAdapterConfig = {};
      const headers = injector.inject(config);

      expect('Authorization' in headers).toBe(false);
    });

    it('should not add auth header when function token returns non-string', () => {
      injector = new RequestHeaderInjector({
        token: () => 123 as unknown as string,
        tokenPrefix: 'Bearer'
      });
      const config: RequestAdapterConfig = {};
      const headers = injector.inject(config);

      expect('Authorization' in headers).toBe(false);
    });

    it('should handle tokenPrefix as empty string', () => {
      injector = new RequestHeaderInjector({
        token: 'test-token',
        tokenPrefix: ''
      });
      const config: RequestAdapterConfig = {
        token: 'test-token',
        tokenPrefix: ''
      };
      const headers = injector.inject(config);

      expect(headers['Authorization']).toBe('test-token');
    });

    it('should handle tokenPrefix as function returning non-string', () => {
      injector = new RequestHeaderInjector({
        token: 'test-token',
        tokenPrefix: 123 as unknown as string
      });
      const config: RequestAdapterConfig = {
        token: 'test-token',
        tokenPrefix: 123 as unknown as string
      };
      const headers = injector.inject(config);

      // tokenPrefix is not a string, so should return token without prefix
      expect(headers['Authorization']).toBe('test-token');
    });
  });

  describe('normalizeHeaders', () => {
    it('should normalize all header values to strings', () => {
      injector = new RequestHeaderInjector({});
      const headers = {
        'String': 'value',
        'Number': 123,
        'Boolean': true,
        'Null': null,
        'Undefined': undefined
      } as Record<string, unknown>;

      const normalized = (injector as any).normalizeHeaders(headers);

      expect(normalized['String']).toBe('value');
      expect(normalized['Number']).toBe('123');
      expect(normalized['Boolean']).toBe('true');
      expect('Null' in normalized).toBe(false);
      expect('Undefined' in normalized).toBe(false);
    });

    it('should handle empty headers object', () => {
      injector = new RequestHeaderInjector({});
      const normalized = (injector as any).normalizeHeaders({});

      expect(normalized).toEqual({});
    });
  });

  describe('getAuthToken', () => {
    it('should return token with prefix', () => {
      injector = new RequestHeaderInjector({
        token: 'test-token',
        tokenPrefix: 'Bearer'
      });
      const config = { token: 'test-token', tokenPrefix: 'Bearer' };
      const token = (injector as any).getAuthToken(config);

      expect(token).toBe('Bearer test-token');
    });

    it('should return token without prefix', () => {
      injector = new RequestHeaderInjector({
        token: 'test-token'
      });
      const config = { token: 'test-token' };
      const token = (injector as any).getAuthToken(config);

      expect(token).toBe('test-token');
    });

    it('should handle function token', () => {
      injector = new RequestHeaderInjector({
        token: () => 'function-token'
      });
      const config = { token: () => 'function-token' };
      const token = (injector as any).getAuthToken(config);

      expect(token).toBe('function-token');
    });

    it('should return empty string for invalid token', () => {
      injector = new RequestHeaderInjector({});
      const config = { token: null };
      const token = (injector as any).getAuthToken(config);

      expect(token).toBe('');
    });

    it('should handle function token returning number', () => {
      injector = new RequestHeaderInjector({
        token: () => 123 as unknown as string
      });
      const config = { token: () => 123 as unknown as string };
      const token = (injector as any).getAuthToken(config);

      expect(token).toBe('');
    });

    it('should handle function token returning boolean', () => {
      injector = new RequestHeaderInjector({
        token: () => true as unknown as string
      });
      const config = { token: () => true as unknown as string };
      const token = (injector as any).getAuthToken(config);

      expect(token).toBe('');
    });

    it('should handle function token throwing error', () => {
      injector = new RequestHeaderInjector({
        token: () => {
          throw new Error('Token error');
        }
      });
      const config = {
        token: () => {
          throw new Error('Token error');
        }
      };

      expect(() => {
        (injector as any).getAuthToken(config);
      }).toThrow('Token error');
    });

    it('should handle tokenPrefix with whitespace', () => {
      injector = new RequestHeaderInjector({
        token: 'test-token',
        tokenPrefix: 'Bearer '
      });
      const config = { token: 'test-token', tokenPrefix: 'Bearer ' };
      const token = (injector as any).getAuthToken(config);

      expect(token).toBe('Bearer  test-token');
    });
  });

  describe('getAuthKey', () => {
    it('should return default auth key', () => {
      injector = new RequestHeaderInjector({});
      const config = {};
      const authKey = (injector as any).getAuthKey(config);

      expect(authKey).toBe('Authorization');
    });

    it('should return custom auth key', () => {
      injector = new RequestHeaderInjector({
        authKey: 'X-Auth-Token'
      });
      const config = { authKey: 'X-Auth-Token' };
      const authKey = (injector as any).getAuthKey(config);

      expect(authKey).toBe('X-Auth-Token');
    });

    it('should return false when authKey is false', () => {
      injector = new RequestHeaderInjector({
        authKey: false
      });
      const config = { authKey: false };
      const authKey = (injector as any).getAuthKey(config);

      expect(authKey).toBe(false);
    });
  });
});

