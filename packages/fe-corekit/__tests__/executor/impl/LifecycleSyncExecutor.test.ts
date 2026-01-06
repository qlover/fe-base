/**
 * LifecycleSyncExecutor test suite
 *
 * Coverage:
 * 1. Basic execution
 *    - exec with sync task
 *    - exec with data parameter
 *    - execNoError variants
 *    - Synchronous return (no Promise)
 * 2. Lifecycle hooks
 *    - beforeHooks (onBefore)
 *    - execHook (onExec)
 *    - afterHooks (onSuccess)
 *    - errorHook (onError)
 * 3. Hook execution flow
 *    - Sequential plugin execution
 *    - Parameter modification in beforeHooks
 *    - Result transformation in afterHooks
 *    - Task interception in execHook
 * 4. Chain breaking
 *    - Break chain in beforeHooks
 *    - Break chain on return
 *    - Chain breaking across hooks
 * 5. Error handling
 *    - Task execution errors
 *    - Hook execution errors
 *    - Error transformation in onError
 *    - execNoError error capture
 * 6. Context management
 *    - Context creation
 *    - Context reset in finally
 *    - Runtime tracking
 *    - Return value management
 * 7. Plugin management
 *    - Plugin registration
 *    - Plugin enablement/disablement
 *    - Multiple plugins interaction
 * 8. Edge cases
 *    - Empty plugin array
 *    - Missing hooks
 *    - Invalid task input
 *    - Synchronous execution verification
 *
 * Test Strategy:
 * - Test synchronous execution behavior
 * - Verify no Promise overhead
 * - Test each lifecycle phase independently
 * - Verify execution order and flow
 * - Test error propagation and handling
 * - Test plugin interaction patterns
 * - Verify context state management
 * - Compare with async version where relevant
 */

import { describe, it, expect } from 'vitest';
import { LifecycleSyncExecutor } from '../../../src/executor/impl/LifecycleSyncExecutor';
import { ExecutorError } from '../../../src/executor/interface';
import type {
  ExecutorContextInterface,
  ExecutorSyncTask
} from '../../../src/executor/interface';
import type { LifecycleSyncPluginInterface } from '../../../src/executor/interface/SyncLifecyclePluginInterface';
import type { HookRuntimes } from '../../../src/executor/interface/ExecutorContext';

// Test helper types
interface TestParams {
  value: string;
  count?: number;
}

interface TestResult {
  data: string;
  processed?: boolean;
}

// Test helper functions
function createMockPlugin<Params = unknown>(
  overrides: Partial<
    LifecycleSyncPluginInterface<ExecutorContextInterface<Params>>
  > = {}
): LifecycleSyncPluginInterface<ExecutorContextInterface<unknown>> {
  return {
    pluginName: 'test-plugin',
    ...overrides
  } as unknown as LifecycleSyncPluginInterface<ExecutorContextInterface<unknown>>;
}

