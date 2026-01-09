/**
 * ExecutorContextImpl comprehensive test suite
 *
 * Coverage:
 * 1. Constructor - Test context initialization with parameter cloning
 * 2. Parameters - Test parameter access and isolation
 * 3. Error - Test error state management
 * 4. ReturnValue - Test return value management
 * 5. SetError - Test error setting
 * 6. SetReturnValue - Test return value setting
 * 7. SetParameters - Test parameter updates with cloning
 * 8. Runtime tracking - Test hook runtime tracking
 * 9. Chain control - Test chain breaking logic
 * 10. Runtime privacy - Test WeakMap-based privacy
 * 11. Real-world error handling - Test various error scenarios
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ExecutorContextImpl } from '../../../src/executor/impl/ExecutorContextImpl';
import { ExecutorError } from '../../../src/executor/interface/ExecutorError';

describe('ExecutorContextImpl', () => {
  describe('constructor', () => {
    it('should initialize with provided parameters', () => {
      const params = { userId: 123, name: 'John' };
      const context = new ExecutorContextImpl(params);

      expect(context.parameters).toEqual(params);
      expect(context.error).toBeUndefined();
      expect(context.returnValue).toBeUndefined();
    });

    it('should clone parameters to prevent memory leaks', () => {
      const params = { userId: 123, name: 'John' };
      const context = new ExecutorContextImpl(params);

      // Parameters should be cloned, not the same reference
      expect(context.parameters).not.toBe(params);
      expect(context.parameters).toEqual(params);

      // Modifying original should not affect context
      params.userId = 456;
      expect(context.parameters.userId).toBe(123);
    });
  });

  describe('error management', () => {
    let context: ExecutorContextImpl<unknown>;

    beforeEach(() => {
      context = new ExecutorContextImpl({});
    });

    it('should set ExecutorError directly', () => {
      const executorError = new ExecutorError('TEST_ERROR', 'Test message');
      context.setError(executorError);

      expect(context.error).toBe(executorError);
      expect((context.error as ExecutorError).id).toBe('TEST_ERROR');
      expect((context.error as ExecutorError).message).toBe('Test message');
    });

    it('should store standard Error as-is', () => {
      const standardError = new Error('Standard error message');
      context.setError(standardError);

      expect(context.error).toBe(standardError);
      expect((context.error as Error).message).toBe('Standard error message');
    });

    it('should preserve original error type information', () => {
      const typeError = new TypeError('Type mismatch');
      context.setError(typeError);

      expect(context.error).toBe(typeError);
      expect(context.error).toBeInstanceOf(TypeError);
    });

    it('should preserve custom error properties', () => {
      class CustomError extends Error {
        constructor(
          message: string,
          public code: number,
          public details: any
        ) {
          super(message);
        }
      }

      const customError = new CustomError('Custom error', 500, {
        reason: 'timeout'
      });
      context.setError(customError);

      expect(context.error).toBe(customError);
      if (context.error instanceof CustomError) {
        expect(context.error.code).toBe(500);
        expect(context.error.details).toEqual({ reason: 'timeout' });
      } else {
        throw new Error('Expected error to be CustomError');
      }
    });

    it('should support error chain traceability', () => {
      const originalError = new Error('Original error');
      const level1Error = new ExecutorError('LEVEL_1', originalError);
      const level2Error = new ExecutorError('LEVEL_2', level1Error);

      context.setError(level2Error);

      expect(context.error).toBe(level2Error);
      expect((context.error as ExecutorError).cause).toBe(level1Error);
      expect(((context.error as ExecutorError).cause as Error)?.cause).toBe(
        originalError
      );
    });

    it('should handle string errors', () => {
      context.setError('Something went wrong');

      expect(context.error).toBe('Something went wrong');
    });

    it('should handle number errors', () => {
      context.setError(404);

      expect(context.error).toBe(404);
    });

    it('should handle object errors', () => {
      const errorObj = { code: 500, reason: 'Server error' };
      context.setError(errorObj);

      expect(context.error).toBe(errorObj);
    });

    it('should handle null error', () => {
      context.setError(null);

      expect(context.error).toBe(null);
    });

    it('should handle undefined error', () => {
      context.setError(undefined);

      expect(context.error).toBe(undefined);
    });

    it('should handle circular reference objects', () => {
      const circularObj: any = { name: 'circular' };
      circularObj.self = circularObj;

      context.setError(circularObj);

      expect(context.error).toBe(circularObj);
    });

    it('should handle boolean errors', () => {
      context.setError(false);

      expect(context.error).toBe(false);
    });
  });

  describe('return value management', () => {
    let context: ExecutorContextImpl<unknown>;

    beforeEach(() => {
      context = new ExecutorContextImpl({});
    });

    it('should set and get return value', () => {
      const returnValue = { success: true, data: 'test' };
      context.setReturnValue(returnValue);

      expect(context.returnValue).toBe(returnValue);
    });

    it('should allow updating return value', () => {
      context.setReturnValue('first');
      expect(context.returnValue).toBe('first');

      context.setReturnValue('second');
      expect(context.returnValue).toBe('second');
    });
  });

  describe('parameter management', () => {
    it('should update parameters with cloning', () => {
      const initialParams = { value: 'initial' };
      const context = new ExecutorContextImpl(initialParams);

      const newParams = { value: 'updated' };
      context.setParameters(newParams);

      expect(context.parameters).toEqual(newParams);
      expect(context.parameters).not.toBe(newParams);

      // Modifying newParams should not affect context
      newParams.value = 'modified';
      expect(context.parameters.value).toBe('updated');
    });
  });

  describe('runtime tracking', () => {
    let context: ExecutorContextImpl<unknown>;

    beforeEach(() => {
      context = new ExecutorContextImpl({});
    });

    it('should track plugin execution metadata', () => {
      context.runtimes({
        pluginName: 'testPlugin',
        hookName: 'onBefore',
        pluginIndex: 0,
        times: 1
      });

      expect(context.hooksRuntimes.pluginName).toBe('testPlugin');
      expect(context.hooksRuntimes.hookName).toBe('onBefore');
      expect(context.hooksRuntimes.times).toBe(1);
      expect(context.hooksRuntimes.pluginIndex).toBe(0);
    });

    it('should increment execution times', () => {
      context.runtimes({ times: 1 });
      expect(context.hooksRuntimes.times).toBe(1);

      context.runtimes({ times: 2 });
      expect(context.hooksRuntimes.times).toBe(2);
    });

    it('should track runtime return value', () => {
      const returnValue = { result: 'test' };
      context.runtimeReturnValue(returnValue);

      expect(context.hooksRuntimes.returnValue).toBe(returnValue);
    });

    it('should reset hooks runtimes', () => {
      context.runtimes({
        pluginName: 'testPlugin',
        hookName: 'onBefore',
        times: 1
      });
      context.runtimeReturnValue('test');

      context.resetHooksRuntimes();

      expect(context.hooksRuntimes.pluginName).toBe('');
      expect(context.hooksRuntimes.hookName).toBe('');
      expect(context.hooksRuntimes.returnValue).toBeUndefined();
      expect(context.hooksRuntimes.times).toBe(0);
      expect(context.hooksRuntimes.pluginIndex).toBeUndefined();
    });

    it('should reset entire context', () => {
      context.runtimes({
        pluginName: 'testPlugin',
        hookName: 'onBefore',
        times: 1
      });
      context.setReturnValue('test');
      context.setError(new ExecutorError('TEST_ERROR'));

      context.reset();

      expect(context.hooksRuntimes.pluginName).toBe('');
      expect(context.returnValue).toBeUndefined();
      expect(context.error).toBeUndefined();
    });
  });

  describe('chain control', () => {
    let context: ExecutorContextImpl<unknown>;

    beforeEach(() => {
      context = new ExecutorContextImpl({});
    });

    it('should check if chain should break', () => {
      expect(context.shouldBreakChain()).toBe(false);

      context.runtimes({ breakChain: true });
      expect(context.shouldBreakChain()).toBe(true);
    });

    it('should check if chain should break on return', () => {
      expect(context.shouldBreakChainOnReturn()).toBe(false);

      context.runtimes({ returnBreakChain: true });
      expect(context.shouldBreakChainOnReturn()).toBe(true);
    });
  });

  describe('plugin hook validation', () => {
    let context: ExecutorContextImpl<unknown>;

    beforeEach(() => {
      context = new ExecutorContextImpl({});
    });

    it('should skip plugin hook if method does not exist', () => {
      const plugin = { pluginName: 'testPlugin' };
      const shouldSkip = context.shouldSkipPluginHook(
        plugin as any,
        'onBefore'
      );

      expect(shouldSkip).toBe(true);
    });

    it('should not skip plugin hook if method exists', () => {
      const plugin = {
        pluginName: 'testPlugin',
        onBefore: () => {}
      };
      const shouldSkip = context.shouldSkipPluginHook(
        plugin as any,
        'onBefore'
      );

      expect(shouldSkip).toBe(false);
    });

    it('should skip plugin hook if enabled returns false', () => {
      const plugin = {
        pluginName: 'testPlugin',
        onBefore: () => {},
        enabled: () => false
      };
      const shouldSkip = context.shouldSkipPluginHook(
        plugin as any,
        'onBefore'
      );

      expect(shouldSkip).toBe(true);
    });

    it('should not skip plugin hook if enabled returns true', () => {
      const plugin = {
        pluginName: 'testPlugin',
        onBefore: () => {},
        enabled: () => true
      };
      const shouldSkip = context.shouldSkipPluginHook(
        plugin as any,
        'onBefore'
      );

      expect(shouldSkip).toBe(false);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete error flow', () => {
      const context = new ExecutorContextImpl({ userId: 123 });

      // Simulate catching a standard error
      try {
        JSON.parse('invalid json');
      } catch (error) {
        context.setError(error as Error);
      }

      // Verify error was stored
      expect(context.error).toBeInstanceOf(SyntaxError);
      expect((context.error as Error).message).toContain('JSON');
    });

    it('should maintain parameter isolation throughout execution', () => {
      const originalParams = { value: 'original' };
      const context = new ExecutorContextImpl(originalParams);

      // Modify original params
      originalParams.value = 'modified';
      expect(context.parameters.value).toBe('original');

      // Update context params
      context.setParameters({ value: 'updated' });
      expect(context.parameters.value).toBe('updated');
      expect(originalParams.value).toBe('modified');
    });
  });

  describe('Runtime Privacy with WeakMap', () => {
    describe('True Privacy', () => {
      it('should not expose _hooksRuntimes property', () => {
        const context = new ExecutorContextImpl({ test: 'data' });

        // TypeScript private is only compile-time, but WeakMap provides runtime privacy
        // @ts-expect-error - Accessing private property for testing
        expect(context._hooksRuntimes).toBeUndefined();
      });

      it('should not allow direct modification via property access', () => {
        const context = new ExecutorContextImpl({ test: 'data' });

        // Try to access internal state (should be undefined)
        // @ts-expect-error - Accessing private property for testing
        const internal = context._hooksRuntimes;
        expect(internal).toBeUndefined();

        // Even if we try to set it, it won't affect the real state
        // @ts-expect-error - Setting private property for testing
        context._hooksRuntimes = { times: 999, hookName: 'fake' };

        // Real state is unchanged
        const runtimes = context.hooksRuntimes;
        expect(runtimes.times).toBe(0);
        expect(runtimes.hookName).toBe('');
      });
    });

    describe('Read-only Access', () => {
      it('should return frozen copy via getter', () => {
        const context = new ExecutorContextImpl({ test: 'data' });

        context.runtimes({
          pluginName: 'TestPlugin',
          hookName: 'onBefore',
          times: 1
        });

        const runtimes = context.hooksRuntimes;

        // Should be frozen
        expect(Object.isFrozen(runtimes)).toBe(true);

        // Cannot modify
        expect(() => {
          // @ts-expect-error - Testing runtime modification
          runtimes.times = 999;
        }).toThrow();
      });

      it('should return new copy each time', () => {
        const context = new ExecutorContextImpl({ test: 'data' });

        const runtimes1 = context.hooksRuntimes;
        const runtimes2 = context.hooksRuntimes;

        // Different objects
        expect(runtimes1).not.toBe(runtimes2);

        // But same content
        expect(runtimes1).toEqual(runtimes2);
      });

      it('should prevent setter assignment', () => {
        const context = new ExecutorContextImpl({ test: 'data' });

        expect(() => {
          // @ts-expect-error - Testing setter
          context.hooksRuntimes = { times: 999 };
        }).toThrow();
      });
    });

    describe('Controlled Modification', () => {
      it('should only allow modification via runtimes() method', () => {
        const context = new ExecutorContextImpl({ test: 'data' });

        // This is the only way to modify
        context.runtimes({
          pluginName: 'TestPlugin',
          hookName: 'onBefore',
          pluginIndex: 0,
          times: 1
        });

        const runtimes = context.hooksRuntimes;
        expect(runtimes.pluginName).toBe('TestPlugin');
        expect(runtimes.hookName).toBe('onBefore');
        expect(runtimes.pluginIndex).toBe(0);
        expect(runtimes.times).toBe(1);
      });

      it('should create new object on each update (immutable)', () => {
        const context = new ExecutorContextImpl({ test: 'data' });

        context.runtimes({ times: 1 });
        const runtimes1 = context.hooksRuntimes;

        context.runtimes({ times: 2 });
        const runtimes2 = context.hooksRuntimes;

        // Different objects (immutable updates)
        expect(runtimes1).not.toBe(runtimes2);

        // Old snapshot unchanged
        expect(runtimes1.times).toBe(1);

        // New snapshot has new value
        expect(runtimes2.times).toBe(2);
      });

      it('should merge updates with existing state', () => {
        const context = new ExecutorContextImpl({ test: 'data' });

        context.runtimes({
          pluginName: 'Plugin1',
          hookName: 'onBefore',
          times: 1
        });

        // Partial update
        context.runtimes({
          times: 2
        });

        const runtimes = context.hooksRuntimes;

        // Previous values preserved
        expect(runtimes.pluginName).toBe('Plugin1');
        expect(runtimes.hookName).toBe('onBefore');

        // New value updated
        expect(runtimes.times).toBe(2);
      });
    });

    describe('Return Value Updates', () => {
      it('should update return value immutably', () => {
        const context = new ExecutorContextImpl({ test: 'data' });

        context.runtimeReturnValue('result1');
        const runtimes1 = context.hooksRuntimes;

        context.runtimeReturnValue('result2');
        const runtimes2 = context.hooksRuntimes;

        // Different objects
        expect(runtimes1).not.toBe(runtimes2);

        // Old snapshot unchanged
        expect(runtimes1.returnValue).toBe('result1');

        // New snapshot has new value
        expect(runtimes2.returnValue).toBe('result2');
      });
    });

    describe('Reset Operations', () => {
      it('should reset hook-specific state immutably', () => {
        const context = new ExecutorContextImpl({ test: 'data' });

        context.runtimes({
          pluginName: 'Plugin1',
          hookName: 'onBefore',
          times: 3,
          returnValue: 'old'
        });

        const before = context.hooksRuntimes;

        // Reset for new hook
        context.resetHooksRuntimes('onExec');

        const after = context.hooksRuntimes;

        // Different objects
        expect(before).not.toBe(after);

        // Hook-specific state reset
        expect(after.hookName).toBe('onExec');
        expect(after.times).toBe(0);
        expect(after.returnValue).toBeUndefined();

        // Plugin info preserved
        expect(after.pluginName).toBe('Plugin1');
      });

      it('should reset all state immutably', () => {
        const context = new ExecutorContextImpl({ test: 'data' });

        context.runtimes({
          pluginName: 'Plugin1',
          hookName: 'onBefore',
          times: 3,
          pluginIndex: 2
        });

        const before = context.hooksRuntimes;

        // Full reset
        context.resetHooksRuntimes();

        const after = context.hooksRuntimes;

        // Different objects
        expect(before).not.toBe(after);

        // All state reset
        expect(after.pluginName).toBe('');
        expect(after.hookName).toBe('');
        expect(after.times).toBe(0);
        expect(after.pluginIndex).toBeUndefined();
      });
    });

    describe('Security Verification', () => {
      it('should prevent all external modification attempts', () => {
        const context = new ExecutorContextImpl({ test: 'data' });

        context.runtimes({
          pluginName: 'TestPlugin',
          hookName: 'onBefore',
          times: 1
        });

        // Attempt 1: Direct property access (should be undefined)
        // @ts-expect-error - Testing private access
        expect(context._hooksRuntimes).toBeUndefined();

        // Attempt 2: Modify frozen getter result (should throw)
        const runtimes = context.hooksRuntimes;
        expect(() => {
          // @ts-expect-error - Testing modification
          runtimes.times = 999;
        }).toThrow();

        // Attempt 3: Setter assignment (should throw)
        expect(() => {
          // @ts-expect-error - Testing setter
          context.hooksRuntimes = { times: 999 };
        }).toThrow();

        // Verify state is unchanged
        const finalRuntimes = context.hooksRuntimes;
        expect(finalRuntimes.pluginName).toBe('TestPlugin');
        expect(finalRuntimes.hookName).toBe('onBefore');
        expect(finalRuntimes.times).toBe(1);
      });
    });
  });

  describe('Real-world Error Handling', () => {
    describe('Common JavaScript error patterns', () => {
      it('should handle errors from JSON.parse', () => {
        const context = new ExecutorContextImpl({});

        try {
          JSON.parse('invalid json');
        } catch (error) {
          // error is unknown in catch clause
          context.setError(error);
        }

        expect(context.error).toBeInstanceOf(SyntaxError);
      });

      it('should handle errors from fetch/axios', () => {
        const context = new ExecutorContextImpl({});

        // Simulating an axios-like error
        const axiosError = {
          message: 'Network Error',
          code: 'ERR_NETWORK',
          response: {
            status: 500,
            data: { error: 'Internal Server Error' }
          }
        };

        try {
          throw axiosError;
        } catch (error) {
          context.setError(error);
        }

        expect(context.error).toBe(axiosError);
        expect((context.error as any).message).toContain('Network Error');
      });

      it('should handle string errors from third-party libraries', () => {
        const context = new ExecutorContextImpl({});

        try {
          // Some libraries throw strings
          throw 'Database connection failed';
        } catch (error) {
          context.setError(error);
        }

        expect(context.error).toBe('Database connection failed');
      });

      it('should handle Promise rejection with any value', async () => {
        const context = new ExecutorContextImpl({});

        try {
          await Promise.reject({ code: 404, message: 'Not Found' });
        } catch (error) {
          context.setError(error);
        }

        expect((context.error as any).code).toBe(404);
      });
    });

    describe('Edge cases from real applications', () => {
      it('should handle undefined thrown by mistake', () => {
        const context = new ExecutorContextImpl({});

        try {
          // Sometimes developers accidentally throw undefined
          const result: any = undefined;
          throw result;
        } catch (error) {
          context.setError(error);
        }

        expect(context.error).toBeUndefined();
      });

      it('should handle null from legacy code', () => {
        const context = new ExecutorContextImpl({});

        try {
          // Legacy code might throw null
          throw null;
        } catch (error) {
          context.setError(error);
        }

        expect(context.error).toBe(null);
      });

      it('should handle error codes as numbers', () => {
        const context = new ExecutorContextImpl({});

        try {
          // Some APIs throw error codes as numbers
          throw 404;
        } catch (error) {
          context.setError(error);
        }

        expect(context.error).toBe(404);
      });

      it('should handle complex error objects with circular references', () => {
        const context = new ExecutorContextImpl({});

        const errorObj: any = {
          message: 'Circular error',
          timestamp: Date.now()
        };
        errorObj.self = errorObj; // Circular reference

        try {
          throw errorObj;
        } catch (error) {
          context.setError(error);
        }

        expect(context.error).toBe(errorObj);
      });
    });

    describe('Type safety demonstration', () => {
      it('should work seamlessly with TypeScript catch clauses', () => {
        const context = new ExecutorContextImpl({});

        // TypeScript catch clause: error is unknown
        try {
          throw new Error('Test');
        } catch (error) {
          // No type assertion needed!
          context.setError(error); // ✅ Works with unknown type
        }

        expect(context.error).toBeDefined();
      });

      it('should handle errors from async operations', async () => {
        const context = new ExecutorContextImpl({});

        async function riskyOperation() {
          throw { status: 500, message: 'Server error' };
        }

        try {
          await riskyOperation();
        } catch (error) {
          // error is unknown
          context.setError(error); // ✅ No type issues
        }

        expect((context.error as any).status).toBe(500);
      });
    });

    describe('Comparison with manual error handling', () => {
      it('demonstrates the improvement over manual type checking', () => {
        const context = new ExecutorContextImpl({});

        // ✅ New way: Automatic handling
        try {
          throw 'error';
        } catch (error) {
          context.setError(error); // Just works!
        }

        expect(context.error).toBe('error');
      });
    });
  });
});
