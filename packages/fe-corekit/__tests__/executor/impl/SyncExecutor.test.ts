/**
 * SyncExecutor test-suite
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
 *
 * Execution Order:
 * 1. All onBefore hooks execute in sequence
 * 2. All onExec hooks execute in sequence
 * 3. All onSuccess hooks execute in sequence
 * 4. On error, onError hooks execute until error is handled
 */

import {
  ExecutorError,
  ExecutorPlugin,
  ExecutorContext,
  SyncExecutor
} from '../../../src';

// Test Data Types
type TestHook = () => void;
type TestHookWithContext = (context: ExecutorContext<unknown>) => void;
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

function createErrorPlugin(
  errorMessage: string = TEST_RESULTS.ERROR_MSG
): ExecutorPlugin {
  return createTestPlugin({
    onExec: () => {
      throw new Error(errorMessage);
    }
  });
}

describe('SyncExecutor', () => {
  // Preserve existing Executor Sync implementation test group
  describe('Executor Sync implementation', () => {
    it('should execute task with default lifecycle hooks', () => {
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

      const executor = new SyncExecutor();
      executor.use(plugin);
      executor.exec(() => TEST_RESULTS.ORIGINAL);

      expect(results).toEqual(['before', 'exec', 'success']);
    });

    it('should execute task with custom lifecycle hooks', () => {
      const customExecutor = new SyncExecutor({
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
  });

  describe('runHooks', () => {
    it('should execute single hook successfully', () => {
      const results: string[] = [];
      const plugin = createTestPlugin({
        hookA: () => {
          results.push('A');
        }
      });

      const executor = new SyncExecutor();
      executor.runHooks([plugin], ['hookA']);

      expect(results).toEqual(['A']);
    });

    it('should execute multiple hooks in order', () => {
      const results: string[] = [];
      const plugin = createTestPlugin({
        hookA: () => {
          results.push('A');
        },
        hookB: () => {
          results.push('B');
        },
        hookC: () => {
          results.push('C');
        }
      });

      const executor = new SyncExecutor();
      executor.runHooks([plugin], ['hookA', 'hookB', 'hookC']);

      expect(results).toEqual(['A', 'B', 'C']);
    });

    it('should handle undefined hook methods', () => {
      const results: string[] = [];
      const plugin = createTestPlugin({
        onA: () => {
          results.push('A');
        },
        onB: undefined,
        onC: () => {
          results.push('C');
        }
      });

      const executor = new SyncExecutor();
      executor.runHooks([plugin], ['onA', 'onB', 'onC']);
      expect(results).toEqual(['A', 'C']);
    });

    it('should handle empty hook names array', () => {
      const plugin = createTestPlugin({
        onTest: () => {}
      });

      const executor = new SyncExecutor();
      const result = executor.runHooks([plugin], []);
      expect(result).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should propagate errors through hook chain', () => {
      const results: string[] = [];
      const errorPlugin = createErrorPlugin('Error in hook chain');
      const plugin2 = createPluginWithHooks({
        onBefore: () => {
          results.push('before');
        },
        onError: (context: ExecutorContext<unknown>) => {
          if (context.error) {
            results.push(`error:${context.error.message}`);
          }
        }
      });

      const executor = new SyncExecutor();
      executor.use(errorPlugin);
      executor.use(plugin2);

      expect(() => {
        executor.exec(() => TEST_RESULTS.ORIGINAL);
      }).toThrow('Error in hook chain');

      expect(results).toEqual(['before', 'error:Error in hook chain']);
    });

    it('should handle errors in different hook types', () => {
      const results: string[] = [];
      const plugin = createPluginWithHooks({
        onValidate: () => {
          results.push('validate');
        },
        onTransform: () => {
          results.push('transform');
          throw new Error(TEST_RESULTS.ERROR_MSG);
        },
        onFormat: () => {
          results.push('format');
        },
        onError: (context: ExecutorContext<unknown>) => {
          if (context.error) {
            results.push(`error:${context.error.message}`);
          }
        }
      });

      const customExecutor = new SyncExecutor({
        beforeHooks: TEST_HOOKS.BEFORE,
        afterHooks: TEST_HOOKS.AFTER
      });

      customExecutor.use(plugin);
      expect(() => customExecutor.exec(() => TEST_RESULTS.ORIGINAL)).toThrow(
        TEST_RESULTS.ERROR_MSG
      );

      expect(results).toEqual([
        'validate',
        'transform',
        `error:${TEST_RESULTS.ERROR_MSG}`
      ]);
    });
  });

  describe('Advanced Error Handling', () => {
    let executor: SyncExecutor;

    beforeEach(() => {
      executor = new SyncExecutor();
    });

    it('should handle nested errors in hook chain', () => {
      const results: string[] = [];
      const plugin = createTestPlugin({
        onA: () => {
          results.push('A');
          throw new Error('Error in A');
        },
        onB: () => {
          results.push('B');
          throw new Error('Error in B');
        },
        onError: (context: ExecutorContext<unknown>) => {
          if (context.error) {
            results.push(`error:${context.error.message}`);
            return new Error('Modified error');
          }
        }
      });

      executor.use(plugin);
      expect(() => {
        executor.exec(() => {
          executor.runHooks([plugin], ['onA', 'onB']);
          return 'success';
        });
      }).toThrow('Modified error');

      expect(results).toEqual(['A', 'error:Error in A']);
    });

    it('should handle errors in different phases', () => {
      const results: string[] = [];
      const plugin = createTestPlugin({
        onBefore: () => {
          results.push('before');
          throw new Error('Before error');
        },
        onExec: () => {
          results.push('exec');
          return 'result';
        },
        onError: (context: ExecutorContext<unknown>) => {
          if (context.error) {
            results.push(`error:${context.error.message}`);
          }
        }
      });

      executor.use(plugin);
      expect(() => executor.exec(() => 'test')).toThrow('Before error');

      expect(results).toEqual(['before', 'error:Before error']);
    });
  });

  describe('Performance and Timing', () => {
    let executor: SyncExecutor;
    const PERFORMANCE_THRESHOLD = 50; // milliseconds

    beforeEach(() => {
      executor = new SyncExecutor();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should execute hooks in sequence within time limit', () => {
      const startTime = performance.now();
      const results: string[] = [];

      const plugin = createPluginWithHooks({
        hookA: () => {
          results.push('A');
          return 'A result';
        },
        hookB: () => {
          results.push('B');
          return 'B result';
        },
        hookC: () => {
          results.push('C');
          return 'C result';
        }
      });

      executor.use(plugin);
      const result = executor.runHooks([plugin], ['hookA', 'hookB', 'hookC']);
      const duration = performance.now() - startTime;

      expect(results).toEqual(['A', 'B', 'C']);
      expect(result).toBe('C result');
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD);
    });

    it('should optimize multiple hook executions', () => {
      const startTime = performance.now();
      const results: string[] = [];

      // Create multiple plugins with timing measurements
      const plugins = Array.from({ length: 5 }, (_, i) =>
        createPluginWithHooks({
          onBefore: () => {
            results.push(`before-${i}`);
          },
          onExec: () => {
            results.push(`exec-${i}`);
            return `result-${i}`;
          },
          onSuccess: () => {
            results.push(`success-${i}`);
          }
        })
      );

      // Register all plugins
      plugins.forEach((plugin) => executor.use(plugin));

      // Execute with all plugins
      executor.exec(() => TEST_RESULTS.ORIGINAL);
      const duration = performance.now() - startTime;

      // Verify execution order
      expect(results).toEqual([
        'before-0',
        'before-1',
        'before-2',
        'before-3',
        'before-4',
        'exec-0',
        'exec-1',
        'exec-2',
        'exec-3',
        'exec-4',
        'success-0',
        'success-1',
        'success-2',
        'success-3',
        'success-4'
      ]);

      // Verify performance
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD);
    });

    it('should handle concurrent hook executions efficiently', () => {
      const startTime = performance.now();
      const results: string[] = [];

      // Create a plugin with multiple hooks
      const plugin = createPluginWithHooks({
        onValidate: () => results.push('validate'),
        onTransform: () => results.push('transform'),
        [TEST_HOOKS.EXEC]: () => {
          results.push('exec');
          return TEST_RESULTS.MODIFIED;
        },
        onFormat: () => results.push('format'),
        onLog: () => results.push('log')
      });

      const customExecutor = new SyncExecutor({
        beforeHooks: TEST_HOOKS.BEFORE,
        afterHooks: TEST_HOOKS.AFTER,
        execHook: TEST_HOOKS.EXEC
      });

      customExecutor.use(plugin);

      // Execute multiple times
      for (let i = 0; i < 10; i++) {
        customExecutor.exec(() => TEST_RESULTS.ORIGINAL);
      }

      const duration = performance.now() - startTime;
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLD * 2);
      expect(results.length).toBe(50); // 5 hooks * 10 executions
    });
  });

  // Preserve existing test groups
  describe('SyncExecutor onBefore Lifecycle', () => {
    it('should not support return value onBefore chain', () => {
      const executor = new SyncExecutor();
      executor.use({
        pluginName: 'test1',
        // not support return
        onBefore({ returnValue }) {
          return (returnValue + '123') as unknown as void;
        }
      });

      executor.use({
        pluginName: 'test2',
        onBefore({ returnValue }) {
          expect(returnValue).not.toBeDefined();
        }
      });

      const result = executor.exec(() => 'test');
      expect(result).not.toBe('test123');
      expect(result).toBe('test');
    });

    it('should modify input data through onBefore hooks', () => {
      const executor = new SyncExecutor();
      const plugin1: ExecutorPlugin<Record<string, unknown>> = {
        pluginName: 'test',
        onBefore: ({ parameters }) => {
          parameters.modifiedBy = 'plugin1';
        }
      };
      const plugin2: ExecutorPlugin<Record<string, unknown>> = {
        pluginName: 'test2',
        onBefore: ({ parameters }) => {
          parameters.modifiedBy = 'plugin2';
        }
      };

      executor.use(plugin1);
      executor.use(plugin2);

      const result = executor.exec(
        { value: 'test' },
        ({ parameters }: ExecutorContext<Record<string, unknown>>) =>
          parameters.modifiedBy
      );
      expect(result).toBe('plugin2');
    });

    it("should use the first plugin's onBefore return value if no subsequent plugin returns a value", () => {
      const executor = new SyncExecutor();
      const plugin1: ExecutorPlugin<Record<string, unknown>> = {
        pluginName: 'test',
        onBefore: ({ parameters }) => {
          parameters.modifiedBy = 'plugin1';
        }
      };
      const plugin2: ExecutorPlugin<Record<string, unknown>> = {
        pluginName: 'test2',
        onBefore: vi.fn()
      };

      executor.use(plugin1);
      executor.use(plugin2);

      const result = executor.exec(
        { value: 'test' },
        ({ parameters }: ExecutorContext<Record<string, unknown>>) =>
          parameters.modifiedBy
      );
      expect(result).toBe('plugin1');
    });

    it('should stop onBefore chain and enter onError if an error is thrown', () => {
      const executor = new SyncExecutor();
      const plugin1: ExecutorPlugin = {
        pluginName: 'test',
        onBefore: () => {
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

      expect(() => {
        executor.exec({ value: 'test' }, (data) => data);
      }).toThrow(ExecutorError);

      expect(plugin2.onBefore).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
    });

    it('should execute onError if onBefore throws an error', () => {
      const executor = new SyncExecutor();
      const plugin1: ExecutorPlugin = {
        pluginName: 'test',
        onBefore: () => {
          throw new Error('Error in onBefore');
        }
      };
      const onError = vi.fn();

      executor.use(plugin1);
      executor.use({ pluginName: 'test2', onError });

      expect(() => {
        executor.exec({ value: 'test' }, (data) => data);
      }).toThrow(ExecutorError);

      expect(onError).toHaveBeenCalled();
    });

    it('should not modify input data if no onBefore hooks are present', () => {
      const executor = new SyncExecutor();
      const result = executor.exec(
        { value: 'test' },
        ({ parameters }) => parameters.value
      );
      expect(result).toBe('test');
    });
  });

  describe('SyncExecutor onExec Lifecycle', () => {
    it('should modify the task through onExec hook', () => {
      const executor = new SyncExecutor();
      const plugin: ExecutorPlugin<Record<string, unknown>> = {
        pluginName: 'test',
        onExec<T>(): T {
          return 'modified task' as T;
        }
      };

      executor.use(plugin);

      const result = executor.exec(() => 'original task');
      expect(result).toBe('modified task');
    });

    it('should overried task return value when exec hook', () => {
      const executor = new SyncExecutor();
      executor.use({
        pluginName: 'test',
        onExec() {
          return 'task1';
        }
      });

      const result = executor.exec(() => 'original task');
      expect(result).not.toBe('original task');
      expect(result).toBe('task1');
    });

    it('should support chain return value, onexec hook', () => {
      const executor = new SyncExecutor();
      executor.use({
        pluginName: 'test',
        onExec() {
          return 'task1';
        }
      });
      executor.use({
        pluginName: 'test2',
        onExec({ hooksRuntimes }) {
          return hooksRuntimes.returnValue + 'task2';
        }
      });
      const result = executor.exec(() => 'original task');
      expect(result).not.toBe('original tasktask1task2');
      expect(result).toBe('task1task2');
    });

    it("should only use the first plugin's onExec hook", () => {
      const executor = new SyncExecutor();
      const plugin1: ExecutorPlugin = {
        pluginName: 'test',
        onExec() {
          return 'modified by plugin1';
        }
      };
      const plugin2: ExecutorPlugin = {
        enabled: () => false,
        pluginName: 'test2',
        onExec() {
          return 'modified by plugin2';
        }
      };

      executor.use(plugin1);
      executor.use(plugin2);

      const result = executor.exec(() => 'original task');
      expect(result).toBe('modified by plugin1');
    });

    it('should execute the original task if no onExec hooks are present', () => {
      const executor = new SyncExecutor();
      const result = executor.exec(() => 'original task');
      expect(result).toBe('original task');
    });

    it('should stop execution and enter onError if onExec throws an error', () => {
      const executor = new SyncExecutor();
      const onError = vi.fn();
      const onSuccess = vi.fn();

      executor.use({
        pluginName: 'test',
        onExec: () => {
          throw new Error('Error in onExec');
        }
      });
      executor.use({ pluginName: 'test2', onError, onSuccess });

      try {
        executor.exec(() => 'original task');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Error in onExec');
        expect(onError).toHaveBeenCalledTimes(1);
        expect(onSuccess).toHaveBeenCalledTimes(0);
      }
    });
  });

  describe('SyncExecutor onError Lifecycle', () => {
    it('should handle error in onBefore hook', () => {
      const executor = new SyncExecutor();
      const plugin: ExecutorPlugin = {
        pluginName: 'test',
        onBefore: () => {
          throw new Error('Error in onBefore');
        }
      };

      executor.use(plugin);

      expect(() => {
        executor.exec(() => 'test');
      }).toThrow(ExecutorError);
    });

    it('should handle error in onSuccess hook', () => {
      const executor = new SyncExecutor();
      const plugin: ExecutorPlugin = {
        pluginName: 'test',
        onSuccess: () => {
          throw new Error('Error in onSuccess');
        }
      };

      executor.use(plugin);

      expect(() => {
        executor.exec(() => 'test');
      }).toThrow(ExecutorError);
    });

    it('should handle error in onError hook', () => {
      const executor = new SyncExecutor();
      const plugin: ExecutorPlugin = {
        pluginName: 'test',
        onError: (): ExecutorError => {
          return new ExecutorError('Error in onError');
        }
      };

      executor.use(plugin);

      expect(() => {
        executor.exec(() => {
          throw new Error('original error');
        });
      }).toThrow(ExecutorError);
    });

    it('should continue execution if onBefore hook does not throw', () => {
      const executor = new SyncExecutor();
      const plugin: ExecutorPlugin = {
        pluginName: 'test',
        onBefore: (context: ExecutorContext<Record<string, unknown>>) => {
          if (context.parameters.shouldThrow) {
            throw new Error('Error in onBefore');
          }
        }
      };

      executor.use(plugin);

      const result = executor.exec({ shouldThrow: false }, () => 'success');
      expect(result).toBe('success');
    });

    it('should wrap error in ExecutorError if onError hook throws', () => {
      const executor = new SyncExecutor();
      const plugin: ExecutorPlugin = {
        pluginName: 'test',
        onError: (): Error => {
          return new Error('Error in onError');
        }
      };

      executor.use(plugin);

      expect(() => {
        executor.exec(() => {
          throw new Error('original error');
        });
      }).toThrow(ExecutorError);
    });

    it('should throw an error if an error occurred in onError', () => {
      const executor = new SyncExecutor();
      const plugin: ExecutorPlugin = {
        pluginName: 'test',
        onError: () => {
          throw new Error('Error in onError');
        }
      };

      executor.use(plugin);

      try {
        executor.exec(() => {
          throw new Error('original error');
        });
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Error in onError');
      }
    });
    it('should handle errors through onError hooks', () => {
      const executor = new SyncExecutor();
      const plugin1: ExecutorPlugin = {
        pluginName: 'test',
        onError: ({ error }) => new ExecutorError('Handled by plugin1', error)
      };
      const plugin2: ExecutorPlugin = {
        pluginName: 'test2',
        onError: ({ error }) => new ExecutorError('Handled by plugin2', error)
      };

      executor.use(plugin1);
      executor.use(plugin2);

      expect(() => {
        executor.exec(() => {
          throw new Error('original error');
        });
      }).toThrow(ExecutorError);
    });

    it('should stop onError chain if an error is thrown', () => {
      const executor = new SyncExecutor();
      const plugin1: ExecutorPlugin = {
        pluginName: 'test',
        onError: () => {
          throw new Error('Error in onError');
        }
      };
      const plugin2: ExecutorPlugin = {
        pluginName: 'test2',
        onError: vi.fn()
      };

      executor.use(plugin1);
      executor.use(plugin2);

      expect(() => {
        executor.exec(() => {
          throw new Error('original error');
        });
      }).toThrow(Error);

      expect(plugin2.onError).not.toHaveBeenCalled();
    });

    it('should wrap raw errors with ExecutorError if no onError returns or throws', () => {
      const executor = new SyncExecutor();
      const plugin1: ExecutorPlugin = {
        pluginName: 'test',
        onError: vi.fn()
      };
      const plugin2: ExecutorPlugin = {
        pluginName: 'test2',
        onError: vi.fn()
      };

      executor.use(plugin1);
      executor.use(plugin2);

      expect(() => {
        executor.exec(() => {
          throw new Error('original error');
        });
      }).toThrow(ExecutorError);
    });

    it('should return the first error encountered in execNoError', () => {
      const executor = new SyncExecutor();
      const plugin1: ExecutorPlugin = {
        pluginName: 'test',
        onError: ({ error, hooksRuntimes }) => {
          // break the chain
          hooksRuntimes.returnBreakChain = true;

          return new ExecutorError('Handled by plugin1', error);
        }
      };
      const plugin2: ExecutorPlugin = {
        pluginName: 'test2',
        onError: vi.fn()
      };

      executor.use(plugin1);
      executor.use(plugin2);

      try {
        executor.exec(() => {
          throw new Error('original error');
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ExecutorError);
        expect((error as ExecutorError).message).toBe('original error');
        expect(plugin2.onError).toHaveBeenCalledTimes(0);
      }
    });
  });

  describe('SyncExecutor onSuccess Lifecycle', () => {
    it('should execute onSuccess hook', () => {
      const executor = new SyncExecutor();
      const plugin: ExecutorPlugin = {
        pluginName: 'test2',
        onSuccess: (context) => {
          context.returnValue = context.returnValue + ' success';
        }
      };

      executor.use(plugin);
      const result = executor.exec(() => 'test');
      expect(result).toBe('test success');
    });

    it('should modify the result through onSuccess hooks', () => {
      const executor = new SyncExecutor();
      const plugin1: ExecutorPlugin = {
        pluginName: 'test',
        onSuccess: (context) => {
          context.returnValue = context.returnValue + ' modified by plugin1';
        }
      };
      const plugin2: ExecutorPlugin = {
        pluginName: 'test2',
        onSuccess: (context) => {
          context.returnValue = context.returnValue + ' modified by plugin2';
        }
      };

      executor.use(plugin1);
      executor.use(plugin2);

      const result = executor.exec(() => 'test');
      expect(result).toBe('test modified by plugin1 modified by plugin2');
    });

    it('should stop onSuccess chain and enter onError if an error is thrown', () => {
      const executor = new SyncExecutor();
      const plugin1: ExecutorPlugin = {
        pluginName: 'test',
        onSuccess: () => {
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

      expect(() => {
        executor.exec(() => 'test');
      }).toThrow(ExecutorError);

      expect(plugin2.onSuccess).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
    });

    it('should not execute onSuccess hook if task throws an error', () => {
      const executor = new SyncExecutor();
      const onSuccess = vi.fn();

      const plugin: ExecutorPlugin = {
        pluginName: 'test',
        onSuccess
      };

      executor.use(plugin);

      expect(() => {
        executor.exec(() => {
          throw new Error('test error');
        });
      }).toThrow(ExecutorError);

      expect(onSuccess).not.toHaveBeenCalled();
    });
  });
  describe('SyncExecutor execNoError Method', () => {
    it('should return ExecutorError instead of throwing an error', () => {
      const executor = new SyncExecutor();
      const result = executor.execNoError(() => {
        throw new Error('test error');
      });

      expect(result).toBeInstanceOf(ExecutorError);
    });

    it('should execute task and return result if no error occurs', () => {
      const executor = new SyncExecutor();
      const result = executor.execNoError(() => 'success');

      expect(result).toBe('success');
    });

    it('should handle errors through onError hooks and return the first error', () => {
      const executor = new SyncExecutor();
      const plugin1: ExecutorPlugin = {
        pluginName: 'test',
        onError: ({ error }) => new ExecutorError('Handled by plugin1', error)
      };
      const plugin2: ExecutorPlugin = {
        pluginName: 'test2',
        onError: vi.fn()
      };

      executor.use(plugin1);
      executor.use(plugin2);

      const result = executor.execNoError(() => {
        throw new Error('original error');
      });

      expect(result).toBeInstanceOf(ExecutorError);
      expect((result as ExecutorError).message).toBe('original error');
    });

    it('should return the original error wrapped in ExecutorError if no onError hooks are present', () => {
      const executor = new SyncExecutor();
      const result = executor.execNoError(() => {
        throw new Error('original error');
      });

      expect(result).toBeInstanceOf(ExecutorError);
      expect((result as ExecutorError).message).toBe('original error');
    });

    it('should not execute onSuccess hooks if an error occurs', () => {
      const executor = new SyncExecutor();
      const onSuccess = vi.fn();

      const plugin: ExecutorPlugin = {
        pluginName: 'test',
        onSuccess
      };

      executor.use(plugin);

      const result = executor.execNoError(() => {
        throw new Error('test error');
      });

      expect(result).toBeInstanceOf(ExecutorError);
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('SyncExecutor Additional Tests', () => {
    it('should execute multiple plugins in sequence', () => {
      const executor = new SyncExecutor();
      const results: string[] = [];

      const plugin1: ExecutorPlugin = {
        pluginName: 'plugin1',
        onBefore: () => {
          results.push('before1');
        },
        onSuccess: () => {
          results.push('success1');
        },
        onError: () => {
          results.push('error1');
        }
      };

      const plugin2: ExecutorPlugin = {
        pluginName: 'plugin2',
        onBefore: () => {
          results.push('before2');
        },
        onSuccess: () => {
          results.push('success2');
        },
        onError: () => {
          results.push('error2');
        }
      };

      executor.use(plugin1);
      executor.use(plugin2);

      executor.exec(() => 'test');

      expect(results).toEqual(['before1', 'before2', 'success1', 'success2']);
    });

    it('should handle plugin that modifies data in onBefore hook', () => {
      const executor = new SyncExecutor();
      const plugin: ExecutorPlugin<Record<string, unknown>> = {
        pluginName: 'plugin1',
        onBefore: (context) => {
          context.parameters.added = true;
        }
      };

      executor.use(plugin);

      const result = executor.exec<boolean, Record<string, unknown>>(
        { value: 'test' },
        (context) => context.parameters.added as boolean
      );
      expect(result).toBe(true);
    });

    it('should handle plugin that modifies result in onSuccess hook', () => {
      const executor = new SyncExecutor();
      const plugin: ExecutorPlugin<string> = {
        pluginName: 'plugin1',
        onSuccess: (context) => {
          context.returnValue = context.returnValue + ' modified';
        }
      };

      executor.use(plugin);

      const result = executor.exec(() => 'test');
      expect(result).toBe('test modified');
    });

    it('should handle plugin that suppresses error in onError hook', () => {
      const executor = new SyncExecutor();
      const plugin: ExecutorPlugin = {
        pluginName: 'plugin1',
        onError: () => {
          return new ExecutorError('Handled Error');
        }
      };

      executor.use(plugin);

      const result = executor.execNoError(() => {
        throw new Error('test error');
      });

      expect(result).toBeInstanceOf(ExecutorError);
      expect((result as ExecutorError).message).toBe('Handled Error');
    });

    it('should execute task with no plugins', () => {
      const executor = new SyncExecutor();
      const result = executor.exec(() => 'no plugins');
      expect(result).toBe('no plugins');
    });

    it('should throw error if task is not a function', () => {
      const executor = new SyncExecutor();
      try {
        executor.exec('not a function' as unknown as () => unknown);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Task must be a function!');
      }
    });
  });

  // Add boundary test cases
  describe('Boundary Cases', () => {
    let executor: SyncExecutor;

    beforeEach(() => {
      executor = new SyncExecutor();
    });

    it('should handle null/undefined plugin', () => {
      expect(() =>
        executor.runHooks([null as unknown as ExecutorPlugin], ['test'])
      ).toThrow();
      expect(() =>
        executor.runHooks([undefined as unknown as ExecutorPlugin], ['test'])
      ).toThrow();
    });

    it('should handle empty plugin list', () => {
      const result = executor.runHooks([], ['test']);
      expect(result).toBeUndefined();
    });

    it('should handle invalid hook names', () => {
      const plugin = createTestPlugin();
      expect(() =>
        executor.runHooks([plugin], ['nonexistentHook'])
      ).not.toThrow();
    });

    it('should handle maximum number of plugins', () => {
      const maxPlugins = Array(100)
        .fill(null)
        .map(() => createTestPlugin());
      maxPlugins.forEach((plugin) => executor.use(plugin));
      expect(executor['plugins'].length).toBeLessThanOrEqual(100);
    });
  });
});
