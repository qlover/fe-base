/**
 * InversifyContainer test-suite
 *
 * Coverage:
 * 1. constructor      - Container initialization tests
 * 2. bind            - Value binding tests
 * 3. get             - Value retrieval tests
 * 4. auto-binding    - Injectable class auto-binding tests
 * 5. singleton scope - Singleton pattern verification tests
 * 6. error handling  - Error cases and boundary tests
 */

import { InversifyContainer } from '@/base/cases/InversifyContainer';
import { injectable } from 'inversify';

describe('InversifyContainer', () => {
  let container: InversifyContainer;

  beforeEach(() => {
    container = new InversifyContainer();
  });

  describe('constructor', () => {
    it('should create container instance', () => {
      expect(container).toBeInstanceOf(InversifyContainer);
    });
  });

  describe('bind', () => {
    it('should bind and get constant value', () => {
      const key = Symbol('test');
      const value = { test: 'value' };

      container.bind(key, value);
      const result = container.get(key);

      expect(result).toBe(value);
    });

    it('should handle multiple bindings', () => {
      const key1 = Symbol('test1');
      const key2 = Symbol('test2');
      const value1 = { test: 'value1' };
      const value2 = { test: 'value2' };

      container.bind(key1, value1);
      container.bind(key2, value2);

      expect(container.get(key1)).toBe(value1);
      expect(container.get(key2)).toBe(value2);
    });

    it('should handle binding of null and undefined values', () => {
      const key1 = Symbol('null');
      const key2 = Symbol('undefined');
      container.bind(key1, null);
      container.bind(key2, undefined);

      expect(container.get(key1)).toBeNull();
      expect(container.get(key2)).toBeUndefined();
    });
  });

  describe('get', () => {
    it('should throw error when getting unbound non-injectable value', () => {
      const key = Symbol('nonexistent');
      expect(() => container.get(key)).toThrow();
    });

    it('should handle retrieval of primitive values', () => {
      const numberKey = Symbol('number');
      const stringKey = Symbol('string');
      const booleanKey = Symbol('boolean');

      container.bind(numberKey, 42);
      container.bind(stringKey, 'test');
      container.bind(booleanKey, true);

      expect(container.get(numberKey)).toBe(42);
      expect(container.get(stringKey)).toBe('test');
      expect(container.get(booleanKey)).toBe(true);
    });
  });

  describe('auto-binding', () => {
    it('should auto bind injectable class', () => {
      @injectable()
      class TestService {
        getValue(): string {
          return 'test';
        }
      }

      const result = container.get(TestService);

      expect(result).toBeInstanceOf(TestService);
      expect(result.getValue()).toBe('test');
    });

    it('should handle manual dependency injection', () => {
      @injectable()
      class ServiceA {
        getValue(): string {
          return 'A';
        }
      }

      @injectable()
      class ServiceB {
        constructor(private serviceA: ServiceA) {}

        getValueWithA(): string {
          return `B with ${this.serviceA.getValue()}`;
        }
      }

      const serviceA = container.get(ServiceA);
      container.bind(ServiceA, serviceA);
      container.bind(ServiceB, new ServiceB(serviceA));

      const serviceB = container.get(ServiceB);
      expect(serviceB).toBeInstanceOf(ServiceB);
      expect(serviceB.getValueWithA()).toBe('B with A');
    });
  });

  describe('singleton scope', () => {
    it('should maintain singleton scope for simple services', () => {
      @injectable()
      class TestService {
        private count = 0;
        increment(): number {
          return ++this.count;
        }
      }

      const instance1 = container.get(TestService);
      const instance2 = container.get(TestService);

      instance1.increment();
      expect(instance2.increment()).toBe(2);
      expect(instance1).toBe(instance2);
    });

    it('should maintain singleton scope for complex services', () => {
      @injectable()
      class ComplexService {
        private state = { count: 0 };

        updateState(): { count: number } {
          this.state.count++;
          return this.state;
        }
      }

      const instance1 = container.get(ComplexService);
      instance1.updateState();
      instance1.updateState();

      const instance2 = container.get(ComplexService);
      expect(instance2.updateState().count).toBe(3);
      expect(instance1).toBe(instance2);
    });
  });

  describe('error handling', () => {
    it('should throw error when getting unbound non-injectable value', () => {
      const key = Symbol('nonexistent');
      expect(() => container.get(key)).toThrow();
    });

    it('should throw error when getting non-existent binding', () => {
      const nonExistentKey = Symbol('non-existent');
      expect(() => container.get(nonExistentKey)).toThrow();
    });

    it('should handle invalid service identifier', () => {
      expect(() => container.get({} as unknown as symbol)).toThrow();
    });
  });
});
