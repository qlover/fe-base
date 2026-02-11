import { StorageExecutor } from '../../src/storage/impl/StorageExecutor';
import type { StorageInterface } from '../../src/storage/interface/StorageInterface';

class MockStorage implements StorageInterface<string, string> {
  public data = new Map<string, string>();
  public setItemCalls: Array<{ key: string; value: string }> = [];
  public getItemCalls: Array<{ key: string }> = [];
  public removeItemCalls: string[] = [];
  public clearCalls = 0;

  public setItem(key: string, value: string): void {
    this.setItemCalls.push({ key, value });
    this.data.set(key, value);
  }

  public getItem(key: string): string | null {
    this.getItemCalls.push({ key });
    return this.data.get(key) ?? null;
  }

  public removeItem(key: string): void {
    this.removeItemCalls.push(key);
    this.data.delete(key);
  }

  public clear(): void {
    this.clearCalls++;
    this.data.clear();
  }

  public reset(): void {
    this.data.clear();
    this.setItemCalls = [];
    this.getItemCalls = [];
    this.removeItemCalls = [];
    this.clearCalls = 0;
  }
}

const mockSerializer = {
  serialize: (v: unknown) => JSON.stringify(v),
  deserialize: (data: string) => {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
};

const mockEncryptor = {
  encrypt: (v: string) => `enc:${v}`,
  decrypt: (v: string) => v.replace(/^enc:/, '')
};

describe('StorageExecutor', () => {
  describe('constructor', () => {
    it('should accept single StorageInterface', () => {
      const storage = new MockStorage();
      const executor = new StorageExecutor(storage);
      executor.setItem('k', 'v');
      expect(storage.data.get('k')).toBe('v');
      expect(executor.getItem('k')).toBe('v');
    });

    it('should accept array [serializer, storage]', () => {
      const storage = new MockStorage();
      const executor = new StorageExecutor([mockSerializer as any, storage]);
      const obj = { a: 1 };
      executor.setItem('k', obj as any);
      expect(storage.data.get('k')).toBe(JSON.stringify(obj));
      expect(executor.getItem('k')).toEqual(obj);
    });

    it('should accept array [serializer, encryptor, storage]', () => {
      const storage = new MockStorage();
      const executor = new StorageExecutor([
        mockSerializer as any,
        mockEncryptor as any,
        storage
      ]);
      const obj = { secret: true };
      executor.setItem('k', obj as any);
      const raw = storage.data.get('k');
      expect(raw).toBe('enc:' + JSON.stringify(obj));
      expect(executor.getItem('k')).toEqual(obj);
    });
  });

  describe('setItem', () => {
    it('should flow value forward through plugins', () => {
      const storage = new MockStorage();
      const executor = new StorageExecutor([
        mockSerializer as any,
        mockEncryptor as any,
        storage
      ]);
      executor.setItem('key', { x: 1 } as any);
      expect(storage.setItemCalls).toHaveLength(1);
      expect(storage.setItemCalls[0].key).toBe('key');
      expect(storage.setItemCalls[0].value).toBe(
        'enc:' + JSON.stringify({ x: 1 })
      );
    });

    it('should work with single storage (no transform)', () => {
      const storage = new MockStorage();
      const executor = new StorageExecutor(storage);
      executor.setItem('a', 'b');
      expect(storage.data.get('a')).toBe('b');
    });
  });

  describe('getItem', () => {
    it('should flow value backward: read then decrypt then deserialize', () => {
      const storage = new MockStorage();
      storage.setItem('k', 'enc:' + JSON.stringify({ y: 2 }));
      const executor = new StorageExecutor([
        mockSerializer as any,
        mockEncryptor as any,
        storage
      ]);
      const result = executor.getItem('k');
      expect(result).toEqual({ y: 2 });
    });

    it('should return null for non-existent key', () => {
      const storage = new MockStorage();
      const executor = new StorageExecutor(storage);
      expect(executor.getItem('missing')).toBeNull();
    });

    it('should return defaultValue when key missing (two-arg getItem)', () => {
      const storage = new MockStorage();
      const executor = new StorageExecutor(storage);
      const def = { default: true };
      const result = executor.getItem('missing', def as any);
      expect(result).toEqual(def);
    });

    it('should return defaultValue when key missing (three-arg getItem with options)', () => {
      const storage = new MockStorage();
      const executor = new StorageExecutor(storage);
      const def = 'default';
      const result = executor.getItem('missing', def, {});
      expect(result).toBe(def);
    });
  });

  describe('removeItem', () => {
    it('should delegate remove to all plugins that implement remove', () => {
      const storage = new MockStorage();
      storage.setItem('k', 'v');
      const executor = new StorageExecutor(storage);
      executor.removeItem('k');
      expect(storage.removeItemCalls).toContain('k');
      expect(storage.data.has('k')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should delegate clear to all plugins that implement clear', () => {
      const storage = new MockStorage();
      storage.setItem('a', '1');
      storage.setItem('b', '2');
      const executor = new StorageExecutor(storage);
      executor.clear();
      expect(storage.clearCalls).toBe(1);
      expect(storage.data.size).toBe(0);
    });
  });

  describe('multiple storage plugins', () => {
    it('should use first storage (from tail) that returns value on getItem', () => {
      const primary = new MockStorage();
      const secondary = new MockStorage();
      primary.setItem('k', 'from-primary');
      secondary.setItem('k', 'from-secondary');

      const executor = new StorageExecutor([primary, secondary]);
      const result = executor.getItem('k');
      expect(result).toBe('from-secondary');
    });

    it('should fallback to earlier storage when later returns null', () => {
      const first = new MockStorage();
      const second = new MockStorage();
      first.setItem('k', 'from-first');

      const executor = new StorageExecutor([first, second]);
      const result = executor.getItem('k');
      expect(result).toBe(null);
    });

    it('should write to all storage plugins on setItem', () => {
      const first = new MockStorage();
      const second = new MockStorage();
      const executor = new StorageExecutor([first, second]);
      executor.setItem('k', 'v');
      expect(first.data.get('k')).toBe('v');
      expect(second.data.get('k')).toBe('v');
    });
  });
});
