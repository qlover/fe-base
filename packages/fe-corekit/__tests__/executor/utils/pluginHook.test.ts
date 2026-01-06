/**
 * pluginHook utility functions test suite
 *
 * Coverage:
 * 1. runPluginHook - Single plugin hook execution
 *    - Sync hook execution
 *    - Async hook execution
 *    - Missing hook handling
 *    - Invalid hook handling
 *    - Arguments passing
 * 2. normalizeHookNames - Hook name normalization
 *    - Single hook name
 *    - Array of hook names
 *    - Empty array
 * 3. runPluginsHookAsync - Multiple plugins single hook execution
 *    - Sequential execution
 *    - Return value handling
 *    - Chain breaking
 *    - Plugin skipping
 *    - Runtime tracking
 * 4. runPluginsHooksAsync - Multiple plugins multiple hooks execution
 *    - Sequential hook execution
 *    - Return value accumulation
 *    - Chain breaking across hooks
 *    - Mixed hook types
 *
 * Test Strategy:
 * - Test each function independently
 * - Verify sync and async behavior
 * - Test edge cases and error conditions
 * - Verify context state management
 * - Test plugin interaction patterns
 */

import { describe, it, expect, vi } from 'vitest';
import {
  runPluginHook,
  normalizeHookNames,
  runPluginsHookAsync,
  runPluginsHooksAsync
} from '../../../src/executor/utils/pluginHook';
import { ExecutorContextImpl } from '../../../src/executor/impl/ExecutorContextImpl';
import type {
  ExecutorPluginInterface,
  ExecutorContextInterface,
  LifecyclePluginInterface
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
    LifecyclePluginInterface<ExecutorContextInterface<unknown>>
  > = {}
): LifecyclePluginInterface<ExecutorContextInterface<unknown>> {
  return {
    pluginName: 'test-plugin',
    ...overrides
  } as ExecutorPluginInterface<ExecutorContextInterface<unknown>>;
}

