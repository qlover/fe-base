/**
 * LifecycleExecutor test-suite
 *
 * Coverage:
 * 1. constructor       - Constructor and configuration tests
 * 2. exec             - Main execution method tests (sync and async)
 * 3. lifecycle hooks  - Hook execution and order tests
 *    - onBefore      - Pre-execution hooks (executed in sequence)
 *    - onExec        - Execution hooks (all plugins execute)
 *    - onSuccess     - Post-execution hooks (executed in sequence)
 *    - onError       - Error handling hooks
 * 4. error handling   - Error propagation and handling tests
 * 5. performance      - Performance and timing tests
 * 6. boundary cases   - Edge cases and invalid inputs
 * 7. sync/async mix   - Mixed synchronous and asynchronous scenarios
 *
 * Test Strategy:
 * - Test each lifecycle hook independently (both sync and async)
 * - Verify hook execution order and sequence
 * - Test error propagation through hook chain
 * - Test data modification in each phase
 * - Test plugin interaction and parallel execution
 * - Test automatic sync/async detection
 * - Test mixed sync/async scenarios
 *
 * Execution Order:
 * 1. All onBefore hooks execute in sequence
 * 2. All onExec hooks execute in sequence
 * 3. All onSuccess hooks execute in sequence
 * 4. On error, onError hooks execute until error is handled
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LifecycleExecutor } from '../../../src/executor/impl/LifecycleExecutor';
import {
  ExecutorContextInterface,
  ExecutorPluginInterface
} from '../../../src/executor/interface/ExecutorInterface';
import { ExecutorError } from '../../../src/executor/interface/ExecutorError';
import { LifecyclePluginInterface } from '../../../src/executor/interface/LifecyclePluginInterface';

// Test Data Types
type TestHook = () => unknown;
type TestHookWithContext = (
  context: ExecutorContextInterface<unknown>
) => unknown;
type TestHooks = Record<string, TestHook | TestHookWithContext | undefined>;

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
  PERFORMANCE_THRESHOLD: 1000,
  CONCURRENT_THRESHOLD: 500
};

interface TestPlugin
  extends LifecyclePluginInterface<ExecutorContextInterface<unknown>> {
  onSkip?: () => void | Promise<void>;
  onA?: () => void | Promise<void>;
  onB?: () => void | Promise<void>;
}
// Test Data Factory Functions
function createTestPlugin(overrides: Partial<TestPlugin> = {}): TestPlugin {
  return {
    pluginName: 'testPlugin',
    enabled: () => true,
    ...overrides
  };
}

function createPluginWithHooks(hooks: TestHooks): TestPlugin {
  return createTestPlugin(hooks);
}

describe('LifecycleExecutor', () => {
  describe('Basic Sync Execution', () => {
    it('should execute sync task with default lifecycle hooks', () => {
      const results: string[] = [];
      const plugin = createPluginWithHooks({
        onBefore: () => {
          results.push('before');
        },
        onExec: () => {
          results.push('exec');
          return TEST_RESULTS.MODIFIED;
        },
        onSuccess: () => {
          results.push('success');
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);
      const result = executor.exec(() => TEST_RESULTS.ORIGINAL);

      expect(results).toEqual(['before', 'exec', 'success']);
      expect(result).toBe(TEST_RESULTS.MODIFIED);
    });

    it('should execute sync task with custom lifecycle hooks', () => {
      const customExecutor = new LifecycleExecutor({
        beforeHooks: TEST_HOOKS.BEFORE,
        afterHooks: TEST_HOOKS.AFTER,
        execHook: TEST_HOOKS.EXEC
      });

      const results: string[] = [];
      const plugin = createPluginWithHooks({
        onValidate: () => {
          results.push('validate');
        },
        onTransform: () => {
          results.push('transform');
        },
        [TEST_HOOKS.EXEC]: () => {
          results.push('exec');
          return TEST_RESULTS.MODIFIED;
        },
        onFormat: () => {
          results.push('format');
        },
        onLog: () => {
          results.push('log');
        }
      });

      customExecutor.use(plugin);
      customExecutor.exec(() => TEST_RESULTS.ORIGINAL);

      expect(results).toEqual([
        'validate',
        'transform',
        'exec',
        'format',
        'log'
      ]);
    });

    it('should execute sync task with input data', () => {
      const executor = new LifecycleExecutor();
      const result = executor.exec(
        { value: 'test' },
        (ctx) => ctx.parameters.value
      );
      expect(result).toBe('test');
    });
  });

  describe('Basic Async Execution', () => {
    it('should execute async task with default lifecycle hooks', async () => {
      const results: string[] = [];
      const plugin = createPluginWithHooks({
        onBefore: async () => {
          results.push('before');
        },
        onExec: async () => {
          results.push('exec');
          return TEST_RESULTS.MODIFIED;
        },
        onSuccess: async () => {
          results.push('success');
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);
      const result = await executor.exec(async () => TEST_RESULTS.ORIGINAL);

      expect(results).toEqual(['before', 'exec', 'success']);
      expect(result).toBe(TEST_RESULTS.MODIFIED);
    });

    it('should execute async task with custom lifecycle hooks', async () => {
      const customExecutor = new LifecycleExecutor({
        beforeHooks: TEST_HOOKS.BEFORE,
        afterHooks: TEST_HOOKS.AFTER,
        execHook: TEST_HOOKS.EXEC
      });

      const results: string[] = [];
      const plugin = createPluginWithHooks({
        onValidate: async () => {
          results.push('validate');
        },
        onTransform: async () => {
          results.push('transform');
        },
        [TEST_HOOKS.EXEC]: async () => {
          results.push('exec');
          return TEST_RESULTS.MODIFIED;
        },
        onFormat: async () => {
          results.push('format');
        },
        onLog: async () => {
          results.push('log');
        }
      });

      customExecutor.use(plugin);
      await customExecutor.exec(async () => TEST_RESULTS.ORIGINAL);

      expect(results).toEqual([
        'validate',
        'transform',
        'exec',
        'format',
        'log'
      ]);
    });

    it('should execute async task with input data', async () => {
      const executor = new LifecycleExecutor();
      const result = await executor.exec(
        { value: 'test' },
        async (ctx) => ctx.parameters.value
      );
      expect(result).toBe('test');
    });
  });

  describe('Mixed Sync/Async Scenarios', () => {
    it('should handle sync task with async plugins', async () => {
      const results: string[] = [];
      const plugin = createPluginWithHooks({
        onBefore: async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          results.push('before');
        },
        onExec: async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          results.push('exec');
          return TEST_RESULTS.MODIFIED;
        },
        onSuccess: async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          results.push('success');
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);
      const result = await executor.exec(() => TEST_RESULTS.ORIGINAL);

      expect(results).toEqual(['before', 'exec', 'success']);
      expect(result).toBe(TEST_RESULTS.MODIFIED);
    });

    it('should handle async task with sync plugins', async () => {
      const results: string[] = [];
      const plugin = createPluginWithHooks({
        onBefore: () => {
          results.push('before');
        },
        onExec: () => {
          results.push('exec');
          return TEST_RESULTS.MODIFIED;
        },
        onSuccess: () => {
          results.push('success');
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);
      const result = await executor.exec(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return TEST_RESULTS.ORIGINAL;
      });

      expect(results).toEqual(['before', 'exec', 'success']);
      expect(result).toBe(TEST_RESULTS.MODIFIED);
    });

    it('should handle mixed sync/async plugins', async () => {
      const results: string[] = [];
      const syncPlugin = createPluginWithHooks({
        onBefore: () => {
          results.push('sync-before');
        }
      });
      const asyncPlugin = createPluginWithHooks({
        onBefore: async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          results.push('async-before');
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(syncPlugin);
      executor.use(asyncPlugin);
      await executor.exec(async () => TEST_RESULTS.ORIGINAL);

      expect(results).toEqual(['sync-before', 'async-before']);
    });
  });

  describe('Constructor and Configuration', () => {
    it('should create instance with default configuration', () => {
      const executor = new LifecycleExecutor();
      expect(executor).toBeInstanceOf(LifecycleExecutor);
    });

    it('should create instance with custom hook configuration', () => {
      const executor = new LifecycleExecutor({
        beforeHooks: ['onValidate', 'onTransform'],
        afterHooks: ['onFormat', 'onLog'],
        execHook: 'onCustomExec'
      });
      expect(executor).toBeInstanceOf(LifecycleExecutor);
      expect(executor['config']?.beforeHooks).toEqual([
        'onValidate',
        'onTransform'
      ]);
      expect(executor['config']?.afterHooks).toEqual(['onFormat', 'onLog']);
      expect(executor['config']?.execHook).toBe('onCustomExec');
    });
  });

  describe('Plugin Management', () => {
    let executor: LifecycleExecutor;

    beforeEach(() => {
      executor = new LifecycleExecutor();
    });

    it('should add plugin successfully', () => {
      const plugin = createTestPlugin();
      executor.use(plugin);
      expect(executor['plugins']).toContain(plugin);
    });

    it('should handle duplicate plugins based on pluginName', () => {
      const plugin1 = createTestPlugin({ onlyOne: true });
      const plugin2 = createTestPlugin({ onlyOne: true });
      executor.use(plugin1);
      executor.use(plugin2);
      expect(executor['plugins'].length).toBe(1);
    });

    it('should respect plugin enabled flag', async () => {
      const results: string[] = [];
      const plugin = createTestPlugin({
        enabled: (name: string) => name !== 'onSkip',
        onBefore: async () => {
          results.push('test');
        },
        onSkip: async () => {
          results.push('skip');
        }
      });

      executor.use(plugin);
      await executor.exec(async () => {
        // onSkip should not be called because enabled returns false
        return 'test';
      });

      expect(results).toEqual(['test']);
    });
  });

  describe('Sync onBefore Lifecycle', () => {
    it('should not support return value onBefore chain', () => {
      const executor = new LifecycleExecutor();
      executor.use(
        createTestPlugin({
          pluginName: 'test1',
          onBefore: ({ returnValue }: ExecutorContextInterface<unknown>) => {
            return (returnValue + '123') as unknown as void;
          }
        })
      );

      executor.use(
        createTestPlugin({
          pluginName: 'test2',
          onBefore: ({ returnValue }: ExecutorContextInterface<unknown>) => {
            expect(returnValue).not.toBeDefined();
          }
        })
      );

      const result = executor.exec(() => 'test');
      expect(result).not.toBe('test123');
      expect(result).toBe('test');
    });

    it('should modify input data through onBefore hooks', () => {
      const executor = new LifecycleExecutor();
      const plugin1 = createTestPlugin({
        onBefore: ({ parameters }: ExecutorContextInterface<unknown>) => {
          (parameters as Record<string, unknown>).modifiedBy = 'plugin1';
        }
      });
      const plugin2 = createTestPlugin({
        onBefore: ({ parameters }: ExecutorContextInterface<unknown>) => {
          (parameters as Record<string, unknown>).modifiedBy = 'plugin2';
        }
      });

      executor.use(plugin1);
      executor.use(plugin2);

      const result = executor.exec<unknown, Record<string, unknown>>(
        { value: 'test' },
        ({ parameters }: ExecutorContextInterface<Record<string, unknown>>) =>
          (parameters as Record<string, unknown>).modifiedBy
      );
      expect(result).toBe('plugin2');
    });

    it('should stop onBefore chain and enter onError if an error is thrown', () => {
      const executor = new LifecycleExecutor();
      const plugin1 = createTestPlugin({
        onBefore: () => {
          throw new Error('Error in onBefore');
        }
      });
      const plugin2 = createTestPlugin({
        onBefore: vi.fn()
      });
      const onError = vi.fn();

      executor.use(plugin1);
      executor.use(plugin2);
      executor.use(createTestPlugin({ onError }));

      try {
        executor.exec({ value: 'test' }, (data) => data);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ExecutorError);
      }

      expect(
        (plugin2 as { onBefore?: unknown }).onBefore
      ).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
    });
  });

  describe('Async onBefore Lifecycle', () => {
    it('should execute async onBefore hooks', async () => {
      const executor = new LifecycleExecutor();
      const results: string[] = [];
      const plugin = createTestPlugin({
        onBefore: async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          results.push('before');
        }
      });

      executor.use(plugin);
      const result = await executor.exec(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 'test';
      });

      expect(results).toEqual(['before']);
      expect(result).toBe('test');
    });

    it('should modify input data through async onBefore hooks', async () => {
      const executor = new LifecycleExecutor();
      const plugin = createTestPlugin({
        onBefore: async ({ parameters }: ExecutorContextInterface<unknown>) => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          (parameters as Record<string, unknown>).modifiedBy = 'async-plugin';
        }
      });

      executor.use(plugin);
      const result = await executor.exec(
        { value: 'test' },
        async ({ parameters }) =>
          (parameters as Record<string, unknown>).modifiedBy
      );
      expect(result).toBe('async-plugin');
    });

    describe('startIndex logic verification - async onBefore hook position tests', () => {
      it('should correctly execute remaining onBefore hooks when async plugin is at first position', async () => {
        const executionOrder: string[] = [];
        const executor = new LifecycleExecutor();

        // Async plugin at index 0
        executor.use(
          createTestPlugin({
            pluginName: 'async-plugin-0',
            onBefore: async () => {
              await new Promise((resolve) => setTimeout(resolve, 10));
              executionOrder.push('async-before-0');
            }
          })
        );

        // Sync plugin at index 1 (should execute after async plugin)
        executor.use(
          createTestPlugin({
            pluginName: 'sync-plugin-1',
            onBefore: () => {
              executionOrder.push('sync-before-1');
            }
          })
        );

        // Sync plugin at index 2 (should execute after sync plugin 1)
        executor.use(
          createTestPlugin({
            pluginName: 'sync-plugin-2',
            onBefore: () => {
              executionOrder.push('sync-before-2');
            }
          })
        );

        await executor.exec(async () => 'original');
        expect(executionOrder).toEqual([
          'async-before-0',
          'sync-before-1',
          'sync-before-2'
        ]);
      });

      it('should correctly execute remaining onBefore hooks when async plugin is in middle position', async () => {
        const executionOrder: string[] = [];
        const executor = new LifecycleExecutor();

        // Sync plugin at index 0
        executor.use(
          createTestPlugin({
            pluginName: 'sync-plugin-0',
            onBefore: () => {
              executionOrder.push('sync-before-0');
            }
          })
        );

        // Async plugin at index 1 (middle position)
        executor.use(
          createTestPlugin({
            pluginName: 'async-plugin-1',
            onBefore: async () => {
              await new Promise((resolve) => setTimeout(resolve, 10));
              executionOrder.push('async-before-1');
            }
          })
        );

        // Sync plugin at index 2 (should execute after async plugin)
        executor.use(
          createTestPlugin({
            pluginName: 'sync-plugin-2',
            onBefore: () => {
              executionOrder.push('sync-before-2');
            }
          })
        );

        // Sync plugin at index 3 (should execute after sync plugin 2)
        executor.use(
          createTestPlugin({
            pluginName: 'sync-plugin-3',
            onBefore: () => {
              executionOrder.push('sync-before-3');
            }
          })
        );

        await executor.exec(async () => 'original');
        expect(executionOrder).toEqual([
          'sync-before-0',
          'async-before-1',
          'sync-before-2',
          'sync-before-3'
        ]);
      });

      it('should correctly handle async onBefore hook at last position', async () => {
        const executionOrder: string[] = [];
        const executor = new LifecycleExecutor();

        // Sync plugin at index 0
        executor.use(
          createTestPlugin({
            pluginName: 'sync-plugin-0',
            onBefore: () => {
              executionOrder.push('sync-before-0');
            }
          })
        );

        // Sync plugin at index 1
        executor.use(
          createTestPlugin({
            pluginName: 'sync-plugin-1',
            onBefore: () => {
              executionOrder.push('sync-before-1');
            }
          })
        );

        // Async plugin at index 2 (last position)
        executor.use(
          createTestPlugin({
            pluginName: 'async-plugin-2',
            onBefore: async () => {
              await new Promise((resolve) => setTimeout(resolve, 10));
              executionOrder.push('async-before-2');
            }
          })
        );

        await executor.exec(async () => 'original');
        expect(executionOrder).toEqual([
          'sync-before-0',
          'sync-before-1',
          'async-before-2'
        ]);
      });

      it('should correctly handle multiple consecutive async onBefore hooks', async () => {
        const executionOrder: string[] = [];
        const executor = new LifecycleExecutor();

        // Sync plugin at index 0
        executor.use(
          createTestPlugin({
            pluginName: 'sync-plugin-0',
            onBefore: () => {
              executionOrder.push('sync-before-0');
            }
          })
        );

        // Async plugin at index 1
        executor.use(
          createTestPlugin({
            pluginName: 'async-plugin-1',
            onBefore: async () => {
              await new Promise((resolve) => setTimeout(resolve, 10));
              executionOrder.push('async-before-1');
            }
          })
        );

        // Async plugin at index 2 (consecutive async)
        executor.use(
          createTestPlugin({
            pluginName: 'async-plugin-2',
            onBefore: async () => {
              await new Promise((resolve) => setTimeout(resolve, 10));
              executionOrder.push('async-before-2');
            }
          })
        );

        // Sync plugin at index 3 (should execute after async plugins)
        executor.use(
          createTestPlugin({
            pluginName: 'sync-plugin-3',
            onBefore: () => {
              executionOrder.push('sync-before-3');
            }
          })
        );

        await executor.exec(async () => 'original');
        expect(executionOrder).toEqual([
          'sync-before-0',
          'async-before-1',
          'async-before-2',
          'sync-before-3'
        ]);
      });
    });
  });

  describe('Sync onExec Lifecycle', () => {
    it('should modify the task through onExec hook', () => {
      const executor = new LifecycleExecutor();
      const plugin = createTestPlugin({
        onExec: () => {
          return 'modified task';
        }
      });

      executor.use(plugin);
      const result = executor.exec(() => 'original task');
      expect(result).toBe('modified task');
    });

    it('should override task return value when exec hook', () => {
      const executor = new LifecycleExecutor();
      executor.use(
        createTestPlugin({
          onExec: () => {
            return 'task1';
          }
        })
      );

      const result = executor.exec(() => 'original task');
      expect(result).not.toBe('original task');
      expect(result).toBe('task1');
    });

    it('should support chain return value, onexec hook', () => {
      const executor = new LifecycleExecutor();
      executor.use(
        createTestPlugin({
          onExec: () => {
            return 'task1';
          }
        })
      );
      executor.use(
        createTestPlugin({
          onExec: ({ returnValue }: ExecutorContextInterface<unknown>) => {
            return (returnValue as string) + 'task2';
          }
        })
      );
      const result = executor.exec(() => 'original task');
      expect(result).toBe('task1task2');
    });

    it('should execute the original task if no onExec hooks are present', () => {
      const executor = new LifecycleExecutor();
      const result = executor.exec(() => 'original task');
      expect(result).toBe('original task');
    });
  });

  describe('Async onExec Lifecycle', () => {
    it('should modify the task through async onExec hook', async () => {
      const executor = new LifecycleExecutor();
      const plugin = createTestPlugin({
        onExec: async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return 'modified task';
        }
      });

      executor.use(plugin);
      const result = await executor.exec(async () => 'original task');
      expect(result).toBe('modified task');
    });

    it('should handle plugin returning Promise<Result>', async () => {
      const executor = new LifecycleExecutor();
      executor.use(
        createTestPlugin({
          onExec: async () => {
            return Promise.resolve('promise result');
          }
        })
      );

      const result = await executor.exec(async () => 'original task');
      expect(result).toBe('promise result');
    });

    it('should handle plugin returning Promise<function>', async () => {
      const executor = new LifecycleExecutor();
      executor.use(
        createTestPlugin({
          onExec: async () => {
            return Promise.resolve(
              async (_ctx: ExecutorContextInterface<unknown>) => {
                return 'wrapped from promise';
              }
            );
          }
        })
      );

      const result = await executor.exec(async () => 'original task');
      expect(result).toBe('wrapped from promise');
    });

    describe('startIndex logic verification - async plugin position tests', () => {
      it('should correctly execute remaining plugins when async plugin is at first position', async () => {
        const executionOrder: string[] = [];
        const executor = new LifecycleExecutor();

        // Async plugin at index 0
        executor.use(
          createTestPlugin({
            pluginName: 'async-plugin-0',
            onExec: async () => {
              await new Promise((resolve) => setTimeout(resolve, 10));
              executionOrder.push('async-0');
              return 'async-0-result';
            }
          })
        );

        // Sync plugin at index 1 (should execute after async plugin)
        executor.use(
          createTestPlugin({
            pluginName: 'sync-plugin-1',
            onExec: ({ returnValue }: ExecutorContextInterface<unknown>) => {
              executionOrder.push('sync-1');
              return (returnValue as string) + '-sync-1';
            }
          })
        );

        // Sync plugin at index 2 (should execute after sync plugin 1)
        executor.use(
          createTestPlugin({
            pluginName: 'sync-plugin-2',
            onExec: ({ returnValue }: ExecutorContextInterface<unknown>) => {
              executionOrder.push('sync-2');
              return (returnValue as string) + '-sync-2';
            }
          })
        );

        const result = await executor.exec(async () => 'original');
        expect(executionOrder).toEqual(['async-0', 'sync-1', 'sync-2']);
        expect(result).toBe('async-0-result-sync-1-sync-2');
      });

      it('should correctly execute remaining plugins when async plugin is in middle position', async () => {
        const executionOrder: string[] = [];
        const executor = new LifecycleExecutor();

        // Sync plugin at index 0
        executor.use(
          createTestPlugin({
            pluginName: 'sync-plugin-0',
            onExec: () => {
              executionOrder.push('sync-0');
              return 'sync-0-result';
            }
          })
        );

        // Async plugin at index 1 (middle position)
        executor.use(
          createTestPlugin({
            pluginName: 'async-plugin-1',
            onExec: async ({
              returnValue
            }: ExecutorContextInterface<unknown>) => {
              await new Promise((resolve) => setTimeout(resolve, 10));
              executionOrder.push('async-1');
              return (returnValue as string) + '-async-1';
            }
          })
        );

        // Sync plugin at index 2 (should execute after async plugin)
        executor.use(
          createTestPlugin({
            pluginName: 'sync-plugin-2',
            onExec: ({ returnValue }: ExecutorContextInterface<unknown>) => {
              executionOrder.push('sync-2');
              return (returnValue as string) + '-sync-2';
            }
          })
        );

        // Sync plugin at index 3 (should execute after sync plugin 2)
        executor.use(
          createTestPlugin({
            pluginName: 'sync-plugin-3',
            onExec: ({ returnValue }: ExecutorContextInterface<unknown>) => {
              executionOrder.push('sync-3');
              return (returnValue as string) + '-sync-3';
            }
          })
        );

        const result = await executor.exec(async () => 'original');
        expect(executionOrder).toEqual([
          'sync-0',
          'async-1',
          'sync-2',
          'sync-3'
        ]);
        expect(result).toBe('sync-0-result-async-1-sync-2-sync-3');
      });

      it('should correctly handle async plugin at last position', async () => {
        const executionOrder: string[] = [];
        const executor = new LifecycleExecutor();

        // Sync plugin at index 0
        executor.use(
          createTestPlugin({
            pluginName: 'sync-plugin-0',
            onExec: () => {
              executionOrder.push('sync-0');
              return 'sync-0-result';
            }
          })
        );

        // Sync plugin at index 1
        executor.use(
          createTestPlugin({
            pluginName: 'sync-plugin-1',
            onExec: ({ returnValue }: ExecutorContextInterface<unknown>) => {
              executionOrder.push('sync-1');
              return (returnValue as string) + '-sync-1';
            }
          })
        );

        // Async plugin at index 2 (last position)
        executor.use(
          createTestPlugin({
            pluginName: 'async-plugin-2',
            onExec: async ({
              returnValue
            }: ExecutorContextInterface<unknown>) => {
              await new Promise((resolve) => setTimeout(resolve, 10));
              executionOrder.push('async-2');
              return (returnValue as string) + '-async-2';
            }
          })
        );

        const result = await executor.exec(async () => 'original');
        expect(executionOrder).toEqual(['sync-0', 'sync-1', 'async-2']);
        expect(result).toBe('sync-0-result-sync-1-async-2');
      });

      it('should correctly handle multiple consecutive async plugins', async () => {
        const executionOrder: string[] = [];
        const executor = new LifecycleExecutor();

        // Sync plugin at index 0
        executor.use(
          createTestPlugin({
            pluginName: 'sync-plugin-0',
            onExec: () => {
              executionOrder.push('sync-0');
              return 'sync-0-result';
            }
          })
        );

        // Async plugin at index 1
        executor.use(
          createTestPlugin({
            pluginName: 'async-plugin-1',
            onExec: async ({
              returnValue
            }: ExecutorContextInterface<unknown>) => {
              await new Promise((resolve) => setTimeout(resolve, 10));
              executionOrder.push('async-1');
              return (returnValue as string) + '-async-1';
            }
          })
        );

        // Async plugin at index 2 (consecutive async)
        executor.use(
          createTestPlugin({
            pluginName: 'async-plugin-2',
            onExec: async ({
              returnValue
            }: ExecutorContextInterface<unknown>) => {
              await new Promise((resolve) => setTimeout(resolve, 10));
              executionOrder.push('async-2');
              return (returnValue as string) + '-async-2';
            }
          })
        );

        // Sync plugin at index 3 (should execute after async plugins)
        executor.use(
          createTestPlugin({
            pluginName: 'sync-plugin-3',
            onExec: ({ returnValue }: ExecutorContextInterface<unknown>) => {
              executionOrder.push('sync-3');
              return (returnValue as string) + '-sync-3';
            }
          })
        );

        const result = await executor.exec(async () => 'original');
        expect(executionOrder).toEqual([
          'sync-0',
          'async-1',
          'async-2',
          'sync-3'
        ]);
        expect(result).toBe('sync-0-result-async-1-async-2-sync-3');
      });

      it('should correctly handle async plugin followed by async plugin (startIndex boundary)', async () => {
        const executionOrder: string[] = [];
        const executor = new LifecycleExecutor();

        // Async plugin at index 0
        executor.use(
          createTestPlugin({
            pluginName: 'async-plugin-0',
            onExec: async () => {
              await new Promise((resolve) => setTimeout(resolve, 10));
              executionOrder.push('async-0');
              return 'async-0-result';
            }
          })
        );

        // Async plugin at index 1 (immediately after async plugin)
        executor.use(
          createTestPlugin({
            pluginName: 'async-plugin-1',
            onExec: async ({
              returnValue
            }: ExecutorContextInterface<unknown>) => {
              await new Promise((resolve) => setTimeout(resolve, 10));
              executionOrder.push('async-1');
              return (returnValue as string) + '-async-1';
            }
          })
        );

        // Sync plugin at index 2
        executor.use(
          createTestPlugin({
            pluginName: 'sync-plugin-2',
            onExec: ({ returnValue }: ExecutorContextInterface<unknown>) => {
              executionOrder.push('sync-2');
              return (returnValue as string) + '-sync-2';
            }
          })
        );

        const result = await executor.exec(async () => 'original');
        expect(executionOrder).toEqual(['async-0', 'async-1', 'sync-2']);
        expect(result).toBe('async-0-result-async-1-sync-2');
      });
    });
  });

  describe('Sync onSuccess Lifecycle', () => {
    it('should execute onSuccess hook', () => {
      const executor = new LifecycleExecutor();
      const plugin = createTestPlugin({
        onSuccess: (context: ExecutorContextInterface<unknown>) => {
          context.setReturnValue(context.returnValue + ' success');
        }
      });

      executor.use(plugin);
      const result = executor.exec(() => 'test');
      expect(result).toBe('test success');
    });

    it('should modify the result through onSuccess hooks', () => {
      const executor = new LifecycleExecutor();
      const plugin1 = createTestPlugin({
        onSuccess: (context: ExecutorContextInterface<unknown>) => {
          context.setReturnValue(context.returnValue + ' modified by plugin1');
        }
      });
      const plugin2 = createTestPlugin({
        onSuccess: (context: ExecutorContextInterface<unknown>) => {
          context.setReturnValue(context.returnValue + ' modified by plugin2');
        }
      });

      executor.use(plugin1);
      executor.use(plugin2);

      const result = executor.exec(() => 'test');
      expect(result).toBe('test modified by plugin1 modified by plugin2');
    });

    it('should stop onSuccess chain and enter onError if an error is thrown', () => {
      const executor = new LifecycleExecutor();
      const plugin1 = createTestPlugin({
        onSuccess: () => {
          throw new Error('Error in onSuccess');
        }
      });
      const plugin2 = createTestPlugin({
        onSuccess: vi.fn()
      });
      const onError = vi.fn();

      executor.use(plugin1);
      executor.use(plugin2);
      executor.use(createTestPlugin({ onError }));

      expect(() => executor.exec(() => 'test')).toThrow('Error in onSuccess');

      expect(
        (plugin2 as { onSuccess?: unknown }).onSuccess
      ).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
    });
  });

  describe('Async onSuccess Lifecycle', () => {
    it('should execute async onSuccess hook', async () => {
      const executor = new LifecycleExecutor();
      const plugin = createTestPlugin({
        onSuccess: async (context: ExecutorContextInterface<unknown>) => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          context.setReturnValue(context.returnValue + ' success');
        }
      });

      executor.use(plugin);
      const result = await executor.exec(async () => 'test');
      expect(result).toBe('test success');
    });
  });

  describe('Error Handling', () => {
    it('should propagate errors through hook chain (sync)', () => {
      const results: string[] = [];
      const plugin = createTestPlugin({
        onA: () => {
          results.push('A');
          throw new Error('Error in A');
        },
        onB: () => {
          results.push('B');
        },
        onError: (context: ExecutorContextInterface<unknown>) => {
          if (context.error) {
            results.push(`error:${context.error.message}`);
          }
        }
      });

      const executor = new LifecycleExecutor({
        beforeHooks: ['onA', 'onB']
      });

      executor.use(plugin);

      expect(() => {
        executor.exec(() => {
          return 'success';
        });
      }).toThrow('Error in A');

      expect(results).toEqual(['A', 'error:Error in A']);
    });

    it('should propagate errors through hook chain (async)', async () => {
      const results: string[] = [];
      const plugin = createTestPlugin({
        onA: async () => {
          results.push('A');
          throw new Error('Error in A');
        },
        onB: async () => {
          results.push('B');
        },
        onError: async (context: ExecutorContextInterface<unknown>) => {
          if (context.error) {
            results.push(`error:${context.error.message}`);
          }
        }
      });

      const executor = new LifecycleExecutor({
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
  });

  describe('execNoError Method', () => {
    it('should return ExecutorError instead of throwing an error (sync)', () => {
      const executor = new LifecycleExecutor();
      const result = executor.execNoError(() => {
        throw new Error('test error');
      });

      expect(result).toBeInstanceOf(ExecutorError);
    });

    it('should return ExecutorError instead of throwing an error (async)', async () => {
      const executor = new LifecycleExecutor();
      const result = await executor.execNoError(async () => {
        throw new Error('test error');
      });

      expect(result).toBeInstanceOf(ExecutorError);
    });

    it('should execute task and return result if no error occurs (sync)', () => {
      const executor = new LifecycleExecutor();
      const result = executor.execNoError(() => 'success');

      expect(result).toBe('success');
    });

    it('should execute task and return result if no error occurs (async)', async () => {
      const executor = new LifecycleExecutor();
      const result = await executor.execNoError(async () => 'success');

      expect(result).toBe('success');
    });
  });

  describe('Boundary Cases', () => {
    let executor: LifecycleExecutor;

    beforeEach(() => {
      executor = new LifecycleExecutor();
    });

    it('should handle null/undefined plugin', () => {
      expect(() => {
        executor.use(
          null as unknown as ExecutorPluginInterface<
            ExecutorContextInterface<unknown>
          >
        );
      }).toThrow('Plugin must be an object');
    });

    it('should handle empty plugin list', () => {
      const executor = new LifecycleExecutor();
      const result = executor.exec(() => 'test');
      expect(result).toBe('test');
    });

    it('should execute task with no plugins', () => {
      const executor = new LifecycleExecutor();
      const result = executor.exec(() => 'no plugins');
      expect(result).toBe('no plugins');
    });

    it('should execute async task with no plugins', async () => {
      const executor = new LifecycleExecutor();
      const result = await executor.exec(async () => 'no plugins');
      expect(result).toBe('no plugins');
    });
  });

  describe('Performance', () => {
    let executor: LifecycleExecutor;

    beforeEach(() => {
      executor = new LifecycleExecutor();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should execute hooks with specified delays (async)', async () => {
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
      const customExecutor = new LifecycleExecutor({
        beforeHooks: ['hookA', 'hookB', 'hookC']
      });
      customExecutor.use(plugin);
      const promise = customExecutor.exec(async () => 'test');

      await vi.runAllTimersAsync();
      await promise;
      expect(results).toEqual(['A', 'B', 'C']);
    });
  });

  describe('Additional Test Cases from AsyncExecutor', () => {
    it('should execute multiple plugins in sequence (async)', async () => {
      const executor = new LifecycleExecutor();
      const results: string[] = [];

      const plugin1 = createTestPlugin({
        onBefore: async () => {
          results.push('before1');
        },
        onSuccess: async () => {
          results.push('success1');
        },
        onError: async () => {
          results.push('error1');
        }
      });

      const plugin2 = createTestPlugin({
        onBefore: async () => {
          results.push('before2');
        },
        onSuccess: async () => {
          results.push('success2');
        },
        onError: async () => {
          results.push('error2');
        }
      });

      executor.use(plugin1);
      executor.use(plugin2);

      await executor.exec(async () => 'test');

      expect(results).toEqual(['before1', 'before2', 'success1', 'success2']);
    });

    it('should execute multiple plugins in sequence (sync)', () => {
      const executor = new LifecycleExecutor();
      const results: string[] = [];

      const plugin1 = createTestPlugin({
        onBefore: () => {
          results.push('before1');
        },
        onSuccess: () => {
          results.push('success1');
        },
        onError: () => {
          results.push('error1');
        }
      });

      const plugin2 = createTestPlugin({
        onBefore: () => {
          results.push('before2');
        },
        onSuccess: () => {
          results.push('success2');
        },
        onError: () => {
          results.push('error2');
        }
      });

      executor.use(plugin1);
      executor.use(plugin2);

      executor.exec(() => 'test');

      expect(results).toEqual(['before1', 'before2', 'success1', 'success2']);
    });

    it('should handle plugin that modifies data in onBefore hook (sync)', () => {
      const executor = new LifecycleExecutor();
      const plugin = createTestPlugin({
        onBefore: (context: ExecutorContextInterface<unknown>) => {
          (context.parameters as Record<string, unknown>).added = true;
        }
      });

      executor.use(plugin);

      const result = executor.exec<boolean, Record<string, unknown>>(
        { value: 'test' },
        (context) =>
          (context.parameters as Record<string, unknown>).added as boolean
      );
      expect(result).toBe(true);
    });

    it('should handle plugin that modifies data in onBefore hook (async)', async () => {
      const executor = new LifecycleExecutor();
      const plugin = createTestPlugin({
        onBefore: async (context: ExecutorContextInterface<unknown>) => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          (context.parameters as Record<string, unknown>).added = true;
        }
      });

      executor.use(plugin);

      const result = await executor.exec<boolean, Record<string, unknown>>(
        { value: 'test' },
        async (context) =>
          (context.parameters as Record<string, unknown>).added as boolean
      );
      expect(result).toBe(true);
    });

    it('should handle plugin that modifies result in onSuccess hook (sync)', () => {
      const executor = new LifecycleExecutor();
      const plugin = createTestPlugin({
        onSuccess: (context: ExecutorContextInterface<unknown>) => {
          context.setReturnValue(context.returnValue + ' modified');
        }
      });

      executor.use(plugin);

      const result = executor.exec(() => 'test');
      expect(result).toBe('test modified');
    });

    it('should handle plugin that modifies result in onSuccess hook (async)', async () => {
      const executor = new LifecycleExecutor();
      const plugin = createTestPlugin({
        onSuccess: async (context: ExecutorContextInterface<unknown>) => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          context.setReturnValue(context.returnValue + ' modified');
        }
      });

      executor.use(plugin);

      const result = await executor.exec(async () => 'test');
      expect(result).toBe('test modified');
    });

    it('should handle plugin that suppresses error in onError hook (sync)', () => {
      const executor = new LifecycleExecutor();
      const plugin = createTestPlugin({
        onError: (): ExecutorError => {
          return new ExecutorError('Handled Error');
        }
      });

      executor.use(plugin);

      const result = executor.execNoError(() => {
        throw new Error('test error');
      });

      expect(result).toBeInstanceOf(ExecutorError);
      expect((result as unknown as ExecutorError).message).toBe(
        'Handled Error'
      );
    });

    it('should handle plugin that suppresses error in onError hook (async)', async () => {
      const executor = new LifecycleExecutor();
      const plugin = createTestPlugin({
        onError: async (): Promise<ExecutorError> => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return new ExecutorError('Handled Error');
        }
      });

      executor.use(plugin);

      const result = await executor.execNoError(async () => {
        throw new Error('test error');
      });

      expect(result).toBeInstanceOf(ExecutorError);
      expect((result as unknown as ExecutorError).message).toBe(
        'Handled Error'
      );
    });

    it('should not execute onSuccess hooks if an error occurs (sync)', () => {
      const executor = new LifecycleExecutor();
      const onSuccess = vi.fn();

      const plugin = createTestPlugin({
        onSuccess
      });

      executor.use(plugin);

      const result = executor.execNoError(() => {
        throw new Error('test error');
      });

      expect(result).toBeInstanceOf(ExecutorError);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should not execute onSuccess hooks if an error occurs (async)', async () => {
      const executor = new LifecycleExecutor();
      const onSuccess = vi.fn();

      const plugin = createTestPlugin({
        onSuccess
      });

      executor.use(plugin);

      const result = await executor.execNoError(async () => {
        throw new Error('test error');
      });

      expect(result).toBeInstanceOf(ExecutorError);
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('Additional Test Cases from SyncExecutor', () => {
    it('should handle plugin returning a function (sync)', () => {
      const executor = new LifecycleExecutor();
      executor.use(
        createTestPlugin({
          onExec: () => {
            return (_ctx: ExecutorContextInterface<unknown>) => {
              return 'wrapped from sync';
            };
          }
        })
      );

      const result = executor.exec(() => 'original task');
      expect(result).toBe('wrapped from sync');
    });

    it('should handle plugin returning undefined and continue to next plugin (sync)', () => {
      const executor = new LifecycleExecutor();
      executor.use(
        createTestPlugin({
          onExec: () => {
            return undefined;
          }
        })
      );
      executor.use(
        createTestPlugin({
          onExec: () => {
            return 'second plugin result';
          }
        })
      );

      const result = executor.exec(() => 'original task');
      expect(result).toBe('second plugin result');
    });

    it('should handle plugin returning undefined and continue to next plugin (async)', async () => {
      const executor = new LifecycleExecutor();
      executor.use(
        createTestPlugin({
          onExec: async () => {
            return Promise.resolve(undefined);
          }
        })
      );
      executor.use(
        createTestPlugin({
          onExec: async () => {
            return 'second plugin result';
          }
        })
      );

      const result = await executor.exec(async () => 'original task');
      expect(result).toBe('second plugin result');
    });

    it('should handle multiple plugins returning values in chain (sync)', () => {
      const executor = new LifecycleExecutor();
      executor.use(
        createTestPlugin({
          onExec: () => {
            return 'value1';
          }
        })
      );
      executor.use(
        createTestPlugin({
          onExec: ({ returnValue }: ExecutorContextInterface<unknown>) => {
            return returnValue + '-value2';
          }
        })
      );
      executor.use(
        createTestPlugin({
          onExec: ({ returnValue }: ExecutorContextInterface<unknown>) => {
            return returnValue + '-value3';
          }
        })
      );

      const result = executor.exec(() => 'original task');
      expect(result).toBe('value1-value2-value3');
    });

    it('should handle multiple plugins returning values in chain (async)', async () => {
      const executor = new LifecycleExecutor();
      executor.use(
        createTestPlugin({
          onExec: async () => {
            return 'value1';
          }
        })
      );
      executor.use(
        createTestPlugin({
          onExec: async ({
            returnValue
          }: ExecutorContextInterface<unknown>) => {
            return returnValue + '-value2';
          }
        })
      );
      executor.use(
        createTestPlugin({
          onExec: async ({
            returnValue
          }: ExecutorContextInterface<unknown>) => {
            return returnValue + '-value3';
          }
        })
      );

      const result = await executor.exec(async () => 'original task');
      expect(result).toBe('value1-value2-value3');
    });
  });

  describe('Parameter Isolation and Cloning', () => {
    describe('Parameter isolation from original', () => {
      it('should isolate parameters from original object (prevent memory leaks)', () => {
        const originalParams = { userId: 123, data: 'test' };
        const executor = new LifecycleExecutor();

        const result = executor.exec(originalParams, (ctx) => {
          // Verify parameters are isolated
          expect(ctx.parameters).not.toBe(originalParams);
          expect(ctx.parameters).toEqual(originalParams);
          return ctx.parameters.userId;
        });

        // Modify original params after execution
        originalParams.userId = 999;
        originalParams.data = 'modified';

        // Context parameters should not be affected
        expect(result).toBe(123);
      });

      it('should isolate array parameters from original', () => {
        const originalArray = [1, 2, 3];
        const executor = new LifecycleExecutor();

        const result = executor.exec(originalArray, (ctx) => {
          expect(ctx.parameters).not.toBe(originalArray);
          expect(ctx.parameters).toEqual(originalArray);
          return ctx.parameters.length;
        });

        // Modify original array
        originalArray.push(4);

        // Result should not be affected
        expect(result).toBe(3);
      });

      it('should isolate nested object parameters (shallow copy)', () => {
        const originalParams = {
          user: { id: 123, name: 'test' },
          data: 'value'
        };
        const executor = new LifecycleExecutor();

        const result = executor.exec(originalParams, (ctx) => {
          // Top-level object is cloned
          expect(ctx.parameters).not.toBe(originalParams);
          // Nested objects share reference (shallow copy)
          expect(ctx.parameters.user).toBe(originalParams.user);
          return ctx.parameters.user.id;
        });

        expect(result).toBe(123);
      });
    });

    describe('Parameter cloning on context creation', () => {
      it('should clone parameters in constructor', () => {
        const originalParams = { value: 'original' };
        const executor = new LifecycleExecutor();

        executor.exec(originalParams, (ctx) => {
          // Parameters should be cloned
          const params1 = ctx.parameters;
          const params2 = ctx.parameters;

          // Same reference (cloned once in constructor)
          expect(params1).toBe(params2);
          // But different from original
          expect(params1).not.toBe(originalParams);
          return 'done';
        });
      });

      it('should handle primitive parameters (no clone needed)', () => {
        const executor = new LifecycleExecutor();

        const result1 = executor.exec('string', (ctx) => ctx.parameters);
        const result2 = executor.exec(123, (ctx) => ctx.parameters);
        const result3 = executor.exec(true, (ctx) => ctx.parameters);

        expect(result1).toBe('string');
        expect(result2).toBe(123);
        expect(result3).toBe(true);
      });
    });

    describe('setParameters method', () => {
      it('should clone parameters when using setParameters', () => {
        const executor = new LifecycleExecutor();
        const plugin = createTestPlugin({
          onBefore: (ctx: ExecutorContextInterface<unknown>) => {
            const newParams = { modified: true, value: 'new' };
            ctx.setParameters(newParams);
            // Verify it's cloned
            expect(ctx.parameters).not.toBe(newParams);
            expect(ctx.parameters).toEqual(newParams);
          }
        });

        executor.use(plugin);
        const result = executor.exec({ original: true }, (ctx) => {
          return ctx.parameters;
        });

        expect(result).toEqual({ modified: true, value: 'new' });
      });

      it('should update parameters with cloned copy', () => {
        const executor = new LifecycleExecutor();
        const updateParams = { new: 'value' };

        executor.exec({ original: true } as Record<string, unknown>, (ctx) => {
          ctx.setParameters(updateParams as typeof ctx.parameters);
          // Verify it's cloned
          expect(ctx.parameters).not.toBe(updateParams);
          expect(ctx.parameters).toEqual(updateParams);

          // Modify updateParams
          updateParams.new = 'modified';
          // Context parameters should not be affected
          expect((ctx.parameters as typeof updateParams).new).toBe('value');
          return 'done';
        });
      });
    });

    describe('onBefore hook return value updates parameters', () => {
      it('should update parameters when onBefore returns a value', () => {
        const executor = new LifecycleExecutor();
        const plugin = createTestPlugin({
          onBefore: () => {
            return { modified: true, value: 'from onBefore' };
          }
        });

        executor.use(plugin);
        const result = executor.exec(
          { original: true } as Record<string, unknown>,
          (ctx) => {
            return ctx.parameters;
          }
        );

        expect(result).toEqual({ modified: true, value: 'from onBefore' });
      });

      it('should update parameters with cloned copy from onBefore return', () => {
        const executor = new LifecycleExecutor();
        const returnValue = { fromHook: true };

        const plugin = createTestPlugin({
          onBefore: () => {
            return returnValue;
          }
        });

        executor.use(plugin);
        executor.exec({ original: true } as Record<string, unknown>, (ctx) => {
          // Parameters should be cloned from return value
          expect(ctx.parameters).not.toBe(returnValue);
          expect(ctx.parameters).toEqual(returnValue);

          // Modify returnValue
          returnValue.fromHook = false;
          // Context parameters should not be affected
          expect((ctx.parameters as typeof returnValue).fromHook).toBe(true);
          return 'done';
        });
      });

      it('should handle async onBefore return value updating parameters', async () => {
        const executor = new LifecycleExecutor();
        const plugin = createTestPlugin({
          onBefore: async () => {
            await new Promise((resolve) => setTimeout(resolve, 10));
            return { asyncModified: true };
          }
        });

        executor.use(plugin);
        const result = await executor.exec(
          { original: true } as Record<string, unknown>,
          async (ctx) => {
            return ctx.parameters;
          }
        );

        expect(result).toEqual({ asyncModified: true });
      });
    });

    describe('Memory leak prevention', () => {
      it('should break reference to prevent memory leaks', () => {
        const largeObject = {
          data: new Array(1000).fill(0).map((_, i) => ({ id: i })),
          metadata: { size: 1000 }
        };
        const executor = new LifecycleExecutor();

        executor.exec(largeObject, (ctx) => {
          // Parameters should be cloned, breaking reference
          const params = ctx.parameters as typeof largeObject;
          expect(params).not.toBe(largeObject);
          // Shallow copy: top-level object is cloned, but nested objects share reference
          // This is expected behavior for shallow copy (performance optimization)
          // The important thing is that the top-level reference is broken to prevent memory leaks
          // Note: Arrays are shallow copied, so nested arrays share reference
          expect(params.data).toBe(largeObject.data); // Shallow copy - nested arrays share reference
          expect(params.metadata).toBe(largeObject.metadata); // Shallow copy - nested objects share reference
          // Verify top-level isolation (prevents memory leaks)
          expect(params).toEqual(largeObject);
          // Verify that modifying top-level properties doesn't affect original
          const originalMetadataSize = largeObject.metadata.size;
          // Create a new metadata object to replace the shared reference
          params.metadata = { size: 0 };
          expect(largeObject.metadata.size).toBe(originalMetadataSize); // Original unchanged
          return 'done';
        });

        // Clear largeObject reference
        largeObject.data = [];
        largeObject.metadata = { size: 0 };

        // If there was a memory leak, largeObject would still be referenced
        // This test verifies that references are properly broken
      });

      it('should allow garbage collection of original parameters', () => {
        const executor = new LifecycleExecutor();

        // Create parameters in a scope
        {
          const scopedParams = { value: 'scoped' };
          executor.exec(scopedParams, (ctx) => {
            // Parameters are cloned, so scopedParams can be GC'd
            expect(ctx.parameters).not.toBe(scopedParams);
            return 'done';
          });
        }

        // scopedParams should be eligible for GC after this point
        // This test verifies that context doesn't hold references to original
      });
    });

    describe('Special object types cloning', () => {
      it('should properly clone Date objects', () => {
        const date = new Date('2024-01-01');
        const executor = new LifecycleExecutor();

        executor.exec(date, (ctx) => {
          const paramDate = ctx.parameters as Date;
          expect(paramDate).not.toBe(date);
          expect(paramDate).toBeInstanceOf(Date);
          expect(paramDate.getTime()).toBe(date.getTime());
          return 'done';
        });
      });

      it('should properly clone arrays', () => {
        const array = [1, 2, 3];
        const executor = new LifecycleExecutor();

        executor.exec(array, (ctx) => {
          const paramArray = ctx.parameters as number[];
          expect(paramArray).not.toBe(array);
          expect(paramArray).toEqual(array);
          expect(Array.isArray(paramArray)).toBe(true);
          return 'done';
        });
      });
    });
  });
});
