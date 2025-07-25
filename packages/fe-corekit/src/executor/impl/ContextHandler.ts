import { ExecutorContext, ExecutorPlugin, HookRuntimes } from '../interface';

/**
 * Create a reusable context with shared hooksRuntimes object
 * This reduces memory allocation by reusing the same hooksRuntimes object
 *
 * Core concept:
 * Context factory function that creates execution contexts with pre-initialized runtime tracking
 *
 * Performance benefits:
 * - Reduces memory allocation overhead
 * - Reuses hooksRuntimes object across executions
 * - Optimizes garbage collection
 *
 * @template Params - Type of context parameters
 * @param parameters - The parameters for the context
 * @returns A new context with shared hooksRuntimes
 *
 * @example Basic usage
 * ```typescript
 * const context = createContext({ userId: 123, data: 'test' });
 * ```
 *
 * @example With custom parameters
 * ```typescript
 * interface UserData {
 *   name: string;
 *   email: string;
 * }
 *
 * const context = createContext<UserData>({
 *   name: 'John',
 *   email: 'john@example.com'
 * });
 * ```
 */
export function createContext<Params = unknown>(
  parameters: Params
): ExecutorContext<Params> {
  return {
    parameters: parameters,
    returnValue: undefined,
    error: undefined,
    hooksRuntimes: {
      pluginName: '',
      hookName: '',
      returnValue: undefined,
      returnBreakChain: false,
      times: 0,
      breakChain: false,
      index: undefined
    }
  };
}

/**
 * Manages execution context state and plugin runtime tracking
 *
 * Core concept:
 * Centralized context management for executor plugin lifecycle tracking
 *
 * Main features:
 * - Context state management: Reset and initialize context state
 * - Plugin runtime tracking: Monitor plugin execution times and metadata
 * - Chain control: Manage execution chain breaking conditions
 * - Error handling: Context error state management
 * - Hook validation: Check plugin hook availability and enablement
 *
 * Key responsibilities:
 * - Maintain execution context consistency
 * - Track plugin execution metadata
 * - Control execution flow through chain breaking
 * - Manage error state propagation
 *
 * @example Basic usage
 * ```typescript
 * const handler = new ContextHandler();
 * const context = createContext(data);
 *
 * // Reset context for new execution
 * handler.reset(context);
 *
 * // Check if plugin should be skipped
 * const shouldSkip = handler.shouldSkipPluginHook(plugin, 'onBefore', context);
 * ```
 *
 * @category ContextHandler
 */
export class ContextHandler {
  /**
   * Reset hooks runtime state to initial values
   *
   * Core concept:
   * Clears all runtime tracking information for fresh execution
   *
   * Reset operations:
   * - Clears plugin name and hook name
   * - Resets return value and chain breaking flags
   * - Resets execution counter and index
   *
   * @param hooksRuntimes - The hooks runtime object to reset
   *
   * @example
   * ```typescript
   * const handler = new ContextHandler();
   * handler.resetHooksRuntimes(context.hooksRuntimes);
   * ```
   */
  resetHooksRuntimes(hooksRuntimes: HookRuntimes): void {
    hooksRuntimes.pluginName = '';
    hooksRuntimes.hookName = '';
    hooksRuntimes.returnValue = undefined;
    hooksRuntimes.returnBreakChain = false;
    hooksRuntimes.times = 0;
    hooksRuntimes.breakChain = false;
    hooksRuntimes.index = undefined;
  }

  /**
   * Reset entire context to initial state
   *
   * Core concept:
   * Complete context cleanup for new execution cycle
   *
   * Reset operations:
   * - Resets hooks runtime state
   * - Clears return value
   * - Clears error state
   *
   * @template Params - Type of context parameters
   * @param context - The execution context to reset
   *
   * @example
   * ```typescript
   * const handler = new ContextHandler();
   * handler.reset(context);
   * ```
   */
  reset<Params>(context: ExecutorContext<Params>): void {
    this.resetHooksRuntimes(context.hooksRuntimes);
    context.returnValue = undefined;
    context.error = undefined;
  }

