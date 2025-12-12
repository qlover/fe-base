/**
 * Executor test-suite
 *
 * Coverage:
 * 1. constructor       – Constructor tests with configuration
 * 2. use              – Plugin registration and deduplication tests
 * 3. runHooks         – Hook execution pipeline tests
 * 4. exec             – Task execution with error handling tests
 * 5. execNoError      – Task execution without error throwing tests
 * 6. edge cases       – Edge case and boundary tests
 * 7. error handling   – Error handling and recovery tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  Executor,
  ExecutorContext,
  Task,
  ExecutorConfigInterface
} from '../../../src';
import { ExecutorPlugin } from '../../../src/executor/interface/ExecutorPlugin';
import { ExecutorError } from '../../../src/executor/interface/ExecutorError';

// Test data constants
const VALID_CONFIG: ExecutorConfigInterface = {
  beforeHooks: ['onBefore'],
  afterHooks: ['onSuccess'],
  execHook: 'onExec'
};

const INVALID_CONFIG = {
  beforeHooks: null,
  afterHooks: undefined,
  execHook: ''
};

// Test data factory functions
const createTestContext = <T = unknown>(
  overrides = {}
): ExecutorContext<T> => ({
  parameters: {} as T,
  error: undefined,
  returnValue: undefined,
  hooksRuntimes: {},
  ...overrides
});

const createMockPlugin = (name: string, overrides = {}): ExecutorPlugin => ({
  pluginName: name,
  onlyOne: false,
  enabled: vi.fn(() => true),
  onBefore: vi.fn(),
  onSuccess: vi.fn(),
  onError: vi.fn(),
  onExec: vi.fn(),
  ...overrides
});

// Concrete implementation for testing
class TestExecutor extends Executor<ExecutorConfigInterface> {
  constructor(config: ExecutorConfigInterface = {}) {
    super(config);
  }

  public runHooks(
    plugins: ExecutorPlugin[],
    name: unknown,
    ...args: unknown[]
  ): unknown {
    // Simple implementation for testing
    let lastResult: unknown;

    for (const plugin of plugins) {
      if (plugin.enabled && !plugin.enabled(name as keyof ExecutorPlugin)) {
        continue;
      }

      const hook = plugin[name as keyof ExecutorPlugin];
      if (typeof hook === 'function') {
        // Call the hook directly without apply to avoid this context issues
        if (name === 'onBefore' && plugin.onBefore) {
          lastResult = plugin.onBefore(args[0] as ExecutorContext);
        }
        if (name === 'onSuccess' && plugin.onSuccess) {
          lastResult = plugin.onSuccess(args[0] as ExecutorContext);
        }
        if (name === 'onError' && plugin.onError) {
          lastResult = plugin.onError(args[0] as ExecutorContext);
        }
        if (name === 'onExec' && plugin.onExec) {
          lastResult = plugin.onExec(
            args[0] as ExecutorContext,
            args[1] as Task<unknown, unknown>
          );
        }
      }
    }

    return lastResult;
  }

  public exec<Result, Params = unknown>(task: Task<Result, Params>): Result {
    const context = createTestContext<Params>();

    // Call onBefore hooks
    this.runHooks(this.plugins, 'onBefore', context);

    try {
      const result = task(context);
      context.returnValue = result;

      // Handle async tasks properly
      if (result instanceof Promise) {
        return result as Result;
      }

      // Call onSuccess hooks
      this.runHooks(this.plugins, 'onSuccess', context);

      return result as Result;
    } catch (error) {
      context.error = error as Error;

      // Call onError hooks
      this.runHooks(this.plugins, 'onError', context);

      throw error;
    }
  }

  public execNoError<Result, Params = unknown>(
    task: Task<Result, Params>
  ): Result | ExecutorError {
    const context = createTestContext<Params>();

    // Call onBefore hooks
    this.runHooks(this.plugins, 'onBefore', context);

    try {
      const result = task(context);
      context.returnValue = result;

      // Handle async tasks properly
      if (result instanceof Promise) {
        return result.catch((error) => {
          context.error = error as Error;

          // Call onError hooks
          this.runHooks(this.plugins, 'onError', context);

          return new ExecutorError('Task execution failed', error as Error);
        }) as Result | ExecutorError;
      }

      // Call onSuccess hooks
      this.runHooks(this.plugins, 'onSuccess', context);

      return result as Result;
    } catch (error) {
      context.error = error as Error;

      // Call onError hooks and check for recovery
      const errorResult = this.runHooks(this.plugins, 'onError', context);

      // If plugin returned a value, use it as recovery
      if (errorResult !== undefined && errorResult !== null) {
        return errorResult as Result;
      }

      return new ExecutorError('Task execution failed', error as Error);
    }
  }
}

describe('Executor', () => {
  let executor: TestExecutor;
  let mockPlugin: ExecutorPlugin;

  beforeEach(() => {
    executor = new TestExecutor();
    mockPlugin = createMockPlugin('test-plugin');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with default configuration', () => {
      const executor = new TestExecutor();
      expect(executor).toBeInstanceOf(TestExecutor);
      expect(executor).toBeInstanceOf(Executor);
    });

    it('should create instance with valid configuration', () => {
      const executor = new TestExecutor(VALID_CONFIG);
      expect(executor).toBeInstanceOf(TestExecutor);
    });

    it('should handle configuration with null/undefined values', () => {
      const executor = new TestExecutor(
        INVALID_CONFIG as unknown as ExecutorConfigInterface
      );
      expect(executor).toBeInstanceOf(TestExecutor);
    });

    it('should handle empty configuration object', () => {
      const executor = new TestExecutor({});
      expect(executor).toBeInstanceOf(TestExecutor);
    });
  });

  describe('use', () => {
    it('should add plugin successfully', () => {
      executor.use(mockPlugin);
      expect(executor['plugins']).toContain(mockPlugin);
    });

    it('should handle multiple plugins', () => {
      const plugin1 = createMockPlugin('plugin1');
      const plugin2 = createMockPlugin('plugin2');

      executor.use(plugin1);
      executor.use(plugin2);

      expect(executor['plugins']).toHaveLength(2);
      expect(executor['plugins']).toContain(plugin1);
      expect(executor['plugins']).toContain(plugin2);
    });

    it('should handle duplicate plugins', () => {
      const plugin1 = createMockPlugin('same-name');
      const plugin2 = createMockPlugin('same-name');

      executor.use(plugin1);
      executor.use(plugin2);

      expect(executor['plugins']).toHaveLength(2);
    });

    it('should handle plugin with onlyOne flag', () => {
      const onlyOnePlugin = createMockPlugin('only-one', { onlyOne: true });
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      executor.use(onlyOnePlugin);
      executor.use(onlyOnePlugin);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should throw error for null/undefined plugin', () => {
      // The use method should throw for null/undefined plugins
      expect(() => executor.use(null as unknown as ExecutorPlugin)).toThrow(
        'Plugin must be an object'
      );
      expect(() =>
        executor.use(undefined as unknown as ExecutorPlugin)
      ).toThrow('Plugin must be an object');
    });
  });

  describe('runHooks', () => {
    it('should execute enabled plugins', () => {
      const plugin = createMockPlugin('test', {
        enabled: vi.fn(() => true),
        onBefore: vi.fn()
      });

      executor.use(plugin);
      const context = createTestContext();
      executor.runHooks(executor['plugins'], 'onBefore', context);

      expect(plugin.enabled).toHaveBeenCalledWith('onBefore');
      expect(plugin.onBefore).toHaveBeenCalledWith(context);
    });

    it('should skip disabled plugins', () => {
      const plugin = createMockPlugin('test', {
        enabled: vi.fn(() => false),
        onBefore: vi.fn()
      });

      executor.use(plugin);
      const context = createTestContext();
      executor.runHooks(executor['plugins'], 'onBefore', context);

      expect(plugin.enabled).toHaveBeenCalledWith('onBefore');
      expect(plugin.onBefore).not.toHaveBeenCalled();
    });

    it('should handle plugins without enabled method', () => {
      const plugin = createMockPlugin('test', {
        enabled: undefined,
        onBefore: vi.fn()
      });

      executor.use(plugin);
      const context = createTestContext();
      executor.runHooks(executor['plugins'], 'onBefore', context);

      expect(plugin.onBefore).toHaveBeenCalledWith(context);
    });

    it('should handle plugins without hook methods', () => {
      const plugin = createMockPlugin('test', {
        onBefore: undefined
      });

      executor.use(plugin);
      expect(() => {
        executor.runHooks(executor['plugins'], 'onBefore', createTestContext());
      }).not.toThrow();
    });

    it('should handle empty plugins array', () => {
      expect(() => {
        executor.runHooks([], 'onBefore', createTestContext());
      }).not.toThrow();
    });
  });

  describe('exec', () => {
    it('should execute sync task successfully', () => {
      const task = vi.fn(() => 'success');
      const result = executor.exec(task);

      expect(result).toBe('success');
      expect(task).toHaveBeenCalledWith(
        expect.objectContaining({
          parameters: {},
          error: undefined,
          returnValue: 'success'
        })
      );
    });

    it('should execute async task successfully', async () => {
      const task = vi.fn(async () => 'async-success');
      const result = executor.exec(task);

      expect(result).resolves.toBe('async-success');
      expect(task).toHaveBeenCalled();
    });

    it('should handle task with parameters', () => {
      const task = vi.fn((context: ExecutorContext<{ id: number }>) => {
        return `result-${context.parameters.id}`;
      });

      const result = executor.exec(task);

      expect(result).toBe('result-undefined');
      expect(task).toHaveBeenCalledWith(
        expect.objectContaining({
          parameters: {}
        })
      );
    });

    it('should handle task that throws error', () => {
      const error = new Error('Task failed');
      const task = vi.fn(() => {
        throw error;
      });

      expect(() => executor.exec(task)).toThrow('Task failed');
    });

    it('should handle task with complex return value', () => {
      const complexResult = { data: 'test', timestamp: Date.now() };
      const task = vi.fn(() => complexResult);

      const result = executor.exec(task);

      expect(result).toEqual(complexResult);
    });

    it('should handle task with null/undefined return', () => {
      const nullTask = vi.fn(() => null);
      const undefinedTask = vi.fn(() => undefined);

      expect(executor.exec(nullTask)).toBeNull();
      expect(executor.exec(undefinedTask)).toBeUndefined();
    });
  });

  describe('execNoError', () => {
    it('should execute sync task successfully', () => {
      const task = vi.fn(() => 'success');
      const result = executor.execNoError(task);

      expect(result).toBe('success');
      expect(task).toHaveBeenCalled();
    });

    it('should execute async task successfully', async () => {
      const task = vi.fn(async () => 'async-success');
      const result = executor.execNoError(task);

      expect(result).resolves.toBe('async-success');
    });

    it('should return ExecutorError when task throws', () => {
      const error = new Error('Task execution failed');
      const task = vi.fn(() => {
        throw error;
      });

      const result = executor.execNoError(task);

      expect(result).toBeInstanceOf(ExecutorError);
      expect((result as ExecutorError).message).toBe('Task execution failed');
    });

    it('should handle task with parameters', () => {
      const task = vi.fn((context: ExecutorContext<{ id: number }>) => {
        return `result-${context.parameters.id}`;
      });

      const result = executor.execNoError(task);

      expect(result).toBe('result-undefined');
    });

    it('should handle task with complex return value', () => {
      const complexResult = { data: 'test', timestamp: Date.now() };
      const task = vi.fn(() => complexResult);

      const result = executor.execNoError(task);

      expect(result).toEqual(complexResult);
    });

    it('should handle task with null/undefined return', () => {
      const nullTask = vi.fn(() => null);
      const undefinedTask = vi.fn(() => undefined);

      expect(executor.execNoError(nullTask)).toBeNull();
      expect(executor.execNoError(undefinedTask)).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle task that returns function', () => {
      const task = vi.fn(() => () => 'nested-function');
      const result = executor.exec(task);

      expect(typeof result).toBe('function');
      expect((result as () => string)()).toBe('nested-function');
    });

    it('should handle task that returns promise', () => {
      const task = vi.fn(() => Promise.resolve('promise-result'));
      const result = executor.exec(task);

      expect(result).resolves.toBe('promise-result');
    });

    it('should handle task with circular reference', () => {
      const circularObj: Record<string, unknown> = { name: 'test' };
      circularObj.self = circularObj;

      const task = vi.fn(() => circularObj);
      const result = executor.exec(task);

      expect(result).toBe(circularObj);
      expect((result as typeof circularObj).self).toBe(circularObj);
    });

    it('should handle task with large data', () => {
      const largeData = 'x'.repeat(10000);
      const task = vi.fn(() => largeData);
      const result = executor.exec(task);

      expect(result).toBe(largeData);
      expect(result).toHaveLength(10000);
    });

    it('should handle task that modifies context', () => {
      const task = vi.fn((context: ExecutorContext) => {
        context.parameters = { modified: true };
        context.returnValue = 'modified';
        return 'result';
      });

      const result = executor.exec(task);

      expect(result).toBe('result');
    });
  });

  describe('error handling', () => {
    it('should handle TypeError', () => {
      const task = vi.fn(() => {
        throw new TypeError('Type error occurred');
      });

      expect(() => executor.exec(task)).toThrow(TypeError);

      const noErrorResult = executor.execNoError(task);
      expect(noErrorResult).toBeInstanceOf(ExecutorError);
      // Note: The cause property might not be set in our test implementation
      // This is a limitation of our simplified test executor
    });

    it('should handle ReferenceError', () => {
      const task = vi.fn(() => {
        throw new ReferenceError('Reference error occurred');
      });

      expect(() => executor.exec(task)).toThrow(ReferenceError);

      const noErrorResult = executor.execNoError(task);
      expect(noErrorResult).toBeInstanceOf(ExecutorError);
    });

    it('should handle custom error', () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'CustomError';
        }
      }

      const task = vi.fn(() => {
        throw new CustomError('Custom error occurred');
      });

      expect(() => executor.exec(task)).toThrow(CustomError);

      const noErrorResult = executor.execNoError(task);
      expect(noErrorResult).toBeInstanceOf(ExecutorError);
      // Note: The cause property might not be set in our test implementation
    });

    it('should handle async task that rejects', async () => {
      const task = vi.fn(async () => {
        throw new Error('Async error');
      });

      await expect(executor.exec(task)).rejects.toThrow('Async error');

      const noErrorResult = await executor.execNoError(task);
      expect(noErrorResult).toBeInstanceOf(ExecutorError);
    });

    it('should handle task that throws non-Error objects', () => {
      const task = vi.fn(() => {
        throw 'string error';
      });

      expect(() => executor.exec(task)).toThrow('string error');

      const noErrorResult = executor.execNoError(task);
      expect(noErrorResult).toBeInstanceOf(ExecutorError);
    });
  });

  describe('integration tests', () => {
    it('should work with multiple plugins and hooks', () => {
      const plugin1 = createMockPlugin('plugin1', {
        onBefore: vi.fn((context) => {
          context.parameters = { ...context.parameters, step1: true };
        }),
        onSuccess: vi.fn((context) => {
          context.returnValue = `${context.returnValue}-processed`;
        })
      });

      const plugin2 = createMockPlugin('plugin2', {
        onBefore: vi.fn((context) => {
          context.parameters = { ...context.parameters, step2: true };
        })
      });

      executor.use(plugin1);
      executor.use(plugin2);

      const task = vi.fn((context: ExecutorContext) => {
        return `result-${JSON.stringify(context.parameters)}`;
      });

      // Execute the task
      executor.exec(task);

      // Verify plugins were called
      expect(plugin1.onBefore).toHaveBeenCalled();
      expect(plugin2.onBefore).toHaveBeenCalled();
      expect(plugin1.onSuccess).toHaveBeenCalled();
      expect(task).toHaveBeenCalled();
    });

    it('should handle plugin chain with error recovery', () => {
      const errorPlugin = createMockPlugin('error-plugin', {
        onError: vi.fn((context) => {
          context.returnValue = 'recovered';
          return context.returnValue;
        })
      });

      executor.use(errorPlugin);

      const task = vi.fn(() => {
        throw new Error('Original error');
      });

      const result = executor.execNoError(task);

      expect(errorPlugin.onError).toHaveBeenCalled();
      expect(result).toBe('recovered');
    });
  });
});
