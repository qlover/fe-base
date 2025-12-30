import { SimpleUrlBuilder } from '../../../src/request/plugins';

describe('SimpleUrlBuilder', () => {
  let urlBuilder: SimpleUrlBuilder;

  beforeEach(() => {
    urlBuilder = new SimpleUrlBuilder();
  });

  describe('buildUrl', () => {
    it('should return empty string when no URL provided', () => {
      const config = {};
      const result = urlBuilder.buildUrl(config);
      expect(result).toBe('');
    });

    it('should return URL as-is when it is a full URL', () => {
      const config = {
        url: 'https://api.example.com/users'
      };
      const result = urlBuilder.buildUrl(config);
      expect(result).toBe('https://api.example.com/users');
    });

    it('should combine baseURL and path', () => {
      const config = {
        url: '/users',
        baseURL: 'https://api.example.com'
      };
      const result = urlBuilder.buildUrl(config);
      expect(result).toBe('https://api.example.com/users');
    });

    it('should handle trailing slashes correctly', () => {
      const config = {
        url: '/users/',
        baseURL: 'https://api.example.com/'
      };
      const result = urlBuilder.buildUrl(config);
      expect(result).toBe('https://api.example.com/users/');
    });

    it('should add query parameters', () => {
      const config = {
        url: '/users',
        baseURL: 'https://api.example.com',
        params: { id: '1', name: 'test' }
      };
      const result = urlBuilder.buildUrl(config);
      const resultUrl = new URL(result);
      expect(resultUrl.origin + resultUrl.pathname).toBe(
        'https://api.example.com/users'
      );
      expect(resultUrl.searchParams.get('id')).toBe('1');
      expect(resultUrl.searchParams.get('name')).toBe('test');
    });

    it('should encode query parameter values', () => {
      const config = {
        url: '/users',
        baseURL: 'https://api.example.com',
        params: { query: 'hello world', filter: 'name=john' }
      };
      const result = urlBuilder.buildUrl(config);
      const resultUrl = new URL(result);
      // URLSearchParams automatically decodes values when retrieved
      expect(resultUrl.searchParams.get('query')).toBe('hello world');
      expect(resultUrl.searchParams.get('filter')).toBe('name=john');
    });

    it('should skip null and undefined parameters', () => {
      const config = {
        url: '/users',
        baseURL: 'https://api.example.com',
        params: { valid: 'value', null: null, undefined: undefined }
      };
      const result = urlBuilder.buildUrl(config);
      expect(result).toBe('https://api.example.com/users?valid=value');
    });

    it('should prefer full URL over baseURL', () => {
      const config = {
        url: 'https://other.example.com/api',
        baseURL: 'https://api.example.com'
      };
      const result = urlBuilder.buildUrl(config);
      expect(result).toBe('https://other.example.com/api');
    });
  });
});
