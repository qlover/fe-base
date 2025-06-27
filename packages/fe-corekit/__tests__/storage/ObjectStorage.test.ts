/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObjectStorage } from '../../src/storage/impl/ObjectStorage';
import { JSONSerializer } from '../../src/serializer';
import { SyncStorage } from '../../src/storage/Storage';

/**
 * Simple mock storage for testing
 */
class MockStorage implements SyncStorage<string, string> {
  private data = new Map<string, string>();
  public calls: {
    setItem: Array<{ key: string; value: unknown }>;
    getItem: Array<{ key: string; defaultValue?: unknown }>;
    removeItem: string[];
    clear: number;
  } = {
    setItem: [],
    getItem: [],
    removeItem: [],
    clear: 0
  };

  get length(): number {
    return this.data.size;
  }

  setItem<T>(key: string, value: T): void {
    this.calls.setItem.push({ key, value });
    this.data.set(key, String(value));
  }

  getItem<T extends string>(key: string, defaultValue?: T): T | null {
    this.calls.getItem.push({ key, defaultValue });
    const value = this.data.get(key);
    return (value ?? defaultValue ?? null) as T | null;
  }

  removeItem(key: string): void {
    this.calls.removeItem.push(key);
    this.data.delete(key);
  }

  clear(): void {
    this.calls.clear++;
    this.data.clear();
  }

  reset(): void {
    this.data.clear();
    this.calls = {
      setItem: [],
      getItem: [],
      removeItem: [],
      clear: 0
    };
  }
}

/**
 * Simple mock serializer for testing
 */
class MockSerializer {
  public calls: {
    serialize: unknown[];
    deserialize: Array<{ data: string; defaultValue?: unknown }>;
  } = {
    serialize: [],
    deserialize: []
  };

  public shouldFailSerialization = false;
  public shouldFailDeserialization = false;

  serialize(data: unknown): string {
    this.calls.serialize.push(data);
    if (this.shouldFailSerialization) {
      throw new Error('Serialization failed');
    }
    return JSON.stringify(data);
  }

  deserialize(data: string, defaultValue?: unknown): unknown {
    this.calls.deserialize.push({ data, defaultValue });
    if (this.shouldFailDeserialization) {
      return defaultValue;
    }
    try {
      return JSON.parse(data);
    } catch {
      return defaultValue;
    }
  }

  reset(): void {
    this.calls = {
      serialize: [],
      deserialize: []
    };
    this.shouldFailSerialization = false;
    this.shouldFailDeserialization = false;
  }
}