describe('pluginHook utilities', () => {
  describe('runPluginHook', () => {
    it('should execute sync hook and return result', () => {
      const plugin = createMockPlugin({
        onBefore: () => {
          return { value: 'modified', count: 1 };
        }
      });

      const context = createMockContext<TestParams>({ value: 'original' });
      const result = runPluginHook(plugin, 'onBefore', context);

      expect(result).toEqual({ value: 'modified', count: 1 });
    });

    it('should execute async hook and return Promise', async () => {
      const plugin = createMockPlugin({
        onBefore: async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return { value: 'async-modified', count: 2 };
        }
      });

      const context = createMockContext<TestParams>({ value: 'original' });
      const result = runPluginHook(plugin, 'onBefore', context);

      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toEqual({
        value: 'async-modified',
        count: 2
      });
    });

    it('should return undefined for missing hook', () => {
      const plugin = createMockPlugin();
      const context = createMockContext<TestParams>({ value: 'test' });

      const result = runPluginHook(plugin, 'onBefore', context);

      expect(result).toBeUndefined();
    });

    it('should return undefined for non-function hook', () => {
      const plugin = createMockPlugin({
        onBefore: 'not-a-function' as any
      });
      const context = createMockContext<TestParams>({ value: 'test' });

      const result = runPluginHook(plugin, 'onBefore', context);

      expect(result).toBeUndefined();
    });

    it('should pass additional arguments to hook', () => {
      const mockHook = vi.fn();
      const plugin = createMockPlugin({
        onBefore: mockHook
      });
      const context = createMockContext<TestParams>({ value: 'test' });
      const arg1 = 'arg1';
      const arg2 = { key: 'value' };

      runPluginHook(plugin, 'onBefore', context, arg1, arg2);

      expect(mockHook).toHaveBeenCalledWith(context, arg1, arg2);
    });

    it('should handle hook that returns undefined', () => {
      const plugin = createMockPlugin({
        onBefore: () => undefined
      });
      const context = createMockContext<TestParams>({ value: 'test' });

      const result = runPluginHook(plugin, 'onBefore', context);

      expect(result).toBeUndefined();
    });

    it('should handle hook that returns null', () => {
      const plugin = createMockPlugin({
        onBefore: () => null
      });
      const context = createMockContext<TestParams>({ value: 'test' });

      const result = runPluginHook(plugin, 'onBefore', context);

      expect(result).toBeNull();
    });

    it('should propagate errors from sync hooks', () => {
      const plugin = createMockPlugin({
        onBefore: () => {
          throw new Error('Sync hook error');
        }
      });
      const context = createMockContext<TestParams>({ value: 'test' });

      expect(() => runPluginHook(plugin, 'onBefore', context)).toThrow(
        'Sync hook error'
      );
    });

    it('should propagate errors from async hooks', async () => {
      const plugin = createMockPlugin({
        onBefore: async () => {
          throw new Error('Async hook error');
        }
      });
      const context = createMockContext<TestParams>({ value: 'test' });

      const result = runPluginHook(plugin, 'onBefore', context);

      await expect(result).rejects.toThrow('Async hook error');
    });
  });

  describe('normalizeHookNames', () => {
    it('should convert single hook name to array', () => {
      const result = normalizeHookNames('onBefore');
      expect(result).toEqual(['onBefore']);
    });

    it('should return array as-is', () => {
      const input = ['onBefore', 'onAfter'];
      const result = normalizeHookNames(input);
      expect(result).toBe(input);
      expect(result).toEqual(['onBefore', 'onAfter']);
    });

    it('should handle empty array', () => {
      const result = normalizeHookNames([]);
      expect(result).toEqual([]);
    });

    it('should handle array with single element', () => {
      const result = normalizeHookNames(['onBefore']);
      expect(result).toEqual(['onBefore']);
    });

    it('should handle array with multiple elements', () => {
      const result = normalizeHookNames([
        'onBefore',
        'onExec',
        'onSuccess',
        'onError'
      ]);
      expect(result).toEqual(['onBefore', 'onExec', 'onSuccess', 'onError']);
    });
  });

  describe('runPluginsHookAsync', () => {
    it('should execute hook for all plugins sequentially', async () => {
      const executionOrder: string[] = [];
      const plugins = [
        createMockPlugin({
          pluginName: 'plugin1',
          onBefore: async () => {
            executionOrder.push('plugin1');
            await new Promise((resolve) => setTimeout(resolve, 10));
          }
        }),
        createMockPlugin({
          pluginName: 'plugin2',
          onBefore: async () => {
            executionOrder.push('plugin2');
            await new Promise((resolve) => setTimeout(resolve, 5));
          }
        }),
        createMockPlugin({
          pluginName: 'plugin3',
          onBefore: async () => {
            executionOrder.push('plugin3');
          }
        })
      ];

      const context = createMockContext<TestParams>({ value: 'test' });
      await runPluginsHookAsync(plugins, 'onBefore', context);

      expect(executionOrder).toEqual(['plugin1', 'plugin2', 'plugin3']);
    });

    it('should return last non-undefined result', async () => {
      const plugins = [
        createMockPlugin({
          pluginName: 'plugin1',
          onBefore: async () => ({ value: 'result1' })
        }),
        createMockPlugin({
          pluginName: 'plugin2',
          onBefore: async () => undefined
        }),
        createMockPlugin({
          pluginName: 'plugin3',
          onBefore: async () => ({ value: 'result3' })
        })
      ];

      const context = createMockContext<TestParams>({ value: 'test' });
      const result = await runPluginsHookAsync<{ value: string }, TestParams>(
        plugins,
        'onBefore',
        context
      );

      expect(result).toEqual({ value: 'result3' });
    });

    it('should return undefined if all hooks return undefined', async () => {
      const plugins = [
        createMockPlugin({
          pluginName: 'plugin1',
          onBefore: async () => undefined
        }),
        createMockPlugin({
          pluginName: 'plugin2',
          onBefore: async () => undefined
        })
      ];

      const context = createMockContext<TestParams>({ value: 'test' });
      const result = await runPluginsHookAsync(plugins, 'onBefore', context);

      expect(result).toBeUndefined();
    });

    it('should skip plugins that do not have the hook', async () => {
      const executionOrder: string[] = [];
      const plugins = [
        createMockPlugin({
          pluginName: 'plugin1',
          onBefore: async () => {
            executionOrder.push('plugin1');
          }
        }),
        createMockPlugin({
          pluginName: 'plugin2'
          // No onBefore hook
        }),
        createMockPlugin({
          pluginName: 'plugin3',
          onBefore: async () => {
            executionOrder.push('plugin3');
          }
        })
      ];

      const context = createMockContext<TestParams>({ value: 'test' });
      await runPluginsHookAsync(plugins, 'onBefore', context);

      expect(executionOrder).toEqual(['plugin1', 'plugin3']);
    });

    it('should track hook execution times in context', async () => {
      const plugins = [
        createMockPlugin({
          pluginName: 'plugin1',
          onBefore: async () => 'result1'
        }),
        createMockPlugin({
          pluginName: 'plugin2',
          onBefore: async () => 'result2'
        }),
        createMockPlugin({
          pluginName: 'plugin3',
          onBefore: async () => 'result3'
        })
      ];

      const context = createMockContext<TestParams>({ value: 'test' });
      await runPluginsHookAsync(plugins, 'onBefore', context);

      expect(context.hooksRuntimes.times).toBe(3);
      expect(context.hooksRuntimes.hookName).toBe('onBefore');
    });

    it('should update return value in context', async () => {
      const plugins = [
        createMockPlugin({
          pluginName: 'plugin1',
          onBefore: async () => ({ value: 'final-result' })
        })
      ];

      const context = createMockContext<TestParams>({ value: 'test' });
      await runPluginsHookAsync(plugins, 'onBefore', context);

      expect(context.hooksRuntimes.returnValue).toEqual({
        value: 'final-result'
      });
    });

    it('should break chain when shouldBreakChain returns true', async () => {
      const executionOrder: string[] = [];
      const plugins = [
        createMockPlugin({
          pluginName: 'plugin1',
          onBefore: async (ctx: ExecutorContextInterface<TestParams>) => {
            executionOrder.push('plugin1');
            ctx.runtimes({ breakChain: true });
          }
        }),
        createMockPlugin({
          pluginName: 'plugin2',
          onBefore: async () => {
            executionOrder.push('plugin2');
          }
        }),
        createMockPlugin({
          pluginName: 'plugin3',
          onBefore: async () => {
            executionOrder.push('plugin3');
          }
        })
      ];

      const context = createMockContext<TestParams>({ value: 'test' });
      await runPluginsHookAsync(plugins, 'onBefore', context);

      expect(executionOrder).toEqual(['plugin1']);
    });

    it('should break chain on return when shouldBreakChainOnReturn is true', async () => {
      const executionOrder: string[] = [];
      const plugins = [
        createMockPlugin({
          pluginName: 'plugin1',
          onBefore: async (ctx: ExecutorContextInterface<TestParams>) => {
            executionOrder.push('plugin1');
            ctx.runtimes({ returnBreakChain: true });
            return { value: 'result1' };
          }
        }),
        createMockPlugin({
          pluginName: 'plugin2',
          onBefore: async () => {
            executionOrder.push('plugin2');
            return { value: 'result2' };
          }
        })
      ];

      const context = createMockContext<TestParams>({ value: 'test' });
      const result = await runPluginsHookAsync<{ value: string }, TestParams>(
        plugins,
        'onBefore',
        context
      );

      expect(executionOrder).toEqual(['plugin1']);
      expect(result).toEqual({ value: 'result1' });
    });

    it('should skip plugins without the hook', async () => {
      const executionOrder: string[] = [];
      const plugins = [
        createMockPlugin({
          pluginName: 'plugin1',
          onBefore: async () => {
            executionOrder.push('plugin1');
          }
        }),
        createMockPlugin({
          pluginName: 'plugin2'
          // No onBefore hook - should be skipped
        }),
        createMockPlugin({
          pluginName: 'plugin3',
          onBefore: async () => {
            executionOrder.push('plugin3');
          }
        })
      ];

      const context = createMockContext<TestParams>({ value: 'test' });

      await runPluginsHookAsync(plugins, 'onBefore', context);

      expect(executionOrder).toEqual(['plugin1', 'plugin3']);
    });

    it('should reset hook runtimes before execution', async () => {
      const plugin = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: async () => 'result'
      });

      const context = createMockContext<TestParams>({ value: 'test' });

      // Set some initial state
      context.runtimes({
        pluginName: 'old-plugin',
        hookName: 'onOldHook',
        pluginIndex: 99,
        times: 99
      });

      await runPluginsHookAsync([plugin], 'onBefore', context);

      expect(context.hooksRuntimes.hookName).toBe('onBefore');
      expect(context.hooksRuntimes.times).toBe(1);
      expect(context.hooksRuntimes.pluginName).toBe('plugin1');
    });

    it('should pass additional arguments to hooks', async () => {
      const mockHook = vi.fn().mockResolvedValue('result');
      const plugin = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: mockHook
      });

      const context = createMockContext<TestParams>({ value: 'test' });
      const arg1 = 'arg1';
      const arg2 = { key: 'value' };

      await runPluginsHookAsync([plugin], 'onBefore', context, arg1, arg2);

      expect(mockHook).toHaveBeenCalledWith(context, arg1, arg2);
    });

    it('should handle empty plugin array', async () => {
      const context = createMockContext<TestParams>({ value: 'test' });
      const result = await runPluginsHookAsync([], 'onBefore', context);

      expect(result).toBeUndefined();
      expect(context.hooksRuntimes.times).toBe(0);
    });

    it('should propagate errors from hooks', async () => {
      const plugin = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: async () => {
          throw new Error('Hook execution error');
        }
      });

      const context = createMockContext<TestParams>({ value: 'test' });

      await expect(
        runPluginsHookAsync([plugin], 'onBefore', context)
      ).rejects.toThrow('Hook execution error');
    });
  });

  describe('runPluginsHooksAsync', () => {
    it('should execute single hook name', async () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: async () => {
          executionOrder.push('onBefore');
        }
      });

      const context = createMockContext<TestParams>({ value: 'test' });
      await runPluginsHooksAsync([plugin], 'onBefore', context);

      expect(executionOrder).toEqual(['onBefore']);
    });

    it('should execute multiple hooks in sequence', async () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: async () => {
          executionOrder.push('onBefore');
        },
        onExec: async () => {
          executionOrder.push('onExec');
        },
        onSuccess: async () => {
          executionOrder.push('onSuccess');
        }
      });

      const context = createMockContext<TestParams>({ value: 'test' });
      await runPluginsHooksAsync(
        [plugin],
        ['onBefore', 'onExec', 'onSuccess'],
        context
      );

      expect(executionOrder).toEqual(['onBefore', 'onExec', 'onSuccess']);
    });

    it('should return last non-undefined result across hooks', async () => {
      const plugin = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: async () => ({ value: 'before' }),
        onExec: async () => undefined,
        // @ts-expect-error for test
        onSuccess: async () => ({ value: 'success' })
      });

      const context = createMockContext<TestParams>({ value: 'test' });
      const result = await runPluginsHooksAsync<{ value: string }, TestParams>(
        [plugin],
        ['onBefore', 'onExec', 'onSuccess'],
        context
      );

      expect(result).toEqual({ value: 'success' });
    });

    it('should break chain across hooks when shouldBreakChain is true', async () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: async (ctx: ExecutorContextInterface<TestParams>) => {
          executionOrder.push('onBefore');
          ctx.runtimes({ breakChain: true });
        },
        onExec: async () => {
          executionOrder.push('onExec');
        },
        onSuccess: async () => {
          executionOrder.push('onSuccess');
        }
      });

      const context = createMockContext<TestParams>({ value: 'test' });
      await runPluginsHooksAsync(
        [plugin],
        ['onBefore', 'onExec', 'onSuccess'],
        context
      );

      expect(executionOrder).toEqual(['onBefore']);
    });

    it('should handle empty hook names array', async () => {
      const plugin = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: async () => 'result'
      });

      const context = createMockContext<TestParams>({ value: 'test' });
      const result = await runPluginsHooksAsync([plugin], [], context);

      expect(result).toBeUndefined();
    });

    it('should execute hooks for multiple plugins', async () => {
      const executionOrder: string[] = [];
      const plugins = [
        createMockPlugin({
          pluginName: 'plugin1',
          onBefore: async () => {
            executionOrder.push('plugin1-before');
          },
          onSuccess: async () => {
            executionOrder.push('plugin1-success');
          }
        }),
        createMockPlugin({
          pluginName: 'plugin2',
          onBefore: async () => {
            executionOrder.push('plugin2-before');
          },
          onSuccess: async () => {
            executionOrder.push('plugin2-success');
          }
        })
      ];

      const context = createMockContext<TestParams>({ value: 'test' });
      await runPluginsHooksAsync(plugins, ['onBefore', 'onSuccess'], context);

      expect(executionOrder).toEqual([
        'plugin1-before',
        'plugin2-before',
        'plugin1-success',
        'plugin2-success'
      ]);
    });

    it('should pass additional arguments to all hooks', async () => {
      const mockBefore = vi.fn().mockResolvedValue(undefined);
      const mockSuccess = vi.fn().mockResolvedValue(undefined);
      const plugin = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: mockBefore,
        onSuccess: mockSuccess
      });

      const context = createMockContext<TestParams>({ value: 'test' });
      const arg1 = 'arg1';
      const arg2 = { key: 'value' };

      await runPluginsHooksAsync(
        [plugin],
        ['onBefore', 'onSuccess'],
        context,
        arg1,
        arg2
      );

      expect(mockBefore).toHaveBeenCalledWith(context, arg1, arg2);
      expect(mockSuccess).toHaveBeenCalledWith(context, arg1, arg2);
    });

    it('should handle hooks that do not exist', async () => {
      const executionOrder: string[] = [];
      const plugin = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: async () => {
          executionOrder.push('onBefore');
        }
        // onExec not defined
      });

      const context = createMockContext<TestParams>({ value: 'test' });
      await runPluginsHooksAsync([plugin], ['onBefore', 'onExec'], context);

      expect(executionOrder).toEqual(['onBefore']);
    });

    it('should propagate errors from hooks', async () => {
      const plugin = createMockPlugin({
        pluginName: 'plugin1',
        onBefore: async () => {
          throw new Error('Before hook error');
        },
        onSuccess: async () => {
          // Should not be called
        }
      });

      const context = createMockContext<TestParams>({ value: 'test' });

      await expect(
        runPluginsHooksAsync([plugin], ['onBefore', 'onSuccess'], context)
      ).rejects.toThrow('Before hook error');
    });

    it('should maintain hook execution order across multiple plugins and hooks', async () => {
      const executionOrder: string[] = [];
      const plugins = [
        createMockPlugin({
          pluginName: 'plugin1',
          onBefore: async () => {
            executionOrder.push('p1-before');
          },
          onExec: async () => {
            executionOrder.push('p1-exec');
          }
        }),
        createMockPlugin({
          pluginName: 'plugin2',
          onBefore: async () => {
            executionOrder.push('p2-before');
          },
          onExec: async () => {
            executionOrder.push('p2-exec');
          }
        })
      ];

      const context = createMockContext<TestParams>({ value: 'test' });
      await runPluginsHooksAsync(plugins, ['onBefore', 'onExec'], context);

      expect(executionOrder).toEqual([
        'p1-before',
        'p2-before',
        'p1-exec',
        'p2-exec'
      ]);
    });
  });
});
