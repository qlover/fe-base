/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TokenStorage } from '../../../src/core/storage/impl/TokenStorage';
import {
  QuickerTime,
  type TimeUnit
} from '../../../src/core/storage/utils/QuickerTime';
import {
  type Encryptor,
  type SyncStorageInterface,
  SyncStorage
} from '@qlover/fe-corekit';

/**
 * Mock storage implementation for testing
 *
 * Significance: Provides controlled storage environment for testing
 * Core idea: Simulate storage operations with tracking capabilities
 * Main function: Store, retrieve, and manage test data
 * Main purpose: Enable isolated testing of TokenStorage functionality
 *
 * @example
 * const mockStorage = new MockStorage();
 * mockStorage.setItem('key', 'value');
 * expect(mockStorage.getItem('key')).toBe('value');
 */
class MockStorage<Key> implements SyncStorageInterface<Key> {
  public data = new Map<string, string>();
  public calls: {
    setItem: Array<{ key: Key; value: unknown; options?: unknown }>;
    getItem: Array<{ key: Key; defaultValue?: unknown; options?: unknown }>;
    removeItem: Array<{ key: Key; options?: unknown }>;
    clear: number;
  } = {
    setItem: [],
    getItem: [],
    removeItem: [],
    clear: 0
  };

  public get length(): number {
    return this.data.size;
  }

  /**
   * Store an item in mock storage
   * @param key - Storage key
   * @param value - Value to store
   * @param options - Storage options
   * @returns The stored value
   */
  public setItem<T>(key: Key, value: T, options?: unknown): T {
    this.calls.setItem.push({ key, value, options });
    this.data.set(String(key), String(value));
    return value;
  }

  /**
   * Retrieve an item from mock storage
   * @param key - Storage key
   * @param defaultValue - Default value if not found
   * @param options - Retrieval options
   * @returns Retrieved value or default
   */
  public getItem<T>(key: Key, defaultValue?: T, options?: unknown): T | null {
    this.calls.getItem.push({ key, defaultValue, options });
    const value = this.data.get(String(key));
    return (value ?? defaultValue ?? null) as T | null;
  }

  /**
   * Remove an item from mock storage
   * @param key - Storage key
   * @param options - Removal options
   */
  public removeItem(key: Key, options?: unknown): void {
    this.calls.removeItem.push({ key, options });
    this.data.delete(String(key));
  }

  /**
   * Clear all items from mock storage
   */
  public clear(): void {
    this.calls.clear++;
    this.data.clear();
  }

  /**
   * Reset mock storage state
   */
  public reset(): void {
    this.data.clear();
    this.calls = {
      setItem: [],
      getItem: [],
      removeItem: [],
      clear: 0
    };
  }

  /**
   * Directly set data (simulating existing storage)
   * @param key - Storage key
   * @param value - Value to set
   */
  public directSet(key: string, value: string): void {
    this.data.set(key, value);
  }
}

class MockEncryptor implements Encryptor<string, string> {
  public encrypt(value: string): string {
    return '__encrypted__' + value;
  }

  public decrypt(value: string): string {
    return value.replace('__encrypted__', '');
  }
}

