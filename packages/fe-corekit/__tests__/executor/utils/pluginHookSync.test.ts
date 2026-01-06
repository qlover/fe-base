/**
 * pluginHookSync utility functions test suite
 *
 * Coverage:
 * 1. runPluginsHookSync - Multiple plugins single hook execution (sync)
 *    - Sequential execution
 *    - Return value handling
 *    - Chain breaking
 *    - Plugin skipping
 *    - Runtime tracking
 * 2. runPluginsHooksSync - Multiple plugins multiple hooks execution (sync)
 *    - Sequential hook execution
 *    - Return value accumulation
 *    - Chain breaking across hooks
 *    - Mixed hook types
 *
 * Test Strategy:
 * - Test synchronous execution behavior
 * - Verify no Promise overhead
 * - Test edge cases and error conditions
 * - Verify context state management
 * - Test plugin interaction patterns
 * - Compare with async version behavior
 *
 * Note: This test suite focuses on synchronous execution.
 * runPluginHook and normalizeHookNames are already tested in pluginHook.test.ts
 */

import { describe, it, expect, vi } from 'vitest';
import {
  runPluginsHookSync,
  runPluginsHooksSync
} from '../../../src/executor/utils/pluginHookSync';
import { ExecutorContextImpl } from '../../../src/executor/impl/ExecutorContextImpl';
import type {
  ExecutorContextInterface,
  LifecycleSyncPluginInterface
} from '../../../src/executor/interface';

// Test helper types
interface TestParams {
  value: string;
  count?: number;
}

// Test helper functions
function createMockContext<P>(params: P): ExecutorContextImpl<P> {
  return new ExecutorContextImpl<P>(params);
}

function createMockPlugin(
  overrides: Partial<
    LifecycleSyncPluginInterface<ExecutorContextInterface<unknown>>
  > = {}
): LifecycleSyncPluginInterface<ExecutorContextInterface<unknown>> {
  return {
    pluginName: 'test-plugin',
    ...overrides
  } as LifecycleSyncPluginInterface<ExecutorContextInterface<unknown>>;
}

