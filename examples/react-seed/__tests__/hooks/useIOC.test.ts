import { inject } from '@qlover/corekit-bridge/ioc';
import * as globals from '@/globals';
import { useIOC } from '@/hooks/useIOC';
import type { IOCIdentifierMap } from '@config/ioc-identifier';
import type {
  IOCContainerInterface,
  IOCFunctionInterface,
  SimpleIOCContainer
} from '@qlover/corekit-bridge/ioc';

describe('useIOC', () => {
  let mockIOC: IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockIOC = globals.IOC;
  });

  describe('when called without identifier', () => {
    it('should return the IOC function itself', () => {
      const result = useIOC();

      expect(result).toBe(mockIOC);
      expect(result).toBe(globals.IOC);
    });

    it('should return IOCFunctionInterface type', () => {
      const result = useIOC();

      expect(typeof result).toBe('function');
      expect(result).toHaveProperty('implemention');
      expect(result).toHaveProperty('get');
      expect(result).toHaveProperty('bind');
    });

    it('should return the same reference as globals.IOC', () => {
      const result1 = useIOC();
      const result2 = useIOC();

      expect(result1).toBe(result2);
      expect(result1).toBe(globals.IOC);
      expect(result2).toBe(globals.IOC);
    });
  });

  describe('when called with string identifier', () => {
    it('should call IOC function with the identifier', () => {
      const identifier = 'Logger';
      const mockLogger = {
        log: vi.fn(),
        fatal: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
        trace: vi.fn(),
        addAppender: vi.fn(),
        context: vi.fn()
      };

      globals.containerImpl.bind(identifier, mockLogger);

      const result = useIOC(identifier);

      expect(result).toBe(mockLogger);
    });

    it('should return the service instance from IOC', () => {
      const identifier = 'Logger';
      const mockLogger = {
        log: vi.fn(),
        fatal: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
        trace: vi.fn(),
        addAppender: vi.fn(),
        context: vi.fn()
      };

      globals.containerImpl.bind(identifier, mockLogger);

      const result = useIOC(identifier);

      expect(result).toBe(mockLogger);
      expect(result).toHaveProperty('log');
      expect(result).toHaveProperty('debug');
    });

    it('should work with IOCIdentifierMap keys', () => {
      const identifier = 'Logger';
      const mockLogger = {
        log: vi.fn(),
        fatal: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
        trace: vi.fn(),
        addAppender: vi.fn(),
        context: vi.fn()
      };

      globals.containerImpl.bind(identifier, mockLogger);

      const result = useIOC(identifier);

      expect(result).toBe(mockLogger);
      expect(result).toHaveProperty('log');
      expect(result).toHaveProperty('debug');
    });
  });

  describe('when called with class constructor identifier', () => {
    it('should call IOC function with the class constructor', () => {
      class TestService {
        public value = 'test';
      }

      const result = useIOC(TestService);

      expect(result).toBeInstanceOf(TestService);
    });

    it('should return instance of the class', () => {
      class TestService {
        public value = 'test-value';
        public getValue(): string {
          return this.value;
        }
      }

      const result = useIOC(TestService);

      expect(result).toBeInstanceOf(TestService);
      expect((result as TestService).value).toBe('test-value');
      expect((result as TestService).getValue()).toBe('test-value');
    });

    it('should handle classes with dependencies', () => {
      class Dependency {
        public value = 'dependency';
      }

      class Service {
        constructor(@inject(Dependency) public dep: Dependency) {}
      }

      // Bind dependencies
      globals.containerImpl.bind('Dependency', Dependency);
      globals.containerImpl.bind('Service', Service);

      // Use type assertion to handle constructor signature mismatch
      const result = useIOC(Service as new (...args: unknown[]) => Service);

      expect(result).toBeInstanceOf(Service);
      expect((result as Service).dep).toBeInstanceOf(Dependency);
      expect((result as Service).dep.value).toBe('dependency');
    });
  });

  describe('integration with IOC container', () => {
    it('should use the same IOC container as globals.IOC', () => {
      const identifier = 'Logger';
      const mockLogger = {
        log: vi.fn(),
        fatal: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
        trace: vi.fn(),
        addAppender: vi.fn(),
        context: vi.fn()
      };

      globals.containerImpl.bind(identifier, mockLogger);

      const instance1 = useIOC(identifier);
      const instance2 = globals.IOC(identifier);

      // Should return the same instance (singleton behavior)
      expect(instance1).toBe(instance2);
      expect(instance1).toBe(mockLogger);
    });

    it('should reflect changes in container bindings', () => {
      class Service1 {
        public value = 'service1';
      }

      class Service2 {
        public value = 'service2';
      }

      // First binding
      globals.containerImpl.bind('Service1', Service1);
      const result1 = useIOC(Service1);
      expect((result1 as Service1).value).toBe('service1');

      // Reset and rebind
      (globals.containerImpl as SimpleIOCContainer).reset();
      globals.containerImpl.bind('Service2', Service2);
      const result2 = useIOC(Service2);
      expect((result2 as Service2).value).toBe('service2');
    });

    it('should handle errors when service is not bound', () => {
      // When using a string identifier that is not bound, it should throw
      // Use a valid IOCIdentifierMap key that is not bound
      const unboundIdentifier = 'JSONSerializer' as keyof IOCIdentifierMap;

      // Ensure it's not bound
      (globals.containerImpl as SimpleIOCContainer).reset();

      expect(() => {
        useIOC(unboundIdentifier);
      }).toThrow(/No binding found/);
    });

    it('should auto-instantiate unbound class constructors', () => {
      // When using a class constructor that is not bound, it should auto-instantiate
      class UnboundService {
        public value = 'unbound';
      }

      const result = useIOC(UnboundService);

      // Should auto-instantiate instead of throwing
      expect(result).toBeInstanceOf(UnboundService);
      expect((result as UnboundService).value).toBe('unbound');
    });
  });

  describe('type safety', () => {
    it('should maintain type inference for string identifiers', () => {
      const identifier = 'Logger';
      const mockLogger = {
        log: vi.fn(),
        fatal: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
        trace: vi.fn(),
        addAppender: vi.fn(),
        context: vi.fn()
      };

      globals.containerImpl.bind(identifier, mockLogger);

      const result = useIOC(identifier);

      // Type should be inferred correctly
      expect(result).toBe(mockLogger);
      expect(typeof result).toBe('object');
    });

    it('should maintain type inference for class constructors', () => {
      class TestService {
        public value = 'test';
      }

      const result = useIOC(TestService);

      // Type should be inferred as InstanceType<TestService>
      expect(result).toBeInstanceOf(TestService);
      expect((result as TestService).value).toBe('test');
    });
  });

  describe('edge cases', () => {
    it('should handle undefined identifier explicitly', () => {
      // @ts-expect-error - testing edge case with undefined
      const result = useIOC(undefined);

      expect(result).toBe(mockIOC);
      expect(result).toBe(globals.IOC);
    });

    it('should handle multiple calls with same identifier', () => {
      class TestService {
        public callCount = 0;
        constructor() {
          this.callCount++;
        }
      }

      globals.containerImpl.bind('TestService', TestService);

      const result1 = useIOC(TestService);
      const result2 = useIOC(TestService);
      const result3 = useIOC(TestService);

      // Should return same instance (singleton)
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
      expect((result1 as TestService).callCount).toBe(1);
    });

    it('should handle different identifiers independently', () => {
      class Service1 {
        public value = 'service1';
      }

      class Service2 {
        public value = 'service2';
      }

      globals.containerImpl.bind('Service1', Service1);
      globals.containerImpl.bind('Service2', Service2);

      const result1 = useIOC(Service1);
      const result2 = useIOC(Service2);

      expect(result1).toBeInstanceOf(Service1);
      expect(result2).toBeInstanceOf(Service2);
      expect((result1 as Service1).value).toBe('service1');
      expect((result2 as Service2).value).toBe('service2');
    });
  });
});
