/* eslint-disable @typescript-eslint/no-explicit-any */
import { SyncStorage } from '../../src/storage/impl/SyncStorage';
import type { SerializerIneterface } from '../../src/serializer';
import type { Encryptor } from '../../src/encrypt';
import type { SyncStorageInterface } from '../../src/storage/interface/SyncStorageInterface';
import { Base64Serializer, JSONSerializer, ObjectStorage } from '../../src';

/**
 * Mock storage implementation for testing
 *
 * Significance: Provides controlled storage behavior for testing
 * Core idea: Track all operations and allow direct data manipulation
 * Main function: Simulate storage operations with call tracking
 * Main purpose: Verify SyncStorage pipeline behavior
 */
class MockStorage<Key = string> implements SyncStorageInterface<Key> {
  public data = new Map<string, unknown>();
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

  public setItem<T>(key: Key, value: T, options?: unknown): T {
    this.calls.setItem.push({ key, value, options });
    this.data.set(String(key), value);
    return value;
  }

  public getItem<T>(key: Key, defaultValue?: T, options?: unknown): T | null {
    this.calls.getItem.push({ key, defaultValue, options });
    const value = this.data.get(String(key));
    return (value ?? defaultValue ?? null) as T | null;
  }

  public removeItem(key: Key, options?: unknown): void {
    this.calls.removeItem.push({ key, options });
    this.data.delete(String(key));
  }

  public clear(): void {
    this.calls.clear++;
    this.data.clear();
  }

  public reset(): void {
    this.data.clear();
    this.calls = {
      setItem: [],
      getItem: [],
      removeItem: [],
      clear: 0
    };
  }

  // Helper method to directly set data (simulating existing storage)
  public directSet(key: string, value: unknown): void {
    this.data.set(key, value);
  }
}

/**
 * Mock serializer implementation for testing
 *
 * Significance: Provides controlled serialization behavior
 * Core idea: Simple JSON serialization with call tracking
 * Main function: Serialize/deserialize data with prefix for identification
 * Main purpose: Verify serialization pipeline behavior
 */
class MockSerializer<T = unknown> implements SerializerIneterface<T, string> {
  public calls: {
    serialize: T[];
    deserialize: Array<{ data: string; defaultValue?: T }>;
  } = {
    serialize: [],
    deserialize: []
  };

  public shouldFailSerialization = false;
  public shouldFailDeserialization = false;

  public serialize(data: T): string {
    this.calls.serialize.push(data);
    if (this.shouldFailSerialization) {
      throw new Error('Serialization failed');
    }
    return `serialized_${JSON.stringify(data)}`;
  }

  public deserialize(data: string, defaultValue?: T): T {
    this.calls.deserialize.push({ data, defaultValue });
    if (this.shouldFailDeserialization) {
      throw new Error('Deserialization failed');
    }
    if (typeof data !== 'string' || !data.startsWith('serialized_')) {
      return defaultValue as T;
    }
    try {
      return JSON.parse(data.replace('serialized_', ''));
    } catch {
      return defaultValue as T;
    }
  }

  public reset(): void {
    this.calls = {
      serialize: [],
      deserialize: []
    };
    this.shouldFailSerialization = false;
    this.shouldFailDeserialization = false;
  }
}

/**
 * Mock encryptor implementation for testing
 *
 * Significance: Provides controlled encryption behavior
 * Core idea: Simple reversible transformation with call tracking
 * Main function: Encrypt/decrypt data with prefix for identification
 * Main purpose: Verify encryption pipeline behavior
 */
class MockEncryptor<T = unknown> implements Encryptor<T, string> {
  public calls: {
    encrypt: T[];
    decrypt: string[];
  } = {
    encrypt: [],
    decrypt: []
  };

  public shouldFailEncryption = false;
  public shouldFailDecryption = false;

