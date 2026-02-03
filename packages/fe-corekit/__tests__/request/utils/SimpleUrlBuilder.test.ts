import { describe, it, expect, beforeEach } from 'vitest';
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

      // Added test: correctly preserve path segments when baseURL contains path
      it('should preserve baseURL path segments when baseURL contains path', () => {
        const config: RequestAdapterConfig = {
          url: '/api/token.json',
          baseURL:
            'https://brus-dev.api.brain.ai/v1.0/invoke/brain-user-system/method'
        };

        expect(urlBuilder.buildUrl(config)).toBe(
          'https://brus-dev.api.brain.ai/v1.0/invoke/brain-user-system/method/api/token.json'
        );
      });

      it('should handle complex baseURL with path and relative URL', () => {
        const config: RequestAdapterConfig = {
          url: 'token.json',
          baseURL: 'https://api.example.com/v1/auth'
        };

        expect(urlBuilder.buildUrl(config)).toBe(
          'https://api.example.com/v1/auth/token.json'
        );
      });

      it('should handle baseURL with multiple path segments', () => {
        const config: RequestAdapterConfig = {
          url: 'profile',
          baseURL: 'https://api.example.com/api/v1/users/123'
        };

        expect(urlBuilder.buildUrl(config)).toBe(
          'https://api.example.com/api/v1/users/123/profile'
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

      // Added test: handle baseURL with existing query parameters
      it('should handle baseURL with existing query parameters', () => {
        const config: RequestAdapterConfig = {
          url: '/api/token.json',
          baseURL: 'https://api.example.com/v1/auth?existing=value',
          params: { grant_type: 'authorization_code' }
        };

        const result = urlBuilder.buildUrl(config);
        expect(result).toContain('existing=value');
        expect(result).toContain('grant_type=authorization_code');
        expect(result).toBe(
          'https://api.example.com/v1/auth/api/token.json?existing=value&grant_type=authorization_code'
        );
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

      // Added test: when baseURL contains query parameters, new parameters override old ones
      it('should override existing query parameters when key conflicts', () => {
        const config: RequestAdapterConfig = {
          url: '/api/token.json',
          baseURL: 'https://api.example.com/v1/auth?version=1',
          params: { version: '2', client_id: 'test' }
        };

        const result = urlBuilder.buildUrl(config);
        const params = new URL(result).searchParams;
        expect(params.getAll('version')).toHaveLength(1);
        expect(params.get('version')).toBe('2'); // New value overrides old value
        expect(params.get('client_id')).toBe('test');
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

      // Added test: concatenate relative baseURL
      it('should handle relative baseURL', () => {
        const config: RequestAdapterConfig = {
          url: 'token.json',
          baseURL: '/api/v1/auth'
        };

        expect(urlBuilder.buildUrl(config)).toBe('/api/v1/auth/token.json');
      });

      it('should handle multiple relative segments', () => {
        const config: RequestAdapterConfig = {
          url: 'profile',
          baseURL: 'api/v1/users/123'
        };

        expect(urlBuilder.buildUrl(config)).toBe('/api/v1/users/123/profile');
      });

      it('should handle multiple relative segments', () => {
        const config: RequestAdapterConfig = {
          url: '/user/profile',
          baseURL: '/api'
        };

        expect(urlBuilder.buildUrl(config)).toBe('/api/user/profile');
      });

      // Added test case: baseUrl='/api' and url='/user/login' scenario
      it('should handle api base with user login path', () => {
        const config: RequestAdapterConfig = {
          url: '/user/login',
          baseURL: '/api'
        };

        expect(urlBuilder.buildUrl(config)).toBe('/api/user/login');
      });

      // Additional edge case tests
      it('should handle baseURL ending with slash', () => {
        const config: RequestAdapterConfig = {
          url: '/users',
          baseURL: '/api/'
        };

        expect(urlBuilder.buildUrl(config)).toBe('/api/users');
      });

      it('should handle baseURL without leading slash', () => {
        const config: RequestAdapterConfig = {
          url: '/users',
          baseURL: 'api'
        };

        expect(urlBuilder.buildUrl(config)).toBe('/api/users');
      });

      it('should handle url without leading slash', () => {
        const config: RequestAdapterConfig = {
          url: 'users',
          baseURL: '/api'
        };

        expect(urlBuilder.buildUrl(config)).toBe('/api/users');
      });
      
      // Test the specific bug case: baseUrl = /api url = /user/login
      it('should correctly join /api with /user/login', () => {
        const config: RequestAdapterConfig = {
          url: '/user/login',
          baseURL: '/api'
        };
        
        expect(urlBuilder.buildUrl(config)).toBe('/api/user/login');
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

      // Added test: path normalization includes baseURL path
      it('should normalize path segments including baseURL path', () => {
        const config: RequestAdapterConfig = {
          url: '../token.json',
          baseURL: 'https://api.example.com/v1/auth/users'
        };

        expect(urlBuilder.buildUrl(config)).toBe(
          'https://api.example.com/v1/auth/token.json'
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

      // Added test: preserve hash from baseURL
      it('should preserve hash from baseURL', () => {
        const config: RequestAdapterConfig = {
          url: '/api/token.json',
          baseURL: 'https://api.example.com/v1/auth#section'
        };

        expect(urlBuilder.buildUrl(config)).toBe(
          'https://api.example.com/v1/auth/api/token.json#section'
        );
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

      // Added test: port handling
      it('should handle baseURL with port', () => {
        const config: RequestAdapterConfig = {
          url: '/api/token.json',
          baseURL: 'https://api.example.com:8080/v1/auth'
        };

        expect(urlBuilder.buildUrl(config)).toBe(
          'https://api.example.com:8080/v1/auth/api/token.json'
        );
      });

      it('should handle baseURL with authentication', () => {
        const config: RequestAdapterConfig = {
          url: '/api/token.json',
          baseURL: 'https://user:pass@api.example.com/v1/auth'
        };

        expect(urlBuilder.buildUrl(config)).toBe(
          'https://user:pass@api.example.com/v1/auth/api/token.json'
        );
      });
    });

    describe('Error handling', () => {
      it('should handle invalid baseURL gracefully in non-strict mode', () => {
        const config: RequestAdapterConfig = {
          url: '/users',
          baseURL: 'not-a-valid-url'
        };

        const result = urlBuilder.buildUrl(config);
        // In non-strict mode, invalid baseURL is ignored and only the URL is returned
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

      // Added test: strict mode
      describe('strict mode', () => {
        it('should throw error for invalid baseURL in strict mode', () => {
          const strictBuilder = new SimpleUrlBuilder({ strict: true });
          const config: RequestAdapterConfig = {
            url: '/users',
            baseURL: 'not-a-valid-url'
          };

          expect(() => {
            strictBuilder.buildUrl(config);
          }).toThrow(/Invalid baseURL format/);
        });

        it('should work with valid baseURL in strict mode', () => {
          const strictBuilder = new SimpleUrlBuilder({ strict: true });
          const config: RequestAdapterConfig = {
            url: '/api/token.json',
            baseURL: 'https://api.example.com/v1/auth'
          };

          expect(strictBuilder.buildUrl(config)).toBe(
            'https://api.example.com/v1/auth/api/token.json'
          );
        });
      });
    });
  });
});
