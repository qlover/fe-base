import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { LoggerInterface } from '@qlover/logger';
import { SimpleIOCContainer } from '../../src/core/ioc/SimpleIOCContainer';

function createMockLogger(): LoggerInterface {
  return {
    log: vi.fn(),
    fatal: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    addAppender: vi.fn(),
    context: vi.fn()
  } as unknown as LoggerInterface;
}

describe('SimpleIOCContainer', () => {
  let container: SimpleIOCContainer;
  let mockLogger: LoggerInterface;

  beforeEach(() => {
    mockLogger = createMockLogger();
    container = new SimpleIOCContainer(mockLogger);
  });

  describe('constructor', () => {
    it('should create instance without logger', () => {
      const c = new SimpleIOCContainer();
      expect(c).toBeInstanceOf(SimpleIOCContainer);
    });

    it('should create instance with logger', () => {
      expect(container).toBeInstanceOf(SimpleIOCContainer);
    });
  });

  describe('bind and get', () => {
    it('should bind and get a value by string id', () => {
      container.bind('key', 'value');
      expect(container.get<string>('key')).toBe('value');
    });

    it('should bind and get by symbol id', () => {
      const sym = Symbol('s');
      container.bind(sym, 42);
      expect(container.get<number>(sym)).toBe(42);
    });

    it('should return same instance when binding a class (singleton per id)', () => {
      class Service {
        public id = 1;
      }
      container.bind('svc', Service);
      const a = container.get<Service>('svc');
      const b = container.get<Service>('svc');
      expect(a).toBe(b);
      expect(a).toBeInstanceOf(Service);
    });

    it('should throw when getting unbound id', () => {
      expect(() => container.get('missing')).toThrow(
        'No binding found for missing'
      );
    });
  });

  describe('bindFactory', () => {
    it('should use factory and cache result', () => {
      let count = 0;
      container.bindFactory('counter', () => ++count);
      expect(container.get<number>('counter')).toBe(1);
      expect(container.get<number>('counter')).toBe(1);
    });
  });

  describe('auto-instantiate', () => {
    it('should auto-instantiate unbound class with no-arg constructor', () => {
      class NoArgService {
        public value = 'ok';
      }
      const instance = container.get(NoArgService);
      expect(instance).toBeInstanceOf(NoArgService);
      expect(instance.value).toBe('ok');
    });

    it('should cache auto-instantiated class', () => {
      class C {}
      expect(container.get(C)).toBe(container.get(C));
    });
  });

  describe('reset', () => {
    it('should clear bindings and instances', () => {
      container.bind('a', 1);
      container.get('a');
      container.reset();
      expect(() => container.get('a')).toThrow('No binding found for a');
    });
  });

  describe('isConstructor', () => {
    it('should return true for class', () => {
      class A {}
      expect(container.isConstructor(A)).toBe(true);
    });

    it('should return false for plain object', () => {
      expect(container.isConstructor({})).toBe(false);
    });

    it('should return false for string', () => {
      expect(container.isConstructor('x')).toBe(false);
    });
  });
});
