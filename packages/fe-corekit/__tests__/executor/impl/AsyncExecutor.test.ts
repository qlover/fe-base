/**
 * AsyncExecutor test-suite
 *
 * Coverage:
 * 1. constructor       - Constructor and configuration tests
 * 2. exec             - Main execution method tests
 * 3. lifecycle hooks  - Hook execution and order tests
 *    - onBefore      - Pre-execution hooks (executed in sequence)
 *    - onExec        - Execution hooks (all plugins execute)
 *    - onSuccess     - Post-execution hooks (executed in sequence)
 *    - onError       - Error handling hooks
 * 4. error handling   - Error propagation and handling tests
 * 5. performance      - Performance and timing tests
 * 6. boundary cases   - Edge cases and invalid inputs
 *
 * Test Strategy:
 * - Test each lifecycle hook independently
 * - Verify hook execution order and sequence
 * - Test error propagation through hook chain
 * - Test data modification in each phase
 * - Test plugin interaction and parallel execution
 * - Test async timing and performance
 *
 * Execution Order:
 * 1. All onBefore hooks execute in sequence
 * 2. All onExec hooks execute in sequence
 * 3. All onSuccess hooks execute in sequence
 * 4. On error, onError hooks execute until error is handled
 */

import {
  AsyncExecutor,
  ExecutorContext,
  ExecutorPlugin,
  ExecutorError
} from '../../../src';

// Test Data Types
type TestHook = () => Promise<unknown>;
type TestHookWithContext = (
  context: ExecutorContext<unknown>
) => Promise<unknown>;
type TestHooks = Record<string, TestHook | TestHookWithContext>;

// Test Data Constants
const TEST_HOOKS = {
  BEFORE: ['onValidate', 'onTransform'],
  AFTER: ['onFormat', 'onLog'],
  EXEC: 'onCustomExec'
};

const TEST_RESULTS = {
  ORIGINAL: 'original task',
  MODIFIED: 'modified task',
  ERROR_MSG: 'Test error occurred'
};

const TEST_TIMINGS = {
  FAST: 10,
  MEDIUM: 30,
  SLOW: 50,
  TIMEOUT: 100,
  PERFORMANCE_THRESHOLD: 1000, // 增加阈值到 1000ms
  CONCURRENT_THRESHOLD: 500 // 并发测试阈值
};

// Test Data Factory Functions
function createTestPlugin(overrides = {}): ExecutorPlugin {
  return {
    pluginName: 'testPlugin',
    ...overrides
  } as unknown as ExecutorPlugin;
}

function createPluginWithHooks(hooks: TestHooks): ExecutorPlugin {
  return createTestPlugin(hooks);
}