  public encrypt(data: T): string {
    this.calls.encrypt.push(data);
    if (this.shouldFailEncryption) {
      throw new Error('Encryption failed');
    }
    return `encrypted_${String(data)}`;
  }

  public decrypt(data: string): T {
    this.calls.decrypt.push(data);
    if (this.shouldFailDecryption) {
      throw new Error('Decryption failed');
    }
    if (!data.startsWith('encrypted_')) {
      return data as T;
    }
    return data.replace('encrypted_', '') as T;
  }

  public reset(): void {
    this.calls = {
      encrypt: [],
      decrypt: []
    };
    this.shouldFailEncryption = false;
    this.shouldFailDecryption = false;
  }
}

class MockJSONEncryptor<T = unknown> implements Encryptor<T, string> {
  public calls: {
    encrypt: T[];
    decrypt: string[];
  } = {
    encrypt: [],
    decrypt: []
  };

  public shouldFailEncryption = false;
  public shouldFailDecryption = false;

  public encrypt(data: T): string {
    this.calls.encrypt.push(data);
    if (this.shouldFailEncryption) {
      throw new Error('Encryption failed');
    }
    return `encrypted_${String(data)}`;
  }

  public decrypt(data: string): T {
    this.calls.decrypt.push(data);
    if (this.shouldFailDecryption) {
      throw new Error('Decryption failed');
    }
    if (!data.startsWith('encrypted_')) {
      return data as T;
    }
    const decrypted = data.replace('encrypted_', '');
    try {
      return JSON.parse(decrypted) as T;
    } catch {
      return decrypted as T;
    }
  }

  public reset(): void {
    this.calls = {
      encrypt: [],
      decrypt: []
    };
    this.shouldFailEncryption = false;
    this.shouldFailDecryption = false;
  }
}

