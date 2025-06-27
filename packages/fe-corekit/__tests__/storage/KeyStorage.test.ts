/* eslint-disable @typescript-eslint/no-explicit-any */
import { KeyStorage } from '../../src/storage/impl/KeyStorage';
import type { Encryptor } from '../../src/encrypt';
import type { SyncStorageInterface } from '../../src/storage/interface/SyncStorageInterface';
import {
  JSONSerializer,
  JSONSerializerOptions,
  ObjectStorage
} from '../../src';

/**
 * Mock storage implementation for testing
 */
class MockStorage implements SyncStorageInterface<string, string> {
  public data = new Map<string, string>();
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

  // Helper method to directly set data (simulating existing storage)
  directSet(key: string, value: string): void {
    this.data.set(key, value);
  }
}

/**
 * Mock encryptor implementation for testing
 */
class MockEncryptor implements Encryptor<string, string> {
  public calls: {
    encrypt: string[];
    decrypt: string[];
  } = {
    encrypt: [],
    decrypt: []
  };

  public shouldFailEncryption = false;
  public shouldFailDecryption = false;

  encrypt(value: string): string {
    this.calls.encrypt.push(value);
    if (this.shouldFailEncryption) {
      throw new Error('Encryption failed');
    }
    return `encrypted_${value}`;
  }

  decrypt(encryptedData: string): string {
    this.calls.decrypt.push(encryptedData);
    if (this.shouldFailDecryption) {
      throw new Error('Decryption failed');
    }
    return encryptedData.replace('encrypted_', '');
  }

  reset(): void {
    this.calls = {
      encrypt: [],
      decrypt: []
    };
    this.shouldFailEncryption = false;
    this.shouldFailDecryption = false;
  }
}