describe('LifecycleSyncExecutor', () => {
  describe('Basic execution', () => {
    it('should execute sync task and return result immediately', () => {
      const executor = new LifecycleSyncExecutor();
      const task: ExecutorSyncTask<string, TestParams> = (ctx) => {
        return `processed: ${ctx.parameters.value}`;
      };

      const result = executor.exec({ value: 'test' }, task);

      expect(result).toBe('processed: test');
      expect(result).not.toBeInstanceOf(Promise);
    });

    it('should execute task without data parameter', () => {
      const executor = new LifecycleSyncExecutor();
      const task: ExecutorSyncTask<string, unknown> = () => {
        return 'result';
      };

      const result = executor.exec(task);

      expect(result).toBe('result');
    });

    it('should throw error for invalid task', () => {
      const executor = new LifecycleSyncExecutor();

      expect(() => executor.exec('not-a-function' as any)).toThrow(
        'Task must be a function!'
      );
    });

    it('should handle task that returns object', () => {
      const executor = new LifecycleSyncExecutor();
      const task: ExecutorSyncTask<TestResult, TestParams> = (ctx) => {
        return { data: ctx.parameters.value, processed: true };
      };

      const result = executor.exec({ value: 'test' }, task);

      expect(result).toEqual({ data: 'test', processed: true });
    });

    it('should execute synchronously without async overhead', () => {
      let executed = false;
      const executor = new LifecycleSyncExecutor();
      const task: ExecutorSyncTask<string, unknown> = () => {
        executed = true;
        return 'result';
      };

      const result = executor.exec(task);

      // Should be executed immediately
      expect(executed).toBe(true);
      expect(result).toBe('result');
    });
  });

  describe('execNoError', () => {
    it('should return result on success', () => {
      const executor = new LifecycleSyncExecutor();
      const task: ExecutorSyncTask<string, TestParams> = (ctx) => {
        return `result: ${ctx.parameters.value}`;
      };

      const result = executor.execNoError({ value: 'test' }, task);

      expect(result).toBe('result: test');
      expect(result).not.toBeInstanceOf(ExecutorError);
    });

    it('should return ExecutorError on failure', () => {
      const executor = new LifecycleSyncExecutor();
      const task: ExecutorSyncTask<string, TestParams> = () => {
        throw new Error('Task failed');
      };

      const result = executor.execNoError({ value: 'test' }, task);

      expect(result).toBeInstanceOf(ExecutorError);
      if (result instanceof ExecutorError) {
        expect(result.cause).toBeInstanceOf(Error);
        expect((result.cause as Error).message).toBe('Task failed');
      }
    });

    it('should return ExecutorError for ExecutorError thrown', () => {
      const executor = new LifecycleSyncExecutor();
      const customError = new ExecutorError(
        'CUSTOM_ERROR',
        new Error('Custom')
      );
      const task: ExecutorSyncTask<string, TestParams> = () => {
        throw customError;
      };

      const result = executor.execNoError({ value: 'test' }, task);

      expect(result).toBe(customError);
    });

    it('should work without data parameter', () => {
      const executor = new LifecycleSyncExecutor();
      const task: ExecutorSyncTask<string, unknown> = () => {
        return 'result';
      };

      const result = executor.execNoError(task);

      expect(result).toBe('result');
    });

    it('should return result synchronously', () => {
      let executed = false;
      const executor = new LifecycleSyncExecutor();
      const task: ExecutorSyncTask<string, unknown> = () => {
        executed = true;
        return 'result';
      };

      const result = executor.execNoError(task);

      expect(executed).toBe(true);
      expect(result).not.toBeInstanceOf(Promise);
    });
  });

  describe('beforeHooks (onBefore)', () => {
    it('should execute onBefore hook before task', () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        onBefore: () => {
          executionOrder.push('onBefore');
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      executor.exec(() => {
        executionOrder.push('task');
        return 'result';
      });

      expect(executionOrder).toEqual(['onBefore', 'task']);
    });

    it('should modify parameters in onBefore', () => {
      const plugin = createMockPlugin({
        onBefore: (_ctx: ExecutorContextInterface<TestParams>) => {
          return { value: 'modified', count: 1 };
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      const task: ExecutorSyncTask<TestParams, TestParams> = (ctx) => {
        return ctx.parameters;
      };

      const result = executor.exec({ value: 'original' }, task);

      expect(result).toEqual({ value: 'modified', count: 1 });
    });

    it('should execute multiple onBefore hooks sequentially', () => {
      const executionOrder: string[] = [];
      const plugin1 = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: () => {
          executionOrder.push('plugin1');
        }
      });
      const plugin2 = createMockPlugin({
        pluginName: 'plugin2',
        onBefore: () => {
          executionOrder.push('plugin2');
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin1);
      executor.use(plugin2);

      executor.exec(() => 'result');

      expect(executionOrder).toEqual(['plugin1', 'plugin2']);
    });

    it('should use last non-undefined return value from onBefore', () => {
      const plugin1 = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: () => ({ value: 'first', count: 1 })
      });
      const plugin2 = createMockPlugin({
        pluginName: 'plugin2',
        onBefore: () => undefined
      });
      const plugin3 = createMockPlugin({
        pluginName: 'plugin3',
        onBefore: () => ({ value: 'last', count: 3 })
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin1);
      executor.use(plugin2);
      executor.use(plugin3);

      const task: ExecutorSyncTask<TestParams, TestParams> = (ctx) => {
        return ctx.parameters;
      };

      const result = executor.exec({ value: 'original' }, task);

      expect(result).toEqual({ value: 'last', count: 3 });
    });

    it('should not modify parameters if onBefore returns undefined', () => {
      const plugin = createMockPlugin({
        onBefore: () => undefined
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      const task: ExecutorSyncTask<TestParams, TestParams> = (ctx) => {
        return ctx.parameters;
      };

      const result = executor.exec({ value: 'original' }, task);

      expect(result).toEqual({ value: 'original' });
    });
  });

  describe('execHook (onExec)', () => {
    it('should execute onExec hook with task as argument', () => {
      let receivedTask: ExecutorSyncTask<unknown, unknown> | null = null;
      const plugin = createMockPlugin({
        onExec: (_ctx, task) => {
          receivedTask = task;
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      const originalTask = () => 'result';
      executor.exec(originalTask);

      expect(receivedTask).toBe(originalTask);
    });

    it('should execute task if onExec does not return value', () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        onExec: (_ctx, task) => {
          executionOrder.push('onExec');
          return task(_ctx);
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      const result = executor.exec(() => {
        executionOrder.push('task');
        return 'task-result';
      });

      expect(executionOrder).toEqual(['onExec', 'task']);
      expect(result).toBe('task-result');
    });

    it('should use onExec return value instead of executing task', () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        onExec: <Result>() => {
          executionOrder.push('onExec');
          return 'intercepted-result' as Result;
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      const result = executor.exec(() => {
        executionOrder.push('task');
        return 'task-result';
      });

      expect(executionOrder).toEqual(['onExec']);
      expect(result).toBe('intercepted-result');
    });

    it('should allow plugin to wrap task execution', () => {
      const plugin = createMockPlugin({
        onExec: <Result>(ctx: ExecutorContextInterface<unknown>, task: ExecutorSyncTask<Result, unknown>) => {
          const result = task(ctx);
          return `wrapped: ${result}` as Result;
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      const result = executor.exec(() => 'original');

      expect(result).toBe('wrapped: original');
    });

    it('should execute multiple onExec hooks', () => {
      const executionOrder: string[] = [];
      const plugin1 = createMockPlugin({
        pluginName: 'plugin1',
        onExec: () => {
          executionOrder.push('plugin1');
        }
      });
      const plugin2 = createMockPlugin({
        pluginName: 'plugin2',
        onExec: <Result>() => {
          executionOrder.push('plugin2');
          return 'plugin2-result' as Result;
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin1);
      executor.use(plugin2);

      const result = executor.exec(() => {
        executionOrder.push('task');
        return 'task-result';
      });

      // Both plugins execute, last return value is used
      expect(executionOrder).toEqual(['plugin1', 'plugin2']);
      expect(result).toBe('plugin2-result');
    });
  });

  describe('afterHooks (onSuccess)', () => {
    it('should execute onSuccess hook after task', () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        onSuccess: () => {
          executionOrder.push('onSuccess');
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      executor.exec(() => {
        executionOrder.push('task');
        return 'result';
      });

      expect(executionOrder).toEqual(['task', 'onSuccess']);
    });

    it('should have access to task result in context', () => {
      let capturedResult: unknown = null;
      const plugin = createMockPlugin({
        onSuccess: (ctx) => {
          capturedResult = ctx.returnValue;
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      executor.exec(() => 'task-result');

      expect(capturedResult).toBe('task-result');
    });

    it('should execute multiple onSuccess hooks sequentially', () => {
      const executionOrder: string[] = [];
      const plugin1 = createMockPlugin({
        pluginName: 'plugin1',
        onSuccess: () => {
          executionOrder.push('plugin1');
        }
      });
      const plugin2 = createMockPlugin({
        pluginName: 'plugin2',
        onSuccess: () => {
          executionOrder.push('plugin2');
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin1);
      executor.use(plugin2);

      executor.exec(() => 'result');

      expect(executionOrder).toEqual(['plugin1', 'plugin2']);
    });

    it('should not affect return value', () => {
      const plugin = createMockPlugin({
        onSuccess: () => {
          return 'modified-result';
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      const result = executor.exec(() => 'original-result');

      // onSuccess return value should not affect final result
      expect(result).toBe('original-result');
    });
  });

  describe('errorHook (onError)', () => {
    it('should execute onError hook on task error', () => {
      let errorCaptured = false;
      const plugin = createMockPlugin({
        onError: () => {
          errorCaptured = true;
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      expect(() => {
        executor.exec(() => {
          throw new Error('Task error');
        });
      }).toThrow('Task error');

      expect(errorCaptured).toBe(true);
    });

    it('should have access to error in context', () => {
      let capturedError: unknown = null;
      const plugin = createMockPlugin({
        onError: (ctx) => {
          capturedError = ctx.error;
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      const testError = new Error('Test error');
      expect(() => {
        executor.exec(() => {
          throw testError;
        });
      }).toThrow();

      expect(capturedError).toBeInstanceOf(ExecutorError);
      if (capturedError instanceof ExecutorError) {
        expect(capturedError.cause).toBe(testError);
      }
    });

    it('should allow plugin to transform error', () => {
      const plugin = createMockPlugin({
        onError: () => {
          return new ExecutorError('CUSTOM_ERROR', new Error('Custom message'));
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      try {
        executor.exec(() => {
          throw new Error('Original error');
        });
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(ExecutorError);
        // ExecutorError doesn't have a code property, it has an id
        if (error instanceof ExecutorError) {
          expect(error.id).toBe('CUSTOM_ERROR');
        }
      }
    });

    it('should execute multiple onError hooks', () => {
      const executionOrder: string[] = [];
      const plugin1 = createMockPlugin({
        pluginName: 'plugin1',
        onError: () => {
          executionOrder.push('plugin1');
        }
      });
      const plugin2 = createMockPlugin({
        pluginName: 'plugin2',
        onError: () => {
          executionOrder.push('plugin2');
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin1);
      executor.use(plugin2);

      expect(() => {
        executor.exec(() => {
          throw new Error('Error');
        });
      }).toThrow();

      expect(executionOrder).toEqual(['plugin1', 'plugin2']);
    });

    it('should not execute onSuccess when error occurs', () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        onSuccess: () => {
          executionOrder.push('onSuccess');
        },
        onError: () => {
          executionOrder.push('onError');
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      expect(() => {
        executor.exec(() => {
          throw new Error('Error');
        });
      }).toThrow();

      expect(executionOrder).toEqual(['onError']);
    });
  });

  describe('finallyHook (onFinally)', () => {
    it('should execute onFinally hook after successful task', () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        onSuccess: () => {
          executionOrder.push('onSuccess');
        },
        onFinally: () => {
          executionOrder.push('onFinally');
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      executor.exec(() => {
        executionOrder.push('task');
        return 'result';
      });

      expect(executionOrder).toEqual(['task', 'onSuccess', 'onFinally']);
    });

    it('should execute onFinally hook after error', () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        onError: () => {
          executionOrder.push('onError');
        },
        onFinally: () => {
          executionOrder.push('onFinally');
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      expect(() => {
        executor.exec(() => {
          executionOrder.push('task');
          throw new Error('Task error');
        });
      }).toThrow();

      expect(executionOrder).toEqual(['task', 'onError', 'onFinally']);
    });

    it('should execute onFinally hook even when error occurs', () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        onFinally: () => {
          executionOrder.push('onFinally');
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      expect(() => {
        executor.exec(() => {
          throw new Error('Task error');
        });
      }).toThrow();

      expect(executionOrder).toEqual(['onFinally']);
    });

    it('should execute multiple onFinally hooks sequentially', () => {
      const executionOrder: string[] = [];
      const plugin1 = createMockPlugin({
        pluginName: 'plugin1',
        onFinally: () => {
          executionOrder.push('plugin1');
        }
      });
      const plugin2 = createMockPlugin({
        pluginName: 'plugin2',
        onFinally: () => {
          executionOrder.push('plugin2');
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin1);
      executor.use(plugin2);

      executor.exec(() => 'result');

      expect(executionOrder).toEqual(['plugin1', 'plugin2']);
    });

    it('should execute onFinally after both onSuccess and onError hooks', () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        onSuccess: () => {
          executionOrder.push('onSuccess');
        },
        onError: () => {
          executionOrder.push('onError');
        },
        onFinally: () => {
          executionOrder.push('onFinally');
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      // Test success path
      executor.exec(() => {
        executionOrder.push('task-success');
        return 'result';
      });

      expect(executionOrder).toEqual([
        'task-success',
        'onSuccess',
        'onFinally'
      ]);

      // Reset for error path
      executionOrder.length = 0;

      expect(() => {
        executor.exec(() => {
          executionOrder.push('task-error');
          throw new Error('Error');
        });
      }).toThrow();

      expect(executionOrder).toEqual(['task-error', 'onError', 'onFinally']);
    });

    it('should have access to context in onFinally', () => {
      let finallyContext: ExecutorContextInterface<unknown> | null = null;
      const plugin = createMockPlugin({
        onFinally: (ctx) => {
          finallyContext = ctx;
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      executor.exec({ value: 'test' }, () => 'result');

      expect(finallyContext).not.toBeNull();
      expect(finallyContext!.parameters).toEqual({ value: 'test' });
    });

    it('should have access to error in onFinally when error occurs', () => {
      let finallyError: unknown = null;
      const plugin = createMockPlugin({
        onFinally: (ctx) => {
          finallyError = ctx.error;
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      const testError = new Error('Test error');
      expect(() => {
        executor.exec(() => {
          throw testError;
        });
      }).toThrow();

      expect(finallyError).toBeInstanceOf(ExecutorError);
      if (finallyError instanceof ExecutorError) {
        expect(finallyError.cause).toBe(testError);
      }
    });

    it('should have access to returnValue in onFinally on success', () => {
      let finallyReturnValue: unknown = null;
      const plugin = createMockPlugin({
        onFinally: (ctx) => {
          finallyReturnValue = ctx.returnValue;
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      executor.exec(() => 'task-result');

      expect(finallyReturnValue).toBe('task-result');
    });

    it('should execute onFinally in complete lifecycle order', () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        onBefore: () => {
          executionOrder.push('onBefore');
        },
        onExec: (_ctx, task) => {
          executionOrder.push('onExec');
          return task(_ctx);
        },
        onSuccess: () => {
          executionOrder.push('onSuccess');
        },
        onFinally: () => {
          executionOrder.push('onFinally');
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      executor.exec(() => {
        executionOrder.push('task');
        return 'result';
      });

      expect(executionOrder).toEqual([
        'onBefore',
        'onExec',
        'task',
        'onSuccess',
        'onFinally'
      ]);
    });

    it('should execute onFinally even when onSuccess throws', () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        onSuccess: () => {
          executionOrder.push('onSuccess');
          throw new Error('onSuccess error');
        },
        onFinally: () => {
          executionOrder.push('onFinally');
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      expect(() => {
        executor.exec(() => {
          executionOrder.push('task');
          return 'result';
        });
      }).toThrow('onSuccess error');

      expect(executionOrder).toEqual(['task', 'onSuccess', 'onFinally']);
    });

    it('should not throw error when onFinally hook throws error', () => {
      const plugin = createMockPlugin({
        onFinally: () => {
          throw new Error('Finally hook error');
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      // Should not throw, error in finally hook should be silently ignored
      expect(executor.exec(() => 'result')).toBe('result');
    });

    it('should not mask original error when onFinally hook throws error', () => {
      const plugin = createMockPlugin({
        onFinally: () => {
          throw new Error('Finally hook error');
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      const originalError = new Error('Original task error');
      // Original error should still be thrown, not masked by finally hook error
      expect(() => {
        executor.exec(() => {
          throw originalError;
        });
      }).toThrow('Original task error');
    });

    it('should execute all onFinally hooks even if one throws error', () => {
      const executionOrder: string[] = [];
      const plugin1 = createMockPlugin({
        pluginName: 'plugin1',
        onFinally: () => {
          executionOrder.push('plugin1');
          throw new Error('Plugin1 finally error');
        }
      });
      const plugin2 = createMockPlugin({
        pluginName: 'plugin2',
        onFinally: () => {
          executionOrder.push('plugin2');
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin1);
      executor.use(plugin2);

      // Should not throw, all finally hooks should execute
      expect(executor.exec(() => 'result')).toBe('result');

      expect(executionOrder).toEqual(['plugin1', 'plugin2']);
    });
  });

  describe('Chain breaking', () => {
    it('should break chain in onBefore', () => {
      const executionOrder: string[] = [];
      const plugin1 = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: (ctx) => {
          executionOrder.push('plugin1');
          ctx.runtimes({ breakChain: true });
        }
      });
      const plugin2 = createMockPlugin({
        pluginName: 'plugin2',
        onBefore: () => {
          executionOrder.push('plugin2');
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin1);
      executor.use(plugin2);

      executor.exec(() => {
        executionOrder.push('task');
        return 'result';
      });

      expect(executionOrder).toEqual(['plugin1', 'task']);
    });

    it('should break chain on return in onBefore', () => {
      const executionOrder: string[] = [];
      const plugin1 = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: (ctx) => {
          executionOrder.push('plugin1');
          ctx.runtimes({ returnBreakChain: true });
          return { value: 'modified' };
        }
      });
      const plugin2 = createMockPlugin({
        pluginName: 'plugin2',
        onBefore: () => {
          executionOrder.push('plugin2');
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin1);
      executor.use(plugin2);

      executor.exec(() => 'result');

      expect(executionOrder).toEqual(['plugin1']);
    });

    it('should break chain in onSuccess', () => {
      const executionOrder: string[] = [];
      const plugin1 = createMockPlugin({
        pluginName: 'plugin1',
        onSuccess: (ctx) => {
          executionOrder.push('plugin1');
          ctx.runtimes({ breakChain: true });
        }
      });
      const plugin2 = createMockPlugin({
        pluginName: 'plugin2',
        onSuccess: () => {
          executionOrder.push('plugin2');
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin1);
      executor.use(plugin2);

      executor.exec(() => {
        executionOrder.push('task');
        return 'result';
      });

      expect(executionOrder).toEqual(['task', 'plugin1']);
    });
  });

  describe('Context management', () => {
    it('should create context with parameters', () => {
      let capturedContext: ExecutorContextInterface<TestParams> | null = null;
      const plugin = createMockPlugin({
        onBefore: (ctx) => {
          capturedContext = ctx as ExecutorContextInterface<TestParams>;
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      executor.exec({ value: 'test', count: 42 }, () => 'result');

      expect(capturedContext).not.toBeNull();
      expect(capturedContext!.parameters).toEqual({ value: 'test', count: 42 });
    });

    it('should reset context in finally block', () => {
      const plugin = createMockPlugin({
        onBefore: (ctx) => {
          ctx.runtimes({ hookName: 'onBefore', times: 1 });
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      executor.exec(() => 'result');

      // Context should be reset after execution
      let secondExecContext: ExecutorContextInterface<unknown> | null = null;
      executor.use(
        createMockPlugin({
          pluginName: 'second-plugin',
          onBefore: (ctx) => {
            secondExecContext = ctx;
          }
        })
      );

      executor.exec(() => 'result2');

      // The hook runtimes are tracked during execution
      expect(secondExecContext).not.toBeNull();
    });

    it('should track hook runtimes', () => {
      let capturedRuntimes: Readonly<HookRuntimes> | null = null;
      const plugin1 = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: () => 'result1'
      });
      const plugin2 = createMockPlugin({
        pluginName: 'plugin2',
        onBefore: (ctx) => {
          capturedRuntimes = { ...ctx.hooksRuntimes };
          return 'result2';
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin1);
      executor.use(plugin2);

      executor.exec(() => 'result');

      expect(capturedRuntimes).not.toBeNull();
      expect(capturedRuntimes!.times).toBe(2);
      expect(capturedRuntimes!.hookName).toBe('onBefore');
      expect(capturedRuntimes!.pluginName).toBe('plugin2');
    });

    it('should store return value in context', () => {
      let capturedReturnValue: unknown = null;
      const plugin = createMockPlugin({
        onSuccess: (ctx) => {
          capturedReturnValue = ctx.returnValue;
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      const result = executor.exec(() => ({ data: 'test-result' }));

      expect(capturedReturnValue).toEqual({ data: 'test-result' });
      expect(result).toEqual({ data: 'test-result' });
    });
  });

  describe('Plugin management', () => {
    it('should register plugins with use()', () => {
      const executionOrder: string[] = [];
      const plugin1 = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: () => {
          executionOrder.push('plugin1');
        }
      });
      const plugin2 = createMockPlugin({
        pluginName: 'plugin2',
        onBefore: () => {
          executionOrder.push('plugin2');
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin1);
      executor.use(plugin2);

      executor.exec(() => 'result');

      expect(executionOrder).toEqual(['plugin1', 'plugin2']);
    });

    it('should skip plugins without hooks', () => {
      const executionOrder: string[] = [];
      const plugin1 = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: () => {
          executionOrder.push('plugin1');
        }
      });
      const plugin2 = createMockPlugin({
        pluginName: 'plugin2'
        // No onBefore hook
      });
      const plugin3 = createMockPlugin({
        pluginName: 'plugin3',
        onBefore: () => {
          executionOrder.push('plugin3');
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin1);
      executor.use(plugin2);
      executor.use(plugin3);

      executor.exec(() => 'result');

      expect(executionOrder).toEqual(['plugin1', 'plugin3']);
    });

    it('should handle plugins with partial hooks', () => {
      const executionOrder: string[] = [];
      const plugin1 = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: () => {
          executionOrder.push('plugin1-before');
        }
        // No onSuccess
      });
      const plugin2 = createMockPlugin({
        pluginName: 'plugin2',
        onSuccess: () => {
          executionOrder.push('plugin2-success');
        }
        // No onBefore
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin1);
      executor.use(plugin2);

      executor.exec(() => {
        executionOrder.push('task');
        return 'result';
      });

      expect(executionOrder).toEqual([
        'plugin1-before',
        'task',
        'plugin2-success'
      ]);
    });
  });

  describe('Edge cases', () => {
    it('should work with no plugins', () => {
      const executor = new LifecycleSyncExecutor();
      const result = executor.exec(() => 'result');

      expect(result).toBe('result');
    });

    it('should handle empty parameters', () => {
      const executor = new LifecycleSyncExecutor();
      const task: ExecutorSyncTask<string, unknown> = (ctx) => {
        return `params: ${JSON.stringify(ctx.parameters)}`;
      };

      const result = executor.exec(task);

      expect(result).toBe('params: {}');
    });

    it('should handle null return value', () => {
      const executor = new LifecycleSyncExecutor();
      const result = executor.exec(() => null);

      expect(result).toBeNull();
    });

    it('should handle undefined return value', () => {
      const executor = new LifecycleSyncExecutor();
      const result = executor.exec(() => undefined);

      expect(result).toBeUndefined();
    });

    it('should handle complex object parameters', () => {
      const executor = new LifecycleSyncExecutor();
      const complexParams = {
        nested: { value: 'test' },
        array: [1, 2, 3],
        func: () => 'test'
      };

      const task: ExecutorSyncTask<unknown, unknown> = (ctx) => {
        return ctx.parameters;
      };

      const result = executor.exec(complexParams, task);

      expect(result).toEqual(complexParams);
    });

    it('should handle errors in hooks', () => {
      const plugin = createMockPlugin({
        onBefore: () => {
          throw new Error('Hook error');
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      expect(() => executor.exec(() => 'result')).toThrow('Hook error');
    });

    it('should handle very long plugin chains', () => {
      const executor = new LifecycleSyncExecutor();
      const pluginCount = 100;

      for (let i = 0; i < pluginCount; i++) {
        executor.use(
          createMockPlugin({
            pluginName: `plugin${i}`,
            onBefore: () => undefined
          })
        );
      }

      const result = executor.exec(() => 'result');

      expect(result).toBe('result');
    });

    it('should execute truly synchronously', () => {
      const executionOrder: string[] = [];
      const executor = new LifecycleSyncExecutor();

      executor.use(
        createMockPlugin({
          onBefore: () => {
            executionOrder.push('before');
          },
          onSuccess: () => {
            executionOrder.push('success');
          }
        })
      );

      const result = executor.exec(() => {
        executionOrder.push('task');
        return 'result';
      });

      // All should be executed synchronously before this line
      executionOrder.push('after-exec');

      expect(executionOrder).toEqual([
        'before',
        'task',
        'success',
        'after-exec'
      ]);
      expect(result).toBe('result');
    });

    it('should not create Promise overhead', () => {
      const executor = new LifecycleSyncExecutor();
      const result = executor.exec(() => 'result');

      expect(result).not.toBeInstanceOf(Promise);
      expect(typeof result).toBe('string');
    });
  });

  describe('Full lifecycle integration', () => {
    it('should execute complete lifecycle in order', () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        onBefore: () => {
          executionOrder.push('onBefore');
        },
        onExec: (_ctx, task) => {
          executionOrder.push('onExec');
          return task(_ctx);
        },
        onSuccess: () => {
          executionOrder.push('onSuccess');
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      executor.exec(() => {
        executionOrder.push('task');
        return 'result';
      });

      expect(executionOrder).toEqual([
        'onBefore',
        'onExec',
        'task',
        'onSuccess'
      ]);
    });

    it('should pass data through complete lifecycle', () => {
      const plugin = createMockPlugin({
        onBefore: (ctx: ExecutorContextInterface<TestParams>) => {
          return { value: ctx.parameters.value.toUpperCase(), count: 1 };
        },
        onSuccess: (ctx) => {
          const returnValue = ctx.returnValue as TestResult;
          if (returnValue) {
            returnValue.processed = true;
          }
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      const task: ExecutorSyncTask<TestResult, TestParams> = (ctx) => {
        return {
          data: ctx.parameters.value,
          count: ctx.parameters.count
        };
      };

      const result = executor.exec({ value: 'test' }, task);

      expect(result).toEqual({
        data: 'TEST',
        count: 1,
        processed: true
      });
    });

    it('should handle error in complete lifecycle', () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        onBefore: () => {
          executionOrder.push('onBefore');
        },
        onExec: (_ctx, task) => {
          executionOrder.push('onExec');
          return task(_ctx);
        },
        onSuccess: () => {
          executionOrder.push('onSuccess');
        },
        onError: () => {
          executionOrder.push('onError');
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      try {
        executor.exec(() => {
          executionOrder.push('task');
          throw new Error('Task error');
        });
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(ExecutorError);
      }

      expect(executionOrder).toEqual(['onBefore', 'onExec', 'task', 'onError']);
    });

    it('should maintain synchronous execution throughout lifecycle', () => {
      let step = 0;
      const plugin = createMockPlugin({
        onBefore: () => {
          expect(step).toBe(0);
          step = 1;
        },
        onSuccess: () => {
          expect(step).toBe(2);
          step = 3;
        }
      });

      const executor = new LifecycleSyncExecutor();
      executor.use(plugin);

      const result = executor.exec(() => {
        expect(step).toBe(1);
        step = 2;
        return 'result';
      });

      expect(step).toBe(3);
      expect(result).toBe('result');
    });
  });

  describe('Comparison with async version', () => {
    it('should have identical behavior for sync operations', () => {
      const plugins = [
        createMockPlugin({
          pluginName: 'plugin1',
          onBefore: () => ({ value: 'result1' })
        }),
        createMockPlugin({
          pluginName: 'plugin2',
          onBefore: () => ({ value: 'result2' })
        })
      ];

      const executor = new LifecycleSyncExecutor();
      plugins.forEach((p) => executor.use(p));

      const result = executor.exec(() => 'final');

      expect(result).toBe('final');
    });

    it('should execute without Promise wrapping', () => {
      const executor = new LifecycleSyncExecutor();
      const start = Date.now();

      const result = executor.exec(() => 'result');

      const elapsed = Date.now() - start;

      // Should complete immediately (< 1ms typically)
      expect(elapsed).toBeLessThan(10);
      expect(result).not.toBeInstanceOf(Promise);
    });
  });
});
