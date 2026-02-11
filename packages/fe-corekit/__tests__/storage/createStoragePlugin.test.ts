import {
  createStoragePlugin,
  createStoragePluginWithStorage,
  isSerializer,
  isEncryptor
} from '../../src/storage/utils/createStoragePlugin';
import type { StorageInterface } from '../../src/storage/interface/StorageInterface';
import type { StorageExecutorPlugin } from '../../src/storage/impl/StorageExecutor';

class MockStorage implements StorageInterface<string, string> {
  public data = new Map<string, string>();

  public setItem(key: string, value: string): void {
    this.data.set(key, value);
  }

  public getItem(key: string): string | null {
    return this.data.get(key) ?? null;
  }

  public removeItem(key: string): void {
    this.data.delete(key);
  }

  public clear(): void {
    this.data.clear();
  }
}

const mockSerializer = {
  serialize: (v: unknown) => JSON.stringify(v),
  deserialize: (data: string) => JSON.parse(data)
};

const mockEncryptor = {
  encrypt: (v: string) => `encrypted:${v}`,
  decrypt: (v: string) => v.replace(/^encrypted:/, '')
};

describe('createStoragePlugin utils', () => {
  describe('createStoragePluginWithStorage', () => {
    it('should wrap storage with get/set/remove/clear and type storage', () => {
      const storage = new MockStorage();
      const plugin = createStoragePluginWithStorage(storage);

      expect(plugin.type).toBe('storage');
      expect(typeof plugin.get).toBe('function');
      expect(typeof plugin.set).toBe('function');
      expect(typeof plugin.remove).toBe('function');
      expect(typeof plugin.clear).toBe('function');

      plugin.set('k', 'v');
      expect(storage.data.get('k')).toBe('v');

      expect(plugin.get('k', null)).toBe('v');

      plugin.remove?.('k');
      expect(storage.data.has('k')).toBe(false);

      storage.setItem('x', 'y');
      plugin.clear?.();
      expect(storage.data.size).toBe(0);
    });
  });

  describe('isSerializer', () => {
    it('should return true for object with serialize and deserialize', () => {
      expect(isSerializer(mockSerializer)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isSerializer(null)).toBe(false);
    });

    it('should return false for object without serialize', () => {
      expect(isSerializer({ deserialize: () => {} })).toBe(false);
    });

    it('should return false for object without deserialize', () => {
      expect(isSerializer({ serialize: () => {} })).toBe(false);
    });

    it('should return false for non-object', () => {
      expect(isSerializer('string')).toBe(false);
    });
  });

  describe('isEncryptor', () => {
    it('should return true for object with encrypt and decrypt', () => {
      expect(isEncryptor(mockEncryptor)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isEncryptor(null)).toBe(false);
    });

    it('should return false for object without encrypt', () => {
      expect(isEncryptor({ decrypt: () => {} })).toBe(false);
    });

    it('should return false for object without decrypt', () => {
      expect(isEncryptor({ encrypt: () => {} })).toBe(false);
    });
  });

  describe('createStoragePlugin', () => {
    it('should return single wrapped plugin when given single StorageInterface', () => {
      const storage = new MockStorage();
      const plugins = createStoragePlugin(storage);

      expect(plugins).toHaveLength(1);
      expect(plugins[0].type).toBe('storage');

      plugins[0].set('a', 'b');
      expect(storage.getItem('a')).toBe('b');
      expect(plugins[0].get('a', null)).toBe('b');
    });

    it('should map serializer to plugin with get/set calling deserialize/serialize', () => {
      const storage = new MockStorage();
      const plugins = createStoragePlugin([mockSerializer as any, storage]);

      expect(plugins).toHaveLength(2);
      expect(plugins[0].type).toBe('serializer');

      const obj = { x: 1 };
      plugins[0].set('k', obj as any);
      expect(plugins[0].set).toBeDefined();
      const serialized = (plugins[0].set as any)('k', obj);
      expect(serialized).toBe(JSON.stringify(obj));

      const deserialized = plugins[0].get('k', JSON.stringify(obj));
      expect(deserialized).toEqual(obj);
    });

    it('should map encryptor to plugin with get/set calling decrypt/encrypt', () => {
      const storage = new MockStorage();
      const plugins = createStoragePlugin([mockEncryptor as any, storage]);

      expect(plugins).toHaveLength(2);
      expect(plugins[0].type).toBe('encryptor');

      const encrypted = (plugins[0].set as any)('k', 'plain');
      expect(encrypted).toBe('encrypted:plain');

      const decrypted = plugins[0].get('k', 'encrypted:plain');
      expect(decrypted).toBe('plain');
    });

    it('should wrap storage in array with createStoragePluginWithStorage', () => {
      const storage = new MockStorage();
      const plugins = createStoragePlugin([storage]);

      expect(plugins).toHaveLength(1);
      expect(plugins[0].type).toBe('storage');
      plugins[0].set('k', 'v');
      expect(storage.data.get('k')).toBe('v');
    });

    it('should pass through raw StorageExecutorPlugin in array', () => {
      const customPlugin: StorageExecutorPlugin<string, string, unknown> = {
        type: 'custom',
        get: (_key, prev) => (prev as string) ?? null,
        set: (_key, value) => `custom:${value}`
      };
      const storage = new MockStorage();
      const plugins = createStoragePlugin([customPlugin, storage]);

      expect(plugins).toHaveLength(2);
      expect(plugins[0]).toBe(customPlugin);
      expect((plugins[0].set as any)('k', 'v')).toBe('custom:v');
    });

    it('should preserve order: serializer, encryptor, storage', () => {
      const storage = new MockStorage();
      const plugins = createStoragePlugin([
        mockSerializer as any,
        mockEncryptor as any,
        storage
      ]);

      expect(plugins).toHaveLength(3);
      expect(plugins[0].type).toBe('serializer');
      expect(plugins[1].type).toBe('encryptor');
      expect(plugins[2].type).toBe('storage');
    });
  });
});
