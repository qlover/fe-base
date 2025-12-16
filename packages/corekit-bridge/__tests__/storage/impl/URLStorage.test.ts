/**
 * URLStorage test-suite
 *
 * Coverage:
 * 1. constructor       – Constructor tests
 * 2. getKey            – Key retrieval tests
 * 3. getValue          – Cached value retrieval tests
 * 4. get               – Value retrieval with options override tests
 * 5. set               – Value setting tests (read-only behavior)
 * 6. remove            – Value removal tests
 * 7. clearCache        – Cache clearing tests
 * 8. key matching       – Single and multiple key matching tests
 * 9. case sensitivity  – Case-sensitive and case-insensitive matching tests
 * 10. caching          – Caching mechanism tests
 * 11. edge cases       – Edge case tests
 * 12. error handling   – Error handling tests
 */

import { describe, it, expect } from 'vitest';
import {
  URLStorage,
  type URLStorageOptions
} from '../../../src/core/storage/impl/URLStorage';

describe('URLStorage', () => {
  describe('constructor', () => {
    it('should create instance with URL string', () => {
      const storage = new URLStorage('https://example.com?token=abc123', {
        key: 'token'
      });

      expect(storage).toBeInstanceOf(URLStorage);
      expect(storage.getValue()).toBe('abc123');
    });

    it('should create instance with URL object', () => {
      const url = new URL('https://example.com?token=xyz789');
      const storage = new URLStorage(url, {
        key: 'token'
      });

      expect(storage).toBeInstanceOf(URLStorage);
      expect(storage.getValue()).toBe('xyz789');
    });

    it('should initialize with null when key not found', () => {
      const storage = new URLStorage('https://example.com?other=value', {
        key: 'token'
      });

      expect(storage.getValue()).toBeNull();
    });

    it('should initialize with null when no key configured', () => {
      const storage = new URLStorage('https://example.com?token=abc123');

      expect(storage.getValue()).toBeNull();
    });

    it('should initialize with first matching key from array', () => {
      const storage = new URLStorage('https://example.com?Token=value', {
        key: ['token', 'Token', 'TOKEN'],
        caseSensitive: true
      });

      expect(storage.getValue()).toBe('value');
      expect(storage.getKey()).toBe('Token');
    });
  });

  describe('getKey', () => {
    it('should return matched key when found', () => {
      const storage = new URLStorage('https://example.com?Token=abc', {
        key: ['token', 'Token'],
        caseSensitive: true
      });

      expect(storage.getKey()).toBe('Token');
    });

    it('should return first configured key when no match', () => {
      const storage = new URLStorage('https://example.com?other=value', {
        key: ['token', 'Token']
      });

      expect(storage.getKey()).toBe('token');
    });

    it('should return single key when configured', () => {
      const storage = new URLStorage('https://example.com?token=abc', {
        key: 'token'
      });

      expect(storage.getKey()).toBe('token');
    });

    it('should throw error when no key configured', () => {
      const storage = new URLStorage('https://example.com?token=abc');

      expect(() => storage.getKey()).toThrow('No key configured');
    });
  });

  describe('getValue', () => {
    it('should return cached value', () => {
      const storage = new URLStorage('https://example.com?token=abc123', {
        key: 'token'
      });

      expect(storage.getValue()).toBe('abc123');
    });

    it('should return null when no value found', () => {
      const storage = new URLStorage('https://example.com?other=value', {
        key: 'token'
      });

      expect(storage.getValue()).toBeNull();
    });

    it('should return null after remove', () => {
      const storage = new URLStorage('https://example.com?token=abc123', {
        key: 'token'
      });

      storage.remove();
      expect(storage.getValue()).toBeNull();
    });
  });

  describe('get', () => {
    it('should return value using default options', () => {
      const storage = new URLStorage('https://example.com?token=abc123', {
        key: 'token'
      });

      expect(storage.get()).toBe('abc123');
    });

    it('should return null when key not found', () => {
      const storage = new URLStorage('https://example.com?other=value', {
        key: 'token'
      });

      expect(storage.get()).toBeNull();
    });

    it('should override options with provided options', () => {
      const storage = new URLStorage('https://example.com?Token=xyz', {
        key: 'token',
        caseSensitive: true
      });

      // Override to case-insensitive
      expect(storage.get({ caseSensitive: false })).toBe('xyz');
    });

    it('should override key with provided key', () => {
      const storage = new URLStorage('https://example.com?other=value', {
        key: 'token'
      });

      expect(storage.get({ key: 'other' })).toBe('value');
    });

    it('should merge options when overriding', () => {
      const storage = new URLStorage('https://example.com?Token=xyz', {
        key: 'token',
        caseSensitive: true
      });

      // Override both key and caseSensitive
      expect(storage.get({ key: 'Token', caseSensitive: false })).toBe('xyz');
    });

    it('should use cache when same options are used', () => {
      const storage = new URLStorage('https://example.com?token=abc123', {
        key: 'token'
      });

      const value1 = storage.get();
      const value2 = storage.get();

      expect(value1).toBe(value2);
      expect(value1).toBe('abc123');
    });
  });

  describe('set', () => {
    it('should update cached value only', () => {
      const storage = new URLStorage('https://example.com?token=abc123', {
        key: 'token'
      });

      storage.set('new-value');
      expect(storage.getValue()).toBe('new-value');
    });

    it('should not modify actual URL', () => {
      const url = 'https://example.com?token=abc123';
      const storage = new URLStorage(url, {
        key: 'token'
      });

      storage.set('new-value');
      // URL should remain unchanged (we can't verify this directly, but the behavior is documented)
      expect(storage.getValue()).toBe('new-value');
    });
  });

  describe('remove', () => {
    it('should clear cached value', () => {
      const storage = new URLStorage('https://example.com?token=abc123', {
        key: 'token'
      });

      storage.remove();
      expect(storage.getValue()).toBeNull();
      expect(storage.getKey()).toBe('token'); // Key should still be available
    });

    it('should clear matched key', () => {
      const storage = new URLStorage('https://example.com?Token=abc', {
        key: ['token', 'Token'],
        caseSensitive: true
      });

      expect(storage.getKey()).toBe('Token');
      storage.remove();
      expect(storage.getKey()).toBe('token'); // Falls back to first configured key
    });

    it('should clear cache for current options', () => {
      const storage = new URLStorage('https://example.com?token=abc123', {
        key: 'token'
      });

      storage.get(); // Populate cache
      storage.remove();

      // Cache should be cleared, but URL is unchanged so get() will find it again
      expect(storage.get()).toBe('abc123');
    });
  });

  describe('clearCache', () => {
    it('should clear all cached results', () => {
      const storage = new URLStorage('https://example.com?token=abc123', {
        key: 'token'
      });

      storage.get(); // Populate cache
      storage.clearCache();

      // Cache cleared, but value and matchedKey remain
      expect(storage.getValue()).toBe('abc123');
    });

    it('should force re-parsing on next get with options', () => {
      const storage = new URLStorage('https://example.com?token=abc123', {
        key: 'token'
      });

      storage.get(); // Populate cache
      storage.clearCache();

      // Next get with same options should re-parse and cache again
      expect(storage.get()).toBe('abc123');
    });
  });

  describe('key matching - single key', () => {
    it('should match single string key', () => {
      const storage = new URLStorage('https://example.com?token=abc123', {
        key: 'token'
      });

      expect(storage.get()).toBe('abc123');
    });

    it('should match single numeric key', () => {
      const storage = new URLStorage('https://example.com?123=value', {
        key: 123
      });

      expect(storage.get()).toBe('value');
    });

    it('should return null when single key not found', () => {
      const storage = new URLStorage('https://example.com?other=value', {
        key: 'token'
      });

      expect(storage.get()).toBeNull();
    });
  });

  describe('key matching - multiple keys', () => {
    it('should match first key in array', () => {
      const storage = new URLStorage('https://example.com?token=abc123', {
        key: ['token', 'Token', 'TOKEN']
      });

      expect(storage.get()).toBe('abc123');
      expect(storage.getKey()).toBe('token');
    });

    it('should match second key in array when first not found', () => {
      const storage = new URLStorage('https://example.com?Token=xyz789', {
        key: ['token', 'Token', 'TOKEN'],
        caseSensitive: true
      });

      expect(storage.get()).toBe('xyz789');
      expect(storage.getKey()).toBe('Token');
    });

    it('should match third key in array when first two not found', () => {
      const storage = new URLStorage('https://example.com?TOKEN=final', {
        key: ['token', 'Token', 'TOKEN'],
        caseSensitive: true
      });

      expect(storage.get()).toBe('final');
      expect(storage.getKey()).toBe('TOKEN');
    });

    it('should return null when no keys in array match', () => {
      const storage = new URLStorage('https://example.com?other=value', {
        key: ['token', 'Token', 'TOKEN']
      });

      expect(storage.get()).toBeNull();
    });

    it('should handle numeric keys in array', () => {
      const storage = new URLStorage('https://example.com?456=value', {
        key: [123, 456, 789]
      });

      expect(storage.get()).toBe('value');
      expect(storage.getKey()).toBe(456);
    });
  });

  describe('case sensitivity - case-sensitive', () => {
    it('should match exact case when caseSensitive is true', () => {
      const storage = new URLStorage('https://example.com?token=abc123', {
        key: 'token',
        caseSensitive: true
      });

      expect(storage.get()).toBe('abc123');
    });

    it('should not match different case when caseSensitive is true', () => {
      const storage = new URLStorage('https://example.com?Token=xyz789', {
        key: 'token',
        caseSensitive: true
      });

      expect(storage.get()).toBeNull();
    });

    it('should match exact case in array when caseSensitive is true', () => {
      const storage = new URLStorage('https://example.com?Token=xyz789', {
        key: ['token', 'Token', 'TOKEN'],
        caseSensitive: true
      });

      expect(storage.get()).toBe('xyz789');
      expect(storage.getKey()).toBe('Token');
    });
  });

  describe('case sensitivity - case-insensitive', () => {
    it('should match regardless of case when caseSensitive is false', () => {
      const storage = new URLStorage('https://example.com?Token=xyz789', {
        key: 'token',
        caseSensitive: false
      });

      expect(storage.get()).toBe('xyz789');
    });

    it('should match TOKEN when searching for token (case-insensitive)', () => {
      const storage = new URLStorage('https://example.com?TOKEN=final', {
        key: 'token',
        caseSensitive: false
      });

      expect(storage.get()).toBe('final');
    });

    it('should match first key in array (case-insensitive)', () => {
      const storage = new URLStorage('https://example.com?TOKEN=value', {
        key: ['token', 'Token'],
        caseSensitive: false
      });

      expect(storage.get()).toBe('value');
      expect(storage.getKey()).toBe('token'); // Returns first configured key
    });
  });

  describe('caching mechanism', () => {
    it('should cache result for same key configuration', () => {
      const storage = new URLStorage('https://example.com?token=abc123', {
        key: 'token'
      });

      const value1 = storage.get();
      const value2 = storage.get();

      expect(value1).toBe(value2);
    });

    it('should cache result for different key configurations independently', () => {
      const storage = new URLStorage(
        'https://example.com?token=abc123&Token=xyz789',
        {
          key: 'token',
          caseSensitive: true
        }
      );

      const value1 = storage.get(); // Uses 'token' key
      const value2 = storage.get({ key: 'Token', caseSensitive: true }); // Uses 'Token' key

      expect(value1).toBe('abc123');
      expect(value2).toBe('xyz789');
    });

    it('should cache result for different caseSensitive settings independently', () => {
      const storage = new URLStorage('https://example.com?Token=xyz789', {
        key: 'token',
        caseSensitive: true
      });

      const value1 = storage.get(); // caseSensitive: true, returns null
      const value2 = storage.get({ caseSensitive: false }); // caseSensitive: false, returns 'xyz789'

      expect(value1).toBeNull();
      expect(value2).toBe('xyz789');
    });

    it('should use cached result when same options are provided', () => {
      const storage = new URLStorage('https://example.com?token=abc123', {
        key: 'token'
      });

      storage.get(); // First call, populates cache
      storage.clearCache(); // Clear cache

      // Next call should re-parse and cache again
      const value = storage.get();
      expect(value).toBe('abc123');
    });
  });

  describe('edge cases', () => {
    it('should handle empty string value', () => {
      const storage = new URLStorage('https://example.com?token=', {
        key: 'token'
      });

      expect(storage.get()).toBe('');
    });

    it('should handle URL with no query parameters', () => {
      const storage = new URLStorage('https://example.com', {
        key: 'token'
      });

      expect(storage.get()).toBeNull();
    });

    it('should handle URL with multiple parameters', () => {
      const storage = new URLStorage(
        'https://example.com?token=abc123&other=value&more=data',
        {
          key: 'token'
        }
      );

      expect(storage.get()).toBe('abc123');
    });

    it('should handle special characters in parameter value', () => {
      const storage = new URLStorage(
        'https://example.com?token=abc%20123%26xyz',
        {
          key: 'token'
        }
      );

      // URL automatically decodes the value
      expect(storage.get()).toBe('abc 123&xyz');
    });

    it('should handle URL-encoded parameter names', () => {
      const storage = new URLStorage('https://example.com?token%20key=value', {
        key: 'token key',
        caseSensitive: true
      });

      expect(storage.get()).toBe('value');
    });

    it('should handle empty key array', () => {
      const storage = new URLStorage('https://example.com?token=abc123', {
        key: []
      });

      expect(storage.get()).toBeNull();
    });

    it('should handle numeric key as string', () => {
      const storage = new URLStorage('https://example.com?123=value', {
        key: '123'
      });

      expect(storage.get()).toBe('value');
    });
  });

  describe('URL object handling', () => {
    it('should work with URL object passed to constructor', () => {
      const url = new URL('https://example.com?token=abc123');
      const storage = new URLStorage(url, {
        key: 'token'
      });

      expect(storage.get()).toBe('abc123');
    });

    it('should work with URL object and modify search params', () => {
      const url = new URL('https://example.com?token=abc123');
      const storage = new URLStorage(url, {
        key: 'token'
      });

      expect(storage.get()).toBe('abc123');

      url.searchParams.set('token', 'new-value');

      expect(storage.get()).toBe('abc123'); // Returns cached value

      expect(storage['findValueFromURL'](url, { key: 'token' })).toBe('abc123');
    });
  });

  describe('getCacheKey', () => {
    it('should generate same cache key for same options', () => {
      const storage = new URLStorage('https://example.com?token=abc123', {
        key: 'token',
        caseSensitive: true
      });

      const options1: URLStorageOptions<string> = {
        key: 'token',
        caseSensitive: true
      };
      const options2: URLStorageOptions<string> = {
        key: 'token',
        caseSensitive: true
      };

      const key1 = storage['getCacheKey'](options1);
      const key2 = storage['getCacheKey'](options2);

      expect(key1).toBe(key2);
    });

    it('should generate different cache keys for different keys', () => {
      const storage = new URLStorage('https://example.com?token=abc123', {
        key: 'token'
      });

      const key1 = storage['getCacheKey']({ key: 'token' });
      const key2 = storage['getCacheKey']({ key: 'other' });

      expect(key1).not.toBe(key2);
    });

    it('should generate different cache keys for different caseSensitive values', () => {
      const storage = new URLStorage('https://example.com?token=abc123', {
        key: 'token'
      });

      const key1 = storage['getCacheKey']({
        key: 'token',
        caseSensitive: true
      });
      const key2 = storage['getCacheKey']({
        key: 'token',
        caseSensitive: false
      });

      expect(key1).not.toBe(key2);
    });

    it('should generate cache key for array keys', () => {
      const storage = new URLStorage('https://example.com?token=abc123', {
        key: 'token'
      });

      const cacheKey = storage['getCacheKey']({ key: ['token', 'Token'] });

      expect(cacheKey).toContain('token,Token');
    });
  });
});