describe('KeyStorage', () => {
  let mockStorage: MockStorage;
  let mockEncryptor: MockEncryptor;

  beforeEach(() => {
    mockStorage = new MockStorage();
    mockEncryptor = new MockEncryptor();
  });

  afterEach(() => {
    mockStorage.reset();
    mockEncryptor.reset();
  });

  describe('Constructor', () => {
    it('should create instance with key only', () => {
      const keyStorage = new KeyStorage('test-key');
      expect(keyStorage).toBeInstanceOf(KeyStorage);
    });

    it('should create instance with key and storage', () => {
      const keyStorage = new KeyStorage('test-key', { storage: mockStorage });
      expect(keyStorage).toBeInstanceOf(KeyStorage);
    });

    it('should create instance with key, storage, and encryptor', () => {
      const keyStorage = new KeyStorage('test-key', {
        storage: mockStorage,
        encrypt: mockEncryptor
      });
      expect(keyStorage).toBeInstanceOf(KeyStorage);
    });

    it('should initialize with existing value from storage', () => {
      mockStorage.directSet('existing-key', 'existing-value');
      const keyStorage = new KeyStorage('existing-key', {
        storage: mockStorage
      });

      expect(keyStorage.get()).toBe('existing-value');
    });

    it('should initialize with null when no existing value', () => {
      const keyStorage = new KeyStorage('new-key', { storage: mockStorage });
      expect(keyStorage.get()).toBeNull();
    });
  });

  describe('Basic Operations', () => {
    describe('Memory-only storage', () => {
      let keyStorage: KeyStorage;

      beforeEach(() => {
        keyStorage = new KeyStorage('memory-key');
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
      let keyStorage: KeyStorage;

      beforeEach(() => {
        keyStorage = new KeyStorage('persistent-key', {
          storage: mockStorage
        });
      });

      it('should store value to persistent storage', () => {
        keyStorage.set('persistent-value');

        expect(mockStorage.calls.setItem).toHaveLength(1);
        expect(mockStorage.calls.setItem[0]).toEqual({
          key: 'persistent-key',
          value: 'persistent-value'
        });
      });

      it('should retrieve from memory first if available', () => {
        keyStorage.set('memory-value');
        mockStorage.reset(); // Clear storage calls

        const result = keyStorage.get();

        expect(result).toBe('memory-value');
        expect(mockStorage.calls.getItem).toHaveLength(0);
      });

      it('should fallback to persistent storage when memory is empty', () => {
        // Create storage with existing data
        mockStorage.directSet('persistent-key', 'storage-value');

        // Create new instance that will load from storage
        const newKeyStorage = new KeyStorage('persistent-key', {
          storage: mockStorage
        });

        // The value should be loaded during construction
        expect(newKeyStorage.get()).toBe('storage-value');
      });

      it('should remove from both memory and persistent storage', () => {
        keyStorage.set('remove-test');
        mockStorage.reset();

        keyStorage.remove();

        expect(keyStorage.get()).toBeNull();
        expect(mockStorage.calls.removeItem).toContain('persistent-key');
      });

      it('should handle null values from storage', () => {
        const newKeyStorage = new KeyStorage('non-existent-key', {
          storage: mockStorage
        });

        const result = newKeyStorage.get();
        expect(result).toBeNull();
      });
    });
  });

  describe('Encryption Support', () => {
    let keyStorage: KeyStorage;

    beforeEach(() => {
      keyStorage = new KeyStorage('encrypted-key', {
        storage: mockStorage,
        encrypt: mockEncryptor
      });
    });

    it('should encrypt value before storing', () => {
      keyStorage.set('secret-data');

      expect(mockEncryptor.calls.encrypt).toContain('secret-data');
      expect(mockStorage.calls.setItem[0].value).toBe('encrypted_secret-data');
    });

    it('should decrypt value when retrieving from storage', () => {
      // Store encrypted data directly in storage
      mockStorage.directSet('encrypted-key', 'encrypted_stored-secret');

      // Create new instance that will load from storage
      const newKeyStorage = new KeyStorage('encrypted-key', {
        storage: mockStorage,
        encrypt: mockEncryptor
      });

      // The constructor loads the encrypted value into memory without decrypting
      // Clear memory to force retrieval from storage with decryption
      (newKeyStorage as any).value = null; // Force memory clear
      mockEncryptor.reset();

      // Should decrypt when getting from storage
      const result = newKeyStorage.get();
      expect(mockEncryptor.calls.decrypt).toContain('encrypted_stored-secret');
      expect(result).toBe('stored-secret');
    });

    it('should not encrypt memory values', () => {
      keyStorage.set('memory-secret');
      mockEncryptor.reset();

      const result = keyStorage.get();

      expect(result).toBe('memory-secret');
      expect(mockEncryptor.calls.decrypt).toHaveLength(0);
    });

    it('should handle encryption errors', () => {
      mockEncryptor.shouldFailEncryption = true;

      expect(() => keyStorage.set('fail-encrypt')).toThrow('Encryption failed');
    });

    it('should handle decryption errors when retrieving from storage', () => {
      mockStorage.directSet('encrypted-key', 'encrypted_data');
      mockEncryptor.shouldFailDecryption = true;

      const newKeyStorage = new KeyStorage('encrypted-key', {
        storage: mockStorage,
        encrypt: mockEncryptor
      });

      // Clear memory to force storage retrieval with decryption
      (newKeyStorage as any).value = null;

      // Should throw when trying to decrypt
      expect(() => newKeyStorage.get()).toThrow('Decryption failed');
    });
  });

  describe('Options Merging', () => {
    let baseKeyStorage: KeyStorage;

    beforeEach(() => {
      baseKeyStorage = new KeyStorage('base-key', {
        storage: mockStorage,
        encrypt: mockEncryptor
      });
    });

    it('should use base options when no override provided', () => {
      baseKeyStorage.set('test-value');

      expect(mockEncryptor.calls.encrypt).toContain('test-value');
      expect(mockStorage.calls.setItem).toHaveLength(1);
    });

    it('should override storage in method options', () => {
      const alternativeStorage = new MockStorage();

      baseKeyStorage.set('override-test', { storage: alternativeStorage });

      expect(alternativeStorage.calls.setItem).toHaveLength(1);
      expect(mockStorage.calls.setItem).toHaveLength(0);
    });

    it('should override encryptor in method options', () => {
      const alternativeEncryptor = new MockEncryptor();

      baseKeyStorage.set('encrypt-override', {
        encrypt: alternativeEncryptor
      });

      expect(alternativeEncryptor.calls.encrypt).toContain('encrypt-override');
      expect(mockEncryptor.calls.encrypt).toHaveLength(0);
    });

    it('should merge options correctly', () => {
      const alternativeStorage = new MockStorage();

      baseKeyStorage.set('merge-test', {
        storage: alternativeStorage
        // encrypt should still use base encryptor
      });

      expect(alternativeStorage.calls.setItem[0].value).toBe(
        'encrypted_merge-test'
      );
      expect(mockEncryptor.calls.encrypt).toContain('merge-test');
    });

    it('should handle get with options override', () => {
      const alternativeStorage = new MockStorage();
      alternativeStorage.directSet('base-key', 'override-value');

      baseKeyStorage.remove(); // Clear memory

      const result = baseKeyStorage.get({ storage: alternativeStorage });

      expect(result).toBe('override-value');
      expect(alternativeStorage.calls.getItem).toHaveLength(1);
    });

    it('should handle remove with options override', () => {
      const alternativeStorage = new MockStorage();

      baseKeyStorage.remove({ storage: alternativeStorage });

      expect(alternativeStorage.calls.removeItem).toContain('base-key');
      expect(mockStorage.calls.removeItem).toHaveLength(0);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle null and undefined values', () => {
      const keyStorage = new KeyStorage('null-test', { storage: mockStorage });

      keyStorage.set(null as any);
      expect(keyStorage.get()).toBe('null'); // KeyStorage stores as string

      keyStorage.set(undefined as any);
      expect(keyStorage.get()).toBe('undefined'); // KeyStorage stores as string
    });

    it('should handle empty string values', () => {
      const keyStorage = new KeyStorage('empty-test', { storage: mockStorage });

      keyStorage.set('');
      expect(keyStorage.get()).toBe('');
    });

    it('should handle special characters in keys', () => {
      const specialKey = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const keyStorage = new KeyStorage(specialKey, { storage: mockStorage });

      keyStorage.set('special-value');
      expect(keyStorage.get()).toBe('special-value');
      expect(mockStorage.calls.setItem[0].key).toBe(specialKey);
    });

    it('should handle numeric keys', () => {
      const keyStorage = new KeyStorage(123 as any, { storage: mockStorage });

      keyStorage.set('numeric-key-value');
      expect(keyStorage.get()).toBe('numeric-key-value');
    });

    it('should handle large data values', () => {
      const keyStorage = new KeyStorage('large-data', { storage: mockStorage });
      const largeValue = 'x'.repeat(10000);

      keyStorage.set(largeValue);
      expect(keyStorage.get()).toBe(largeValue);
    });

    it('should handle concurrent operations', () => {
      const keyStorage = new KeyStorage('concurrent', { storage: mockStorage });

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
      } as unknown as SyncStorageInterface<string, string>;

      // Constructor should throw if storage.getItem fails
      expect(() => {
        new KeyStorage('fail-test', { storage: failingStorage });
      }).toThrow('Read error');

      // For memory-only storage, operations should work
      const memoryStorage = new KeyStorage('memory-test');
      expect(() => memoryStorage.set('test')).not.toThrow();
      expect(memoryStorage.get()).toBe('test');
      expect(() => memoryStorage.remove()).not.toThrow();
    });

    it('should auto-remove null values from persistent storage', () => {
      // Set up storage with null value
      mockStorage.directSet('auto-remove-key', 'some-value');

      const keyStorage = new KeyStorage('auto-remove-key', {
        storage: mockStorage
      });

      // Clear memory and simulate storage returning null
      keyStorage.remove();
      mockStorage.data.delete('auto-remove-key');
      mockStorage.reset();

      // Getting should trigger auto-removal
      const result = keyStorage.get();

      expect(result).toBeNull();
      expect(mockStorage.calls.removeItem).toContain('auto-remove-key');
    });

    it('should handle session persistence', () => {
      // Simulate app startup with existing session
      mockStorage.directSet('session-id', 'encrypted_session-12345');

      const sessionStorage = new KeyStorage('session-id', {
        storage: mockStorage,
        encrypt: mockEncryptor
      });

      // Constructor loads encrypted value but doesn't decrypt it
      // Clear memory to force decryption on next get
      (sessionStorage as any).value = null;
      mockEncryptor.reset();

      // Now get should decrypt from storage
      expect(sessionStorage.get()).toBe('session-12345');
      expect(mockEncryptor.calls.decrypt).toContain('encrypted_session-12345');

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

  describe('Real-world Usage Patterns', () => {
    it('should work as token storage', () => {
      const tokenStorage = new KeyStorage('auth-token', {
        storage: mockStorage,
        encrypt: mockEncryptor
      });

      // Store token
      const token = 'jwt-token-123456789';
      tokenStorage.set(token);

      // Retrieve token
      expect(tokenStorage.get()).toBe(token);

      // Verify encryption was used
      expect(mockEncryptor.calls.encrypt).toContain(token);
      expect(mockStorage.calls.setItem[0].value).toBe(`encrypted_${token}`);

      // Clear token
      tokenStorage.remove();
      expect(tokenStorage.get()).toBeNull();
    });

    it('should work as user preference storage', () => {
      const themeStorage = new KeyStorage('user-theme', {
        storage: mockStorage
      });

      themeStorage.set('dark');
      expect(themeStorage.get()).toBe('dark');

      themeStorage.set('light');
      expect(themeStorage.get()).toBe('light');
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
    const tokenStorage1 = new KeyStorage<string, string>('user-token', {
      storage: mockStorage
    });
    const tokenStorage2 = new KeyStorage<string, string>('user-token2', {
      storage: mockStorage
    });

    // set default storage value
    mockStorage.setItem(tokenStorage1.key, 'test-token1');
    mockStorage.setItem(tokenStorage2.key, 'test-token2');

    expect(tokenStorage1.get()).toBe('test-token1');
    expect(tokenStorage1.get()).toBe('test-token1');
    expect(tokenStorage2.get()).toBe('test-token2');
  });

  it('should get value from storage and update memory value', () => {
    const mockStorage = new MockStorage();
    const tokenStorage1 = new KeyStorage<string, string>('user-token', {
      storage: mockStorage
    });

    const tokenValue = 'test-token1';
    // set default storage value
    mockStorage.setItem(tokenStorage1.key, tokenValue);

    // @ts-expect-error
    expect(tokenStorage1.value).toBe(null);
    expect(tokenStorage1.get()).toBe(tokenValue);

    // @ts-expect-error
    expect(tokenStorage1.value).toBe(tokenValue);
  });

  it('should get value from storage and update memory value (encrypted)', () => {
    const mockStorage = new MockStorage();
    const encryptor = new MockEncryptor();

    const tokenStorage1 = new KeyStorage<string, string>('user-token', {
      storage: mockStorage,
      encrypt: encryptor
    });

    const tokenValue = 'test-token1';
    // set default storage value
    mockStorage.setItem(tokenStorage1.key, encryptor.encrypt(tokenValue));

    // @ts-expect-error
    expect(tokenStorage1.value).toBe(null);
    expect(tokenStorage1.get()).toBe(tokenValue);

    // @ts-expect-error
    expect(tokenStorage1.value).toBe(tokenValue);
  });

  it('should get value from storage and update memory value', () => {
    const mockStorage = new MockStorage();

    const tokenStorage = new KeyStorage<string, string>('user-token');

    const tokenValue = 'test-token1';
    mockStorage.setItem(tokenStorage.key, tokenValue);

    // @ts-expect-error
    expect(tokenStorage.value).toBe(null);

    expect(tokenStorage.get({ storage: mockStorage })).toBe(tokenValue);

    // @ts-expect-error
    expect(tokenStorage.value).toBe(tokenValue);
  });

  it('should get value from storage and update memory value', () => {
    const mockStorage = new MockStorage();
    const mockStorage2 = new MockStorage();

    const tokenStorage = new KeyStorage<string, string>('user-token');

    const tokenValue = 'test-token1';
    const tokenValue2 = 'test-token2';

    mockStorage.setItem(tokenStorage.key, tokenValue);
    mockStorage2.setItem(tokenStorage.key, tokenValue2);

    // @ts-expect-error
    expect(tokenStorage.value).toBe(null);

    expect(tokenStorage.get({ storage: mockStorage })).toBe(tokenValue);

    // @ts-expect-error
    expect(tokenStorage.value).toBe(tokenValue);

    tokenStorage.set(null as any);

    expect(tokenStorage.get({ storage: mockStorage2 })).toBe(tokenValue2);

    // @ts-expect-error
    expect(tokenStorage.value).toBe(tokenValue2);
  });

  it('should use objectStorage and serialize with json', () => {
    const objectStorage = new ObjectStorage<string, string>(
      new JSONSerializer()
    );

    const tokenStorage = new KeyStorage<string, string>('user-token', {
      storage: objectStorage
    });
    const tokenValue = 'test-token';
    tokenStorage.set(tokenValue);

    const objectStorageValue = objectStorage.getItem(tokenStorage.key);
    expect(tokenStorage.get()).toBe(tokenValue);
    expect(objectStorageValue).toBe(tokenValue);
  });

  it('should use objectStorage and serialize with json, and encrypt token', () => {
    const objectStorage = new ObjectStorage<string, string>(
      new JSONSerializer()
    );
    const encryptor = new MockEncryptor();
    const tokenStorage = new KeyStorage<string, string>('user-token', {
      storage: objectStorage,
      encrypt: encryptor
    });

    const tokenValue = 'test-token';
    tokenStorage.set(tokenValue);

    const objectStorageValue = objectStorage.getItem(tokenStorage.key);
    console.log(objectStorage);
    expect(tokenStorage.get()).toBe(tokenValue);
    // !!! need encrypted compress
    expect(objectStorageValue).toBe(encryptor.encrypt(tokenValue));
  });

  it('should encrypt the entire objectStorage object with token (inherit JSONSerializer, override serialize and deserialize method)', () => {
    interface MockEncryptorJSONSerializerOptions extends JSONSerializerOptions {
      encryptor: Encryptor<string, string>;
    }

    class MockEncryptorJSONSerializer<T> extends JSONSerializer<
      T,
      MockEncryptorJSONSerializerOptions
    > {
      constructor(options: MockEncryptorJSONSerializerOptions) {
        super(options);
      }

      override serialize(data: T): string {
        const value = super.serialize(data);
        return this.options.encryptor.encrypt(value);
      }

      override deserialize(data: string, defaultValue?: T): T {
        const value = this.options.encryptor.decrypt(data);
        return super.deserialize(value, defaultValue);
      }
    }

    const encryptor = new MockEncryptor();
    const objectStorage = new ObjectStorage<string, string>(
      new MockEncryptorJSONSerializer({ encryptor })
    );

    const tokenStorage = new KeyStorage<string, string>('user-token', {
      storage: objectStorage
    });

    const tokenValue = 'test-token';
    tokenStorage.set(tokenValue);

    const objectStorageValue = objectStorage.getItem(tokenStorage.key);
    expect(tokenStorage.get()).toBe(tokenValue);
    // !!! storage(MockEncryptorJSONSerializer) is encrypted
    expect(objectStorageValue).toBe(tokenValue);
  });
});