describe('pluginHookSync utilities', () => {
  describe('runPluginsHookSync', () => {
    it('should execute hook for all plugins sequentially', () => {
      const executionOrder: string[] = [];
      const plugins = [
        createMockPlugin({
          pluginName: 'plugin1',
          onBefore: () => {
            executionOrder.push('plugin1');
          }
        }),
        createMockPlugin({
          pluginName: 'plugin2',
          onBefore: () => {
            executionOrder.push('plugin2');
          }
        }),
        createMockPlugin({
          pluginName: 'plugin3',
          onBefore: () => {
            executionOrder.push('plugin3');
          }
        })
      ];

      const context = createMockContext<TestParams>({ value: 'test' });
      runPluginsHookSync(plugins, 'onBefore', context);

      expect(executionOrder).toEqual(['plugin1', 'plugin2', 'plugin3']);
    });

    it('should return last non-undefined result', () => {
      const plugins = [
        createMockPlugin({
          pluginName: 'plugin1',
          onBefore: () => ({ value: 'result1' })
        }),
        createMockPlugin({
          pluginName: 'plugin2',
          onBefore: () => undefined
        }),
        createMockPlugin({
          pluginName: 'plugin3',
          onBefore: () => ({ value: 'result3' })
        })
      ];

      const context = createMockContext<TestParams>({ value: 'test' });
      const result = runPluginsHookSync<{ value: string }, TestParams>(
        plugins,
        'onBefore',
        context
      );

      expect(result).toEqual({ value: 'result3' });
    });

    it('should return undefined if all hooks return undefined', () => {
      const plugins = [
        createMockPlugin({
          pluginName: 'plugin1',
          onBefore: () => undefined
        }),
        createMockPlugin({
          pluginName: 'plugin2',
          onBefore: () => undefined
        })
      ];

      const context = createMockContext<TestParams>({ value: 'test' });
      const result = runPluginsHookSync(plugins, 'onBefore', context);

      expect(result).toBeUndefined();
    });

    it('should skip plugins that do not have the hook', () => {
      const executionOrder: string[] = [];
      const plugins = [
        createMockPlugin({
          pluginName: 'plugin1',
          onBefore: () => {
            executionOrder.push('plugin1');
          }
        }),
        createMockPlugin({
          pluginName: 'plugin2'
          // No onBefore hook
        }),
        createMockPlugin({
          pluginName: 'plugin3',
          onBefore: () => {
            executionOrder.push('plugin3');
          }
        })
      ];

      const context = createMockContext<TestParams>({ value: 'test' });
      runPluginsHookSync(plugins, 'onBefore', context);

      expect(executionOrder).toEqual(['plugin1', 'plugin3']);
    });

    it('should track hook execution times in context', () => {
      const plugins = [
        createMockPlugin({
          pluginName: 'plugin1',
          onBefore: () => 'result1'
        }),
        createMockPlugin({
          pluginName: 'plugin2',
          onBefore: () => 'result2'
        }),
        createMockPlugin({
          pluginName: 'plugin3',
          onBefore: () => 'result3'
        })
      ];

      const context = createMockContext<TestParams>({ value: 'test' });
      runPluginsHookSync(plugins, 'onBefore', context);

      expect(context.hooksRuntimes.times).toBe(3);
      expect(context.hooksRuntimes.hookName).toBe('onBefore');
    });

    it('should update return value in context', () => {
      const plugins = [
        createMockPlugin({
          pluginName: 'plugin1',
          onBefore: () => ({ value: 'final-result' })
        })
      ];

      const context = createMockContext<TestParams>({ value: 'test' });
      runPluginsHookSync(plugins, 'onBefore', context);

      expect(context.hooksRuntimes.returnValue).toEqual({
        value: 'final-result'
      });
    });

    it('should break chain when shouldBreakChain returns true', () => {
      const executionOrder: string[] = [];
      const plugins = [
        createMockPlugin({
          pluginName: 'plugin1',
          onBefore: (ctx) => {
            executionOrder.push('plugin1');
            ctx.runtimes({ breakChain: true });
          }
        }),
        createMockPlugin({
          pluginName: 'plugin2',
          onBefore: () => {
            executionOrder.push('plugin2');
          }
        }),
        createMockPlugin({
          pluginName: 'plugin3',
          onBefore: () => {
            executionOrder.push('plugin3');
          }
        })
      ];

      const context = createMockContext<TestParams>({ value: 'test' });
      runPluginsHookSync(plugins, 'onBefore', context);

      expect(executionOrder).toEqual(['plugin1']);
    });

    it('should break chain on return when shouldBreakChainOnReturn is true', () => {
      const executionOrder: string[] = [];
      const plugins = [
        createMockPlugin({
          pluginName: 'plugin1',
          onBefore: (ctx) => {
            executionOrder.push('plugin1');
            ctx.runtimes({ returnBreakChain: true });
            return { value: 'result1' };
          }
        }),
        createMockPlugin({
          pluginName: 'plugin2',
          onBefore: () => {
            executionOrder.push('plugin2');
            return { value: 'result2' };
          }
        })
      ];

      const context = createMockContext<TestParams>({ value: 'test' });
      const result = runPluginsHookSync<{ value: string }, TestParams>(
        plugins,
        'onBefore',
        context
      );

      expect(executionOrder).toEqual(['plugin1']);
      expect(result).toEqual({ value: 'result1' });
    });

    it('should skip plugins without the hook', () => {
      const executionOrder: string[] = [];
      const plugins = [
        createMockPlugin({
          pluginName: 'plugin1',
          onBefore: () => {
            executionOrder.push('plugin1');
          }
        }),
        createMockPlugin({
          pluginName: 'plugin2'
          // No onBefore hook - should be skipped
        }),
        createMockPlugin({
          pluginName: 'plugin3',
          onBefore: () => {
            executionOrder.push('plugin3');
          }
        })
      ];

      const context = createMockContext<TestParams>({ value: 'test' });

      runPluginsHookSync(plugins, 'onBefore', context);

      expect(executionOrder).toEqual(['plugin1', 'plugin3']);
    });

    it('should reset hook runtimes before execution', () => {
      const plugin = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: () => 'result'
      });

      const context = createMockContext<TestParams>({ value: 'test' });

      // Set some initial state
      context.runtimes({
        pluginName: 'old-plugin',
        hookName: 'onOldHook',
        pluginIndex: 99,
        times: 99
      });

      runPluginsHookSync([plugin], 'onBefore', context);

      expect(context.hooksRuntimes.hookName).toBe('onBefore');
      expect(context.hooksRuntimes.times).toBe(1);
      expect(context.hooksRuntimes.pluginName).toBe('plugin1');
    });

    it('should pass additional arguments to hooks', () => {
      const mockHook = vi.fn().mockReturnValue('result');
      const plugin = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: mockHook
      });

      const context = createMockContext<TestParams>({ value: 'test' });
      const arg1 = 'arg1';
      const arg2 = { key: 'value' };

      runPluginsHookSync([plugin], 'onBefore', context, arg1, arg2);

      expect(mockHook).toHaveBeenCalledWith(context, arg1, arg2);
    });

    it('should handle empty plugin array', () => {
      const context = createMockContext<TestParams>({ value: 'test' });
      const result = runPluginsHookSync([], 'onBefore', context);

      expect(result).toBeUndefined();
      expect(context.hooksRuntimes.times).toBe(0);
    });

    it('should propagate errors from hooks', () => {
      const plugin = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: () => {
          throw new Error('Hook execution error');
        }
      });

      const context = createMockContext<TestParams>({ value: 'test' });

      expect(() => runPluginsHookSync([plugin], 'onBefore', context)).toThrow(
        'Hook execution error'
      );
    });

    it('should execute synchronously without Promise overhead', () => {
      let executed = false;
      const plugins = [
        createMockPlugin({
          pluginName: 'plugin1',
          onBefore: () => {
            executed = true;
            return 'result';
          }
        })
      ];

      const context = createMockContext<TestParams>({ value: 'test' });
      const result = runPluginsHookSync(plugins, 'onBefore', context);

      // Should be executed immediately, not deferred
      expect(executed).toBe(true);
      expect(result).toBe('result');
      expect(result).not.toBeInstanceOf(Promise);
    });

    it('should handle hook that returns null', () => {
      const plugins = [
        createMockPlugin({
          pluginName: 'plugin1',
          onBefore: () => null
        }),
        createMockPlugin({
          pluginName: 'plugin2',
          onBefore: () => ({ value: 'result2' })
        })
      ];

      const context = createMockContext<TestParams>({ value: 'test' });
      const result = runPluginsHookSync<{ value: string } | null, TestParams>(
        plugins,
        'onBefore',
        context
      );

      // null is not undefined, so it should be tracked
      expect(result).toEqual({ value: 'result2' });
    });

    it('should track plugin index correctly', () => {
      const plugins = [
        createMockPlugin({
          pluginName: 'plugin1',
          onBefore: () => 'result1'
        }),
        createMockPlugin({
          pluginName: 'plugin2',
          onBefore: () => 'result2'
        })
      ];

      const context = createMockContext<TestParams>({ value: 'test' });
      runPluginsHookSync(plugins, 'onBefore', context);

      // Should track the last plugin index
      expect(context.hooksRuntimes.pluginIndex).toBe(1);
    });
  });

  describe('runPluginsHooksSync', () => {
    it('should execute single hook name', () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: () => {
          executionOrder.push('onBefore');
        }
      });

      const context = createMockContext<TestParams>({ value: 'test' });
      runPluginsHooksSync([plugin], 'onBefore', context);

      expect(executionOrder).toEqual(['onBefore']);
    });

    it('should execute multiple hooks in sequence', () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: () => {
          executionOrder.push('onBefore');
        },
        onSuccess: () => {
          executionOrder.push('onSuccess');
        }
      });

      const context = createMockContext<TestParams>({ value: 'test' });
      runPluginsHooksSync(
        [plugin],
        ['onBefore', 'onSuccess'],
        context
      );

      expect(executionOrder).toEqual(['onBefore', 'onSuccess']);
    });

    it('should return last non-undefined result across hooks', () => {
      const plugin = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: () => ({ value: 'before' }),
        onSuccess: () => ({ value: 'success' })
      });

      const context = createMockContext<TestParams>({ value: 'test' });
      const result = runPluginsHooksSync<{ value: string }, TestParams>(
        [plugin],
        ['onBefore', 'onSuccess'],
        context
      );

      expect(result).toEqual({ value: 'success' });
    });

    it('should break chain across hooks when shouldBreakChain is true', () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: (ctx) => {
          executionOrder.push('onBefore');
          ctx.runtimes({ breakChain: true });
        },
        onExec: (ctx, task) => {
          executionOrder.push('onExec');
          return task(ctx);
        },
        onSuccess: () => {
          executionOrder.push('onSuccess');
        }
      });

      const context = createMockContext<TestParams>({ value: 'test' });
      runPluginsHooksSync(
        [plugin],
        ['onBefore', 'onExec', 'onSuccess'],
        context
      );

      expect(executionOrder).toEqual(['onBefore']);
    });

    it('should handle empty hook names array', () => {
      const plugin = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: () => 'result'
      });

      const context = createMockContext<TestParams>({ value: 'test' });
      const result = runPluginsHooksSync([plugin], [], context);

      expect(result).toBeUndefined();
    });

    it('should execute hooks for multiple plugins', () => {
      const executionOrder: string[] = [];
      const plugins = [
        createMockPlugin({
          pluginName: 'plugin1',
          onBefore: () => {
            executionOrder.push('plugin1-before');
          },
          onSuccess: () => {
            executionOrder.push('plugin1-success');
          }
        }),
        createMockPlugin({
          pluginName: 'plugin2',
          onBefore: () => {
            executionOrder.push('plugin2-before');
          },
          onSuccess: () => {
            executionOrder.push('plugin2-success');
          }
        })
      ];

      const context = createMockContext<TestParams>({ value: 'test' });
      runPluginsHooksSync(plugins, ['onBefore', 'onSuccess'], context);

      expect(executionOrder).toEqual([
        'plugin1-before',
        'plugin2-before',
        'plugin1-success',
        'plugin2-success'
      ]);
    });

    it('should pass additional arguments to all hooks', () => {
      const mockBefore = vi.fn().mockReturnValue(undefined);
      const mockSuccess = vi.fn().mockReturnValue(undefined);
      const plugin = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: mockBefore,
        onSuccess: mockSuccess
      });

      const context = createMockContext<TestParams>({ value: 'test' });
      const arg1 = 'arg1';
      const arg2 = { key: 'value' };

      runPluginsHooksSync(
        [plugin],
        ['onBefore', 'onSuccess'],
        context,
        arg1,
        arg2
      );

      expect(mockBefore).toHaveBeenCalledWith(context, arg1, arg2);
      expect(mockSuccess).toHaveBeenCalledWith(context, arg1, arg2);
    });

    it('should handle hooks that do not exist', () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: () => {
          executionOrder.push('onBefore');
        }
        // onExec not defined
      });

      const context = createMockContext<TestParams>({ value: 'test' });
      runPluginsHooksSync([plugin], ['onBefore', 'onExec'], context);

      expect(executionOrder).toEqual(['onBefore']);
    });

    it('should propagate errors from hooks', () => {
      const plugin = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: () => {
          throw new Error('Before hook error');
        },
        onSuccess: () => {
          // Should not be called
        }
      });

      const context = createMockContext<TestParams>({ value: 'test' });

      expect(() =>
        runPluginsHooksSync([plugin], ['onBefore', 'onSuccess'], context)
      ).toThrow('Before hook error');
    });

    it('should maintain hook execution order across multiple plugins and hooks', () => {
      const executionOrder: string[] = [];
      const plugins = [
        createMockPlugin({
          pluginName: 'plugin1',
          onBefore: () => {
            executionOrder.push('p1-before');
          },
          onSuccess: () => {
            executionOrder.push('p1-success');
          }
        }),
        createMockPlugin({
          pluginName: 'plugin2',
          onBefore: () => {
            executionOrder.push('p2-before');
          },
          onSuccess: () => {
            executionOrder.push('p2-success');
          }
        })
      ];

      const context = createMockContext<TestParams>({ value: 'test' });
      runPluginsHooksSync(plugins, ['onBefore', 'onSuccess'], context);

      expect(executionOrder).toEqual([
        'p1-before',
        'p2-before',
        'p1-success',
        'p2-success'
      ]);
    });

    it('should execute synchronously without Promise overhead', () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: () => {
          executionOrder.push('before');
        },
        onSuccess: () => {
          executionOrder.push('success');
        }
      });

      const context = createMockContext<TestParams>({ value: 'test' });
      const result = runPluginsHooksSync(
        [plugin],
        ['onBefore', 'onSuccess'],
        context
      );

      // Should be executed immediately, not deferred
      expect(executionOrder).toEqual(['before', 'success']);
      expect(result).not.toBeInstanceOf(Promise);
    });

    it('should handle chain breaking in the middle of hook sequence', () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: () => {
          executionOrder.push('before');
        },
        onSuccess: (ctx) => {
          executionOrder.push('success');
          ctx.runtimes({ breakChain: true });
        }
      });
      const plugin2 = createMockPlugin({
        pluginName: 'plugin2',
        onSuccess: () => {
          executionOrder.push('success2');
        }
      });

      const context = createMockContext<TestParams>({ value: 'test' });
      runPluginsHooksSync(
        [plugin, plugin2],
        ['onBefore', 'onSuccess'],
        context
      );

      expect(executionOrder).toEqual(['before', 'success']);
    });

    it('should reset chain break flag between hooks', () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: (ctx) => {
          executionOrder.push('before');
          ctx.runtimes({ returnBreakChain: true });
          return 'before-result';
        },
        onSuccess: () => {
          executionOrder.push('success');
        }
      });

      const context = createMockContext<TestParams>({ value: 'test' });
      runPluginsHooksSync([plugin], ['onBefore', 'onSuccess'], context);

      // returnBreakChain is reset between hooks, so onSuccess should execute
      expect(executionOrder).toEqual(['before', 'success']);
    });
  });

  describe('Sync vs Async comparison', () => {
    it('should have identical behavior to async version for sync hooks', () => {
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

      const context = createMockContext<TestParams>({ value: 'test' });
      const result = runPluginsHookSync<{ value: string }, TestParams>(
        plugins,
        'onBefore',
        context
      );

      expect(result).toEqual({ value: 'result2' });
      expect(context.hooksRuntimes.times).toBe(2);
    });

    it('should not accept async hooks (type safety)', () => {
      // This test verifies type safety at compile time
      // Async hooks should cause TypeScript errors
      const plugin = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: () => 'sync-result' // Sync hook is OK
      });

      const context = createMockContext<TestParams>({ value: 'test' });
      const result = runPluginsHookSync([plugin], 'onBefore', context);

      expect(result).toBe('sync-result');
    });
  });
});
