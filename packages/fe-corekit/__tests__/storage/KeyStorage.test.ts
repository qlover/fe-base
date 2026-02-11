import { KeyStorage } from '../../src/storage/impl/KeyStorage';
import { JSONSerializer, ObjectStorage } from '../../src';
import type { StorageInterface } from '@qlover/fe-corekit';

/**
 * Mock storage implementation for testing
 */
class MockStorage<Key = string> implements StorageInterface<Key, string, any> {
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

  /**
   * @override
   */
  public get length(): number {
    return this.data.size;
  }

  /**
   * @override
   */
  public setItem<T>(key: Key, value: T, options?: unknown): void {
    this.calls.setItem.push({ key, value, options });
    this.data.set(String(key), String(value));
  }

  /**
   * @override
   */
  public getItem<T>(key: Key, defaultValue?: T, options?: unknown): T | null {
    this.calls.getItem.push({ key, defaultValue, options });
    const value = this.data.get(String(key));
    return (value ?? defaultValue ?? null) as T | null;
  }

  /**
   * @override
   */
  public removeItem(key: Key, options?: unknown): void {
    this.calls.removeItem.push({ key, options });
    this.data.delete(String(key));
  }

  /**
   * @override
   */
  public clear(): void {
    this.calls.clear++;
    this.data.clear();
  }

  /**
   * @override
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

  // Helper method to directly set data (simulating existing storage)
  /**
   * @override
   */
  public directSet(key: string, value: string): void {
    this.data.set(key, value);
  }
}

