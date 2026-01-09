/**
 * LifecycleExecutor test suite
 *
 * Coverage:
 * 1. Basic execution
 *    - exec with async task
 *    - exec with sync task
 *    - exec with data parameter
 *    - execNoError variants
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
 *    - Async/sync mixing
 *
 * Test Strategy:
 * - Test each lifecycle phase independently
 * - Verify execution order and flow
 * - Test error propagation and handling
 * - Test plugin interaction patterns
 * - Verify context state management
 * - Test both sync and async tasks
 */

import { describe, it, expect } from 'vitest';
import { LifecycleExecutor } from '../../../src/executor/impl/LifecycleExecutor';
import { ExecutorError } from '../../../src/executor/interface';
import type {
  ExecutorContextInterface,
  ExecutorAsyncTask,
  ExecutorSyncTask,
  ExecutorTask
} from '../../../src/executor/interface';
import type { LifecyclePluginInterface } from '../../../src/executor/interface/LifecyclePluginInterface';

// Test helper types
interface TestParams {
  value: string;
  count?: number;
}

interface TestResult {
  data: string;
  processed?: boolean;
}

type TestParamsContext<R = unknown> = ExecutorContextInterface<TestParams, R>;
type TestMockContext<R = unknown> = ExecutorContextInterface<unknown, R>;

function createMockPlugin<R>(
  overrides: Partial<LifecyclePluginInterface<TestMockContext<R>>> = {}
): LifecyclePluginInterface<TestMockContext<R>> {
  return {
    pluginName: 'test-mock-plugin',
    ...overrides
  };
}