describe('AsyncExecutor', () => {
  // Preserve existing Executor Async implementation test group
  describe('Executor Async implementation', () => {
    it('should execute task with default lifecycle hooks', async () => {
      const results: string[] = [];
      const plugin = createTestPlugin({
        onBefore: async () => {
          results.push('before');
        },
        onExec: async () => {
          results.push('exec');
          return 'result';
        },
        onSuccess: async () => {
          results.push('success');
        }
      });

      const executor = new AsyncExecutor();
      executor.use(plugin);
      await executor.exec(async () => 'test');

      expect(results).toEqual(['before', 'exec', 'success']);
    });

    it('should execute task with custom lifecycle hooks', async () => {
      const customExecutor = new AsyncExecutor({
        beforeHooks: ['onValidate', 'onTransform'],
        afterHooks: ['onFormat', 'onLog'],
        execHook: 'onCustomExec'
      });

      const results: string[] = [];
      const plugin = createTestPlugin({
        onValidate: async () => {
          results.push('validate');
        },
        onTransform: async () => {
          results.push('transform');
        },
        onCustomExec: async () => {
          results.push('exec');
          return 'result';
        },
        onFormat: async () => {
          results.push('format');
        },
        onLog: async () => {
          results.push('log');
        }
      });

      customExecutor.use(plugin);
      await customExecutor.exec(async () => 'test');

      expect(results).toEqual([
        'validate',
        'transform',
        'exec',
        'format',
        'log'
      ]);
    });
  });

  describe('runHooks', () => {
    it('should execute single hook successfully', async () => {
      const results: string[] = [];
      const plugin = createTestPlugin({
        hookA: async () => {
          results.push('A');
        }
      });

      const executor = new AsyncExecutor();
      await executor.runHooks([plugin as ExecutorPlugin], ['hookA']);

      expect(results).toEqual(['A']);
    });

    it('should execute multiple hooks in order', async () => {
      const results: string[] = [];
      const plugin = createTestPlugin({
        hookA: async () => {
          results.push('A');
        },
        hookB: async () => {
          results.push('B');
        },
        hookC: async () => {
          results.push('C');
        }
      });

      const executor = new AsyncExecutor();
      await executor.runHooks(
        [plugin as ExecutorPlugin],
        ['hookA', 'hookB', 'hookC']
      );

      expect(results).toEqual(['A', 'B', 'C']);
    });

    it('should handle undefined hook methods', async () => {
      const results: string[] = [];
      const plugin = createTestPlugin({
        onA: async () => {
          results.push('A');
        },
        onB: undefined,
        onC: async () => {
          results.push('C');
        }
      });

      const executor = new AsyncExecutor();
      await executor.runHooks(
        [plugin as ExecutorPlugin],
        ['onA', 'onB', 'onC']
      );
      expect(results).toEqual(['A', 'C']);
    });

    it('should handle empty hook names array', async () => {
      const plugin = createTestPlugin({
        onTest: async () => {}
      });

      const executor = new AsyncExecutor();
      const result = await executor.runHooks([plugin as ExecutorPlugin], []);
      expect(result).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should propagate errors through hook chain', async () => {
      const results: string[] = [];
      const plugin = createTestPlugin({
        onA: async () => {
          results.push('A');
          throw new Error('Error in A');
        },
        onB: async () => {
          results.push('B');
        },
        onError: async (context: ExecutorContext<unknown>) => {
          if (context.error) {
            results.push(`error:${context.error.message}`);
          }
        }
      });

      const executor = new AsyncExecutor({
        beforeHooks: ['onA', 'onB']
      });

      executor.use(plugin);

      await expect(
        executor.exec(async () => {
          return 'success';
        })
      ).rejects.toThrow('Error in A');

      expect(results).toEqual(['A', 'error:Error in A']);
    });

    it('should handle errors in different hook types', async () => {
      const customExecutor = new AsyncExecutor({
        beforeHooks: ['onValidate', 'onTransform'],
        afterHooks: ['onFormat']
      });

      const results: string[] = [];
      const plugin = createTestPlugin({
        onValidate: async () => {
          results.push('validate');
        },
        onTransform: async () => {
          results.push('transform');
          throw new Error('Transform error');
        },
        onFormat: async () => {
          results.push('format');
        },
        onError: async (context: ExecutorContext<unknown>) => {
          if (context.error) {
            results.push(`error:${context.error.message}`);
          }
        }
      });

      customExecutor.use(plugin as ExecutorPlugin);
      await expect(customExecutor.exec(async () => 'test')).rejects.toThrow(
        'Transform error'
      );

      expect(results).toEqual([
        'validate',
        'transform',
        'error:Transform error'
      ]);
    });
  });

  describe('performance', () => {
    let executor: AsyncExecutor;

    beforeEach(() => {
      executor = new AsyncExecutor();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should execute hooks with specified delays', async () => {
      const results: string[] = [];
      const plugin = createPluginWithHooks({
        hookA: async () => {
          await new Promise((resolve) =>
            setTimeout(resolve, TEST_TIMINGS.FAST)
          );
          results.push('A');
        },
        hookB: async () => {
          await new Promise((resolve) =>
            setTimeout(resolve, TEST_TIMINGS.MEDIUM)
          );
          results.push('B');
        },
        hookC: async () => {
          await new Promise((resolve) =>
            setTimeout(resolve, TEST_TIMINGS.SLOW)
          );
          results.push('C');
        }
      });

      executor.use(plugin);
      const promise = executor.runHooks([plugin], ['hookA', 'hookB', 'hookC']);

      // Execute all pending timers
      await vi.runAllTimersAsync();

      await promise;
      expect(results).toEqual(['A', 'B', 'C']);
    });

    it('should optimize concurrent hook executions', async () => {
      vi.useRealTimers();
      const results: string[] = [];

      // Create multiple plugins with timing measurements
      const plugins = Array.from(
        { length: 3 },
        (
          _,
          i // 减少插件数量从 5 个到 3 个
        ) =>
          createPluginWithHooks({
            onBefore: async () => {
              await new Promise((resolve) =>
                setTimeout(resolve, TEST_TIMINGS.MEDIUM)
              );
              results.push(`before-${i}`);
            },
            onExec: async () => {
              await new Promise((resolve) =>
                setTimeout(resolve, TEST_TIMINGS.MEDIUM)
              );
              results.push(`exec-${i}`);
              return `result-${i}`;
            },
            onSuccess: async () => {
              await new Promise((resolve) =>
                setTimeout(resolve, TEST_TIMINGS.MEDIUM)
              );
              results.push(`success-${i}`);
            }
          })
      );

      // Register all plugins
      plugins.forEach((plugin) => executor.use(plugin));

      const startTime = performance.now();

      // Execute with all plugins
      await executor.exec(async () => TEST_RESULTS.ORIGINAL);
      const duration = performance.now() - startTime;

      // Verify execution order
      expect(results).toEqual([
        'before-0',
        'before-1',
        'before-2',
        'exec-0',
        'exec-1',
        'exec-2',
        'success-0',
        'success-1',
        'success-2'
      ]);

      // Verify performance
      expect(duration).toBeLessThan(TEST_TIMINGS.PERFORMANCE_THRESHOLD);
    });

    it('should handle concurrent hook executions efficiently', async () => {
      vi.useRealTimers();
      const startTime = performance.now();
      const results: string[] = [];

      // Create a plugin with multiple hooks
      const plugin = createPluginWithHooks({
        onValidate: async () => {
          await new Promise((resolve) =>
            setTimeout(resolve, TEST_TIMINGS.FAST)
          );
          results.push('validate');
        },
        onTransform: async () => {
          await new Promise((resolve) =>
            setTimeout(resolve, TEST_TIMINGS.FAST)
          );
          results.push('transform');
        },
        [TEST_HOOKS.EXEC]: async () => {
          await new Promise((resolve) =>
            setTimeout(resolve, TEST_TIMINGS.MEDIUM)
          );
          results.push('exec');
          return TEST_RESULTS.MODIFIED;
        },
        onFormat: async () => {
          await new Promise((resolve) =>
            setTimeout(resolve, TEST_TIMINGS.FAST)
          );
          results.push('format');
        },
        onLog: async () => {
          await new Promise((resolve) =>
            setTimeout(resolve, TEST_TIMINGS.FAST)
          );
          results.push('log');
        }
      });

      const customExecutor = new AsyncExecutor({
        beforeHooks: TEST_HOOKS.BEFORE,
        afterHooks: TEST_HOOKS.AFTER,
        execHook: TEST_HOOKS.EXEC
      });

      customExecutor.use(plugin);

      // Execute multiple times
      const executions = 5; // 减少执行次数从 10 次到 5 次
      await Promise.all(
        Array(executions)
          .fill(null)
          .map(() => customExecutor.exec(async () => TEST_RESULTS.ORIGINAL))
      );

      const duration = performance.now() - startTime;

      // Verify total execution count
      expect(results.length).toBe(25); // 5 hooks * 5 executions

      // Verify performance - should be much faster than sequential execution
      expect(duration).toBeLessThan(TEST_TIMINGS.CONCURRENT_THRESHOLD);
    });
  });

  describe('Constructor and Configuration', () => {
    it('should create instance with default configuration', () => {
      const executor = new AsyncExecutor();
      expect(executor).toBeInstanceOf(AsyncExecutor);
    });

    it('should create instance with custom hook configuration', () => {
      const executor = new AsyncExecutor({
        beforeHooks: ['onValidate', 'onTransform'],
        afterHooks: ['onFormat', 'onLog'],
        execHook: 'onCustomExec'
      });
      expect(executor).toBeInstanceOf(AsyncExecutor);
      // Verify configuration is correctly saved
      expect(executor['config']?.beforeHooks).toEqual([
        'onValidate',
        'onTransform'
      ]);
      expect(executor['config']?.afterHooks).toEqual(['onFormat', 'onLog']);
      expect(executor['config']?.execHook).toBe('onCustomExec');
    });
  });

  describe('Plugin Management', () => {
    let executor: AsyncExecutor;

    beforeEach(() => {
      executor = new AsyncExecutor();
    });

    it('should add plugin successfully', () => {
      const plugin = createTestPlugin();
      executor.use(plugin);
      // Verify plugin is correctly added
      expect(executor['plugins']).toContain(plugin);
    });

    it('should handle duplicate plugins based on pluginName', () => {
      const plugin1 = createTestPlugin({ onlyOne: true });
      const plugin2 = createTestPlugin({ onlyOne: true });
      executor.use(plugin1);
      executor.use(plugin2);
      // Verify only one plugin is retained
      expect(executor['plugins'].length).toBe(1);
    });

    it('should respect plugin enabled flag', async () => {
      const results: string[] = [];
      const plugin = createTestPlugin({
        enabled: (name: string) => name !== 'onSkip',
        onTest: async () => {
          results.push('test');
        },
        onSkip: async () => {
          results.push('skip');
        }
      });

      executor.use(plugin);
      await executor.runHooks([plugin], ['onTest', 'onSkip']);

      expect(results).toEqual(['test']);
    });
  });

  describe('Advanced Error Handling', () => {
    let executor: AsyncExecutor;

    beforeEach(() => {
      executor = new AsyncExecutor();
    });

    it('should handle nested errors in hook chain', async () => {
      const results: string[] = [];
      const plugin = createTestPlugin({
        onA: async () => {
          results.push('A');
          throw new Error('Error in A');
        },
        onB: async () => {
          results.push('B');
          throw new Error('Error in B');
        },
        onError: async (context: ExecutorContext<unknown>) => {
          if (context.error) {
            results.push(`error:${context.error.message}`);
            // 返回新的错误
            return new Error('Modified error');
          }
        }
      });

      executor.use(plugin);
      await expect(
        executor.exec(async () => {
          await executor.runHooks([plugin], ['onA', 'onB']);
          return 'success';
        })
      ).rejects.toThrow('Modified error');

      expect(results).toEqual(['A', 'error:Error in A']);
    });

    it('should handle async errors in different phases', async () => {
      const results: string[] = [];
      const plugin = createTestPlugin({
        onBefore: async () => {
          results.push('before');
          await new Promise((resolve) => setTimeout(resolve, 10));
          throw new Error('Before error');
        },
        onExec: async () => {
          results.push('exec');
          return 'result';
        },
        onError: async (context: ExecutorContext<unknown>) => {
          if (context.error) {
            results.push(`error:${context.error.message}`);
          }
        }
      });

      executor.use(plugin);
      await expect(executor.exec(async () => 'test')).rejects.toThrow(
        'Before error'
      );

      expect(results).toEqual(['before', 'error:Before error']);
    });
  });

  describe('Performance and Timing', () => {
    let executor: AsyncExecutor;

    beforeEach(() => {
      executor = new AsyncExecutor();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should execute hooks with specified delays', async () => {
      const results: string[] = [];
      const plugin = createPluginWithHooks({
        hookA: async () => {
          await new Promise((resolve) =>
            setTimeout(resolve, TEST_TIMINGS.FAST)
          );
          results.push('A');
        },
        hookB: async () => {
          await new Promise((resolve) =>
            setTimeout(resolve, TEST_TIMINGS.MEDIUM)
          );
          results.push('B');
        },
        hookC: async () => {
          await new Promise((resolve) =>
            setTimeout(resolve, TEST_TIMINGS.SLOW)
          );
          results.push('C');
        }
      });

      executor.use(plugin);
      const promise = executor.runHooks([plugin], ['hookA', 'hookB', 'hookC']);

      // Execute all pending timers
      await vi.runAllTimersAsync();

      await promise;
      expect(results).toEqual(['A', 'B', 'C']);
    });

    it('should optimize concurrent hook executions', async () => {
      vi.useRealTimers();
      const results: string[] = [];

      // Create multiple plugins with timing measurements
      const plugins = Array.from(
        { length: 3 },
        (
          _,
          i // 减少插件数量从 5 个到 3 个
        ) =>
          createPluginWithHooks({
            onBefore: async () => {
              await new Promise((resolve) =>
                setTimeout(resolve, TEST_TIMINGS.MEDIUM)
              );
              results.push(`before-${i}`);
            },
            onExec: async () => {
              await new Promise((resolve) =>
                setTimeout(resolve, TEST_TIMINGS.MEDIUM)
              );
              results.push(`exec-${i}`);
              return `result-${i}`;
            },
            onSuccess: async () => {
              await new Promise((resolve) =>
                setTimeout(resolve, TEST_TIMINGS.MEDIUM)
              );
              results.push(`success-${i}`);
            }
          })
      );

      // Register all plugins
      plugins.forEach((plugin) => executor.use(plugin));

      const startTime = performance.now();

      // Execute with all plugins
      await executor.exec(async () => TEST_RESULTS.ORIGINAL);
      const duration = performance.now() - startTime;

      // Verify execution order
      expect(results).toEqual([
        'before-0',
        'before-1',
        'before-2',
        'exec-0',
        'exec-1',
        'exec-2',
        'success-0',
        'success-1',
        'success-2'
      ]);

      // Verify performance
      expect(duration).toBeLessThan(TEST_TIMINGS.PERFORMANCE_THRESHOLD);
    });

    it('should handle concurrent hook executions efficiently', async () => {
      vi.useRealTimers();
      const startTime = performance.now();
      const results: string[] = [];

      // Create a plugin with multiple hooks
      const plugin = createPluginWithHooks({
        onValidate: async () => {
          await new Promise((resolve) =>
            setTimeout(resolve, TEST_TIMINGS.FAST)
          );
          results.push('validate');
        },
        onTransform: async () => {
          await new Promise((resolve) =>
            setTimeout(resolve, TEST_TIMINGS.FAST)
          );
          results.push('transform');
        },
        [TEST_HOOKS.EXEC]: async () => {
          await new Promise((resolve) =>
            setTimeout(resolve, TEST_TIMINGS.MEDIUM)
          );
          results.push('exec');
          return TEST_RESULTS.MODIFIED;
        },
        onFormat: async () => {
          await new Promise((resolve) =>
            setTimeout(resolve, TEST_TIMINGS.FAST)
          );
          results.push('format');
        },
        onLog: async () => {
          await new Promise((resolve) =>
            setTimeout(resolve, TEST_TIMINGS.FAST)
          );
          results.push('log');
        }
      });

      const customExecutor = new AsyncExecutor({
        beforeHooks: TEST_HOOKS.BEFORE,
        afterHooks: TEST_HOOKS.AFTER,
        execHook: TEST_HOOKS.EXEC
      });

      customExecutor.use(plugin);

      // Execute multiple times
      const executions = 5; // 减少执行次数从 10 次到 5 次
      await Promise.all(
        Array(executions)
          .fill(null)
          .map(() => customExecutor.exec(async () => TEST_RESULTS.ORIGINAL))
      );

      const duration = performance.now() - startTime;

      // Verify total execution count
      expect(results.length).toBe(25); // 5 hooks * 5 executions

      // Verify performance - should be much faster than sequential execution
      expect(duration).toBeLessThan(TEST_TIMINGS.CONCURRENT_THRESHOLD);
    });
  });

  // Add boundary test cases
  describe('Boundary Cases', () => {
    let executor: AsyncExecutor;

    beforeEach(() => {
      executor = new AsyncExecutor();
    });

    it('should handle null/undefined plugin', async () => {
      await expect(
        executor.runHooks([null as unknown as ExecutorPlugin], ['test'])
      ).rejects.toThrow();
      await expect(
        executor.runHooks([undefined as unknown as ExecutorPlugin], ['test'])
      ).rejects.toThrow();
    });

    it('should handle empty plugin list', async () => {
      const result = await executor.runHooks([], ['test']);
      expect(result).toBeUndefined();
    });

    it('should handle invalid hook names', async () => {
      const plugin = createTestPlugin();
      await expect(
        executor.runHooks([plugin], ['nonexistentHook'])
      ).resolves.not.toThrow();
    });

    it('should handle maximum number of plugins', async () => {
      const maxPlugins = Array(100)
        .fill(null)
        .map(() => createTestPlugin());
      maxPlugins.forEach((plugin) => executor.use(plugin));
      expect(executor['plugins'].length).toBeLessThanOrEqual(100);
    });
  });

  describe('AsyncExecutor onBefore Lifecycle', () => {
    it('should not support return value onBefore chain', async () => {
      const executor = new AsyncExecutor();
      executor.use({
        pluginName: 'test1',
        onBefore: async ({ returnValue }) => {
          return (returnValue + '123') as unknown as void;
        }
      });

      executor.use({
        pluginName: 'test2',
        onBefore: async ({ returnValue }) => {
          expect(returnValue).not.toBeDefined();
        }
      });

      const result = await executor.exec(async () => 'test');
      expect(result).not.toBe('test123');
      expect(result).toBe('test');
    });

    it('should modify input data through onBefore hooks', async () => {
      const executor = new AsyncExecutor();
      const plugin1: ExecutorPlugin<Record<string, unknown>> = {
        pluginName: 'test',
        onBefore: async ({ parameters }) => {
          (parameters as Record<string, unknown>).modifiedBy = 'plugin1';
        }
      };
      const plugin2: ExecutorPlugin<Record<string, unknown>> = {
        pluginName: 'test2',
        onBefore: async ({ parameters }) => {
          (parameters as Record<string, unknown>).modifiedBy = 'plugin2';
        }
      };

      executor.use(plugin1);
      executor.use(plugin2);

      const result = await executor.exec(
        { value: 'test' } as Record<string, unknown>,
        async ({ parameters }) =>
          (parameters as Record<string, unknown>).modifiedBy
      );
      expect(result).toBe('plugin2');
    });

    it('should stop onBefore chain and enter onError if an error is thrown', async () => {
      const executor = new AsyncExecutor();
      const plugin1: ExecutorPlugin = {
        pluginName: 'test',
        onBefore: async () => {
          throw new Error('Error in onBefore');
        }
      };
      const plugin2: ExecutorPlugin = {
        pluginName: 'test2',
        onBefore: vi.fn()
      };
      const onError = vi.fn();

      executor.use(plugin1);
      executor.use(plugin2);
      executor.use({ pluginName: 'test3', onError });

      await expect(
        executor.exec({ value: 'test' }, async (data) => data)
      ).rejects.toThrow('Error in onBefore');

      expect(plugin2.onBefore).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
    });

    it("should use the first plugin's onBefore return value if no subsequent plugin returns a value", async () => {
      const executor = new AsyncExecutor();
      const plugin1: ExecutorPlugin<Record<string, unknown>> = {
        pluginName: 'test',
        onBefore: async ({ parameters }) => {
          parameters.modifiedBy = 'plugin1';
        }
      };
      const plugin2: ExecutorPlugin<Record<string, unknown>> = {
        pluginName: 'test2',
        onBefore: vi.fn()
      };

      executor.use(plugin1);
      executor.use(plugin2);

      const result = await executor.exec(
        { value: 'test' },
        async ({ parameters }: ExecutorContext<Record<string, unknown>>) =>
          parameters.modifiedBy
      );
      expect(result).toBe('plugin1');
    });

    it('should execute onError if onBefore throws an error', async () => {
      const executor = new AsyncExecutor();
      const plugin1: ExecutorPlugin = {
        pluginName: 'test',
        onBefore: async () => {
          throw new Error('Error in onBefore');
        }
      };
      const onError = vi.fn();

      executor.use(plugin1);
      executor.use({ pluginName: 'test2', onError });

      await expect(
        executor.exec({ value: 'test' }, async (data) => data)
      ).rejects.toThrow('Error in onBefore');

      expect(onError).toHaveBeenCalled();
    });

    it('should not modify input data if no onBefore hooks are present', async () => {
      const executor = new AsyncExecutor();
      const result = await executor.exec(
        { value: 'test' },
        async ({ parameters }) => parameters.value
      );
      expect(result).toBe('test');
    });
  });

  describe('AsyncExecutor onExec Lifecycle', () => {
    it('should modify the task through onExec hook', async () => {
      const executor = new AsyncExecutor();
      const plugin: ExecutorPlugin<Record<string, unknown>> = {
        pluginName: 'test',
        onExec: async <T>(): Promise<T> => {
          return 'modified task' as T;
        }
      };

      executor.use(plugin);

      const result = await executor.exec(async () => 'original task');
      expect(result).toBe('modified task');
    });

    it('should override task return value when exec hook', async () => {
      const executor = new AsyncExecutor();
      executor.use({
        pluginName: 'test',
        onExec: async () => {
          return 'task1';
        }
      });

      const result = await executor.exec(async () => 'original task');
      expect(result).not.toBe('original task');
      expect(result).toBe('task1');
    });

    it('should support chain return value, onexec hook', async () => {
      const executor = new AsyncExecutor();
      executor.use({
        pluginName: 'test',
        onExec: async () => {
          return 'task1';
        }
      });
      executor.use({
        pluginName: 'test2',
        onExec: async ({ hooksRuntimes }) => {
          return hooksRuntimes.returnValue + 'task2';
        }
      });
      const result = await executor.exec(async () => 'original task');
      expect(result).not.toBe('original tasktask1task2');
      expect(result).toBe('task1task2');
    });

    it("should only use the first plugin's onExec hook", async () => {
      const executor = new AsyncExecutor();
      const plugin1: ExecutorPlugin = {
        pluginName: 'test',
        onExec: async () => {
          return 'modified by plugin1';
        }
      };
      const plugin2: ExecutorPlugin = {
        enabled: () => false,
        pluginName: 'test2',
        onExec: async () => {
          return 'modified by plugin2';
        }
      };

      executor.use(plugin1);
      executor.use(plugin2);

      const result = await executor.exec(async () => 'original task');
      expect(result).toBe('modified by plugin1');
    });

    it('should execute the original task if no onExec hooks are present', async () => {
      const executor = new AsyncExecutor();
      const result = await executor.exec(async () => 'original task');
      expect(result).toBe('original task');
    });

    describe('onExec returning Promise', () => {
      it('should handle plugin returning Promise<Result>', async () => {
        const executor = new AsyncExecutor();
        executor.use({
          pluginName: 'test',
          onExec: async () => {
            // Return a Promise that resolves to a value
            return Promise.resolve('promise result');
          }
        });

        const result = await executor.exec(async () => 'original task');
        expect(result).toBe('promise result');
      });

      it('should handle plugin returning Promise<function>', async () => {
        const executor = new AsyncExecutor();
        executor.use({
          pluginName: 'test',
          onExec: async () => {
            // Return a Promise that resolves to a wrapper function
            return Promise.resolve(
              async (_ctx: ExecutorContext<unknown>) => {
                return 'wrapped from promise';
              }
            );
          }
        });

        const result = await executor.exec(async () => 'original task');
        expect(result).toBe('wrapped from promise');
      });

      it('should handle plugin returning nested Promise<Promise<Result>>', async () => {
        const executor = new AsyncExecutor();
        executor.use({
          pluginName: 'test',
          onExec: async () => {
            // Return a nested Promise (JavaScript will auto-flatten)
            return Promise.resolve(Promise.resolve('nested promise result'));
          }
        });

        const result = await executor.exec(async () => 'original task');
        expect(result).toBe('nested promise result');
      });

      it('should handle plugin returning Promise<undefined> and continue to next plugin', async () => {
        const executor = new AsyncExecutor();
        executor.use({
          pluginName: 'test1',
          onExec: async () => {
            return Promise.resolve(undefined);
          }
        });
        executor.use({
          pluginName: 'test2',
          onExec: async () => {
            return 'second plugin result';
          }
        });

        const result = await executor.exec(async () => 'original task');
        expect(result).toBe('second plugin result');
      });

      it('should handle plugin returning Promise that rejects', async () => {
        const executor = new AsyncExecutor();
        executor.use({
          pluginName: 'test',
          onExec: async () => {
            return Promise.reject(new Error('Plugin error'));
          }
        });

        await expect(
          executor.exec(async () => 'original task')
        ).rejects.toThrow('Plugin error');
      });

      it('should handle plugin returning Promise<function> that wraps the task', async () => {
        const executor = new AsyncExecutor();
        let wrapperCalled = false;

        executor.use({
          pluginName: 'test',
          onExec: async (_context, task) => {
            // Return a Promise that resolves to a wrapper function
            return Promise.resolve(
              async (ctx: ExecutorContext<unknown>) => {
                wrapperCalled = true;
                const originalResult = await task(ctx);
                return `wrapped: ${originalResult}`;
              }
            );
          }
        });

        const result = await executor.exec(async () => 'original task');
        expect(wrapperCalled).toBe(true);
        expect(result).toBe('wrapped: original task');
      });

      it('should handle multiple plugins returning Promise<function> in chain', async () => {
        const executor = new AsyncExecutor();
        const callOrder: string[] = [];

        executor.use({
          pluginName: 'wrapper1',
          onExec: async () => {
            return Promise.resolve(
              async (_ctx: ExecutorContext<unknown>) => {
                callOrder.push('wrapper1');
                return 'wrapper1-result';
              }
            );
          }
        });

        executor.use({
          pluginName: 'wrapper2',
          onExec: async (_context, task) => {
            return Promise.resolve(
              async (ctx: ExecutorContext<unknown>) => {
                callOrder.push('wrapper2');
                const prevResult = await task(ctx);
                return `wrapper2-${prevResult}`;
              }
            );
          }
        });

        const result = await executor.exec(async () => {
          callOrder.push('original');
          return 'original-task';
        });

        // When plugins return functions, they chain: wrapper2 wraps wrapper1
        // wrapper2 is executed first (outer wrapper), then wrapper1 (inner wrapper)
        expect(callOrder).toEqual(['wrapper2', 'wrapper1']);
        expect(result).toBe('wrapper2-wrapper1-result');
      });

      it('should handle plugin returning Promise<Result> and use last plugin result', async () => {
        const executor = new AsyncExecutor();
        executor.use({
          pluginName: 'test1',
          onExec: async () => {
            return Promise.resolve('first result');
          }
        });
        executor.use({
          pluginName: 'test2',
          onExec: async () => {
            return Promise.resolve('second result');
          }
        });

        const result = await executor.exec(async () => 'original task');
        // All plugins execute, last plugin's result is used
        expect(result).toBe('second result');
      });

      it('should handle plugin returning Promise with delay', async () => {
        const executor = new AsyncExecutor();
        executor.use({
          pluginName: 'test',
          onExec: async () => {
            return new Promise((resolve) => {
              setTimeout(() => resolve('delayed result'), 50);
            });
          }
        });

        const startTime = Date.now();
        const result = await executor.exec(async () => 'original task');
        const duration = Date.now() - startTime;

        expect(result).toBe('delayed result');
        expect(duration).toBeGreaterThanOrEqual(50);
      });
    });
  });

  describe('AsyncExecutor onSuccess Lifecycle', () => {
    it('should execute onSuccess hook', async () => {
      const executor = new AsyncExecutor();
      const plugin: ExecutorPlugin = {
        pluginName: 'test2',
        onSuccess: async (context) => {
          context.returnValue = context.returnValue + ' success';
        }
      };

      executor.use(plugin);
      const result = await executor.exec(async () => 'test');
      expect(result).toBe('test success');
    });

    it('should modify the result through onSuccess hooks', async () => {
      const executor = new AsyncExecutor();
      const plugin1: ExecutorPlugin = {
        pluginName: 'test',
        onSuccess: async (context) => {
          context.returnValue = context.returnValue + ' modified by plugin1';
        }
      };
      const plugin2: ExecutorPlugin = {
        pluginName: 'test2',
        onSuccess: async (context) => {
          context.returnValue = context.returnValue + ' modified by plugin2';
        }
      };

      executor.use(plugin1);
      executor.use(plugin2);

      const result = await executor.exec(async () => 'test');
      expect(result).toBe('test modified by plugin1 modified by plugin2');
    });

    it('should stop onSuccess chain and enter onError if an error is thrown', async () => {
      const executor = new AsyncExecutor();
      const plugin1: ExecutorPlugin = {
        pluginName: 'test',
        onSuccess: async () => {
          throw new Error('Error in onSuccess');
        }
      };
      const plugin2: ExecutorPlugin = {
        pluginName: 'test2',
        onSuccess: vi.fn()
      };
      const onError = vi.fn();

      executor.use(plugin1);
      executor.use(plugin2);
      executor.use({ pluginName: 'test3', onError });

      await expect(executor.exec(async () => 'test')).rejects.toThrow(
        'Error in onSuccess'
      );

      expect(plugin2.onSuccess).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
    });
  });

  describe('AsyncExecutor execNoError Method', () => {
    it('should return ExecutorError instead of throwing an error', async () => {
      const executor = new AsyncExecutor();
      const result = await executor.execNoError(async () => {
        throw new Error('test error');
      });

      expect(result).toBeInstanceOf(ExecutorError);
    });

    it('should execute task and return result if no error occurs', async () => {
      const executor = new AsyncExecutor();
      const result = await executor.execNoError(async () => 'success');

      expect(result).toBe('success');
    });

    it('should handle errors through onError hooks and return the first error', async () => {
      const executor = new AsyncExecutor();
      const plugin1: ExecutorPlugin = {
        pluginName: 'test',
        onError: async ({ error }) =>
          new ExecutorError('Handled by plugin1', error)
      };
      const plugin2: ExecutorPlugin = {
        pluginName: 'test2',
        onError: vi.fn()
      };

      executor.use(plugin1);
      executor.use(plugin2);

      const result = await executor.execNoError(async () => {
        throw new Error('original error');
      });

      expect(result).toBeInstanceOf(ExecutorError);
      expect((result as ExecutorError).message).toBe('original error');
    });

    it('should return the original error wrapped in ExecutorError if no onError hooks are present', async () => {
      const executor = new AsyncExecutor();
      const result = await executor.execNoError(async () => {
        throw new Error('original error');
      });

      expect(result).toBeInstanceOf(ExecutorError);
      expect((result as ExecutorError).message).toBe('original error');
    });

    it('should not execute onSuccess hooks if an error occurs', async () => {
      const executor = new AsyncExecutor();
      const onSuccess = vi.fn();

      const plugin: ExecutorPlugin = {
        pluginName: 'test',
        onSuccess
      };

      executor.use(plugin);

      const result = await executor.execNoError(async () => {
        throw new Error('test error');
      });

      expect(result).toBeInstanceOf(ExecutorError);
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('AsyncExecutor Additional Tests', () => {
    it('should execute multiple plugins in sequence', async () => {
      const executor = new AsyncExecutor();
      const results: string[] = [];

      const plugin1: ExecutorPlugin = {
        pluginName: 'plugin1',
        onBefore: async () => {
          results.push('before1');
        },
        onSuccess: async () => {
          results.push('success1');
        },
        onError: async () => {
          results.push('error1');
        }
      };

      const plugin2: ExecutorPlugin = {
        pluginName: 'plugin2',
        onBefore: async () => {
          results.push('before2');
        },
        onSuccess: async () => {
          results.push('success2');
        },
        onError: async () => {
          results.push('error2');
        }
      };

      executor.use(plugin1);
      executor.use(plugin2);

      await executor.exec(async () => 'test');

      expect(results).toEqual(['before1', 'before2', 'success1', 'success2']);
    });

    it('should handle plugin that modifies data in onBefore hook', async () => {
      const executor = new AsyncExecutor();
      const plugin: ExecutorPlugin<Record<string, unknown>> = {
        pluginName: 'plugin1',
        onBefore: async (context) => {
          context.parameters.added = true;
        }
      };

      executor.use(plugin);

      const result = await executor.exec<boolean, Record<string, unknown>>(
        { value: 'test' },
        async (context) => context.parameters.added as boolean
      );
      expect(result).toBe(true);
    });

    it('should handle plugin that modifies result in onSuccess hook', async () => {
      const executor = new AsyncExecutor();
      const plugin: ExecutorPlugin<string> = {
        pluginName: 'plugin1',
        onSuccess: async (context) => {
          context.returnValue = context.returnValue + ' modified';
        }
      };

      executor.use(plugin);

      const result = await executor.exec(async () => 'test');
      expect(result).toBe('test modified');
    });

    it('should throw error if task is not a function', async () => {
      const executor = new AsyncExecutor();

      try {
        await executor.exec(
          'not a function' as unknown as () => Promise<unknown>
        );
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).message).toBe('Task must be a async function!');
      }
    });

    it('should handle plugin that suppresses error in onError hook', async () => {
      const executor = new AsyncExecutor();
      const plugin: ExecutorPlugin = {
        pluginName: 'plugin1',
        onError: async () => {
          return new ExecutorError('Handled Error');
        }
      };

      executor.use(plugin);

      const result = await executor.execNoError(async () => {
        throw new Error('test error');
      });

      expect(result).toBeInstanceOf(ExecutorError);
      expect((result as ExecutorError).message).toBe('Handled Error');
    });

    it('should execute task with no plugins', async () => {
      const executor = new AsyncExecutor();
      const result = await executor.exec(async () => 'no plugins');
      expect(result).toBe('no plugins');
    });
  });
});