describe('TokenStorage', () => {
  let mockStorage: MockStorage<string>;
  let tokenStorage: TokenStorage<string, string>;
  const BASE_TIME = Date.UTC(2025, 0, 1, 0, 0, 0, 0); // 2025-01-01 00:00:00 UTC

  beforeEach(() => {
    mockStorage = new MockStorage();
    vi.useFakeTimers();
    vi.setSystemTime(BASE_TIME);
  });

  afterEach(() => {
    vi.useRealTimers();
    mockStorage.reset();
  });

  describe('constructor', () => {
    it('should create instance with default options', () => {
      tokenStorage = new TokenStorage('test-token');

      expect(tokenStorage.getKey()).toBe('test-token');
      expect(tokenStorage['quickerTime']).toBeInstanceOf(QuickerTime);
    });

    it('should create instance with custom QuickerTime', () => {
      const customQuickerTime = new QuickerTime();
      tokenStorage = new TokenStorage('test-token', {
        quickerTime: customQuickerTime
      });

      expect(tokenStorage['quickerTime']).toBe(customQuickerTime);
    });

    it('should create instance with storage option', () => {
      tokenStorage = new TokenStorage('test-token', {
        storage: mockStorage
      });

      expect(tokenStorage.getKey()).toBe('test-token');
    });
  });

  describe('basic storage operations', () => {
    beforeEach(() => {
      tokenStorage = new TokenStorage('test-token', {
        storage: mockStorage
      });
    });

    it('should set and get token value', () => {
      const testToken = 'test-token-value-123';

      tokenStorage.set(testToken);
      expect(tokenStorage.get()).toBe(testToken);
      expect(mockStorage.calls.setItem).toHaveLength(1);
      expect(mockStorage.calls.setItem[0].key).toBe('test-token');
      expect(mockStorage.calls.setItem[0].value).toBe(testToken);
    });

    it('should return null when no token is stored', () => {
      expect(tokenStorage.get()).toBeNull();
    });

    it('should remove token', () => {
      const testToken = 'test-token-value-123';

      tokenStorage.set(testToken);
      expect(tokenStorage.get()).toBe(testToken);

      tokenStorage.remove();
      expect(tokenStorage.get()).toBeNull();
      // Two removeItem calls: 1) explicit remove() 2) get() method calls remove() when storage returns null
      expect(mockStorage.calls.removeItem).toHaveLength(2);
      expect(mockStorage.calls.removeItem[0].key).toBe('test-token');
      expect(mockStorage.calls.removeItem[1].key).toBe('test-token');
    });

    it('should cache value in memory after first retrieval', () => {
      const testToken = 'test-token-value-123';

      // Set up a scenario where we first store a value
      tokenStorage.set(testToken);

      // Clear the calls to get a clean slate
      mockStorage.calls.getItem = [];

      // Clear the memory cache to force retrieval from storage
      tokenStorage['value'] = null;

      // First get() should retrieve from storage and cache in memory
      const result1 = tokenStorage.get();
      expect(result1).toBe(testToken);
      expect(mockStorage.calls.getItem).toHaveLength(1);

      // Second get() should use cached value, not call storage
      const result2 = tokenStorage.get();
      expect(result2).toBe(testToken);
      expect(mockStorage.calls.getItem).toHaveLength(1); // Still 1, not 2
    });
  });

  describe('expiration handling', () => {
    beforeEach(() => {
      tokenStorage = new TokenStorage('test-token', {
        storage: mockStorage
      });
    });

    it('should handle numeric expiration (months)', () => {
      const testToken = 'test-token-value-123';
      const expectedExpireTime = new QuickerTime().add('month', 2, BASE_TIME);

      tokenStorage.set(testToken, { expires: 2 });

      expect(mockStorage.calls.setItem).toHaveLength(1);
      expect(mockStorage.calls.setItem[0].options).toEqual({
        expires: expectedExpireTime
      });
    });

    it('should handle string expiration (time unit)', () => {
      const testToken = 'test-token-value-123';
      const expectedExpireTime = new QuickerTime().add('day', 1, BASE_TIME);

      tokenStorage.set(testToken, { expires: 'day' });

      expect(mockStorage.calls.setItem).toHaveLength(1);
      expect(mockStorage.calls.setItem[0].options).toEqual({
        expires: expectedExpireTime
      });
    });

    it('should handle array expiration [unit, value]', () => {
      const testToken = 'test-token-value-123';
      const expectedExpireTime = new QuickerTime().add('hour', 3, BASE_TIME);

      tokenStorage.set(testToken, { expires: ['hour', 3] });

      expect(mockStorage.calls.setItem).toHaveLength(1);
      expect(mockStorage.calls.setItem[0].options).toEqual({
        expires: expectedExpireTime
      });
    });

    it('should use custom QuickerTime for expiration calculation', () => {
      const customQuickerTime = new QuickerTime();
      const customQuickerTimeSpy = vi.spyOn(customQuickerTime, 'add');

      tokenStorage = new TokenStorage('test-token', {
        storage: mockStorage,
        quickerTime: customQuickerTime
      });

      const testToken = 'test-token-value-123';
      tokenStorage.set(testToken, { expires: 'week' });

      expect(customQuickerTimeSpy).toHaveBeenCalledWith('week', 1, BASE_TIME);
    });
  });

  describe('storage integration', () => {
    beforeEach(() => {
      tokenStorage = new TokenStorage('test-token', {
        storage: mockStorage
      });
    });

    it('should pass token value directly to storage', () => {
      const testToken = 'test-token-123';

      tokenStorage.set(testToken);

      expect(mockStorage.calls.setItem).toHaveLength(1);
      expect(mockStorage.calls.setItem[0].value).toBe(testToken);
    });

    it('should retrieve token value directly from storage', () => {
      const testToken = 'test-token-123';

      mockStorage.directSet('test-token', testToken);

      expect(tokenStorage.get()).toBe(testToken);
    });

    it('should work with storage options and expiration together', () => {
      const testToken = 'test-token-123';
      const expectedExpireTime = new QuickerTime().add('day', 1, BASE_TIME);

      tokenStorage.set(testToken, { expires: 'day' });

      expect(mockStorage.calls.setItem).toHaveLength(1);
      expect(mockStorage.calls.setItem[0].value).toBe(testToken);
      expect(mockStorage.calls.setItem[0].options).toEqual({
        expires: expectedExpireTime
      });
    });
  });

  describe('getTokenExpireTime method', () => {
    beforeEach(() => {
      tokenStorage = new TokenStorage('test-token');
    });

    it('should calculate expire time for array input', () => {
      const quickerTime = new QuickerTime();
      const result = tokenStorage['getTokenExpireTime'](
        ['minute', 30],
        BASE_TIME,
        quickerTime
      );
      const expected = quickerTime.add('minute', 30, BASE_TIME);

      expect(result).toBe(expected);
    });

    it('should calculate expire time for string input', () => {
      const quickerTime = new QuickerTime();
      const result = tokenStorage['getTokenExpireTime'](
        'hour',
        BASE_TIME,
        quickerTime
      );
      const expected = quickerTime.add('hour', 1, BASE_TIME);

      expect(result).toBe(expected);
    });

    it('should calculate expire time for number input (months)', () => {
      const quickerTime = new QuickerTime();
      const result = tokenStorage['getTokenExpireTime'](
        3,
        BASE_TIME,
        quickerTime
      );
      const expected = quickerTime.add('month', 3, BASE_TIME);

      expect(result).toBe(expected);
    });
  });

  describe('mergeOptions method', () => {
    beforeEach(() => {
      tokenStorage = new TokenStorage('test-token', {
        storage: mockStorage
      });
    });

    it('should merge options without expires', () => {
      const options = { storage: mockStorage };
      const result = tokenStorage['mergeOptions'](options);

      expect(result).toEqual(options);
    });

    it('should merge options and calculate expires time', () => {
      const options = { expires: 'day' as const };
      const result = tokenStorage['mergeOptions'](options);
      const expectedExpireTime = new QuickerTime().add('day', 1, BASE_TIME);

      expect(result.expires).toBe(expectedExpireTime);
    });

    it('should preserve other options while calculating expires', () => {
      const options = {
        expires: ['hour', 2] as [TimeUnit, number],
        storage: mockStorage,
        someOtherOption: 'test'
      };
      const result = tokenStorage['mergeOptions'](options);
      const expectedExpireTime = new QuickerTime().add('hour', 2, BASE_TIME);

      expect(result.expires).toBe(expectedExpireTime);
      expect(result.storage).toBe(mockStorage);
      expect((result as any).someOtherOption).toBe('test');
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      tokenStorage = new TokenStorage('test-token', {
        storage: mockStorage
      });
    });

    it('should handle null values gracefully', () => {
      mockStorage.directSet('test-token', 'null');
      mockStorage.data.delete('test-token'); // Simulate null return

      expect(tokenStorage.get()).toBeNull();
    });

    it('should handle empty string tokens', () => {
      tokenStorage.set('');
      expect(tokenStorage.get()).toBe('');
    });

    it('should handle special characters in tokens', () => {
      const specialToken = 'token-with-!@#$%^&*()_+-=[]{}|;:,.<>?';
      tokenStorage.set(specialToken);
      expect(tokenStorage.get()).toBe(specialToken);
    });

    it('should work without storage option (memory only)', () => {
      const memoryOnlyStorage = new TokenStorage('memory-token');
      const testToken = 'memory-test-token';

      memoryOnlyStorage.set(testToken);
      expect(memoryOnlyStorage.get()).toBe(testToken);

      memoryOnlyStorage.remove();
      expect(memoryOnlyStorage.get()).toBeNull();
    });
  });

  describe('encryption support', () => {
    it('should encrypt token when storing', () => {
      const encryptorStorage = new SyncStorage(
        mockStorage,
        new MockEncryptor()
      );

      tokenStorage = new TokenStorage('test-token', {
        storage: encryptorStorage
      });

      tokenStorage.set('test-token-value-123');

      expect(mockStorage.calls.setItem).toHaveLength(1);
      expect(mockStorage.calls.setItem[0].value).toBe(
        '__encrypted__test-token-value-123'
      );
    });

    it('should decrypt token when retrieving', () => {
      const encryptorStorage = new SyncStorage(
        mockStorage,
        new MockEncryptor()
      );

      tokenStorage = new TokenStorage('test-token', {
        storage: encryptorStorage
      });

      const testToken = 'test-token-value-123';
      tokenStorage.set(testToken);

      // Clear memory cache to force retrieval from storage
      tokenStorage['value'] = null;

      const retrievedToken = tokenStorage.get();
      expect(retrievedToken).toBe(testToken);
    });

    it('should handle encrypted token with expiration', () => {
      const encryptorStorage = new SyncStorage(
        mockStorage,
        new MockEncryptor()
      );

      tokenStorage = new TokenStorage('test-token', {
        storage: encryptorStorage
      });

      const testToken = 'test-token-with-expiry';
      const expectedExpireTime = new QuickerTime().add('hour', 2, BASE_TIME);

      tokenStorage.set(testToken, { expires: ['hour', 2] });

      expect(mockStorage.calls.setItem).toHaveLength(1);
      expect(mockStorage.calls.setItem[0].value).toBe(
        '__encrypted__test-token-with-expiry'
      );
      expect(mockStorage.calls.setItem[0].options).toEqual({
        expires: expectedExpireTime
      });
    });

    it('should handle empty string encryption', () => {
      const encryptorStorage = new SyncStorage(
        mockStorage,
        new MockEncryptor()
      );

      tokenStorage = new TokenStorage('test-token', {
        storage: encryptorStorage
      });

      tokenStorage.set('');

      expect(mockStorage.calls.setItem).toHaveLength(1);
      expect(mockStorage.calls.setItem[0].value).toBe('__encrypted__');

      // Clear memory cache to force retrieval from storage
      tokenStorage['value'] = null;

      expect(tokenStorage.get()).toBe('');
    });

    it('should handle special characters in encrypted tokens', () => {
      const encryptorStorage = new SyncStorage(
        mockStorage,
        new MockEncryptor()
      );

      tokenStorage = new TokenStorage('test-token', {
        storage: encryptorStorage
      });

      const specialToken = 'token-with-!@#$%^&*()_+-=[]{}|;:,.<>?';
      tokenStorage.set(specialToken);

      expect(mockStorage.calls.setItem).toHaveLength(1);
      expect(mockStorage.calls.setItem[0].value).toBe(
        '__encrypted__token-with-!@#$%^&*()_+-=[]{}|;:,.<>?'
      );

      // Clear memory cache to force retrieval from storage
      tokenStorage['value'] = null;

      expect(tokenStorage.get()).toBe(specialToken);
    });

    it('should handle encrypted token removal', () => {
      const encryptorStorage = new SyncStorage(
        mockStorage,
        new MockEncryptor()
      );

      tokenStorage = new TokenStorage('test-token', {
        storage: encryptorStorage
      });

      const testToken = 'test-token-for-removal';
      tokenStorage.set(testToken);

      // Verify token is encrypted and stored
      expect(mockStorage.calls.setItem).toHaveLength(1);
      expect(mockStorage.calls.setItem[0].value).toBe(
        '__encrypted__test-token-for-removal'
      );

      // Remove the token
      tokenStorage.remove();

      // Verify token is removed
      expect(tokenStorage.get()).toBeNull();
      expect(mockStorage.calls.removeItem).toHaveLength(2); // remove() + get() calls
    });

    it('should handle null values from encrypted storage', () => {
      const encryptorStorage = new SyncStorage(
        mockStorage,
        new MockEncryptor()
      );

      tokenStorage = new TokenStorage('test-token', {
        storage: encryptorStorage
      });

      // Simulate storage returning null (no token stored)
      expect(tokenStorage.get()).toBeNull();
    });

    it('should maintain encryption consistency across multiple operations', () => {
      const encryptorStorage = new SyncStorage(
        mockStorage,
        new MockEncryptor()
      );

      tokenStorage = new TokenStorage('test-token', {
        storage: encryptorStorage
      });

      // First operation
      const token1 = 'first-token';
      tokenStorage.set(token1);

      // Clear memory cache to force retrieval from storage
      tokenStorage['value'] = null;

      expect(tokenStorage.get()).toBe(token1);

      // Second operation - update token
      const token2 = 'second-token';
      tokenStorage.set(token2);

      // Clear memory cache to force retrieval from storage
      tokenStorage['value'] = null;

      expect(tokenStorage.get()).toBe(token2);

      // Verify both tokens were encrypted when stored
      expect(mockStorage.calls.setItem).toHaveLength(2);
      expect(mockStorage.calls.setItem[0].value).toBe(
        '__encrypted__first-token'
      );
      expect(mockStorage.calls.setItem[1].value).toBe(
        '__encrypted__second-token'
      );
    });

    it('should work with custom encryptor implementation', () => {
      // Custom encryptor that uses different prefix
      class CustomEncryptor implements Encryptor<string, string> {
        public encrypt(value: string): string {
          return `[CUSTOM_ENCRYPTED]${value}[/CUSTOM_ENCRYPTED]`;
        }

        public decrypt(value: string): string {
          return value
            .replace('[CUSTOM_ENCRYPTED]', '')
            .replace('[/CUSTOM_ENCRYPTED]', '');
        }
      }

      const customEncryptorStorage = new SyncStorage(
        mockStorage,
        new CustomEncryptor()
      );

      tokenStorage = new TokenStorage('test-token', {
        storage: customEncryptorStorage
      });

      const testToken = 'custom-encrypted-token';
      tokenStorage.set(testToken);

      expect(mockStorage.calls.setItem).toHaveLength(1);
      expect(mockStorage.calls.setItem[0].value).toBe(
        '[CUSTOM_ENCRYPTED]custom-encrypted-token[/CUSTOM_ENCRYPTED]'
      );

      // Clear memory cache to force retrieval from storage
      tokenStorage['value'] = null;

      expect(tokenStorage.get()).toBe(testToken);
    });
  });
});
