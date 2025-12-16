import { ObjectStorage } from '../../src/storage/impl/ObjectStorage';
import { JSONSerializer } from '../../src/serializer';

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

  public serialize(data: unknown): string {
    this.calls.serialize.push(data);
    if (this.shouldFailSerialization) {
      throw new Error('Serialization failed');
    }
    return JSON.stringify(data);
  }

  public deserialize(data: string, defaultValue?: unknown): unknown {
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

  public reset(): void {
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

  beforeEach(() => {
    vi.useFakeTimers();
    mockSerializer = new MockSerializer();
    storage = new ObjectStorage(mockSerializer as any);
  });

  afterEach(() => {
    vi.useRealTimers();
    mockSerializer.reset();
  });

  describe('Constructor', () => {
    it('should create instance with serializer only', () => {
      const simpleStorage = new ObjectStorage(mockSerializer as any);
      expect(simpleStorage).toBeInstanceOf(ObjectStorage);
      expect(simpleStorage.getSerializer()).toBe(mockSerializer);
    });

    it('should create instance without serializer', () => {
      const noSerializerStorage = new ObjectStorage();
      expect(noSerializerStorage).toBeInstanceOf(ObjectStorage);
      expect(noSerializerStorage.getSerializer()).toBeUndefined();
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

      storage.setItem('expire-test', 'value', { expires: expireTime });
      expect(storage.getItem('expire-test')).toBe('value');
    });

    it('should return null for expired value', () => {
      const expireTime = Date.now() + 1000; // 1 second from now

      storage.setItem('expire-test', 'value', { expires: expireTime });

      // Advance time past expiration
      vi.advanceTimersByTime(1001);

      expect(storage.getItem('expire-test')).toBeNull();
    });

    it('should automatically remove expired items', () => {
      const expireTime = Date.now() + 1000;

      storage.setItem('expire-test', 'value', { expires: expireTime });
      expect(storage.length).toBe(1);

      vi.advanceTimersByTime(1001);
      storage.getItem('expire-test'); // This should trigger removal

      expect(storage.length).toBe(0);
    });

    it('should handle zero expiration time correctly', () => {
      storage.setItem('zero-expire', 'value', { expires: 0 });
      expect(storage.getItem('zero-expire')).toBe('value');
    });

    it('should handle negative expiration time correctly', () => {
      storage.setItem('negative-expire', 'value', { expires: -1000 });
      expect(storage.getItem('negative-expire')).toBe('value');
    });

    it('should return default value for expired item', () => {
      const expireTime = Date.now() + 1000;
      const defaultValue = 'default';

      storage.setItem('expire-test', 'value', { expires: expireTime });
      vi.advanceTimersByTime(1001);

      expect(storage.getItem('expire-test', defaultValue)).toBe(defaultValue);
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

  describe('Storage without Serializer', () => {
    let noSerializerStorage: ObjectStorage<string>;

    beforeEach(() => {
      noSerializerStorage = new ObjectStorage();
    });

    it('should store and retrieve values without serializer', () => {
      const testValue = 'simple string value';

      noSerializerStorage.setItem('test-key', testValue);
      const retrieved = noSerializerStorage.getItem('test-key');

      expect(retrieved).toBe(testValue);
    });

    it('should handle expiration without serializer', () => {
      const expireTime = Date.now() + 1000;

      noSerializerStorage.setItem('expire-test', 'value', {
        expires: expireTime
      });
      expect(noSerializerStorage.getItem('expire-test')).toBe('value');

      vi.advanceTimersByTime(1001);
      expect(noSerializerStorage.getItem('expire-test')).toBeNull();
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

    it('should handle numeric string keys', () => {
      storage.setItem('123', 'numeric key');
      storage.setItem('0', 'zero key');
      storage.setItem('-1', 'negative key');

      expect(storage.getItem('123')).toBe('numeric key');
      expect(storage.getItem('0')).toBe('zero key');
      expect(storage.getItem('-1')).toBe('negative key');
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
      realStorage = new ObjectStorage(jsonSerializer as any);
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

      realStorage.setItem(
        'session',
        { token: 'abc123' },
        { expires: expireTime }
      );
      expect(realStorage.getItem('session')).toEqual({ token: 'abc123' });

      vi.advanceTimersByTime(1001);
      expect(realStorage.getItem('session')).toBeNull();
    });
  });

  describe('Error Handling and Edge Cases', () => {
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
    it('should return serializer instance', () => {
      expect(storage.getSerializer()).toBe(mockSerializer);
    });

    it('should return undefined for missing serializer', () => {
      const memoryStorage = new ObjectStorage();
      expect(memoryStorage.getSerializer()).toBeUndefined();
    });
  });

  describe('Edge Cases and Boundary Tests', () => {
    describe('Key Edge Cases', () => {
      it('should handle extremely long keys', () => {
        const longKey = 'a'.repeat(10000);
        storage.setItem(longKey, 'value');
        expect(storage.getItem(longKey)).toBe('value');
      });

      it('should handle keys with unicode characters', () => {
        const unicodeKey = '测试🚀💯';
        storage.setItem(unicodeKey, 'unicode value');
        expect(storage.getItem(unicodeKey)).toBe('unicode value');
      });

      it('should handle keys with control characters', () => {
        const controlKey = '\n\t\r\0';
        storage.setItem(controlKey, 'control value');
        expect(storage.getItem(controlKey)).toBe('control value');
      });
    });

    describe('Value Edge Cases', () => {
      it('should handle extremely large objects', () => {
        const largeObject = {
          data: Array.from({ length: 10000 }, (_, i) => ({
            id: i,
            name: `item-${i}`,
            description: 'x'.repeat(100),
            metadata: {
              created: new Date().toISOString(),
              tags: Array.from({ length: 10 }, (_, j) => `tag-${j}`)
            }
          }))
        };

        storage.setItem('large-object', largeObject);
        const retrieved = storage.getItem('large-object');
        expect(retrieved).toEqual(largeObject);
      });

      it('should handle deeply nested objects', () => {
        const createNestedObject = (depth: number): any => {
          if (depth === 0) return { value: 'deep' };
          return { nested: createNestedObject(depth - 1) };
        };

        const deepObject = createNestedObject(100);
        storage.setItem('deep-object', deepObject);
        expect(storage.getItem('deep-object')).toEqual(deepObject);
      });

      it('should handle circular reference objects with serializer', () => {
        const circularObj: any = { name: 'test' };
        circularObj.self = circularObj;

        expect(() => storage.setItem('circular', circularObj)).toThrow();
      });

      it('should handle objects with special properties', () => {
        const specialObj = {
          __proto__: null,
          constructor: 'fake',
          toString: () => 'custom',
          valueOf: () => 42,
          hasOwnProperty: 'overridden'
        };

        storage.setItem('special-obj', specialObj);
        const retrieved = storage.getItem('special-obj');

        // JSON serialization will lose functions and some special properties
        expect(retrieved).toEqual({
          constructor: 'fake',
          hasOwnProperty: 'overridden'
          // toString and valueOf functions will be lost during JSON serialization
          // __proto__ will be lost as well
        });
      });

      it('should handle functions (should be serialized as undefined/null)', () => {
        const objWithFunction = {
          name: 'test',
          func: () => 'hello',
          method: function () {
            return 'world';
          }
        };

        storage.setItem('with-function', objWithFunction);
        const retrieved = storage.getItem('with-function');

        // Functions should be serialized as undefined and become null
        expect(retrieved).toEqual({
          name: 'test'
          // func and method should be missing due to JSON serialization
        });
      });

      it('should handle symbols (should be ignored in serialization)', () => {
        const sym = Symbol('test');
        const objWithSymbol = {
          name: 'test',
          [sym]: 'symbol value',
          regular: 'regular value'
        };

        storage.setItem('with-symbol', objWithSymbol);
        const retrieved = storage.getItem('with-symbol');

        // Symbol properties should be ignored
        expect(retrieved).toEqual({
          name: 'test',
          regular: 'regular value'
        });
      });
    });

    describe('Expiration Edge Cases', () => {
      it('should handle expiration at exact boundary', () => {
        const expireTime = Date.now() + 1000;

        storage.setItem('boundary-test', 'value', { expires: expireTime });

        // At exact expiration time - should still be valid (expires < Date.now())
        vi.setSystemTime(expireTime);
        expect(storage.getItem('boundary-test')).toBe('value');

        // Just after expiration time - should be expired
        vi.setSystemTime(expireTime + 1);
        expect(storage.getItem('boundary-test')).toBeNull();
      });

      it('should handle expiration just before boundary', () => {
        const expireTime = Date.now() + 1000;

        storage.setItem('before-boundary', 'value', { expires: expireTime });

        // Just before expiration
        vi.setSystemTime(expireTime - 1);
        expect(storage.getItem('before-boundary')).toBe('value');
      });

      it('should handle very large expiration times', () => {
        const farFuture = Date.now() + 1000 * 60 * 60 * 24 * 365 * 100; // 100 years

        storage.setItem('far-future', 'value', { expires: farFuture });
        expect(storage.getItem('far-future')).toBe('value');
      });

      it('should handle expiration time in the past', () => {
        const pastTime = Date.now() - 1000;

        storage.setItem('past-time', 'value', { expires: pastTime });
        expect(storage.getItem('past-time')).toBeNull();
      });

      it('should handle multiple items with different expiration times', () => {
        const now = Date.now();

        storage.setItem('expire-1s', 'value1', { expires: now + 1000 });
        storage.setItem('expire-2s', 'value2', { expires: now + 2000 });
        storage.setItem('expire-3s', 'value3', { expires: now + 3000 });
        storage.setItem('no-expire', 'value4'); // No expiration

        expect(storage.length).toBe(4);

        // After 1.5 seconds
        vi.advanceTimersByTime(1500);
        expect(storage.getItem('expire-1s')).toBeNull();
        expect(storage.getItem('expire-2s')).toBe('value2');
        expect(storage.getItem('expire-3s')).toBe('value3');
        expect(storage.getItem('no-expire')).toBe('value4');
        expect(storage.length).toBe(3); // One should be removed

        // After 2.5 seconds total
        vi.advanceTimersByTime(1000);
        expect(storage.getItem('expire-2s')).toBeNull();
        expect(storage.getItem('expire-3s')).toBe('value3');
        expect(storage.getItem('no-expire')).toBe('value4');
        expect(storage.length).toBe(2);

        // After 3.5 seconds total
        vi.advanceTimersByTime(1000);
        expect(storage.getItem('expire-3s')).toBeNull();
        expect(storage.getItem('no-expire')).toBe('value4');
        expect(storage.length).toBe(1);
      });
    });

    describe('Memory and Performance Edge Cases', () => {
      it('should handle rapid successive operations', () => {
        const iterations = 10000;

        // Rapid writes
        for (let i = 0; i < iterations; i++) {
          storage.setItem(`rapid-${i}`, `value-${i}`);
        }
        expect(storage.length).toBe(iterations);

        // Rapid reads
        for (let i = 0; i < iterations; i++) {
          expect(storage.getItem(`rapid-${i}`)).toBe(`value-${i}`);
        }

        // Rapid deletes
        for (let i = 0; i < iterations / 2; i++) {
          storage.removeItem(`rapid-${i}`);
        }
        expect(storage.length).toBe(iterations / 2);
      });

      it('should handle alternating set/remove operations', () => {
        const key = 'alternating-key';

        for (let i = 0; i < 1000; i++) {
          storage.setItem(key, `value-${i}`);
          expect(storage.getItem(key)).toBe(`value-${i}`);
          storage.removeItem(key);
          expect(storage.getItem(key)).toBeNull();
        }

        expect(storage.length).toBe(0);
      });

      it('should handle memory cleanup after clear', () => {
        // Fill storage
        for (let i = 0; i < 1000; i++) {
          storage.setItem(`cleanup-${i}`, { data: 'x'.repeat(1000) });
        }
        expect(storage.length).toBe(1000);

        // Clear and verify cleanup
        storage.clear();
        expect(storage.length).toBe(0);

        // Should be able to add new items after clear
        storage.setItem('after-clear', 'value');
        expect(storage.getItem('after-clear')).toBe('value');
        expect(storage.length).toBe(1);
      });
    });

    describe('Serializer Edge Cases', () => {
      it('should handle serializer returning non-string values', () => {
        const badSerializer = {
          serialize: vi.fn().mockReturnValue(123), // Returns number instead of string
          deserialize: vi.fn().mockReturnValue('deserialized')
        };

        const badStorage = new ObjectStorage(badSerializer as any);
        badStorage.setItem('bad-serialize', 'value');

        expect(badSerializer.serialize).toHaveBeenCalled();
      });

      it('should handle serializer throwing during deserialization', () => {
        mockSerializer.shouldFailDeserialization = true;

        storage.setItem('fail-deserialize', 'value');
        const result = storage.getItem('fail-deserialize', 'fallback');

        expect(result).toBe('fallback');
      });

      it('should handle serializer returning undefined during deserialization', () => {
        const undefinedSerializer = {
          serialize: vi.fn().mockReturnValue('serialized'),
          deserialize: vi.fn().mockReturnValue(undefined)
        };

        const undefinedStorage = new ObjectStorage(undefinedSerializer as any);
        undefinedStorage.setItem('undefined-result', 'value');

        const result = undefinedStorage.getItem('undefined-result', 'default');
        expect(result).toBe('default');
      });
    });

    describe('Type Safety Edge Cases', () => {
      it('should handle mixed types in same storage instance', () => {
        storage.setItem('string', 'text');
        storage.setItem('number', 42);
        storage.setItem('boolean', true);
        storage.setItem('array', [1, 2, 3]);
        storage.setItem('object', { key: 'value' });
        storage.setItem('null', null);

        expect(storage.getItem('string')).toBe('text');
        expect(storage.getItem('number')).toBe(42);
        expect(storage.getItem('boolean')).toBe(true);
        expect(storage.getItem('array')).toEqual([1, 2, 3]);
        expect(storage.getItem('object')).toEqual({ key: 'value' });
        expect(storage.getItem('null')).toBeNull();
      });

      it('should handle type coercion in default values', () => {
        expect(storage.getItem('missing', 0)).toBe(0);
        expect(storage.getItem('missing', false)).toBe(false);
        expect(storage.getItem('missing', '')).toBe('');
        expect(storage.getItem('missing', [])).toEqual([]);
        expect(storage.getItem('missing', {})).toEqual({});
      });
    });

    describe('Concurrent Operations Simulation', () => {
      it('should handle interleaved operations', () => {
        const operations = [];
        const keys = ['a', 'b', 'c', 'd', 'e'];

        // Create interleaved operations
        for (let i = 0; i < 100; i++) {
          const key = keys[i % keys.length];
          const operation = i % 3;

          switch (operation) {
            case 0: // set
              operations.push(() => storage.setItem(key, `value-${i}`));
              break;
            case 1: // get
              operations.push(() => storage.getItem(key));
              break;
            case 2: // remove
              operations.push(() => storage.removeItem(key));
              break;
          }
        }

        // Execute all operations
        operations.forEach((op) => op());

        // Storage should still be functional
        storage.setItem('final-test', 'final-value');
        expect(storage.getItem('final-test')).toBe('final-value');
      });
    });

    describe('Storage State Consistency', () => {
      it('should maintain consistent state after errors', () => {
        // Cause serialization error
        mockSerializer.shouldFailSerialization = true;

        try {
          storage.setItem('error-key', 'value');
        } catch {
          // Expected error
        }

        // Reset serializer and verify storage still works
        mockSerializer.shouldFailSerialization = false;
        mockSerializer.reset();

        storage.setItem('recovery-key', 'recovery-value');
        expect(storage.getItem('recovery-key')).toBe('recovery-value');
      });

      it('should handle operations on same key with different value types', () => {
        const key = 'changing-type';

        storage.setItem(key, 'string');
        expect(storage.getItem(key)).toBe('string');

        storage.setItem(key, 123);
        expect(storage.getItem(key)).toBe(123);

        storage.setItem(key, { object: true });
        expect(storage.getItem(key)).toEqual({ object: true });

        storage.setItem(key, [1, 2, 3]);
        expect(storage.getItem(key)).toEqual([1, 2, 3]);

        expect(storage.length).toBe(1); // Should still be just one item
      });
    });
  });
});