describe('SyncStorage', () => {
  let mainStorage: MockStorage<string>;
  let intermediateStorage1: MockStorage<string>;
  let intermediateStorage2: MockStorage<string>;
  let serializer: MockSerializer<unknown>;
  let encryptor: MockJSONEncryptor<unknown>;

  beforeEach(() => {
    mainStorage = new MockStorage();
    intermediateStorage1 = new MockStorage();
    intermediateStorage2 = new MockStorage();
    serializer = new MockSerializer();
    encryptor = new MockJSONEncryptor();
  });

  afterEach(() => {
    mainStorage.reset();
    intermediateStorage1.reset();
    intermediateStorage2.reset();
    serializer.reset();
    encryptor.reset();
  });

  describe('Basic Operations Without Pipes', () => {
    it('should work without any pipes', () => {
      const storage = new SyncStorage(mainStorage);
      const testValue = { test: 'data' };

      storage.setItem('key1', testValue);
      expect(storage.getItem('key1')).toEqual(testValue);

      expect(mainStorage.calls.setItem).toHaveLength(1);
      expect(mainStorage.calls.getItem).toHaveLength(1);
    });

    it('should return null for non-existent keys', () => {
      const storage = new SyncStorage(mainStorage);

      const result = storage.getItem('non-existent-key');
      expect(result).toBeNull();
    });

    it('should return default value for non-existent keys', () => {
      const storage = new SyncStorage(mainStorage);

      const result = storage.getItem('non-existent-key', 'default');
      expect(result).toBe('default');
    });
  });

  describe('Pipeline Operations', () => {
    it('should process data through serialization pipeline on setItem', () => {
      const storage = new SyncStorage(mainStorage, [serializer]);
      const testValue = { test: 'data' };

      storage.setItem('key1', testValue);

      // Verify serializer was called during pipeline processing
      expect(serializer.calls.serialize).toHaveLength(1);
      expect(serializer.calls.serialize[0]).toEqual(testValue);
    });

    it('should process data through encryption pipeline on setItem', () => {
      const storage = new SyncStorage(mainStorage, [encryptor]);
      const testValue = 'secret-data';

      storage.setItem('key1', testValue);

      // Verify encryptor was called during pipeline processing
      expect(encryptor.calls.encrypt).toHaveLength(1);
      expect(encryptor.calls.encrypt[0]).toBe(testValue);
    });

    it('should process data through multiple pipes in order', () => {
      const storage = new SyncStorage(mainStorage, [serializer, encryptor]);
      const testValue = { secret: 'data' };

      storage.setItem('key1', testValue);

      // Verify both pipes were called
      expect(serializer.calls.serialize).toHaveLength(1);
      expect(encryptor.calls.encrypt).toHaveLength(1);
    });
  });

  describe('Intermediate Storage Pipeline', () => {
    it('should store in intermediate storage during setItem', () => {
      const storage = new SyncStorage(mainStorage, [
        serializer,
        intermediateStorage1,
        encryptor
      ]);
      const testValue = { data: 'test' };

      storage.setItem('key1', testValue);

      // Verify intermediate storage was used
      expect(intermediateStorage1.calls.setItem).toHaveLength(1);
      expect(intermediateStorage1.calls.setItem[0].key).toBe('key1');
    });

    it('should retrieve from intermediate storage when main storage is empty', () => {
      const storage = new SyncStorage(mainStorage, [
        serializer,
        intermediateStorage1,
        encryptor
      ]);

      // Set up data only in intermediate storage
      intermediateStorage1.directSet(
        'key1',
        'serialized_{"data":"intermediate"}'
      );

      const result = storage.getItem('key1');

      // Should find data from intermediate storage
      expect(result).toBeDefined();
      expect(intermediateStorage1.calls.getItem).toHaveLength(1);
    });
  });

  describe('Data Type Handling', () => {
    it('should handle null values', () => {
      const storage = new SyncStorage(mainStorage, [serializer, encryptor]);

      storage.setItem('null-key', null);
      const result = storage.getItem('null-key');

      expect(result).toBeNull();
    });

    it('should handle undefined values', () => {
      const storage = new SyncStorage(mainStorage, [serializer, encryptor]);

      storage.setItem('undefined-key', undefined);
      const result = storage.getItem('undefined-key');

      // The actual behavior depends on the implementation
      // undefined might be converted to null during storage
      expect(result).toBeNull();
    });

    it('should handle empty objects', () => {
      const storage = new SyncStorage(mainStorage, [serializer, encryptor]);
      const emptyObj = {};

      storage.setItem('empty-obj', emptyObj);
      expect(storage.getItem('empty-obj')).toEqual(emptyObj);
    });

    it('should handle empty arrays', () => {
      const storage = new SyncStorage(mainStorage, [serializer, encryptor]);
      const emptyArray: unknown[] = [];

      storage.setItem('empty-array', emptyArray);
      expect(storage.getItem('empty-array')).toEqual(emptyArray);
    });

    it('should handle complex nested objects', () => {
      const storage = new SyncStorage(mainStorage, [serializer, encryptor]);
      const complexObj = {
        level1: {
          level2: {
            level3: {
              value: 'deep-value',
              array: [1, 2, { nested: true }]
            }
          }
        }
      };

      storage.setItem('complex-obj', complexObj);
      expect(storage.getItem('complex-obj')).toEqual(complexObj);
    });
  });

  describe('Error Handling', () => {
    it('should handle serialization errors', () => {
      const storage = new SyncStorage(mainStorage, [serializer]);
      serializer.shouldFailSerialization = true;

      expect(() => storage.setItem('error-key', 'test')).toThrow(
        'Serialization failed'
      );
    });

    it('should handle encryption errors', () => {
      const storage = new SyncStorage(mainStorage, [encryptor]);
      encryptor.shouldFailEncryption = true;

      expect(() => storage.setItem('encrypt-error', 'test')).toThrow(
        'Encryption failed'
      );
    });

    it('should handle invalid pipe types gracefully', () => {
      const invalidPipe = { invalid: 'pipe' };

      const storage = new SyncStorage(mainStorage, [invalidPipe as any]);

      // Should work without the invalid pipe
      storage.setItem('key1', 'test');
      expect(storage.getItem('key1')).toBe('test');
    });
  });

  describe('RemoveItem and Clear Operations', () => {
    it('should remove from all storage layers', () => {
      const storage = new SyncStorage(mainStorage, [
        serializer,
        intermediateStorage1,
        encryptor,
        intermediateStorage2
      ]);

      storage.removeItem('remove-key');

      expect(mainStorage.calls.removeItem).toHaveLength(1);
      expect(intermediateStorage1.calls.removeItem).toHaveLength(1);
      expect(intermediateStorage2.calls.removeItem).toHaveLength(1);
    });

    it('should clear all storage layers', () => {
      const storage = new SyncStorage(mainStorage, [
        serializer,
        intermediateStorage1,
        encryptor,
        intermediateStorage2
      ]);

      storage.clear();

      expect(mainStorage.calls.clear).toBe(1);
      expect(intermediateStorage1.calls.clear).toBe(1);
      expect(intermediateStorage2.calls.clear).toBe(1);
    });

    it('should pass options to removeItem on all storage layers', () => {
      const storage = new SyncStorage(mainStorage, [intermediateStorage1]);
      const options = { force: true };

      storage.removeItem('key-with-options', options);

      expect(mainStorage.calls.removeItem[0].options).toEqual(options);
      expect(intermediateStorage1.calls.removeItem[0].options).toEqual(options);
    });
  });

  describe('Length Property', () => {
    it('should return length from main storage', () => {
      const storage = new SyncStorage(mainStorage, [intermediateStorage1]);

      mainStorage.directSet('key1', 'value1');
      mainStorage.directSet('key2', 'value2');
      intermediateStorage1.directSet('key3', 'value3');

      expect(storage.length).toBe(2); // Only main storage length
    });
  });

  describe('Type Detection', () => {
    it('should auto-detect serializer type', () => {
      const mockSerializer = {
        serialize: vi.fn().mockReturnValue('serialized'),
        deserialize: vi.fn().mockReturnValue('deserialized')
      };

      const storage = new SyncStorage(mainStorage, [mockSerializer]);
      storage.setItem('key1', 'test');

      // Due to the implementation, serializer might be called during pipeline processing
      expect(mockSerializer.serialize).toHaveBeenCalled();
    });

    it('should auto-detect encryptor type', () => {
      const mockEncryptor = {
        encrypt: vi.fn().mockReturnValue('encrypted'),
        decrypt: vi.fn().mockReturnValue('decrypted')
      };

      const storage = new SyncStorage(mainStorage, [mockEncryptor]);
      storage.setItem('key1', 'test');

      // Due to the implementation, encryptor might be called during pipeline processing
      expect(mockEncryptor.encrypt).toHaveBeenCalled();
    });

    it('should auto-detect storage type', () => {
      const mockStorageInterface = {
        setItem: vi.fn().mockReturnValue('stored'),
        getItem: vi.fn().mockReturnValue(null),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0
      };

      const storage = new SyncStorage(mainStorage, [mockStorageInterface]);
      storage.setItem('key1', 'test');

      expect(mockStorageInterface.setItem).toHaveBeenCalledWith(
        'key1',
        'test',
        undefined
      );
    });
  });

  describe('Real-world Usage Patterns', () => {
    it('should work as encrypted JSON storage with cache', () => {
      const cacheStorage = new MockStorage();
      const storage = new SyncStorage(mainStorage, [
        serializer,
        cacheStorage,
        encryptor
      ]);

      const userData = {
        id: 123,
        name: 'John Doe',
        email: 'john@example.com',
        preferences: {
          theme: 'dark',
          notifications: true
        }
      };

      // Store user data
      storage.setItem('user-profile', userData);

      // Retrieve user data
      const retrieved = storage.getItem('user-profile');
      expect(retrieved).toEqual(userData);
    });

    it('should work as multi-layer backup storage', () => {
      const primaryCache = new MockStorage();
      const secondaryCache = new MockStorage();
      const backupStorage = new MockStorage();

      const storage = new SyncStorage(mainStorage, [
        serializer,
        primaryCache,
        encryptor,
        secondaryCache,
        backupStorage
      ]);

      const criticalData = { transaction: 'tx-123', amount: 1000 };

      storage.setItem('transaction', criticalData);

      // All storage layers should receive the data
      expect(primaryCache.calls.setItem).toHaveLength(1);
      expect(secondaryCache.calls.setItem).toHaveLength(1);
      expect(backupStorage.calls.setItem).toHaveLength(1);
      expect(mainStorage.calls.setItem).toHaveLength(1);

      // Retrieval should work
      const result = storage.getItem('transaction');
      expect(result).toEqual(criticalData);
    });
  });

  describe('Performance Considerations', () => {
    it('should handle large data efficiently', () => {
      const storage = new SyncStorage(mainStorage, [serializer, encryptor]);

      const largeData = {
        data: new Array(1000)
          .fill(0)
          .map((_, i) => ({ id: i, value: `item-${i}` }))
      };

      storage.setItem('large-data', largeData);
      const result = storage.getItem('large-data');

      expect(result).toEqual(largeData);
    });

    it('should handle rapid successive operations', () => {
      const storage = new SyncStorage(mainStorage, [serializer, encryptor]);

      // Store multiple items
      for (let i = 0; i < 10; i++) {
        storage.setItem(`key-${i}`, `value-${i}`);
      }

      // Retrieve and verify
      for (let i = 0; i < 10; i++) {
        expect(storage.getItem(`key-${i}`)).toBe(`value-${i}`);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string keys', () => {
      const storage = new SyncStorage(mainStorage, [serializer]);

      storage.setItem('', 'empty-key-value');
      expect(storage.getItem('')).toBe('empty-key-value');
    });

    it('should handle special character keys', () => {
      const storage = new SyncStorage(mainStorage, [serializer]);
      const specialKey = '🔑 key with spaces & symbols!@#$%^&*()';

      storage.setItem(specialKey, 'special-value');
      expect(storage.getItem(specialKey)).toBe('special-value');
    });

    it('should handle overwriting existing keys', () => {
      const storage = new SyncStorage(mainStorage, [serializer, encryptor]);

      storage.setItem('overwrite-key', 'original-value');
      expect(storage.getItem('overwrite-key')).toBe('original-value');

      storage.setItem('overwrite-key', 'new-value');
      expect(storage.getItem('overwrite-key')).toBe('new-value');
    });
  });

  describe('Real-world Integration Tests', () => {
    interface User {
      id: number;
      name: string;
      email?: string;
      token?: string;
    }

    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should use object storage', () => {
      const objectStorage = new ObjectStorage<string, User>();
      const storage = new SyncStorage(objectStorage);

      storage.setItem('user:1', {
        id: 1,
        name: 'John Doe'
      });

      const result = storage.getItem<User>('user:1');
      expect(result).toEqual({
        id: 1,
        name: 'John Doe'
      });
    });

    it('should use object storage with expiration', () => {
      const objectStorage = new ObjectStorage<string, User>();
      const storage = new SyncStorage(objectStorage);
      const expireTime = Date.now() + 1000;

      const user: User = {
        id: 1,
        name: 'John Doe'
      };

      storage.setItem('user:1', user, {
        expires: expireTime
      });

      expect(storage.getItem<User>('user:1')).toEqual(user);

      // Advance time past expiration
      vi.advanceTimersByTime(1001);

      expect(storage.getItem<User>('user:1')).toBeNull();
    });

    it('should use object storage with serialization', () => {
      const objectStorage = new ObjectStorage<string>();
      const serializer = new JSONSerializer();
      const storage = new SyncStorage(objectStorage, [serializer]);

      const user: User = {
        id: 1,
        name: 'John Doe'
      };

      storage.setItem('user:1', user);
      expect(storage.getItem<User>('user:1')).toEqual(user);
    });

    it('should use object storage with serialization and encryption', () => {
      const serializer = new JSONSerializer();
      const objectStorage = new ObjectStorage<string, string>();
      const encryptor = new MockEncryptor<string>();
      const storage = new SyncStorage(objectStorage, [serializer, encryptor]);

      const user: User = {
        id: 1,
        name: 'John Doe'
      };

      storage.setItem('user:1', user);
      expect(storage.getItem<User>('user:1')).toEqual(user);
    });

    it('should use multiple serializers', () => {
      const storage = new SyncStorage<string>(new ObjectStorage(), [
        new JSONSerializer(),
        new Base64Serializer()
      ]);

      storage.setItem('user:1', 'dark');
      expect(storage.getItem<string>('user:1')).toBe('dark');
    });

    it('should handle authentication token storage', () => {
      const tokenStorage = new ObjectStorage<string, string>();
      const encryptor = new MockEncryptor<string>();
      const storage = new SyncStorage(tokenStorage, [encryptor]);

      const token = 'jwt-token-12345';
      storage.setItem('auth-token', token);

      expect(storage.getItem('auth-token')).toBe(token);
    });

    it('should handle user preferences with caching', () => {
      const cacheStorage = new ObjectStorage<string>();
      const mainStorage = new ObjectStorage<string>();
      const storage = new SyncStorage(mainStorage, [
        new JSONSerializer(),
        cacheStorage
      ]);

      const preferences = {
        theme: 'dark',
        language: 'en',
        notifications: true
      };

      storage.setItem('user-preferences', preferences);
      expect(storage.getItem('user-preferences')).toEqual(preferences);
    });

    it('should handle session data with encryption and expiration', () => {
      const sessionStorage = new ObjectStorage<string>();
      const encryptor = new MockEncryptor();
      const storage = new SyncStorage(sessionStorage, [
        new JSONSerializer(),
        encryptor
      ]);

      const sessionData = {
        userId: 123,
        sessionId: 'session-abc',
        permissions: ['read', 'write']
      };

      const expireTime = Date.now() + 3600000; // 1 hour

      storage.setItem('session', sessionData, {
        expires: expireTime
      });

      expect(storage.getItem('session')).toEqual(sessionData);

      // Advance time past expiration
      vi.advanceTimersByTime(3600001);
      expect(storage.getItem('session')).toBeNull();
    });
  });

  describe('Type Safety Tests', () => {
    it('should work with typed keys and values', () => {
      interface UserData {
        id: number;
        name: string;
        active: boolean;
      }

      const storage = new SyncStorage<string>(mainStorage, [serializer]);
      const userData: UserData = { id: 1, name: 'John', active: true };

      storage.setItem('user:1', userData);
      const result = storage.getItem<UserData>('user:1');

      expect(result).toEqual(userData);
    });

    it('should work with union types', () => {
      const storage = new SyncStorage<string>(mainStorage, [serializer]);

      storage.setItem('string-value', 'hello');
      storage.setItem('number-value', 42);
      storage.setItem('boolean-value', true);

      expect(storage.getItem<string>('string-value')).toBe('hello');
      expect(storage.getItem<number>('number-value')).toBe(42);
      expect(storage.getItem<boolean>('boolean-value')).toBe(true);
    });

    it('should work with optional properties', () => {
      interface Config {
        theme: 'light' | 'dark';
        language?: string;
        features?: string[];
      }

      const storage = new SyncStorage<string>(mainStorage, [serializer]);
      const config: Config = {
        theme: 'dark',
        language: 'en',
        features: ['feature1', 'feature2']
      };

      storage.setItem('config', config);
      const result = storage.getItem<Config>('config');

      expect(result).toEqual(config);
    });
  });
});