  /**
   * Check if a plugin hook should be skipped
   * Returns true if the hook should be skipped (invalid or disabled)
   *
   * Core concept:
   * Plugin hook validation and enablement checking
   *
   * Validation criteria:
   * - Hook method exists and is callable
   * - Plugin is enabled for the specific hook
   * - Plugin enablement function returns true
   *
   * @template Params - Type of context parameters
   * @param plugin - The plugin to check
   * @param hookName - The name of the hook to validate
   * @param context - The execution context
   * @returns True if the hook should be skipped, false otherwise
   *
   * @example
   * ```typescript
   * const shouldSkip = handler.shouldSkipPluginHook(
   *   validationPlugin,
   *   'onBefore',
   *   context
   * );
   *
   * if (!shouldSkip) {
   *   // Execute the hook
   * }
   * ```
   */
  shouldSkipPluginHook<Params>(
    plugin: ExecutorPlugin,
    hookName: string,
    context: ExecutorContext<Params>
  ): boolean {
    return (
      typeof plugin[hookName as keyof ExecutorPlugin] !== 'function' ||
      (typeof plugin.enabled == 'function' &&
        !plugin.enabled(hookName as keyof ExecutorPlugin, context))
    );
  }

  /**
   * Update runtime tracking information for plugin execution
   *
   * Core concept:
   * Track plugin execution metadata for debugging and flow control
   *
   * Tracking information:
   * - Current plugin name
   * - Current hook name
   * - Execution counter (times)
   * - Plugin index in execution chain
   *
   * @template Params - Type of context parameters
   * @param context - The execution context
   * @param plugin - The plugin being executed
   * @param hookName - The hook name being executed
   * @param index - The index of the plugin in the execution chain
   *
   * @example
   * ```typescript
   * handler.runtimes(context, plugin, 'onBefore', 0);
   * ```
   */
  runtimes<Params>(
    context: ExecutorContext<Params>,
    plugin: ExecutorPlugin,
    hookName: string,
    index: number
  ): void {
    context.hooksRuntimes.pluginName = plugin.pluginName;
    context.hooksRuntimes.hookName = hookName;
    context.hooksRuntimes.times = (context.hooksRuntimes.times || 0) + 1;
    context.hooksRuntimes.index = index;
  }

  /**
   * Set return value in context runtime tracking
   *
   * Core concept:
   * Store plugin hook return value for chain control and debugging
   *
   * Usage scenarios:
   * - Track plugin hook return values
   * - Enable chain breaking based on return values
   * - Debug plugin execution flow
   *
   * @template Params - Type of context parameters
   * @param context - The execution context
   * @param returnValue - The value to set as return value
   *
   * @example
   * ```typescript
   * const result = plugin.onBefore(context);
   * handler.runtimeReturnValue(context, result);
   * ```
   */
  runtimeReturnValue<Params>(
    context: ExecutorContext<Params>,
    returnValue: unknown
  ): void {
    context.hooksRuntimes.returnValue = returnValue;
  }

  /**
   * Check if the execution chain should be broken
   *
   * Core concept:
   * Chain breaking control for plugin execution flow
   *
   * Chain breaking scenarios:
   * - Plugin explicitly sets breakChain flag
   * - Error conditions requiring immediate termination
   * - Business logic requiring early exit
   *
   * @template Params - Type of context parameters
   * @param context - The execution context
   * @returns True if the chain should be broken, false otherwise
   *
   * @example
   * ```typescript
   * if (handler.shouldBreakChain(context)) {
   *   break; // Stop plugin execution
   * }
   * ```
   */
  shouldBreakChain<Params>(context: ExecutorContext<Params>): boolean {
    return !!context.hooksRuntimes?.breakChain;
  }

  /**
   * Check if the execution chain should be broken due to return value
   *
   * Core concept:
   * Return value-based chain breaking control
   *
   * Usage scenarios:
   * - Plugin returns a value that should terminate execution
   * - Error handling hooks return error objects
   * - Business logic requires return value-based flow control
   *
   * @template Params - Type of context parameters
   * @param context - The execution context
   * @returns True if the chain should be broken due to return value, false otherwise
   *
   * @example
   * ```typescript
   * if (handler.shouldBreakChainOnReturn(context)) {
   *   return context.hooksRuntimes.returnValue;
   * }
   * ```
   */
  shouldBreakChainOnReturn<Params>(context: ExecutorContext<Params>): boolean {
    return !!context.hooksRuntimes?.returnBreakChain;
  }

  /**
   * Set error in context
   *
   * Core concept:
   * Error state management for execution context
   *
   * Error handling:
   * - Store error for plugin error hooks
   * - Enable error-based flow control
   * - Support error propagation through plugin chain
   *
   * @template Params - Type of context parameters
   * @param context - The execution context
   * @param error - The error to set in context
   *
   * @example
   * ```typescript
   * try {
   *   // Execute some operation
   * } catch (error) {
   *   handler.setError(context, error as Error);
   * }
   * ```
   */
  setError<Params>(context: ExecutorContext<Params>, error: Error): void {
    context.error = error;
  }
}
