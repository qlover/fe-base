import { describe, it, expect } from 'vitest';
import { SimpleUrlBuilder } from '../../../src/request/utils/SimpleUrlBuilder';
import type { RequestAdapterConfig } from '../../../src/request/interface';

describe('SimpleUrlBuilder', () => {
  let urlBuilder: SimpleUrlBuilder;

  beforeEach(() => {
    urlBuilder = new SimpleUrlBuilder();
  });

  describe('isFullURL', () => {
    it('should return true for http:// URLs', () => {
      expect(urlBuilder.isFullURL('http://example.com')).toBe(true);
      expect(urlBuilder.isFullURL('http://api.example.com/users')).toBe(true);
    });

    it('should return true for https:// URLs', () => {
      expect(urlBuilder.isFullURL('https://example.com')).toBe(true);
      expect(urlBuilder.isFullURL('https://api.example.com/users')).toBe(true);
    });

    it('should return false for relative URLs', () => {
      expect(urlBuilder.isFullURL('/users')).toBe(false);
      expect(urlBuilder.isFullURL('users')).toBe(false);
      expect(urlBuilder.isFullURL('./users')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(urlBuilder.isFullURL('')).toBe(false);
    });
  });

  describe('buildUrl', () => {
    describe('Basic URL building', () => {
      it('should return empty string when url is empty', () => {
        const config: RequestAdapterConfig = {
          url: ''
        };

        expect(urlBuilder.buildUrl(config)).toBe('');
      });

      it('should return empty string when url is not provided', () => {
        const config: RequestAdapterConfig = {};

        expect(urlBuilder.buildUrl(config)).toBe('');
      });

      it('should build URL with baseURL and relative path', () => {
        const config: RequestAdapterConfig = {
          url: '/users',
          baseURL: 'https://api.example.com'
        };

        expect(urlBuilder.buildUrl(config)).toBe(
          'https://api.example.com/users'
        );
      });

      it('should build URL with baseURL and path without leading slash', () => {
        const config: RequestAdapterConfig = {
          url: 'users',
          baseURL: 'https://api.example.com'
        };

        expect(urlBuilder.buildUrl(config)).toBe(
          'https://api.example.com/users'
        );
      });

      it('should handle baseURL with trailing slash', () => {
        const config: RequestAdapterConfig = {
          url: '/users',
          baseURL: 'https://api.example.com/'
        };

        expect(urlBuilder.buildUrl(config)).toBe(
          'https://api.example.com/users'
        );
      });

      it('should handle both baseURL and path with slashes', () => {
        const config: RequestAdapterConfig = {
          url: '/users/',
          baseURL: 'https://api.example.com/'
        };

        expect(urlBuilder.buildUrl(config)).toBe(
          'https://api.example.com/users/'
        );
      });

      it('should use absolute URL directly when provided', () => {
        const config: RequestAdapterConfig = {
          url: 'https://api.example.com/users',
          baseURL: 'https://other.example.com'
        };

        expect(urlBuilder.buildUrl(config)).toBe(
          'https://api.example.com/users'
        );
      });

      it('should ignore baseURL when url is absolute', () => {
        const config: RequestAdapterConfig = {
          url: 'http://api.example.com/users',
          baseURL: 'https://other.example.com'
        };

        expect(urlBuilder.buildUrl(config)).toBe(
          'http://api.example.com/users'
        );
      });
    });

    describe('Query parameters', () => {
      it('should append query parameters to URL', () => {
        const config: RequestAdapterConfig = {
          url: '/users',
          baseURL: 'https://api.example.com',
          params: { role: 'admin', page: '1' }
        };

        const result = urlBuilder.buildUrl(config);
        expect(result).toContain('role=admin');
        expect(result).toContain('page=1');
        expect(result).toMatch(/^https:\/\/api\.example\.com\/users\?/);
      });

      it('should handle single query parameter', () => {
        const config: RequestAdapterConfig = {
          url: '/users',
          baseURL: 'https://api.example.com',
          params: { role: 'admin' }
        };

        expect(urlBuilder.buildUrl(config)).toBe(
          'https://api.example.com/users?role=admin'
        );
      });

      it('should encode query parameter values', () => {
        const config: RequestAdapterConfig = {
          url: '/search',
          baseURL: 'https://api.example.com',
          params: { q: 'hello world', name: 'John Doe' }
        };

        const result = urlBuilder.buildUrl(config);
        // URL API encodes spaces as + in query parameters (standard behavior)
        expect(result).toContain('q=hello+world');
        expect(result).toContain('name=John+Doe');
      });

      it('should encode query parameter keys', () => {
        const config: RequestAdapterConfig = {
          url: '/search',
          baseURL: 'https://api.example.com',
          params: { 'user name': 'John' }
        };

        const result = urlBuilder.buildUrl(config);
        // URL API encodes spaces as + in query parameters (standard behavior)
        expect(result).toContain('user+name=John');
      });

      it('should filter out null values', () => {
        const config: RequestAdapterConfig = {
          url: '/users',
          baseURL: 'https://api.example.com',
          params: { role: 'admin', page: null, status: 'active' }
        };

        const result = urlBuilder.buildUrl(config);
        expect(result).toContain('role=admin');
        expect(result).toContain('status=active');
        expect(result).not.toContain('page=');
      });

      it('should filter out undefined values', () => {
        const config: RequestAdapterConfig = {
          url: '/users',
          baseURL: 'https://api.example.com',
          params: { role: 'admin', page: undefined, status: 'active' }
        };

        const result = urlBuilder.buildUrl(config);
        expect(result).toContain('role=admin');
        expect(result).toContain('status=active');
        expect(result).not.toContain('page=');
      });

      it('should handle number values', () => {
        const config: RequestAdapterConfig = {
          url: '/users',
          baseURL: 'https://api.example.com',
          params: { page: 1, limit: 10 }
        };

        const result = urlBuilder.buildUrl(config);
        expect(result).toContain('page=1');
        expect(result).toContain('limit=10');
      });

      it('should handle boolean values', () => {
        const config: RequestAdapterConfig = {
          url: '/users',
          baseURL: 'https://api.example.com',
          params: { active: true, deleted: false }
        };

        const result = urlBuilder.buildUrl(config);
        expect(result).toContain('active=true');
        expect(result).toContain('deleted=false');
      });

      it('should merge with existing query parameters in URL', () => {
        const config: RequestAdapterConfig = {
          url: '/users?existing=value',
          baseURL: 'https://api.example.com',
          params: { role: 'admin' }
        };

        const result = urlBuilder.buildUrl(config);
        expect(result).toContain('existing=value');
        expect(result).toContain('role=admin');
      });

      it('should handle empty params object', () => {
        const config: RequestAdapterConfig = {
          url: '/users',
          baseURL: 'https://api.example.com',
          params: {}
        };

        expect(urlBuilder.buildUrl(config)).toBe(
          'https://api.example.com/users'
        );
      });
    });

    describe('Relative URLs without baseURL', () => {
      it('should return relative path when no baseURL provided', () => {
        const config: RequestAdapterConfig = {
          url: '/users'
        };

        expect(urlBuilder.buildUrl(config)).toBe('/users');
      });

      it('should handle relative path with query parameters', () => {
        const config: RequestAdapterConfig = {
          url: '/users',
          params: { role: 'admin' }
        };

        expect(urlBuilder.buildUrl(config)).toBe('/users?role=admin');
      });

      it('should handle relative path without leading slash', () => {
        const config: RequestAdapterConfig = {
          url: 'users'
        };

        expect(urlBuilder.buildUrl(config)).toBe('/users');
      });

      it('should preserve query string in relative URL', () => {
        const config: RequestAdapterConfig = {
          url: '/users?existing=value',
          params: { role: 'admin' }
        };

        const result = urlBuilder.buildUrl(config);
        expect(result).toContain('existing=value');
        expect(result).toContain('role=admin');
      });
    });

    describe('URL normalization', () => {
      it('should normalize path segments', () => {
        const config: RequestAdapterConfig = {
          url: '/users/../posts',
          baseURL: 'https://api.example.com'
        };

        expect(urlBuilder.buildUrl(config)).toBe(
          'https://api.example.com/posts'
        );
      });

      it('should handle complex paths', () => {
        const config: RequestAdapterConfig = {
          url: '/api/v1/users/123',
          baseURL: 'https://api.example.com'
        };

        expect(urlBuilder.buildUrl(config)).toBe(
          'https://api.example.com/api/v1/users/123'
        );
      });
    });

    describe('Edge cases', () => {
      it('should handle empty baseURL string', () => {
        const config: RequestAdapterConfig = {
          url: '/users',
          baseURL: ''
        };

        expect(urlBuilder.buildUrl(config)).toBe('/users');
      });

      it('should handle URL with hash', () => {
        const config: RequestAdapterConfig = {
          url: '/users#section',
          baseURL: 'https://api.example.com'
        };

        const result = urlBuilder.buildUrl(config);
        expect(result).toBe('https://api.example.com/users#section');
      });

      it('should handle URL with existing query and hash', () => {
        const config: RequestAdapterConfig = {
          url: '/users?existing=value#section',
          baseURL: 'https://api.example.com',
          params: { role: 'admin' }
        };

        const result = urlBuilder.buildUrl(config);
        expect(result).toContain('existing=value');
        expect(result).toContain('role=admin');
        expect(result).toContain('#section');
      });

      it('should handle special characters in query values', () => {
        const config: RequestAdapterConfig = {
          url: '/search',
          baseURL: 'https://api.example.com',
          params: { q: 'test&value=test', symbol: '@#$%' }
        };

        const result = urlBuilder.buildUrl(config);
        expect(result).toContain('q=test%26value%3Dtest');
        expect(result).toContain('symbol=%40%23%24%25');
      });
    });

    describe('Error handling', () => {
      it('should handle invalid baseURL gracefully in non-strict mode', () => {
        const config: RequestAdapterConfig = {
          url: '/users',
          baseURL: 'not-a-valid-url'
        };

        // In non-strict mode, invalid baseURL (without protocol) is concatenated
        // with temp domain and becomes part of hostname, resulting in just the path
        const result = urlBuilder.buildUrl(config);
        expect(result).toBe('/users');
      });

      it('should throw error for baseURL with invalid characters', () => {
        const config: RequestAdapterConfig = {
          url: '/users',
          baseURL: 'http://invalid url'
        };

        expect(() => {
          urlBuilder.buildUrl(config);
        }).toThrow();
      });

      it('should throw error for invalid absolute URL', () => {
        const config: RequestAdapterConfig = {
          url: 'http://invalid url/users'
        };

        expect(() => {
          urlBuilder.buildUrl(config);
        }).toThrow();
      });
    });
  });
});