describe('KeyStorage', () => {
  let mockStorage: MockStorage;

  beforeEach(() => {
    vi.useFakeTimers();
    mockStorage = new MockStorage();
  });

  afterEach(() => {
    vi.useRealTimers();
    mockStorage.reset();
  });

  describe('Constructor', () => {
    it('should create instance with key only', () => {
      const keyStorage = new KeyStorage<string, string>('test-key');
      expect(keyStorage).toBeInstanceOf(KeyStorage);
    });

    it('should create instance with key and storage', () => {
      const keyStorage = new KeyStorage<string, string, any>(
        'test-key',
        mockStorage
      );
      expect(keyStorage).toBeInstanceOf(KeyStorage);
    });

    it('should initialize with existing value from storage', () => {
      mockStorage.directSet('existing-key', 'existing-value');
      const keyStorage = new KeyStorage<string, string>(
        'existing-key',
        mockStorage
      );

      expect(keyStorage.get()).toBe('existing-value');
    });

    it('should initialize with null when no existing value', () => {
      const keyStorage = new KeyStorage<string, string>('new-key', mockStorage);
      expect(keyStorage.get()).toBeNull();
    });
  });

  describe('Basic Operations', () => {
    describe('Memory-only storage', () => {
      let keyStorage: KeyStorage<string, string>;

      beforeEach(() => {
        keyStorage = new KeyStorage<string, string>('memory-key');
      });

      it('should store and retrieve value in memory', () => {
        keyStorage.set('test-value');
        expect(keyStorage.get()).toBe('test-value');
      });

      it('should return null initially', () => {
        expect(keyStorage.get()).toBeNull();
      });

      it('should remove value from memory', () => {
        keyStorage.set('test-value');
        expect(keyStorage.get()).toBe('test-value');

        keyStorage.remove();
        expect(keyStorage.get()).toBeNull();
      });

      it('should handle multiple set operations', () => {
        keyStorage.set('value1');
        expect(keyStorage.get()).toBe('value1');

        keyStorage.set('value2');
        expect(keyStorage.get()).toBe('value2');
      });
    });

    describe('With persistent storage', () => {
      let keyStorage: KeyStorage<string, string>;

      beforeEach(() => {
        keyStorage = new KeyStorage<string, string>(
          'persistent-key',
          mockStorage
        );
      });

      it('should store value to persistent storage', () => {
        keyStorage.set('persistent-value');

        expect(mockStorage.calls.setItem).toHaveLength(1);
        expect(mockStorage.calls.setItem[0]).toEqual({
          key: 'persistent-key',
          value: 'persistent-value'
        });
      });

      it('should fallback to persistent storage when memory is empty', () => {
        // Create storage with existing data
        mockStorage.directSet('persistent-key', 'storage-value');

        // Create new instance that will load from storage
        const newKeyStorage = new KeyStorage<string, string>(
          'persistent-key',
          mockStorage
        );

        // The value should be loaded during construction
        expect(newKeyStorage.get()).toBe('storage-value');
      });

      it('should remove from both memory and persistent storage', () => {
        keyStorage.set('remove-test');
        mockStorage.reset();

        keyStorage.remove();

        expect(keyStorage.get()).toBeNull();
        expect(mockStorage.calls.removeItem[0].key).toBe('persistent-key');
      });

      it('should handle null values from storage', () => {
        const newKeyStorage = new KeyStorage<string, string>(
          'non-existent-key',
          mockStorage
        );

        const result = newKeyStorage.get();
        expect(result).toBeNull();
      });
    });

    describe('Storage as source of truth (no in-memory cache)', () => {
      let keyStorage: KeyStorage<string, string>;

      beforeEach(() => {
        keyStorage = new KeyStorage<string, string>('cache-key', mockStorage);
      });

      it('should read from storage on every get (no cache)', () => {
        mockStorage.directSet('cache-key', 'cached-value');

        const newKeyStorage = new KeyStorage<string, string>(
          'cache-key',
          mockStorage
        );

        const result1 = newKeyStorage.get();
        expect(result1).toBe('cached-value');
        expect(mockStorage.calls.getItem).toHaveLength(1);

        // Second get still calls storage; no in-memory snapshot
        const result2 = newKeyStorage.get();
        expect(result2).toBe('cached-value');
        expect(mockStorage.calls.getItem).toHaveLength(2);
      });

      it('should return null when storage has been cleared', () => {
        mockStorage.setItem('cache-key', 'storage-value');
        const result1 = keyStorage.get();
        expect(result1).toBe('storage-value');

        // Clear storage (e.g. logout / clear cache)
        mockStorage.reset();

        const result2 = keyStorage.get();
        expect(result2).toBeNull();
        expect(mockStorage.calls.getItem).toHaveLength(1);
      });
    });

    describe('Remove operation behavior', () => {
      let keyStorage: KeyStorage<string, string>;

      beforeEach(() => {
        keyStorage = new KeyStorage<string, string>('remove-key', mockStorage);
      });

      it('should call removeItem twice when remove is followed by get', () => {
        // Set a value first
        keyStorage.set('test-value');
        mockStorage.reset();

        // Remove the value
        keyStorage.remove();
        expect(mockStorage.calls.removeItem).toHaveLength(1);
        expect(mockStorage.calls.removeItem[0].key).toBe('remove-key');

        // Get after remove should return null and trigger another removeItem call
        const result = keyStorage.get();
        expect(result).toBeNull();
        expect(mockStorage.calls.removeItem).toHaveLength(2);
        expect(mockStorage.calls.removeItem[1].key).toBe('remove-key');
      });

      it('should handle multiple consecutive get calls after remove', () => {
        keyStorage.set('test-value');
        keyStorage.remove();

        // Clear memory to ensure get() calls go to storage
        (keyStorage as any).value = null;
        mockStorage.reset();

        keyStorage.get();
        keyStorage.get();
        keyStorage.get();

        expect(mockStorage.calls.removeItem).toHaveLength(3);
      });
    });
  });

  describe('Options passthrough', () => {
    let baseKeyStorage: KeyStorage<string, string>;

    beforeEach(() => {
      baseKeyStorage = new KeyStorage<string, string>('base-key', mockStorage);
    });

    it('should pass options to storage when set is called', () => {
      baseKeyStorage.set('test-value');

      expect(mockStorage.calls.setItem).toHaveLength(1);
      expect(mockStorage.calls.setItem[0]).toEqual({
        key: 'base-key',
        value: 'test-value',
        options: undefined
      });
    });

    it('should pass options to storage when get is called', () => {
      mockStorage.directSet('base-key', 'test-value');
      const result = baseKeyStorage.get();

      expect(result).toBe('test-value');
      expect(mockStorage.calls.getItem).toHaveLength(1);
      expect(mockStorage.calls.getItem[0].key).toBe('base-key');
    });

    it('should pass options to storage when remove is called', () => {
      baseKeyStorage.set('to-remove');
      mockStorage.reset();
      baseKeyStorage.remove();

      expect(mockStorage.calls.removeItem).toHaveLength(1);
      expect(mockStorage.calls.removeItem[0].key).toBe('base-key');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null and undefined values', () => {
      const keyStorage = new KeyStorage<string, string>(
        'null-test',
        mockStorage
      );

      keyStorage.set(null as any);
      expect(keyStorage.get()).toBe('null'); // KeyStorage stores as string

      keyStorage.set(undefined as any);
      expect(keyStorage.get()).toBe('undefined'); // KeyStorage stores as string
    });

    it('should handle empty string values', () => {
      const keyStorage = new KeyStorage<string, string>(
        'empty-test',
        mockStorage
      );

      keyStorage.set('');
      expect(keyStorage.get()).toBe('');
    });

    it('should handle special characters in keys', () => {
      const specialKey = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const keyStorage = new KeyStorage<string, string>(
        specialKey,
        mockStorage
      );

      keyStorage.set('special-value');
      expect(keyStorage.get()).toBe('special-value');
      expect(mockStorage.calls.setItem[0].key).toBe(specialKey);
    });

    it('should handle numeric keys', () => {
      const keyStorage = new KeyStorage<string, string>(
        123 as any,
        mockStorage
      );

      keyStorage.set('numeric-key-value');
      expect(keyStorage.get()).toBe('numeric-key-value');
    });

    it('should handle large data values', () => {
      const keyStorage = new KeyStorage<string, string>(
        'large-data',
        mockStorage
      );
      const largeValue = 'x'.repeat(10000);

      keyStorage.set(largeValue);
      expect(keyStorage.get()).toBe(largeValue);
    });

    it('should handle concurrent operations', () => {
      const keyStorage = new KeyStorage<string, string>(
        'concurrent',
        mockStorage
      );

      // Simulate concurrent set operations
      keyStorage.set('value1');
      keyStorage.set('value2');
      keyStorage.set('value3');

      expect(keyStorage.get()).toBe('value3');
      expect(mockStorage.calls.setItem).toHaveLength(3);
    });

    it('should handle storage failures gracefully', () => {
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
        clear: vi.fn()
      } as unknown as StorageInterface<string, string>;

      // Constructor should handle storage.getItem failures gracefully
      let keyStorage: KeyStorage<string, string>;
      expect(() => {
        keyStorage = new KeyStorage<string, string>(
          'fail-test',
          failingStorage
        );
      }).not.toThrow();

      // Instance should be created successfully with null value
      expect(keyStorage!).toBeInstanceOf(KeyStorage);

      expect(() => {
        keyStorage!.get();
      }).toThrow('Read error');

      // set operation should handle storage failures gracefully
      expect(() => {
        keyStorage!.set('test-value');
      }).toThrow('Storage full');

      // remove operation should handle storage failures gracefully
      expect(() => {
        keyStorage!.remove();
      }).toThrow('Remove error');

      // For memory-only storage, operations should work
      const memoryStorage = new KeyStorage<string, string>('memory-test');
      expect(() => memoryStorage.set('test')).not.toThrow();
      expect(memoryStorage.get()).toBe('test');
      expect(() => memoryStorage.remove()).not.toThrow();
    });

    it('should auto-remove null values from persistent storage', () => {
      // Set up storage with null value
      mockStorage.directSet('auto-remove-key', 'some-value');

      const keyStorage = new KeyStorage<string, string>(
        'auto-remove-key',
        mockStorage
      );

      // Clear memory and simulate storage returning null
      keyStorage.remove();
      mockStorage.data.delete('auto-remove-key');
      mockStorage.reset();

      // Getting should trigger auto-removal
      const result = keyStorage.get();

      expect(result).toBeNull();
      expect(mockStorage.calls.removeItem[0].key).toBe('auto-remove-key');
    });

    it('should handle session persistence', () => {
      // Simulate app startup with existing session
      mockStorage.directSet('session-id', 'session-12345');

      const sessionStorage = new KeyStorage<string, string>(
        'session-id',
        mockStorage
      );

      // Constructor loads value
      expect(sessionStorage.get()).toBe('session-12345');

      // Update session
      sessionStorage.set('session-67890');
      expect(sessionStorage.get()).toBe('session-67890');

      // Clear session
      sessionStorage.remove();
      expect(sessionStorage.get()).toBeNull();
    });
  });

  describe('Type Safety', () => {
    it('should work with different value types', () => {
      const stringStorage = new KeyStorage<string, string>('string-key');
      stringStorage.set('string-value');
      expect(stringStorage.get()).toBe('string-value');

      const numberStorage = new KeyStorage<string, number>('number-key');
      numberStorage.set(42);
      expect(numberStorage.get()).toBe(42);

      const objectStorage = new KeyStorage<string, object>('object-key');
      const testObject = { test: 'value' };
      objectStorage.set(testObject);
      expect(objectStorage.get()).toEqual(testObject);
    });

    it('should work with different key types', () => {
      const numberKeyStorage = new KeyStorage<number, string>(123);
      numberKeyStorage.set('number-key-value');
      expect(numberKeyStorage.get()).toBe('number-key-value');
    });
  });

  describe('Non-String Value Types', () => {
    describe('Number values', () => {
      let numberStorage: KeyStorage<string, number>;

      beforeEach(() => {
        numberStorage = new KeyStorage<string, number>('number-test');
      });

      it('should handle integer values', () => {
        numberStorage.set(42);
        expect(numberStorage.get()).toBe(42);
        expect(typeof numberStorage.get()).toBe('number');
      });

      it('should handle floating point values', () => {
        const floatValue = 3.14159;
        numberStorage.set(floatValue);
        expect(numberStorage.get()).toBe(floatValue);
      });

      it('should handle negative numbers', () => {
        numberStorage.set(-100);
        expect(numberStorage.get()).toBe(-100);
      });

      it('should handle zero', () => {
        numberStorage.set(0);
        expect(numberStorage.get()).toBe(0);
      });

      it('should handle large numbers', () => {
        const largeNumber = 9007199254740991; // Number.MAX_SAFE_INTEGER
        numberStorage.set(largeNumber);
        expect(numberStorage.get()).toBe(largeNumber);
      });

      it('should persist number values in storage with ObjectStorage', () => {
        const objectStorage = new ObjectStorage<string, string>(
          new JSONSerializer()
        );
        const persistentNumberStorage = new KeyStorage<string, number>(
          'number-test',
          objectStorage as unknown as StorageInterface<string, number>
        );

        persistentNumberStorage.set(123);

        // Create new instance to test persistence
        const newNumberStorage = new KeyStorage<string, number>(
          'number-test',
          objectStorage as unknown as StorageInterface<string, number>
        );

        expect(newNumberStorage.get()).toBe(123);
      });
    });

    describe('Boolean values', () => {
      let booleanStorage: KeyStorage<string, boolean>;

      beforeEach(() => {
        booleanStorage = new KeyStorage<string, boolean>('boolean-test');
      });

      it('should handle true value', () => {
        booleanStorage.set(true);
        expect(booleanStorage.get()).toBe(true);
        expect(typeof booleanStorage.get()).toBe('boolean');
      });

      it('should handle false value', () => {
        booleanStorage.set(false);
        expect(booleanStorage.get()).toBe(false);
        expect(typeof booleanStorage.get()).toBe('boolean');
      });

      it('should persist boolean values in storage with ObjectStorage', () => {
        const objectStorage = new ObjectStorage<string, string | boolean>(
          new JSONSerializer()
        );
        const persistentBooleanStorage = new KeyStorage<
          string,
          boolean | string
        >('boolean-test', objectStorage);

        persistentBooleanStorage.set(true);

        // Create new instance to test persistence
        const newBooleanStorage = new KeyStorage<string, boolean | string>(
          'boolean-test',
          objectStorage
        );

        expect(newBooleanStorage.get()).toBe(true);
      });
    });

    describe('Object values', () => {
      interface TestUser {
        id: number;
        name: string;
        email: string;
        preferences?: {
          theme: string;
          language: string;
        };
      }

      let objectStorage: KeyStorage<string, TestUser>;

      beforeEach(() => {
        objectStorage = new KeyStorage<string, TestUser>('object-test');
      });

      it('should handle simple object values', () => {
        const user: TestUser = {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com'
        };

        objectStorage.set(user);
        const retrieved = objectStorage.get();

        expect(retrieved).toEqual(user);
        expect(retrieved?.id).toBe(1);
        expect(retrieved?.name).toBe('John Doe');
      });

      it('should handle nested object values', () => {
        const user: TestUser = {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          preferences: {
            theme: 'dark',
            language: 'en'
          }
        };

        objectStorage.set(user);
        const retrieved = objectStorage.get();

        expect(retrieved).toEqual(user);
        expect(retrieved?.preferences?.theme).toBe('dark');
        expect(retrieved?.preferences?.language).toBe('en');
      });

      it('should persist object values in storage with ObjectStorage', () => {
        const objectStorageInstance = new ObjectStorage<string, TestUser>(
          new JSONSerializer()
        );
        const persistentObjectStorage = new KeyStorage<string, TestUser>(
          'object-test',
          objectStorageInstance
        );

        const user: TestUser = {
          id: 3,
          name: 'Bob Wilson',
          email: 'bob@example.com'
        };

        persistentObjectStorage.set(user);

        // Create new instance to test persistence
        const newObjectStorage = new KeyStorage<string, TestUser>(
          'object-test',
          objectStorageInstance
        );

        expect(newObjectStorage.get()).toEqual(user);
      });

      it('should handle empty objects', () => {
        const emptyUser = {} as TestUser;
        objectStorage.set(emptyUser);
        expect(objectStorage.get()).toEqual(emptyUser);
      });
    });

    describe('Array values', () => {
      let arrayStorage: KeyStorage<string, string[]>;
      let numberArrayStorage: KeyStorage<string, number[]>;

      beforeEach(() => {
        arrayStorage = new KeyStorage<string, string[]>('array-test');
        numberArrayStorage = new KeyStorage<string, number[]>(
          'number-array-test'
        );
      });

      it('should handle string arrays', () => {
        const stringArray = ['apple', 'banana', 'cherry'];
        arrayStorage.set(stringArray);

        const retrieved = arrayStorage.get();
        expect(retrieved).toEqual(stringArray);
        expect(Array.isArray(retrieved)).toBe(true);
        expect(retrieved?.length).toBe(3);
      });

      it('should handle number arrays', () => {
        const numberArray = [1, 2, 3, 4, 5];
        numberArrayStorage.set(numberArray);

        const retrieved = numberArrayStorage.get();
        expect(retrieved).toEqual(numberArray);
        expect(retrieved?.length).toBe(5);
      });

      it('should handle empty arrays', () => {
        const emptyArray: string[] = [];
        arrayStorage.set(emptyArray);

        expect(arrayStorage.get()).toEqual(emptyArray);
        expect(arrayStorage.get()?.length).toBe(0);
      });

      it('should persist array values in storage with ObjectStorage', () => {
        const objectStorage = new ObjectStorage<string>(new JSONSerializer());
        const persistentArrayStorage = new KeyStorage(
          'array-test',
          objectStorage
        );

        const testArray = ['test1', 'test2', 'test3'];
        persistentArrayStorage.set(testArray);

        // Create new instance to test persistence
        const newArrayStorage = new KeyStorage('array-test', objectStorage);

        expect(newArrayStorage.get()).toEqual(testArray);
      });
    });

    describe('Complex nested values', () => {
      interface ComplexData {
        metadata: {
          version: string;
          created: number;
          tags: string[];
        };
        users: Array<{
          id: number;
          active: boolean;
          permissions: string[];
        }>;
        settings: Record<string, unknown>;
      }

      let complexStorage: KeyStorage<string, ComplexData>;

      beforeEach(() => {
        complexStorage = new KeyStorage<string, ComplexData>('complex-test');
      });

      it('should handle deeply nested complex objects', () => {
        const complexData: ComplexData = {
          metadata: {
            version: '1.0.0',
            created: Date.now(),
            tags: ['production', 'api', 'v1']
          },
          users: [
            {
              id: 1,
              active: true,
              permissions: ['read', 'write']
            },
            {
              id: 2,
              active: false,
              permissions: ['read']
            }
          ],
          settings: {
            maxRetries: 3,
            timeout: 5000,
            enableLogging: true,
            apiEndpoint: 'https://api.example.com'
          }
        };

        complexStorage.set(complexData);
        const retrieved = complexStorage.get();

        expect(retrieved).toEqual(complexData);
        expect(retrieved?.metadata.tags).toHaveLength(3);
        expect(retrieved?.users).toHaveLength(2);
        expect(retrieved?.users[0].permissions).toContain('write');
        expect(retrieved?.settings.maxRetries).toBe(3);
      });
    });

    describe('Non-string values with ObjectStorage', () => {
      let objectStorageInstance: ObjectStorage<string, any>;
      let keyStorageWithObjectStorage: KeyStorage<string, { data: number[] }>;

      beforeEach(() => {
        objectStorageInstance = new ObjectStorage<string, any>(
          new JSONSerializer()
        );
        keyStorageWithObjectStorage = new KeyStorage<
          string,
          { data: number[] }
        >('object-storage-test', objectStorageInstance);
      });

      it('should serialize and deserialize complex objects correctly', () => {
        const complexObject = { data: [1, 2, 3, 4, 5] };
        keyStorageWithObjectStorage.set(complexObject);

        const retrieved = keyStorageWithObjectStorage.get();
        expect(retrieved).toEqual(complexObject);
        expect(retrieved?.data).toHaveLength(5);
        expect(retrieved?.data[2]).toBe(3);
      });

      it('should persist complex objects through ObjectStorage', () => {
        const testData = { data: [10, 20, 30] };
        keyStorageWithObjectStorage.set(testData);

        // Create new instance to test persistence
        const newKeyStorage = new KeyStorage<string, { data: number[] }>(
          'object-storage-test',
          objectStorageInstance
        );

        expect(newKeyStorage.get()).toEqual(testData);
      });
    });
  });

  describe('Real-world Usage Patterns', () => {
    it('should work as token storage', () => {
      const tokenStorage = new KeyStorage<string, string>(
        'auth-token',
        mockStorage
      );

      // Store token
      const token = 'jwt-token-123456789';
      tokenStorage.set(token);

      // Retrieve token
      expect(tokenStorage.get()).toBe(token);

      // Verify storage was used
      expect(mockStorage.calls.setItem[0].value).toBe(token);

      // Clear token
      tokenStorage.remove();
      expect(tokenStorage.get()).toBeNull();
    });

    it('should work as user preference storage', () => {
      const themeStorage = new KeyStorage<string, string>(
        'user-theme',
        mockStorage
      );

      themeStorage.set('dark');
      expect(themeStorage.get()).toBe('dark');

      themeStorage.set('light');
      expect(themeStorage.get()).toBe('light');
    });
  });

  describe('Expiration Support with ObjectStorage', () => {
    let objectStorage: ObjectStorage<string, string>;
    let keyStorage: KeyStorage<string, string>;

    beforeEach(() => {
      objectStorage = new ObjectStorage<string, string>(new JSONSerializer());
      keyStorage = new KeyStorage<string, string>(
        'expire-test-key',
        objectStorage
      );
    });

    it('should store value with expiration time', () => {
      const expireTime = Date.now() + 5000; // 5 seconds from now
      const testValue = 'expire-test-value';

      keyStorage.set(testValue, { expires: expireTime });

      // Value should be accessible immediately
      expect(keyStorage.get()).toBe(testValue);

      // Verify the value is stored in ObjectStorage with expiration metadata
      const storedValue = objectStorage.getItem('expire-test-key');
      expect(storedValue).toBe(testValue);
    });

    it('should return null for expired value', () => {
      const expireTime = Date.now() + 1000; // 1 second from now
      const testValue = 'will-expire';

      keyStorage.set(testValue, { expires: expireTime });
      expect(keyStorage.get()).toBe(testValue);

      // Clear memory to force retrieval from storage
      (keyStorage as any).value = null;

      // Advance time past expiration
      vi.advanceTimersByTime(1001);

      // Should return null and auto-remove expired value
      expect(keyStorage.get()).toBeNull();
    });

    it('should auto-remove expired values from storage', () => {
      const expireTime = Date.now() + 500; // 0.5 seconds from now
      const testValue = 'auto-remove-test';

      keyStorage.set(testValue, { expires: expireTime });

      // Clear memory to force storage retrieval
      (keyStorage as any).value = null;

      // Advance time past expiration
      vi.advanceTimersByTime(600);

      // Getting expired value should trigger auto-removal
      expect(keyStorage.get()).toBeNull();

      // Verify the value is removed from ObjectStorage
      expect(objectStorage.getItem('expire-test-key')).toBeNull();
    });

    it('should handle zero expiration time (no expiration)', () => {
      const testValue = 'no-expire-value';

      keyStorage.set(testValue, { expires: 0 });

      // Clear memory
      (keyStorage as any).value = null;

      // Advance time significantly
      vi.advanceTimersByTime(10000);

      // Value should still be available (no expiration)
      expect(keyStorage.get()).toBe(testValue);
    });

    it('should handle negative expiration time (no expiration)', () => {
      const testValue = 'negative-expire-value';

      keyStorage.set(testValue, { expires: -1000 });

      // Clear memory
      (keyStorage as any).value = null;

      // Advance time
      vi.advanceTimersByTime(5000);

      // Value should still be available (negative expiration means no expiration)
      expect(keyStorage.get()).toBe(testValue);
    });

    it('should work with session-like expiration patterns', () => {
      const sessionStorage = new KeyStorage<string, string>(
        'session-token',
        objectStorage
      );

      const sessionToken = 'session-abc123';
      const sessionExpire = Date.now() + 1800000; // 30 minutes

      // Store session with expiration
      sessionStorage.set(sessionToken, { expires: sessionExpire });

      // Should be accessible immediately
      expect(sessionStorage.get()).toBe(sessionToken);

      // Simulate time passing (15 minutes)
      vi.advanceTimersByTime(900000);

      // Clear memory to test storage retrieval
      (sessionStorage as any).value = null;

      // Should still be valid
      expect(sessionStorage.get()).toBe(sessionToken);

      // Advance time past expiration (another 20 minutes)
      vi.advanceTimersByTime(1200000);

      // Clear memory again
      (sessionStorage as any).value = null;

      // Should be expired now
      expect(sessionStorage.get()).toBeNull();
    });

    it('should return null after value expires', () => {
      const testValue = 'expire-switch-test';
      const expireTime = Date.now() + 1000;

      keyStorage.set(testValue, { expires: expireTime });
      expect(keyStorage.get()).toBe(testValue);

      // Clear in-memory value so next get() reads from storage
      (keyStorage as any).value = null;

      vi.advanceTimersByTime(1100);

      expect(keyStorage.get()).toBeNull();
    });

    it('should handle expiration edge cases', () => {
      const testValue = 'edge-case-value';

      // Test expiration in the past (should be expired immediately)
      const pastExpire = Date.now() - 100; // 100ms in the past
      keyStorage.set(testValue, { expires: pastExpire });

      // Clear memory to force storage retrieval
      (keyStorage as any).value = null;

      // Should be expired immediately
      expect(keyStorage.get()).toBeNull();

      // Test with future expiration that becomes past due to time advancement
      const futureExpire = Date.now() + 100;
      keyStorage.set(testValue, { expires: futureExpire });

      // Advance time past the expiration time
      vi.advanceTimersByTime(150);

      // Clear memory to force storage retrieval with expiration check
      (keyStorage as any).value = null;

      // Should be expired
      expect(keyStorage.get()).toBeNull();
    });
  });
});

