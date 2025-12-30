import { FetchURLPlugin, SimpleUrlBuilder } from '../../../src/request/plugins';

describe('FetchURLPlugin', () => {
  let plugin: FetchURLPlugin;

  beforeEach(() => {
    plugin = new FetchURLPlugin();
  });

  describe('constructor', () => {
    it('should use default SimpleUrlBuilder when no urlBuilder provided', () => {
      const defaultPlugin = new FetchURLPlugin();
      expect(defaultPlugin).toBeInstanceOf(FetchURLPlugin);
    });

    it('should accept custom UrlBuilder implementation', () => {
      const customUrlBuilder = new SimpleUrlBuilder();
      const customPlugin = new FetchURLPlugin(customUrlBuilder);
      expect(customPlugin).toBeInstanceOf(FetchURLPlugin);
    });
  });

  describe('buildUrl', () => {
    it('should correctly build URL with baseURL', () => {
      const config = {
        url: '/users',
        baseURL: 'https://api.example.com'
      };
      const result = plugin.buildUrl(config);
      expect(result).toBe('https://api.example.com/users');
    });

    it('should handle slashes in baseURL and path', () => {
      const config = {
        url: '/users/',
        baseURL: 'https://api.example.com/'
      };
      const result = plugin.buildUrl(config);
      expect(result.replace(/\/$/, '')).toBe('https://api.example.com/users');
    });

    it('should preserve full URLs', () => {
      const config = {
        url: 'https://other.example.com/api',
        baseURL: 'https://api.example.com'
      };
      const result = plugin.buildUrl(config);
      expect(result).toBe('https://other.example.com/api');
    });

    it('should add query parameters', () => {
      const config = {
        url: '/users',
        baseURL: 'https://api.example.com',
        params: { id: '1', name: 'test' }
      };
      const result = plugin.buildUrl(config);
      const resultUrl = new URL(result);
      expect(resultUrl.origin + resultUrl.pathname).toBe(
        'https://api.example.com/users'
      );
      expect(resultUrl.searchParams.get('id')).toBe('1');
      expect(resultUrl.searchParams.get('name')).toBe('test');
    });
  });
});
