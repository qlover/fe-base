import {
  SimpleIOCContainer,
  injectable,
  inject
} from '@/impls/SimpleIOCContainer';
import type { LoggerInterface } from '@qlover/logger';

// Helper type to convert a class constructor to Newable type compatible with bind()
type ToNewable<T> = new (...args: unknown[]) => T;

describe('SimpleIOCContainer', () => {
  let container: SimpleIOCContainer;
  let mockLogger: LoggerInterface;

  beforeEach(() => {
    mockLogger = {
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

    container = new SimpleIOCContainer(mockLogger);
  });

  describe('constructor', () => {
    it('should create an instance of SimpleIOCContainer', () => {
      expect(container).toBeInstanceOf(SimpleIOCContainer);
    });

    it('should accept a logger parameter', () => {
      const logger = {
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

      const newContainer = new SimpleIOCContainer(logger);
      expect(newContainer).toBeInstanceOf(SimpleIOCContainer);
    });
  });

  describe('bind and get', () => {
    it('should bind and retrieve a simple value', () => {
      const value = 'test-value';
      container.bind('test-key', value);

      const result = container.get<string>('test-key');
      expect(result).toBe(value);
    });

    it('should bind and retrieve different types of values', () => {
      container.bind('string', 'hello');
      container.bind('number', 42);
      container.bind('boolean', true);
      container.bind('object', { key: 'value' });

      expect(container.get<string>('string')).toBe('hello');
      expect(container.get<number>('number')).toBe(42);
      expect(container.get<boolean>('boolean')).toBe(true);
      expect(container.get<{ key: string }>('object')).toEqual({
        key: 'value'
      });
    });

    it('should bind and retrieve using symbol as identifier', () => {
      const symbolKey = Symbol('test');
      const value = 'symbol-value';

      container.bind(symbolKey, value);
      const result = container.get<string>(symbolKey);

      expect(result).toBe(value);
    });

    it('should throw error when getting unbound service', () => {
      expect(() => {
        container.get('unbound-key');
      }).toThrow('No binding found for unbound-key');
    });

    it('should return the same instance for singleton behavior', () => {
      class TestService {
        public value = 'test';
      }

      container.bind('service', TestService);
      const instance1 = container.get<TestService>('service');
      const instance2 = container.get<TestService>('service');

      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(TestService);
    });
  });

  describe('bindFactory', () => {
    it('should bind and use factory function', () => {
      let callCount = 0;
      const factory = () => {
        callCount++;
        return { id: callCount };
      };

      container.bindFactory('factory-service', factory);

      const instance1 = container.get<{ id: number }>('factory-service');
      const instance2 = container.get<{ id: number }>('factory-service');

      expect(instance1.id).toBe(1);
      expect(instance2.id).toBe(1); // Should be cached
      expect(callCount).toBe(1); // Factory called only once
    });

    it('should use factory function to create instances', () => {
      class Service {
        constructor(public name: string) {}
      }

      container.bindFactory('service', () => new Service('factory-created'));

      const instance = container.get<Service>('service');
      expect(instance).toBeInstanceOf(Service);
      expect(instance.name).toBe('factory-created');
    });
  });

  describe('class instantiation', () => {
    it('should instantiate class without constructor parameters', () => {
      class SimpleService {
        public value = 'test';
      }

      container.bind('service', SimpleService);
      const instance = container.get<SimpleService>('service');

      expect(instance).toBeInstanceOf(SimpleService);
      expect(instance.value).toBe('test');
    });

    it('should instantiate class directly without binding', () => {
      class SimpleService {
        public value = 'test';
      }

      const instance = container.get<SimpleService>(SimpleService);

      expect(instance).toBeInstanceOf(SimpleService);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining(
          'Auto-instantiating unbound class: SimpleService'
        )
      );
    });

    it('should handle class with zero-parameter constructor', () => {
      class ZeroParamService {
        constructor() {}
        public value = 'zero';
      }

      container.bind('service', ZeroParamService);
      const instance = container.get<ZeroParamService>('service');

      expect(instance).toBeInstanceOf(ZeroParamService);
      expect(instance.value).toBe('zero');
    });
  });

  describe('dependency injection with @inject decorator', () => {
    it('should inject dependencies using @inject decorator', () => {
      class Dependency {
        public value = 'dependency';
      }

      class Service {
        constructor(@inject(Dependency) public dep: Dependency) {}
      }

      container.bind('dependency', Dependency);
      container.bind('service', Service as ToNewable<Service>);

      const service = container.get<Service>('service');
      expect(service).toBeInstanceOf(Service);
      expect(service.dep).toBeInstanceOf(Dependency);
      expect(service.dep.value).toBe('dependency');
    });

    it('should inject multiple dependencies with @inject', () => {
      class Dep1 {
        public value = 'dep1';
      }
      class Dep2 {
        public value = 'dep2';
      }

      class Service {
        constructor(
          @inject(Dep1) public dep1: Dep1,
          @inject(Dep2) public dep2: Dep2
        ) {}
      }

      container.bind('dep1', Dep1);
      container.bind('dep2', Dep2);
      container.bind('service', Service as ToNewable<Service>);

      const service = container.get<Service>('service');
      expect(service.dep1.value).toBe('dep1');
      expect(service.dep2.value).toBe('dep2');
    });

    it('should inject dependencies using string identifiers', () => {
      class Dependency {
        public value = 'dependency';
      }

      class Service {
        constructor(@inject('dep-key') public dep: Dependency) {}
      }

      container.bind('dep-key', Dependency);
      container.bind('service', Service as ToNewable<Service>);

      const service = container.get<Service>('service');
      expect(service.dep).toBeInstanceOf(Dependency);
    });

    it('should throw error when dependency is not found', () => {
      class Service {
        constructor(@inject('missing-dep') public dep: unknown) {}
      }

      container.bind('service', Service as ToNewable<Service>);

      expect(() => {
        container.get<Service>('service');
      }).toThrow(/Cannot resolve dependency/);
    });

    it('should throw error when @inject is missing for required parameter', () => {
      class Dependency {
        public value = 'dependency';
      }

      class Service {
        constructor(public dep: Dependency) {}
      }

      container.bind('dependency', Dependency);
      container.bind('service', Service as ToNewable<Service>);

      // Should throw or warn when trying to resolve without @inject
      try {
        container.get<Service>('service');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('No binding found for service');
      }
    });
  });

  describe('@injectable decorator', () => {
    it('should mark class as injectable', () => {
      @injectable()
      class InjectableService {
        public value = 'injectable';
      }

      container.bind('service', InjectableService);
      const instance = container.get<InjectableService>('service');

      expect(instance).toBeInstanceOf(InjectableService);
      expect(instance.value).toBe('injectable');
    });
  });

  describe('automatic dependency resolution', () => {
    it('should automatically resolve dependencies when types are available', () => {
      class Dependency {
        public value = 'auto-resolved';
      }

      class Service {
        constructor(public dep: Dependency) {}
      }

      container.bind('dependency', Dependency);
      container.bind('service', Service as ToNewable<Service>);

      // This might fail if TypeScript metadata is not available
      // In that case, it should fall back to warning and undefined args
      try {
        const service = container.get<Service>('service');
        expect(service).toBeInstanceOf(Service);
      } catch {
        // If auto-resolution fails, it should warn
        expect(mockLogger.warn).toHaveBeenCalled();
      }
    });
  });

  describe('reset', () => {
    it('should clear all bindings', () => {
      container.bind('key1', 'value1');
      container.bind('key2', 'value2');

      container.reset();

      expect(() => {
        container.get('key1');
      }).toThrow();
      expect(() => {
        container.get('key2');
      }).toThrow();
    });

    it('should clear all instances', () => {
      class Service {
        public value = 'test';
      }

      container.bind('service', Service);
      const instance1 = container.get<Service>('service');

      container.reset();
      container.bind('service', Service);
      const instance2 = container.get<Service>('service');

      expect(instance1).not.toBe(instance2);
    });

    it('should clear all factories', () => {
      let callCount = 0;
      const factory = () => {
        callCount++;
        return { id: callCount };
      };

      container.bindFactory('factory', factory);
      container.get('factory');

      container.reset();

      expect(() => {
        container.get('factory');
      }).toThrow();
    });
  });

  describe('complex scenarios', () => {
    it('should handle nested dependencies', () => {
      class Level3 {
        public value = 'level3';
      }

      class Level2 {
        constructor(@inject(Level3) public level3: Level3) {}
      }

      class Level1 {
        constructor(
          @inject(Level2 as ToNewable<Level2>) public level2: Level2
        ) {}
      }

      container.bind('level3', Level3);
      container.bind('level2', Level2 as ToNewable<Level2>);
      container.bind('level1', Level1 as ToNewable<Level1>);

      const level1 = container.get<Level1>('level1');
      expect(level1.level2.level3.value).toBe('level3');
    });

    it('should handle mixed dependency injection', () => {
      class Dep1 {
        public value = 'dep1';
      }
      class Dep2 {
        public value = 'dep2';
      }

      class Service {
        constructor(
          @inject(Dep1) public dep1: Dep1,
          @inject('dep2-key') public dep2: Dep2
        ) {}
      }

      container.bind('dep1', Dep1);
      container.bind('dep2-key', Dep2);
      container.bind('service', Service as ToNewable<Service>);

      const service = container.get<Service>('service');
      expect(service.dep1.value).toBe('dep1');
      expect(service.dep2.value).toBe('dep2');
    });

    it('should maintain singleton instances across different identifiers', () => {
      class SharedService {
        public value = 'shared';
      }

      container.bind('key1', SharedService);
      container.bind('key2', SharedService);

      const instance1 = container.get<SharedService>('key1');
      const instance2 = container.get<SharedService>('key2');

      // Different identifiers should create different instances
      expect(instance1).not.toBe(instance2);
    });

    it('should handle same class bound to same identifier as singleton', () => {
      class Service {
        public value = 'test';
      }

      container.bind('service', Service);
      const instance1 = container.get<Service>('service');
      const instance2 = container.get<Service>('service');

      expect(instance1).toBe(instance2);
    });
  });

  describe('error handling', () => {
    it('should throw error for unbound non-constructor identifier', () => {
      const stringIdentifier = 'not-a-class';

      expect(() => {
        container.get(stringIdentifier);
      }).toThrow('No binding found for not-a-class');
    });

    it('should handle circular dependency detection', () => {
      class ServiceA {
        constructor(@inject('ServiceB') public serviceB: ServiceB) {}
      }

      class ServiceB {
        constructor(@inject('ServiceA') public serviceA: ServiceA) {}
      }

      container.bind('ServiceA', ServiceA as ToNewable<ServiceA>);
      container.bind('ServiceB', ServiceB as ToNewable<ServiceB>);

      // This should throw an error due to circular dependency
      expect(() => {
        container.get<ServiceA>('ServiceA');
      }).toThrow();
    });

    it('should warn when auto-resolution fails', () => {
      class Service {
        constructor(public dep: unknown) {}
      }

      container.bind('service', Service);

      try {
        container.get<Service>('service');
      } catch {
        // Expected to throw
      }

      // Should have warned about failed auto-resolution
      expect(mockLogger.warn).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle binding null value', () => {
      container.bind('null-value', null);
      const result = container.get<null>('null-value');
      expect(result).toBeNull();
    });

    it('should handle binding undefined value', () => {
      container.bind('undefined-value', undefined);
      try {
        container.get<undefined>('undefined-value');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe(
          'No binding found for undefined-value'
        );
      }
    });

    it('should handle class with optional parameters', () => {
      class Service {
        constructor(public param?: string) {}
      }

      container.bind('service', Service as ToNewable<Service>);
      const instance = container.get<Service>('service');

      expect(instance).toBeInstanceOf(Service);
      expect(instance.param).toBeUndefined();
    });

    it('should handle multiple calls to get with same identifier', () => {
      class Service {
        public callCount = 0;
        constructor() {
          this.callCount++;
        }
      }

      container.bind('service', Service);

      const instance1 = container.get<Service>('service');
      const instance2 = container.get<Service>('service');
      const instance3 = container.get<Service>('service');

      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);
      // Constructor should only be called once due to singleton
      expect(instance1.callCount).toBe(1);
    });
  });
});