describe('ObjectStorage', () => {
  let storage: ObjectStorage<string>;
  let mockSerializer: MockSerializer;
  let mockPersistent: MockStorage;

  beforeEach(() => {
    vi.useFakeTimers();
    mockSerializer = new MockSerializer();
    mockPersistent = new MockStorage();
    storage = new ObjectStorage(mockSerializer as any, mockPersistent);
  });

  afterEach(() => {
    vi.useRealTimers();
    mockSerializer.reset();
    mockPersistent.reset();
  });

  describe('Constructor', () => {
    it('should create instance with serializer only', () => {
      const simpleStorage = new ObjectStorage(mockSerializer as any);
      expect(simpleStorage).toBeInstanceOf(ObjectStorage);
      expect(simpleStorage.getSerializer()).toBe(mockSerializer);
      expect(simpleStorage.getPersistentStorage()).toBeUndefined();
    });

    it('should create instance with serializer and persistent storage', () => {
      expect(storage).toBeInstanceOf(ObjectStorage);
      expect(storage.getSerializer()).toBe(mockSerializer);
      expect(storage.getPersistentStorage()).toBe(mockPersistent);
    });
  });

  describe('Basic Storage Operations', () => {
    it('should store and retrieve a value', () => {
      const testValue = { name: 'test', value: 123 };

      storage.setItem('test-key', testValue);
      const retrieved = storage.getItem('test-key');

      expect(retrieved).toEqual(testValue);
      expect(storage.length).toBe(1);
    });

    it('should return null for non-existent key', () => {
      const result = storage.getItem('non-existent');
      expect(result).toBeNull();
    });

    it('should return default value for non-existent key', () => {
      const defaultValue = { default: true };
      const result = storage.getItem('non-existent', defaultValue);
      expect(result).toEqual(defaultValue);
    });

    it('should remove an item', () => {
      storage.setItem('remove-test', 'value');
      expect(storage.getItem('remove-test')).toBe('value');

      storage.removeItem('remove-test');
      expect(storage.getItem('remove-test')).toBeNull();
      expect(storage.length).toBe(0);
    });

    it('should clear all items', () => {
      storage.setItem('key1', 'value1');
      storage.setItem('key2', 'value2');
      expect(storage.length).toBe(2);

      storage.clear();
      expect(storage.length).toBe(0);
      expect(storage.getItem('key1')).toBeNull();
      expect(storage.getItem('key2')).toBeNull();
    });

    it('should handle removing non-existent key gracefully', () => {
      expect(() => storage.removeItem('non-existent')).not.toThrow();
    });
  });

  describe('Expiration Handling', () => {
    it('should store value with expiration', () => {
      const expireTime = Date.now() + 5000; // 5 seconds from now

      storage.setItem('expire-test', 'value', expireTime);
      expect(storage.getItem('expire-test')).toBe('value');
    });

    it('should return null for expired value', () => {
      const expireTime = Date.now() + 1000; // 1 second from now

      storage.setItem('expire-test', 'value', expireTime);

      // Advance time past expiration
      vi.advanceTimersByTime(1001);

      expect(storage.getItem('expire-test')).toBeNull();
    });

    it('should automatically remove expired items', () => {
      const expireTime = Date.now() + 1000;

      storage.setItem('expire-test', 'value', expireTime);
      expect(storage.length).toBe(1);

      vi.advanceTimersByTime(1001);
      storage.getItem('expire-test'); // This should trigger removal

      expect(storage.length).toBe(0);
      expect(mockPersistent.calls.removeItem).toContain('expire-test');
    });

    it('should handle zero expiration time correctly', () => {
      storage.setItem('zero-expire', 'value', 0);
      expect(storage.getItem('zero-expire')).toBe('value');
    });

    it('should handle negative expiration time correctly', () => {
      storage.setItem('negative-expire', 'value', -1000);
      expect(storage.getItem('negative-expire')).toBe('value');
    });

    it('should return default value for expired item', () => {
      const expireTime = Date.now() + 1000;
      const defaultValue = 'default';

      storage.setItem('expire-test', 'value', expireTime);
      vi.advanceTimersByTime(1001);

      expect(storage.getItem('expire-test', defaultValue)).toBe(defaultValue);
    });
  });

  describe('Dual-Layer Storage (Memory + Persistent)', () => {
    it('should store to both memory and persistent storage', () => {
      storage.setItem('dual-test', 'value');

      expect(mockPersistent.calls.setItem).toHaveLength(1);
      expect(mockPersistent.calls.setItem[0].key).toBe('dual-test');
      expect(storage.length).toBe(1);
    });

    it('should retrieve from memory first', () => {
      storage.setItem('memory-test', 'value');
      mockPersistent.reset(); // Clear persistent storage calls

      const result = storage.getItem('memory-test');

      expect(result).toBe('value');
      expect(mockPersistent.calls.getItem).toHaveLength(0); // Should not call persistent
    });

    it('should fallback to persistent storage when not in memory', () => {
      // Directly set in persistent storage (bypassing memory)
      mockPersistent.setItem(
        'persistent-only',
        '{"key":"persistent-only","value":"persistent-value"}'
      );

      const result = storage.getItem('persistent-only');

      expect(result).toBe('persistent-value');
      expect(mockPersistent.calls.getItem).toHaveLength(1);
    });

    it('should remove from both memory and persistent storage', () => {
      storage.setItem('remove-dual', 'value');
      mockPersistent.reset();

      storage.removeItem('remove-dual');

      expect(storage.length).toBe(0);
      expect(mockPersistent.calls.removeItem).toContain('remove-dual');
    });

    it('should clear both memory and persistent storage', () => {
      storage.setItem('clear-test1', 'value1');
      storage.setItem('clear-test2', 'value2');
      mockPersistent.reset();

      storage.clear();

      expect(storage.length).toBe(0);
      expect(mockPersistent.calls.clear).toBe(1);
    });
  });

  describe('Serialization Integration', () => {
    it('should use serializer for storing values', () => {
      const testData = { complex: 'object', nested: { value: 42 } };

      storage.setItem('serialize-test', testData);

      expect(mockSerializer.calls.serialize).toHaveLength(1);
      expect(mockSerializer.calls.serialize[0]).toMatchObject({
        key: 'serialize-test',
        value: testData
      });
    });

    it('should use serializer for retrieving values', () => {
      storage.setItem('deserialize-test', 'value');
      mockSerializer.reset();

      storage.getItem('deserialize-test');

      expect(mockSerializer.calls.deserialize).toHaveLength(1);
    });

    it('should handle serialization errors gracefully', () => {
      mockSerializer.shouldFailSerialization = true;

      expect(() => storage.setItem('fail-test', 'value')).toThrow(
        'Serialization failed'
      );
    });

    it('should handle deserialization errors gracefully', () => {
      storage.setItem('deserialize-fail', 'value');
      mockSerializer.shouldFailDeserialization = true;

      const result = storage.getItem('deserialize-fail', 'default');
      expect(result).toBe('default');
    });
  });

  describe('Type Safety and Edge Cases', () => {
    it('should handle different value types', () => {
      const testCases = [
        { key: 'string', value: 'test string' },
        { key: 'number', value: 42 },
        { key: 'boolean', value: true },
        { key: 'object', value: { nested: 'object' } },
        { key: 'array', value: [1, 2, 3] },
        { key: 'null', value: null }
        // Note: undefined gets converted to null during JSON serialization
      ];

      testCases.forEach(({ key, value }) => {
        storage.setItem(key, value);
        expect(storage.getItem(key)).toEqual(value);
      });
    });

    it('should handle undefined values (converted to null)', () => {
      // undefined values get converted to null during JSON serialization
      storage.setItem('undefined', undefined);
      expect(storage.getItem('undefined')).toBeNull();
    });

    it('should handle empty string keys', () => {
      storage.setItem('', 'empty key value');
      expect(storage.getItem('')).toBe('empty key value');
    });

    it('should handle special character keys', () => {
      const specialKey = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      storage.setItem(specialKey, 'special value');
      expect(storage.getItem(specialKey)).toBe('special value');
    });

    it('should handle large data sets', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        data: `item-${i}`.repeat(10)
      }));

      storage.setItem('large-data', largeData);
      expect(storage.getItem('large-data')).toEqual(largeData);
    });

    it('should handle invalid storage value structure', () => {
      // Simulate corrupted data in persistent storage
      mockPersistent.setItem('corrupted', 'invalid-json-structure');

      const result = storage.getItem('corrupted', 'default');
      expect(result).toBe('default');
    });
  });

  describe('Performance and Memory Management', () => {
    it('should maintain correct length count', () => {
      expect(storage.length).toBe(0);

      storage.setItem('item1', 'value1');
      expect(storage.length).toBe(1);

      storage.setItem('item2', 'value2');
      expect(storage.length).toBe(2);

      storage.removeItem('item1');
      expect(storage.length).toBe(1);

      storage.clear();
      expect(storage.length).toBe(0);
    });

    it('should handle multiple operations efficiently', () => {
      const startTime = performance.now();

      // Perform multiple operations
      for (let i = 0; i < 100; i++) {
        storage.setItem(`key-${i}`, `value-${i}`);
      }

      for (let i = 0; i < 100; i++) {
        storage.getItem(`key-${i}`);
      }

      for (let i = 0; i < 50; i++) {
        storage.removeItem(`key-${i}`);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100); // Should complete within 100ms
      expect(storage.length).toBe(50);
    });
  });

  describe('Real-world Integration with JSONSerializer', () => {
    let realStorage: ObjectStorage<string>;

    beforeEach(() => {
      const jsonSerializer = new JSONSerializer();
      realStorage = new ObjectStorage(jsonSerializer as any, mockPersistent);
    });

    it('should work with real JSONSerializer', () => {
      const complexData = {
        user: {
          id: 123,
          name: 'John Doe',
          preferences: {
            theme: 'dark',
            notifications: true
          }
        },
        metadata: {
          created: new Date().toISOString(),
          version: '1.0.0'
        }
      };

      realStorage.setItem('user-data', complexData);
      const retrieved = realStorage.getItem('user-data');

      expect(retrieved).toEqual(complexData);
    });

    it('should handle expiration with real serializer', () => {
      const expireTime = Date.now() + 1000;

      realStorage.setItem('session', { token: 'abc123' }, expireTime);
      expect(realStorage.getItem('session')).toEqual({ token: 'abc123' });

      vi.advanceTimersByTime(1001);
      expect(realStorage.getItem('session')).toBeNull();
    });

    it('should persist and restore data correctly', () => {
      // Store data
      realStorage.setItem('persistent-data', { important: 'data' });

      // Create new storage instance (simulating app restart)
      const newStorage = new ObjectStorage(
        new JSONSerializer() as any,
        mockPersistent
      );

      // Should retrieve from persistent storage
      const retrieved = newStorage.getItem('persistent-data');
      expect(retrieved).toEqual({ important: 'data' });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle storage without persistent backend', () => {
      const memoryOnlyStorage = new ObjectStorage(mockSerializer as any);

      memoryOnlyStorage.setItem('memory-only', 'value');
      expect(memoryOnlyStorage.getItem('memory-only')).toBe('value');

      memoryOnlyStorage.removeItem('memory-only');
      expect(memoryOnlyStorage.getItem('memory-only')).toBeNull();

      expect(() => memoryOnlyStorage.clear()).not.toThrow();
    });

    it('should handle persistent storage failures gracefully', () => {
      // Mock persistent storage to throw errors
      const failingStorage = {
        length: 0,
        setItem: vi.fn(() => {
          throw new Error('Storage full');
        }),
        getItem: vi.fn(() => {
          throw new Error('Read error');
        }),
        removeItem: vi.fn(() => {
          throw new Error('Remove error');
        }),
        clear: vi.fn(() => {
          throw new Error('Clear error');
        })
      } as unknown as SyncStorage<string, string>;

      const robustStorage = new ObjectStorage(
        mockSerializer as any,
        failingStorage
      );

      // The storage will still throw errors because it tries to persist
      // This is expected behavior - persistent storage failures should be handled by the caller
      expect(() => robustStorage.setItem('test', 'value')).toThrow(
        'Storage full'
      );

      // However, if we can store without persistent layer, memory should work
      const memoryOnlyStorage = new ObjectStorage(mockSerializer as any);
      expect(() => memoryOnlyStorage.setItem('test', 'value')).not.toThrow();
      expect(memoryOnlyStorage.getItem('test')).toBe('value');
    });

    it('should handle concurrent access patterns', () => {
      const keys = Array.from({ length: 10 }, (_, i) => `concurrent-${i}`);

      // Simulate concurrent writes
      keys.forEach((key) => {
        storage.setItem(key, `value-${key}`);
      });

      // Simulate concurrent reads
      const results = keys.map((key) => storage.getItem(key));

      results.forEach((result, index) => {
        expect(result).toBe(`value-concurrent-${index}`);
      });

      expect(storage.length).toBe(keys.length);
    });
  });

  describe('Getter Methods', () => {
    it('should return persistent storage instance', () => {
      expect(storage.getPersistentStorage()).toBe(mockPersistent);
    });

    it('should return serializer instance', () => {
      expect(storage.getSerializer()).toBe(mockSerializer);
    });

    it('should return undefined for missing persistent storage', () => {
      const memoryStorage = new ObjectStorage(mockSerializer as any);
      expect(memoryStorage.getPersistentStorage()).toBeUndefined();
    });
  });
});