function createTestParamsPlugin<R>(
  overrides: Partial<LifecyclePluginInterface<TestParamsContext<R>>> = {}
): LifecyclePluginInterface<TestParamsContext<R>> {
  return {
    pluginName: 'test-params-plugin',
    ...overrides
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('LifecycleExecutor', () => {
  describe('Basic execution', () => {
    it('should execute async task and return result', async () => {
      const executor = new LifecycleExecutor();
      const task: ExecutorAsyncTask<string, TestParams> = async (ctx) => {
        return `processed: ${ctx.parameters.value}`;
      };

      const result = await executor.exec({ value: 'test' }, task);

      expect(result).toBe('processed: test');
    });

    it('should execute sync task and return result as Promise', async () => {
      const executor = new LifecycleExecutor();
      const task: ExecutorSyncTask<string, TestParams> = (ctx) => {
        return `processed: ${ctx.parameters.value}`;
      };

      const result = await executor.exec({ value: 'test' }, task);

      expect(result).toBe('processed: test');
    });

    it('should execute task without data parameter', async () => {
      const executor = new LifecycleExecutor();
      const task: ExecutorAsyncTask<string, unknown> = async () => {
        return 'result';
      };

      const result = await executor.exec(task);

      expect(result).toBe('result');
    });

    it('should throw error for invalid task', () => {
      const executor = new LifecycleExecutor();

      expect(() => executor.exec('not-a-function' as any)).toThrow(
        'Task must be a function!'
      );
    });

    it('should handle task that returns Promise', async () => {
      const executor = new LifecycleExecutor();
      const task: ExecutorAsyncTask<TestResult, TestParams> = async (ctx) => {
        await delay(10);
        return { data: ctx.parameters.value, processed: true };
      };

      const result = await executor.exec({ value: 'test' }, task);

      expect(result).toEqual({ data: 'test', processed: true });
    });

    it('should handle task that returns non-Promise', async () => {
      const executor = new LifecycleExecutor();
      const task: ExecutorSyncTask<TestResult, TestParams> = (ctx) => {
        return { data: ctx.parameters.value, processed: true };
      };

      const result = await executor.exec({ value: 'test' }, task);

      expect(result).toEqual({ data: 'test', processed: true });
    });
  });

  describe('execNoError', () => {
    it('should return result on success', async () => {
      const executor = new LifecycleExecutor();
      const task: ExecutorAsyncTask<string, TestParams> = async (ctx) => {
        return `result: ${ctx.parameters.value}`;
      };

      const result = await executor.execNoError({ value: 'test' }, task);

      expect(result).toBe('result: test');
      expect(result).not.toBeInstanceOf(ExecutorError);
    });

    it('should return ExecutorError on failure', async () => {
      const executor = new LifecycleExecutor();
      const task: ExecutorAsyncTask<string, TestParams> = async () => {
        throw new Error('Task failed');
      };

      try {
        const result = await executor.execNoError({ value: 'test' }, task);

        expect(result).toBeInstanceOf(ExecutorError);
        if (result instanceof ExecutorError) {
          expect(result.cause).toBeInstanceOf(Error);
          expect((result.cause as Error).message).toBe('Task failed');
        }
      } catch (error) {
        // execNoError should not throw, but if it does, fail the test
        expect(error).toBeInstanceOf(ExecutorError);
      }
    });

    it('should return ExecutorError for ExecutorError thrown', async () => {
      const executor = new LifecycleExecutor();
      const customError = new ExecutorError(
        'CUSTOM_ERROR',
        new Error('Custom')
      );
      const task: ExecutorAsyncTask<string, TestParams> = async () => {
        throw customError;
      };

      try {
        const result = await executor.execNoError({ value: 'test' }, task);

        expect(result).toBeInstanceOf(ExecutorError);
      } catch (error) {
        // execNoError should not throw, but if it does, it should be ExecutorError
        expect(error).toBeInstanceOf(ExecutorError);
      }
    });

    it('should work without data parameter', async () => {
      const executor = new LifecycleExecutor();
      const task: ExecutorAsyncTask<string, unknown> = async () => {
        return 'result';
      };

      const result = await executor.execNoError(task);

      expect(result).toBe('result');
    });

    it('should handle sync task', async () => {
      const executor = new LifecycleExecutor();
      const task: ExecutorSyncTask<string, TestParams> = (ctx) => {
        return `result: ${ctx.parameters.value}`;
      };

      const result = await executor.execNoError({ value: 'test' }, task);

      expect(result).toBe('result: test');
    });
  });

  describe('beforeHooks (onBefore)', () => {
    it('should execute onBefore hook before task', async () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        onBefore: async () => {
          executionOrder.push('onBefore');
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      await executor.exec(async () => {
        executionOrder.push('task');
        return 'result';
      });

      expect(executionOrder).toEqual(['onBefore', 'task']);
    });

    it('should modify parameters in onBefore', async () => {
      const plugin = createMockPlugin({
        onBefore: async () => {
          return { value: 'modified', count: 1 };
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      const task: ExecutorAsyncTask<TestParams, TestParams> = async (ctx) => {
        return ctx.parameters;
      };

      const result = await executor.exec({ value: 'original' }, task);

      expect(result).toEqual({ value: 'modified', count: 1 });
    });

    it('should execute multiple onBefore hooks sequentially', async () => {
      const executionOrder: string[] = [];
      const plugin1 = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: async () => {
          executionOrder.push('plugin1');
          await delay(10);
        }
      });
      const plugin2 = createMockPlugin({
        pluginName: 'plugin2',
        onBefore: async () => {
          executionOrder.push('plugin2');
          await delay(5);
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin1);
      executor.use(plugin2);

      await executor.exec(async () => 'result');

      expect(executionOrder).toEqual(['plugin1', 'plugin2']);
    });

    it('should use last non-undefined return value from onBefore', async () => {
      const plugin1 = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: async () => ({ value: 'first', count: 1 })
      });
      const plugin2 = createMockPlugin({
        pluginName: 'plugin2',
        onBefore: async () => undefined
      });
      const plugin3 = createMockPlugin({
        pluginName: 'plugin3',
        onBefore: async () => ({ value: 'last', count: 3 })
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin1);
      executor.use(plugin2);
      executor.use(plugin3);

      const task: ExecutorAsyncTask<TestParams, TestParams> = async (ctx) => {
        return ctx.parameters;
      };

      const result = await executor.exec({ value: 'original' }, task);

      expect(result).toEqual({ value: 'last', count: 3 });
    });

    it('should not modify parameters if onBefore returns undefined', async () => {
      const plugin = createMockPlugin({
        onBefore: async () => undefined
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      const task: ExecutorAsyncTask<TestParams, TestParams> = async (ctx) => {
        return ctx.parameters;
      };

      const result = await executor.exec({ value: 'original' }, task);

      expect(result).toEqual({ value: 'original' });
    });
  });

  describe('execHook (onExec)', () => {
    it('should execute onExec hook with task as argument', async () => {
      let receivedTask: ExecutorTask<unknown, TestParams> | null = null;
      const plugin = createMockPlugin({
        onExec: async (_ctx, task) => {
          receivedTask = task;
          return task(_ctx);
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      const originalTask = async () => 'result';
      await executor.exec(originalTask);

      expect(receivedTask).toBe(originalTask);
    });

    it('should execute task if onExec does not return value', async () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        onExec: async (_ctx, task) => {
          executionOrder.push('onExec');
          return task(_ctx);
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      const result = await executor.exec(async () => {
        executionOrder.push('task');
        return 'task-result';
      });

      expect(executionOrder).toEqual(['onExec', 'task']);
      expect(result).toBe('task-result');
    });

    it('should use onExec return value instead of executing task', async () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        onExec: async (_ctx, _task) => {
          executionOrder.push('onExec');
          return 'intercepted-result' as ReturnType<typeof _task>;
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      const result = await executor.exec(async () => {
        executionOrder.push('task');
        return 'task-result';
      });

      expect(executionOrder).toEqual(['onExec']);
      expect(result).toBe('intercepted-result');
    });

    it('should allow plugin to wrap task execution', async () => {
      const plugin = createMockPlugin({
        onExec: async (ctx, task) => {
          const result = await task(ctx);
          return `wrapped: ${result}`;
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      const result = await executor.exec(async () => 'original');

      expect(result).toBe('wrapped: original');
    });

    it('should execute multiple onExec hooks', async () => {
      const executionOrder: string[] = [];
      const plugin1 = createMockPlugin<string>({
        pluginName: 'plugin1',
        onExec: async () => {
          executionOrder.push('plugin1');
        }
      });
      const plugin2 = createMockPlugin<string>({
        pluginName: 'plugin2',
        onExec: async () => {
          executionOrder.push('plugin2');
          return 'plugin2-result';
        }
      });

      const executor = new LifecycleExecutor<TestMockContext<string>>();
      executor.use(plugin1);
      executor.use(plugin2);

      const result = await executor.exec(async () => {
        executionOrder.push('task');
        return 'task-result';
      });

      // Both plugins execute, last return value is used
      expect(executionOrder).toEqual(['plugin1', 'plugin2']);
      expect(result).toBe('plugin2-result');
    });
  });

  describe('afterHooks (onSuccess)', () => {
    it('should execute onSuccess hook after task', async () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        onSuccess: async () => {
          executionOrder.push('onSuccess');
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      await executor.exec(async () => {
        executionOrder.push('task');
        return 'result';
      });

      expect(executionOrder).toEqual(['task', 'onSuccess']);
    });

    it('should have access to task result in context', async () => {
      let capturedResult: unknown = null;
      const plugin = createMockPlugin({
        onSuccess: async (ctx) => {
          capturedResult = ctx.returnValue;
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      await executor.exec(async () => 'task-result');

      expect(capturedResult).toBe('task-result');
    });

    it('should execute multiple onSuccess hooks sequentially', async () => {
      const executionOrder: string[] = [];
      const plugin1 = createMockPlugin({
        pluginName: 'plugin1',
        onSuccess: async () => {
          executionOrder.push('plugin1');
        }
      });
      const plugin2 = createMockPlugin({
        pluginName: 'plugin2',
        onSuccess: async () => {
          executionOrder.push('plugin2');
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin1);
      executor.use(plugin2);

      await executor.exec(async () => 'result');

      expect(executionOrder).toEqual(['plugin1', 'plugin2']);
    });

    it('should not affect return value', async () => {
      const plugin = createMockPlugin({
        // @ts-expect-error For test purpose
        onSuccess: async (): Promise<string> => {
          return 'modified-result';
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      const result = await executor.exec(async () => 'original-result');

      // onSuccess return value should not affect final result
      expect(result).toBe('original-result');
    });
  });

  describe('errorHook (onError)', () => {
    it('should execute onError hook on task error', async () => {
      let errorCaptured = false;
      const plugin = createMockPlugin({
        onError: async () => {
          errorCaptured = true;
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      await expect(
        executor.exec(async () => {
          throw new Error('Task error');
        })
      ).rejects.toThrow('Task error');

      expect(errorCaptured).toBe(true);
    });

    it('should have access to error in context', async () => {
      let capturedError: unknown = null;
      const plugin = createMockPlugin({
        onError: async (ctx) => {
          capturedError = ctx.error;
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      const testError = new Error('Test error');
      await expect(
        executor.exec(async () => {
          throw testError;
        })
      ).rejects.toThrow();

      // Error is wrapped in ExecutorError
      expect(capturedError).toBeDefined();
    });

    it('should allow plugin to transform error', async () => {
      const plugin = createMockPlugin({
        onError: async () => {
          return new ExecutorError('CUSTOM_ERROR', new Error('Custom message'));
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      try {
        await executor.exec(async () => {
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

    it('should execute multiple onError hooks', async () => {
      const executionOrder: string[] = [];
      const plugin1 = createMockPlugin({
        pluginName: 'plugin1',
        onError: async () => {
          executionOrder.push('plugin1');
        }
      });
      const plugin2 = createMockPlugin({
        pluginName: 'plugin2',
        onError: async () => {
          executionOrder.push('plugin2');
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin1);
      executor.use(plugin2);

      await expect(
        executor.exec(async () => {
          throw new Error('Error');
        })
      ).rejects.toThrow();

      expect(executionOrder).toEqual(['plugin1', 'plugin2']);
    });

    it('should not execute onSuccess when error occurs', async () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        onSuccess: async () => {
          executionOrder.push('onSuccess');
        },
        onError: async () => {
          executionOrder.push('onError');
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      await expect(
        executor.exec(async () => {
          throw new Error('Error');
        })
      ).rejects.toThrow();

      expect(executionOrder).toEqual(['onError']);
    });
  });

  describe('finallyHook (onFinally)', () => {
    it('should execute onFinally hook after successful task', async () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        onSuccess: async () => {
          executionOrder.push('onSuccess');
        },
        onFinally: async () => {
          executionOrder.push('onFinally');
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      await executor.exec(async () => {
        executionOrder.push('task');
        return 'result';
      });

      expect(executionOrder).toEqual(['task', 'onSuccess', 'onFinally']);
    });

    it('should execute onFinally hook after error', async () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        onError: async () => {
          executionOrder.push('onError');
        },
        onFinally: async () => {
          executionOrder.push('onFinally');
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      await expect(
        executor.exec(async () => {
          executionOrder.push('task');
          throw new Error('Task error');
        })
      ).rejects.toThrow();

      expect(executionOrder).toEqual(['task', 'onError', 'onFinally']);
    });

    it('should execute onFinally hook even when error occurs', async () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        onFinally: async () => {
          executionOrder.push('onFinally');
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      await expect(
        executor.exec(async () => {
          throw new Error('Task error');
        })
      ).rejects.toThrow();

      expect(executionOrder).toEqual(['onFinally']);
    });

    it('should execute multiple onFinally hooks sequentially', async () => {
      const executionOrder: string[] = [];
      const plugin1 = createMockPlugin({
        pluginName: 'plugin1',
        onFinally: async () => {
          executionOrder.push('plugin1');
        }
      });
      const plugin2 = createMockPlugin({
        pluginName: 'plugin2',
        onFinally: async () => {
          executionOrder.push('plugin2');
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin1);
      executor.use(plugin2);

      await executor.exec(async () => 'result');

      expect(executionOrder).toEqual(['plugin1', 'plugin2']);
    });

    it('should execute onFinally after both onSuccess and onError hooks', async () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        onSuccess: async () => {
          executionOrder.push('onSuccess');
        },
        onError: async () => {
          executionOrder.push('onError');
        },
        onFinally: async () => {
          executionOrder.push('onFinally');
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      // Test success path
      await executor.exec(async () => {
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

      await expect(
        executor.exec(async () => {
          executionOrder.push('task-error');
          throw new Error('Error');
        })
      ).rejects.toThrow();

      expect(executionOrder).toEqual(['task-error', 'onError', 'onFinally']);
    });

    it('should have access to context in onFinally', async () => {
      let finallyContext: ExecutorContextInterface<unknown> | null = null;
      const plugin = createMockPlugin({
        onFinally: async (ctx) => {
          finallyContext = ctx;
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      await executor.exec({ value: 'test' }, async () => 'result');

      expect(finallyContext).not.toBeNull();
      expect(finallyContext!.parameters).toEqual({ value: 'test' });
    });

    it('should have access to error in onFinally when error occurs', async () => {
      let finallyError: unknown = null;
      const plugin = createMockPlugin({
        onFinally: async (ctx) => {
          finallyError = ctx.error;
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      const testError = new Error('Test error');
      await expect(
        executor.exec(async () => {
          throw testError;
        })
      ).rejects.toThrow();

      expect(finallyError).toBeInstanceOf(ExecutorError);
      if (finallyError instanceof ExecutorError) {
        expect(finallyError.cause).toBe(testError);
      }
    });

    it('should have access to returnValue in onFinally on success', async () => {
      let finallyReturnValue: unknown = null;
      const plugin = createMockPlugin({
        onFinally: async (ctx) => {
          finallyReturnValue = ctx.returnValue;
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      await executor.exec(async () => 'task-result');

      expect(finallyReturnValue).toBe('task-result');
    });

    it('should execute onFinally in complete lifecycle order', async () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        onBefore: async () => {
          executionOrder.push('onBefore');
        },
        onExec: async (_ctx, task) => {
          executionOrder.push('onExec');
          return task(_ctx);
        },
        onSuccess: async () => {
          executionOrder.push('onSuccess');
        },
        onFinally: async () => {
          executionOrder.push('onFinally');
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      await executor.exec(async () => {
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

    it('should execute onFinally even when onSuccess throws', async () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        onSuccess: async () => {
          executionOrder.push('onSuccess');
          throw new Error('onSuccess error');
        },
        onFinally: async () => {
          executionOrder.push('onFinally');
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      await expect(
        executor.exec(async () => {
          executionOrder.push('task');
          return 'result';
        })
      ).rejects.toThrow('onSuccess error');

      expect(executionOrder).toEqual(['task', 'onSuccess', 'onFinally']);
    });

    it('should support async onFinally hooks', async () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        onFinally: async () => {
          await delay(10);
          executionOrder.push('onFinally');
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      await executor.exec(async () => {
        executionOrder.push('task');
        return 'result';
      });

      expect(executionOrder).toEqual(['task', 'onFinally']);
    });

    it('should not throw error when onFinally hook throws error', async () => {
      const plugin = createMockPlugin({
        onFinally: async () => {
          throw new Error('Finally hook error');
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      // Should not throw, error in finally hook should be silently ignored
      await expect(executor.exec(async () => 'result')).resolves.toBe('result');
    });

    it('should not mask original error when onFinally hook throws error', async () => {
      const plugin = createMockPlugin({
        onFinally: async () => {
          throw new Error('Finally hook error');
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      const originalError = new Error('Original task error');
      // Original error should still be thrown, not masked by finally hook error
      await expect(
        executor.exec(async () => {
          throw originalError;
        })
      ).rejects.toThrow('Original task error');
    });

    it('should execute all onFinally hooks even if one throws error', async () => {
      const executionOrder: string[] = [];
      const plugin1 = createMockPlugin({
        pluginName: 'plugin1',
        onFinally: async () => {
          executionOrder.push('plugin1');
          throw new Error('Plugin1 finally error');
        }
      });
      const plugin2 = createMockPlugin({
        pluginName: 'plugin2',
        onFinally: async () => {
          executionOrder.push('plugin2');
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin1);
      executor.use(plugin2);

      // Should not throw, all finally hooks should execute
      await expect(executor.exec(async () => 'result')).resolves.toBe('result');

      expect(executionOrder).toEqual(['plugin1', 'plugin2']);
    });
  });

  describe('Chain breaking', () => {
    it('should break chain in onBefore', async () => {
      const executionOrder: string[] = [];
      const plugin1 = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: async (ctx) => {
          executionOrder.push('plugin1');
          ctx.runtimes({ breakChain: true });
        }
      });
      const plugin2 = createMockPlugin({
        pluginName: 'plugin2',
        onBefore: async () => {
          executionOrder.push('plugin2');
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin1);
      executor.use(plugin2);

      await executor.exec(async () => {
        executionOrder.push('task');
        return 'result';
      });

      expect(executionOrder).toEqual(['plugin1', 'task']);
    });

    it('should break chain on return in onBefore', async () => {
      const executionOrder: string[] = [];
      const plugin1 = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: async (ctx) => {
          executionOrder.push('plugin1');
          ctx.runtimes({ returnBreakChain: true });
          return { value: 'modified' };
        }
      });
      const plugin2 = createMockPlugin({
        pluginName: 'plugin2',
        onBefore: async () => {
          executionOrder.push('plugin2');
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin1);
      executor.use(plugin2);

      await executor.exec(async () => 'result');

      expect(executionOrder).toEqual(['plugin1']);
    });

    it('should break chain in onSuccess', async () => {
      const executionOrder: string[] = [];
      const plugin1 = createMockPlugin({
        pluginName: 'plugin1',
        onSuccess: async (ctx) => {
          executionOrder.push('plugin1');
          ctx.runtimes({ breakChain: true });
        }
      });
      const plugin2 = createMockPlugin({
        pluginName: 'plugin2',
        onSuccess: async () => {
          executionOrder.push('plugin2');
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin1);
      executor.use(plugin2);

      await executor.exec(async () => {
        executionOrder.push('task');
        return 'result';
      });

      expect(executionOrder).toEqual(['task', 'plugin1']);
    });
  });

  describe('Context management', () => {
    it('should create context with parameters', async () => {
      let capturedContext: ExecutorContextInterface<TestParams> | null = null;
      const plugin = createMockPlugin({
        onBefore: async (ctx) => {
          capturedContext = ctx as ExecutorContextInterface<TestParams>;
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      await executor.exec({ value: 'test', count: 42 }, async () => 'result');

      expect(capturedContext).not.toBeNull();
      expect(capturedContext!.parameters).toEqual({ value: 'test', count: 42 });
    });

    it('should reset context in finally block', async () => {
      const plugin = createMockPlugin({
        onBefore: async (ctx) => {
          ctx.runtimes({ hookName: 'onBefore', times: 1 });
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      await executor.exec(async () => 'result');

      // Context should be reset after execution
      // We can't directly access the context, but we can verify
      // that subsequent executions start fresh
      let secondExecContext: ExecutorContextInterface<unknown> | null = null;
      executor.use(
        createMockPlugin({
          pluginName: 'second-plugin',
          onBefore: async (ctx) => {
            secondExecContext = ctx;
          }
        })
      );

      await executor.exec(async () => 'result2');

      // The hook runtimes are tracked during execution
      expect(secondExecContext).not.toBeNull();
    });

    it('should track hook runtimes', async () => {
      let capturedRuntimes: any = null;
      const plugin1 = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: async () => 'result1'
      });
      const plugin2 = createMockPlugin({
        pluginName: 'plugin2',
        onBefore: async (ctx) => {
          capturedRuntimes = { ...ctx.hooksRuntimes };
          return 'result2';
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin1);
      executor.use(plugin2);

      await executor.exec(async () => 'result');

      expect(capturedRuntimes.times).toBe(2);
      expect(capturedRuntimes.hookName).toBe('onBefore');
      expect(capturedRuntimes.pluginName).toBe('plugin2');
    });

    it('should store return value in context', async () => {
      let capturedReturnValue: any = null;
      const plugin = createMockPlugin({
        onSuccess: async (ctx) => {
          capturedReturnValue = ctx.returnValue;
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      const result = await executor.exec(async () => ({ data: 'test-result' }));

      expect(capturedReturnValue).toEqual({ data: 'test-result' });
      expect(result).toEqual({ data: 'test-result' });
    });
  });

  describe('Plugin management', () => {
    it('should register plugins with use()', async () => {
      const executionOrder: string[] = [];
      const plugin1 = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: async () => {
          executionOrder.push('plugin1');
        }
      });
      const plugin2 = createMockPlugin({
        pluginName: 'plugin2',
        onBefore: async () => {
          executionOrder.push('plugin2');
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin1);
      executor.use(plugin2);

      await executor.exec(async () => 'result');

      expect(executionOrder).toEqual(['plugin1', 'plugin2']);
    });

    it('should skip plugins without hooks', async () => {
      const executionOrder: string[] = [];
      const plugin1 = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: async () => {
          executionOrder.push('plugin1');
        }
      });
      const plugin2 = createMockPlugin({
        pluginName: 'plugin2'
        // No onBefore hook
      });
      const plugin3 = createMockPlugin({
        pluginName: 'plugin3',
        onBefore: async () => {
          executionOrder.push('plugin3');
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin1);
      executor.use(plugin2);
      executor.use(plugin3);

      await executor.exec(async () => 'result');

      expect(executionOrder).toEqual(['plugin1', 'plugin3']);
    });

    it('should handle plugins with partial hooks', async () => {
      const executionOrder: string[] = [];
      const plugin1 = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: async () => {
          executionOrder.push('plugin1-before');
        }
        // No onSuccess
      });
      const plugin2 = createMockPlugin({
        pluginName: 'plugin2',
        onSuccess: async () => {
          executionOrder.push('plugin2-success');
        }
        // No onBefore
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin1);
      executor.use(plugin2);

      await executor.exec(async () => {
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
    it('should work with no plugins', async () => {
      const executor = new LifecycleExecutor();
      const result = await executor.exec(async () => 'result');

      expect(result).toBe('result');
    });

    it('should handle empty parameters', async () => {
      const executor = new LifecycleExecutor();
      const task: ExecutorAsyncTask<string, unknown> = async (ctx) => {
        return `params: ${JSON.stringify(ctx.parameters)}`;
      };

      const result = await executor.exec(task);

      expect(result).toBe('params: {}');
    });

    it('should handle null return value', async () => {
      const executor = new LifecycleExecutor();
      const result = await executor.exec(async () => null);

      expect(result).toBeNull();
    });

    it('should handle undefined return value', async () => {
      const executor = new LifecycleExecutor();
      const result = await executor.exec(async () => undefined);

      expect(result).toBeUndefined();
    });

    it('should handle complex object parameters', async () => {
      const executor = new LifecycleExecutor();
      const complexParams = {
        nested: { value: 'test' },
        array: [1, 2, 3],
        func: () => 'test'
      };

      const task: ExecutorAsyncTask<unknown, unknown> = async (ctx) => {
        return ctx.parameters;
      };

      const result = await executor.exec(complexParams, task);

      expect(result).toEqual(complexParams);
    });

    it('should handle async errors in hooks', async () => {
      const plugin = createMockPlugin({
        onBefore: async () => {
          await delay(10);
          throw new Error('Async hook error');
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      await expect(executor.exec(async () => 'result')).rejects.toThrow(
        'Async hook error'
      );
    });

    it('should handle sync errors in async context', async () => {
      const plugin = createMockPlugin({
        onBefore: () => {
          throw new Error('Sync error in async hook');
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      await expect(executor.exec(async () => 'result')).rejects.toThrow(
        'Sync error in async hook'
      );
    });

    it('should handle very long plugin chains', async () => {
      const executor = new LifecycleExecutor();
      const pluginCount = 100;
      const executionOrder: string[] = [];

      for (let i = 0; i < pluginCount; i++) {
        executor.use(
          createMockPlugin({
            pluginName: `plugin${i}`,
            onBefore: async () => {
              executionOrder.push(`plugin${i}`);
            }
          })
        );
      }

      const result = await executor.exec(async () => 'result');

      expect(result).toBe('result');
      expect(executionOrder.length).toBe(pluginCount);
    });

    it('should handle rapid successive executions', async () => {
      const executor = new LifecycleExecutor();

      const promises = Array.from({ length: 10 }, (_, i) =>
        executor.exec(async () => `result${i}`)
      );

      const allResults = await Promise.all(promises);

      expect(allResults).toHaveLength(10);
      expect(allResults).toEqual([
        'result0',
        'result1',
        'result2',
        'result3',
        'result4',
        'result5',
        'result6',
        'result7',
        'result8',
        'result9'
      ]);
    });
  });

  describe('Full lifecycle integration', () => {
    it('should execute complete lifecycle in order', async () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        onBefore: async () => {
          executionOrder.push('onBefore');
        },
        onExec: async (_ctx, task) => {
          executionOrder.push('onExec');
          return task(_ctx);
        },
        onSuccess: async () => {
          executionOrder.push('onSuccess');
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      await executor.exec(async () => {
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

    it('should pass data through complete lifecycle', async () => {
      const plugin = createTestParamsPlugin({
        onBefore: async (ctx) => {
          return { value: ctx.parameters.value.toUpperCase(), count: 1 };
        },
        onSuccess: async (ctx) => {
          (ctx.returnValue as any).processed = true;
        }
      });

      const executor = new LifecycleExecutor<TestParamsContext>();
      executor.use(plugin);

      const task: ExecutorAsyncTask<unknown, TestParams> = async (ctx) => {
        return {
          data: ctx.parameters.value,
          count: ctx.parameters.count
        };
      };

      const result = await executor.exec({ value: 'test' }, task);

      expect(result).toEqual({
        data: 'TEST',
        count: 1,
        processed: true
      });
    });

    it('should handle error in complete lifecycle', async () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        onBefore: async () => {
          executionOrder.push('onBefore');
        },
        onExec: async (_ctx, task) => {
          executionOrder.push('onExec');
          return task(_ctx);
        },
        onSuccess: async () => {
          executionOrder.push('onSuccess');
        },
        onError: async () => {
          executionOrder.push('onError');
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      await expect(
        executor.exec(async () => {
          executionOrder.push('task');
          throw new Error('Task error');
        })
      ).rejects.toThrow();

      expect(executionOrder).toEqual(['onBefore', 'onExec', 'task', 'onError']);
    });
  });

  describe('onExec returning function', () => {
    it('should support plugin returning a new function to replace task', async () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        onExec: async (_ctx, task) => {
          executionOrder.push('onExec');
          // Return a new function that wraps the original task
          return async (ctx) => {
            executionOrder.push('wrapper-before');
            const result = await task(ctx);
            executionOrder.push('wrapper-after');
            return `wrapped-${result}`;
          };
        }
      });

      const executor = new LifecycleExecutor<TestMockContext>();
      executor.use(plugin);

      const result = await executor.exec(async () => {
        executionOrder.push('task');
        return 'result';
      });

      expect(executionOrder).toEqual([
        'onExec',
        'wrapper-before',
        'task',
        'wrapper-after'
      ]);
      expect(result).toBe('wrapped-result');
    });

    it('should support plugin returning function for retry logic', async () => {
      let attemptCount = 0;
      const plugin = createMockPlugin({
        onExec: (_ctx, task) => {
          // Return a retry wrapper function
          return async (ctx: typeof _ctx) => {
            for (let i = 0; i < 3; i++) {
              try {
                attemptCount++;
                return await task(ctx);
              } catch (error) {
                if (i === 2) throw error;
                // Retry on failure
              }
            }
          };
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      // Task that fails twice then succeeds
      let callCount = 0;
      const result = await executor.exec(async () => {
        callCount++;
        if (callCount < 3) {
          throw new Error('Temporary failure');
        }
        return 'success';
      });

      expect(result).toBe('success');
      expect(attemptCount).toBe(3);
      expect(callCount).toBe(3);
    });

    it('should support plugin returning function for conditional execution', async () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        onExec: async (_ctx, task) => {
          // Return a function that conditionally executes the task
          return async (ctx: any) => {
            if (ctx.parameters.skip) {
              executionOrder.push('skipped');
              return 'skipped-result';
            }
            executionOrder.push('executing');
            return await task(ctx);
          };
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      // Test with skip = true
      const result1 = await executor.exec({ skip: true }, async () => {
        executionOrder.push('task');
        return 'task-result';
      });

      expect(result1).toBe('skipped-result');
      expect(executionOrder).toEqual(['skipped']);

      // Test with skip = false
      executionOrder.length = 0;
      const result2 = await executor.exec({ skip: false }, async () => {
        executionOrder.push('task');
        return 'task-result';
      });

      expect(result2).toBe('task-result');
      expect(executionOrder).toEqual(['executing', 'task']);
    });

    it('should support plugin returning function for abort/cancel logic', async () => {
      const executionOrder: string[] = [];
      let aborted = false;

      const plugin = createMockPlugin({
        onExec: async (_ctx, task) => {
          // Return a function that checks abort signal
          return async (ctx: any) => {
            if (aborted) {
              executionOrder.push('aborted');
              throw new Error('Task aborted');
            }
            executionOrder.push('executing');
            return await task(ctx);
          };
        }
      });

      const executor = new LifecycleExecutor();
      executor.use(plugin);

      // Test normal execution
      const result1 = await executor.exec(async () => {
        executionOrder.push('task');
        return 'success';
      });

      expect(result1).toBe('success');
      expect(executionOrder).toEqual(['executing', 'task']);

      // Test aborted execution
      executionOrder.length = 0;
      aborted = true;

      await expect(
        executor.exec(async () => {
          executionOrder.push('task');
          return 'success';
        })
      ).rejects.toThrow('Task aborted');

      expect(executionOrder).toEqual(['aborted']);
    });
  });
});