describe('Use case: token storage', () => {
  it('should get value from memory', () => {
    const tokenStorage1 = new KeyStorage<string, string>('user-token');
    const tokenStorage2 = new KeyStorage<string, string>('user-token2');

    tokenStorage1.set('test-token1');
    tokenStorage2.set('test-token2');

    expect(tokenStorage1.get()).toBe('test-token1');
    expect(tokenStorage2.get()).toBe('test-token2');
  });

  it('should get value from storage', () => {
    const mockStorage = new MockStorage();
    const tokenStorage1 = new KeyStorage<string, string>(
      'user-token',
      mockStorage
    );
    const tokenStorage2 = new KeyStorage<string, string>(
      'user-token2',
      mockStorage
    );

    // set default storage value
    mockStorage.setItem(tokenStorage1.key, 'test-token1');
    mockStorage.setItem(tokenStorage2.key, 'test-token2');

    expect(tokenStorage1.get()).toBe('test-token1');
    expect(tokenStorage1.get()).toBe('test-token1');
    expect(tokenStorage2.get()).toBe('test-token2');
  });

  it('should get value from storage and update internal value after get', () => {
    const mockStorage = new MockStorage();
    const tokenStorage1 = new KeyStorage<string, string>(
      'user-token',
      mockStorage
    );

    const tokenValue = 'test-token1';
    mockStorage.setItem(tokenStorage1.key, tokenValue);

    // Before first get(), internal value is undefined (not yet loaded)
    // @ts-expect-error - access protected for test
    expect(tokenStorage1.value).toBeUndefined();

    expect(tokenStorage1.get()).toBe(tokenValue);

    // After get(), implementation stores the value internally
    // @ts-expect-error - access protected for test
    expect(tokenStorage1.value).toBe(tokenValue);
  });

  it('should use objectStorage and serialize with json', () => {
    const objectStorage = new ObjectStorage<string, string>(
      new JSONSerializer()
    );

    const tokenStorage = new KeyStorage<string, string>(
      'user-token',
      objectStorage
    );
    const tokenValue = 'test-token';
    tokenStorage.set(tokenValue);

    const objectStorageValue = objectStorage.getItem(tokenStorage.key);
    expect(tokenStorage.get()).toBe(tokenValue);
    expect(objectStorageValue).toBe(tokenValue);
  });
});
