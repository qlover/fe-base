/**
 * URLParamsStorage test suite (rewritten for StorageInterface-compliant implementation)
 *
 * Coverage:
 * 1. Constructor – with URL string/object and default options
 * 2. getItem – basic retrieval, default value, key types
 * 3. setItem – cache-only update (read-only storage)
 * 4. removeItem – cache removal
 * 5. clear – full cache clearing
 * 6. Key matching – single vs array keys, fallback order
 * 7. Case sensitivity – global default vs per-call override
 * 8. Caching – correctness, isolation by (key, caseSensitive)
 * 9. Edge cases – empty values, special chars, no params
 * 10. Options merging – default + call-time precedence
 */

import { URLParamsStorage } from '../../../src/core/storage/impl/URLParamsStorage';

describe('URLParamsStorage (StorageInterface-compliant)', () => {
  describe('constructor', () => {
    it('should create instance with URL string', () => {
      const storage = new URLParamsStorage('https://example.com?token=abc123');
      expect(storage).toBeInstanceOf(URLParamsStorage);
    });

    it('should create instance with URL object', () => {
      const url = new URL('https://example.com?token=xyz789');
      const storage = new URLParamsStorage(url);
      expect(storage).toBeInstanceOf(URLParamsStorage);
    });

    it('should accept default options', () => {
      const storage = new URLParamsStorage('https://example.com', {
        caseSensitive: true
      });
      // We can't directly inspect private fields, but behavior will reflect it
      expect(storage).toBeDefined();
    });
  });

  describe('getItem', () => {
    it('should retrieve value by single key (case-insensitive by default)', () => {
      const storage = new URLParamsStorage('https://example.com?Token=abc123');
      expect(storage.getItem('token')).toBe('abc123');
    });

    it('should retrieve value by key array (fallback order)', () => {
      const storage = new URLParamsStorage(
        'https://example.com?access_token=xyz'
      );
      expect(storage.getItem(['token', 'access_token'])).toBe('xyz');
    });

    it('should return null when key not found', () => {
      const storage = new URLParamsStorage('https://example.com?other=value');
      expect(storage.getItem('token')).toBeNull();
    });

    it('should return default value when provided and not found', () => {
      const storage = new URLParamsStorage('https://example.com');
      expect(storage.getItem('lang', 'en')).toBe('en');
    });

    it('should return actual value even if default is provided', () => {
      const storage = new URLParamsStorage('https://example.com?lang=zh');
      expect(storage.getItem('lang', 'en')).toBe('zh');
    });

    it('should handle empty string values', () => {
      const storage = new URLParamsStorage('https://example.com?token=');
      expect(storage.getItem('token')).toBe('');
    });

    it('should decode URL-encoded values automatically', () => {
      const storage = new URLParamsStorage(
        'https://example.com?msg=hello%20world%21'
      );
      expect(storage.getItem('msg')).toBe('hello world!');
    });
  });

  describe('setItem', () => {
    it('should update internal cache only (read-only storage)', () => {
      const storage = new URLParamsStorage(
        'https://example.com?token=original'
      );
      storage.setItem('token', 'mocked');
      expect(storage.getItem('token')).toBe('mocked');
    });

    it('should not affect the underlying URL', () => {
      const urlStr = 'https://example.com?token=real';
      const storage = new URLParamsStorage(urlStr);
      storage.setItem('token', 'fake');

      // Reconstruct to verify original URL unchanged (conceptually)
      const freshStorage = new URLParamsStorage(urlStr);
      expect(freshStorage.getItem('token')).toBe('real');
      // Current instance returns cached value
      expect(storage.getItem('token')).toBe('fake');
    });
  });

  describe('removeItem', () => {
    it('should remove entry from cache', () => {
      const storage = new URLParamsStorage('https://example.com?token=abc');
      storage.setItem('token', 'cached');
      expect(storage.getItem('token')).toBe('cached');

      storage.removeItem('token');
      // Now falls back to URL again
      expect(storage.getItem('token')).toBe('abc');
    });

    it('should work with key arrays', () => {
      const storage = new URLParamsStorage('https://example.com?auth=xyz');
      storage.setItem(['token', 'auth'], 'overridden');
      expect(storage.getItem(['token', 'auth'])).toBe('overridden');

      storage.removeItem(['token', 'auth']);
      expect(storage.getItem(['token', 'auth'])).toBe('xyz');
    });
  });

  describe('clear', () => {
    it('should clear all cached entries', () => {
      const storage = new URLParamsStorage(
        'https://example.com?token=abc&lang=en'
      );
      storage.setItem('token', 'mocked');
      storage.setItem('lang', 'fr');

      expect(storage.getItem('token')).toBe('mocked');
      expect(storage.getItem('lang')).toBe('fr');

      storage.clear();

      // Now reads from URL again
      expect(storage.getItem('token')).toBe('abc');
      expect(storage.getItem('lang')).toBe('en');
    });
  });

  describe('Key matching', () => {
    it('should match first key in array that exists', () => {
      const storage = new URLParamsStorage('https://example.com?b=2&a=1');
      expect(storage.getItem(['x', 'b', 'a'])).toBe('2');
    });

    it('should return null if none of array keys exist', () => {
      const storage = new URLParamsStorage('https://example.com?c=3');
      expect(storage.getItem(['a', 'b'])).toBeNull();
    });

    it('should treat string and [string] equivalently', () => {
      const storage = new URLParamsStorage('https://example.com?token=val');
      expect(storage.getItem('token')).toBe(storage.getItem(['token']));
    });
  });

  describe('Case sensitivity', () => {
    it('should be case-insensitive by default', () => {
      const storage = new URLParamsStorage('https://example.com?Token=123');
      expect(storage.getItem('token')).toBe('123');
    });

    it('should respect caseSensitive: true', () => {
      const storage = new URLParamsStorage('https://example.com?Token=123');
      expect(storage.getItem('token', { caseSensitive: true })).toBeNull();
      expect(storage.getItem('Token', { caseSensitive: true })).toBe('123');
    });

    it('should respect caseSensitive: false override', () => {
      const storage = new URLParamsStorage('https://example.com?TOKEN=xyz', {
        caseSensitive: true
      });
      // Default is case-sensitive, but we override to insensitive
      expect(storage.getItem('token', { caseSensitive: false })).toBe('xyz');
    });

    it('should match correctly with key arrays under case sensitivity', () => {
      const storage = new URLParamsStorage('https://example.com?Auth=ok', {
        caseSensitive: true
      });
      expect(storage.getItem(['auth', 'Auth'], { caseSensitive: true })).toBe(
        'ok'
      );
      expect(storage.getItem(['auth', 'Auth'], { caseSensitive: false })).toBe(
        'ok'
      );
    });
  });

  describe('Caching mechanism', () => {
    it('should cache results per (key, caseSensitive) combination', () => {
      const storage = new URLParamsStorage('https://example.com?Token=123');

      const v1 = storage.getItem('token'); // case-insensitive → '123'
      const v2 = storage.getItem('token'); // from cache

      expect(v1).toBe(v2);
      expect(v1).toBe('123');
    });

    it('should cache case-sensitive and case-insensitive separately', () => {
      const storage = new URLParamsStorage('https://example.com?Token=123');

      const insensitive = storage.getItem('token', { caseSensitive: false }); // '123'
      const sensitive = storage.getItem('token', { caseSensitive: true }); // null

      expect(insensitive).toBe('123');
      expect(sensitive).toBeNull();
    });

    it('should cache different key arrays separately', () => {
      const storage = new URLParamsStorage('https://example.com?a=1&b=2');

      const val1 = storage.getItem(['a', 'b']);
      storage.setItem(['x', 'y'], 'mock');

      const val2 = storage.getItem(['x', 'y']);

      expect(val1).toBe('1');
      expect(val2).toBe('mock');
    });
  });

  describe('Default options', () => {
    it('should use default caseSensitive setting', () => {
      const storage = new URLParamsStorage('https://example.com?Token=123', {
        caseSensitive: true
      });
      expect(storage.getItem('token')).toBeNull(); // uses default: true
    });

    it('should allow per-call override of default options', () => {
      const storage = new URLParamsStorage('https://example.com?Token=123', {
        caseSensitive: true
      });
      expect(storage.getItem('token', { caseSensitive: false })).toBe('123');
    });

    it('should merge options correctly (call wins)', () => {
      const storage = new URLParamsStorage('https://example.com', {
        caseSensitive: false
      });
      // Internally, only caseSensitive matters; no other options yet
      expect(storage.getItem('x', { caseSensitive: true })).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should handle URL with no query parameters', () => {
      const storage = new URLParamsStorage('https://example.com');
      expect(storage.getItem('any')).toBeNull();
    });

    it('should handle empty key array', () => {
      const storage = new URLParamsStorage('https://example.com?token=1');
      expect(storage.getItem([])).toBeNull();
    });

    it('should handle duplicate keys in array (no crash)', () => {
      const storage = new URLParamsStorage('https://example.com?token=1');
      expect(storage.getItem(['token', 'token'])).toBe('1');
    });

    it('should handle special characters in key names', () => {
      const storage = new URLParamsStorage('https://example.com?user%20id=42');
      expect(storage.getItem('user id')).toBe('42');
    });
  });
});
