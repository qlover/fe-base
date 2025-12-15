import { describe, it, expect } from 'vitest';
import { factory } from '../../src/utils/factory';

describe('factory utils', () => {
  describe('factory function', () => {
    it('should instantiate a class constructor', () => {
      class TestClass {
        public name: string;
        public value: number;

        constructor(name: string, value: number) {
          this.name = name;
          this.value = value;
        }
      }

      const instance = factory(TestClass, 'test', 42);

      expect(instance).toBeInstanceOf(TestClass);
      expect(instance.name).toBe('test');
      expect(instance.value).toBe(42);
    });

    it('should call a function directly', () => {
      const testFunction = (name: string, value: number) => ({
        name,
        value
      });

      const result = factory(testFunction, 'test', 42);

      expect(result).toEqual({
        name: 'test',
        value: 42
      });
    });

    it('should work with no arguments', () => {
      class EmptyClass {
        constructor() {
          // Empty constructor
        }
      }

      const instance = factory(EmptyClass);

      expect(instance).toBeInstanceOf(EmptyClass);
    });

    it('should handle function with no arguments', () => {
      const noArgFunction = () => ({ initialized: true });

      const result = factory(noArgFunction);

      expect(result).toEqual({ initialized: true });
    });
  });
});
