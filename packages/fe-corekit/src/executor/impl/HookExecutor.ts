import {
  ExecutorContextInterface,
  ExecutorPluginInterface,
  ExecutorPluginNameType
} from '../interface/ExecutorInterface';
import { ExecutorContextImpl } from './ExecutorContextImpl';
import { isPromise } from '../utils/isPromise';

/**
 * Hook executor for LifecycleExecutor
 *
 * Purpose:
 * Extracted from LifecycleExecutor to handle all hook execution logic, including
 * onBefore, onSuccess, and onError hooks. This separation improves code organization
 * and maintainability.
 *
 * Key Differences from AsyncExecutor/SyncExecutor:
 *
 * Unified Sync/Async Handling:
 * - Single Implementation: One class handles both sync and async hooks
 *   - AsyncExecutor: Only async hooks (always returns Promise)
 *   - SyncExecutor: Only sync hooks (always synchronous)
 *   - LifecycleExecutor: Automatically detects and handles both
 *
 * - Dynamic Type Detection: Uses is-promise to detect Promise return values
 *   - No need for separate sync/async methods
 *   - Seamless mixing of sync and async plugins
 *   - Runtime type checking for flexibility
 *
 * Performance Optimizations:
 * - Cached Property Access: Hook methods are cached to avoid repeated lookups
 *   ```typescript
 *   const hookMethod = plugin[hookName as keyof ExecutorPluginInterface<Ctx>];
 *   // Used multiple times without re-accessing plugin property
 *   ```
 *
 * - Early Returns: Empty plugin arrays return immediately
 * - Efficient Loops: Uses index-based loops instead of indexOf
 * - Input Validation: Validates inputs early to fail fast
 *
 * Improved Error Handling:
 * - Error Propagation: Errors from plugins are properly propagated
 * - Chain Breaking: Supports both breakChain and returnBreakChain flags
 * - Runtime Tracking: Tracks plugin execution for debugging
 *
 * Parameter Update Support:
 * - onBefore Return Values: Handles return values from onBefore hooks
 *   - Returned values are used to update context parameters
 *   - Supports both sync and async return values
 *   - Properly chains return values through plugin pipeline
 *
 * Architecture Benefits:
 * - Separation of Concerns: Hook execution logic isolated from task execution
 * - Testability: Can test hook execution independently
 * - Reusability: Can be reused in other executor implementations
 * - Maintainability: Easier to understand and modify hook logic
 *
 * Usage:
 * This class is used internally by LifecycleExecutor and TaskExecutor.
 * External code should not instantiate this class directly.
 *
 * @since 2.6.0
 * @template Ctx - Type of context interface
 *
 * @example Internal usage
 * ```typescript
 * const hookExecutor = new HookExecutor<ExecutorContextInterface<unknown>>();
 * const result = hookExecutor.runHook(plugins, 'onBefore', context);
 * ```
 *
 * @see LifecycleExecutor - Main executor class that uses this hook executor
 * @see TaskExecutor - Task executor that uses this for hook execution
 *
 * @category HookExecutor
 */
export class HookExecutor<
  Ctx extends ExecutorContextInterface<unknown> = ExecutorContextInterface<unknown>
> {
  /**
   * Security: Validate plugins array before execution
   */
  protected validatePlugins(plugins: ExecutorPluginInterface<Ctx>[]): void {
    if (!Array.isArray(plugins)) {
      throw new Error('Plugins must be an array');
    }
  }
  /**
   * Execute a single plugin hook function
   * Automatically handles both sync and async plugin hooks
   *
   * @template Params - Type of context parameters
   * @param plugins - Array of plugins to execute
   * @param hookName - Name of the hook function to execute
   * @param context - Execution context containing data and runtime information
   * @param args - Additional arguments to pass to the hook function
   * @returns Result of the hook function execution (sync or async based on plugin return type)
   */
  public runHook<Params>(
    plugins: ExecutorPluginInterface<Ctx>[],
    hookName: ExecutorPluginNameType,
    context: ExecutorContextImpl<Params>,
    ...args: unknown[]
  ): Params | Promise<Params> {
    // Security: Validate inputs
    this.validatePlugins(plugins);
    if (!context) {
      throw new Error('Context is required');
    }
    if (!hookName) {
      throw new Error('Hook name is required');
    }

    // Early return for empty plugins array
    if (plugins.length === 0) {
      return undefined as Params;
    }

    let _index = -1;
    let returnValue: Params | undefined;

    context.resetHooksRuntimes();

    for (const plugin of plugins) {
      _index++;

      // Cache hook method access to avoid repeated property lookup
      const hookMethod = plugin[hookName as keyof ExecutorPluginInterface<Ctx>];
      
      // Skip plugin if hook name is not a function or plugin is disabled
      if (
        typeof hookMethod !== 'function' ||
        (typeof plugin.enabled === 'function' &&
          !plugin.enabled(hookName, context as unknown as Ctx))
      ) {
        continue;
      }

      // Break chain if breakChain flag is set
      if (context.shouldBreakChain()) {
        break;
      }

      // Update runtime tracking
      context.runtimes(plugin, hookName, _index);

      // Use cached hookMethod instead of re-accessing plugin property
      const pluginMethod = hookMethod as (...args: unknown[]) => unknown;

      let pluginReturn: unknown;
      try {
        pluginReturn = pluginMethod(context, ...args);
      } catch (error) {
        // If plugin throws an error, propagate it up
        throw error;
      }

      // Check if plugin returned a Promise
      if (isPromise(pluginReturn)) {
        // Handle async plugin - return a Promise that resolves all async operations
        // startIndex = _index + 1: next plugin index to process after current async plugin
        return this.handleAsyncHookExecution(
          plugins,
          hookName,
          context,
          _index + 1,
          pluginReturn,
          args,
          returnValue
        );
      }

      // Handle sync plugin
      if (pluginReturn !== undefined) {
        returnValue = pluginReturn as Params;
        context.runtimeReturnValue(pluginReturn);

        // Break chain if returnBreakChain flag is set
        if (context.shouldBreakChainOnReturn()) {
          return returnValue;
        }
      }
    }

    // Ensure the final return value is set in context.hooksRuntimes.returnValue
    if (returnValue !== undefined) {
      context.runtimeReturnValue(returnValue);
    }

    return returnValue as Params;
  }

  /**
   * Handle async hook execution when a Promise is detected
   *
   * @template Params - Type of context parameters
   * @param plugins - Array of plugins to execute
   * @param hookName - Name of the hook function
   * @param context - Execution context
   * @param startIndex - Next plugin index to process (after the async plugin that returned firstPromise)
   * @param firstPromise - The first Promise returned by a plugin
   * @param args - Additional arguments
   * @param currentReturnValue - Current return value
   * @returns Promise resolving to the final result
   */
  protected async handleAsyncHookExecution<Params>(
    plugins: ExecutorPluginInterface<Ctx>[],
    hookName: ExecutorPluginNameType,
    context: ExecutorContextImpl<Params>,
    startIndex: number,
    firstPromise: Promise<unknown>,
    args: unknown[],
    currentReturnValue: Params | undefined
  ): Promise<Params> {
    // Security: Validate inputs
    this.validatePlugins(plugins);
    if (!context) {
      throw new Error('Context is required');
    }
    // startIndex can be plugins.length (meaning no more plugins to process)
    if (startIndex < 0 || startIndex > plugins.length) {
      throw new Error(`Invalid startIndex: ${startIndex}, plugins.length: ${plugins.length}`);
    }

    let returnValue: Params | undefined = currentReturnValue;

    // Wait for the first async plugin
    // Security: Handle promise rejection properly
    let resolvedValue: unknown;
    try {
      resolvedValue = await firstPromise;
    } catch (error) {
      // Re-throw to be handled by caller's error handling
      throw error;
    }
    if (resolvedValue !== undefined) {
      returnValue = resolvedValue as Params;
      context.runtimeReturnValue(resolvedValue);

      if (context.shouldBreakChainOnReturn()) {
        return returnValue;
      }
    }

    // Continue with remaining plugins
    // startIndex is the next plugin index to process (after the async plugin)
    for (let i = startIndex; i < plugins.length; i++) {
      const plugin = plugins[i];

      // Cache hook method access to avoid repeated property lookup
      const hookMethod = plugin[hookName as keyof ExecutorPluginInterface<Ctx>];
      if (
        typeof hookMethod !== 'function' ||
        (typeof plugin.enabled === 'function' &&
          !plugin.enabled(hookName, context as unknown as Ctx))
      ) {
        continue;
      }

      if (context.shouldBreakChain()) {
        break;
      }

      // Update runtime tracking
      context.runtimes(plugin, hookName, i);

      // Use cached hookMethod instead of re-accessing plugin property
      const pluginMethod = hookMethod as (...args: unknown[]) => unknown;

      let pluginReturn: unknown;
      try {
        pluginReturn = pluginMethod(context, ...args);
      } catch (error) {
        // If plugin throws an error, propagate it up
        throw error;
      }

      if (isPromise(pluginReturn)) {
        const resolved = await pluginReturn;
        if (resolved !== undefined) {
          returnValue = resolved as Params;
          context.runtimeReturnValue(resolved);

          if (context.shouldBreakChainOnReturn()) {
            return returnValue;
          }
        }
      } else {
        if (pluginReturn !== undefined) {
          returnValue = pluginReturn as Params;
          context.runtimeReturnValue(pluginReturn);

          if (context.shouldBreakChainOnReturn()) {
            return returnValue;
          }
        }
      }
    }

    // Ensure the final return value is set in context.hooksRuntimes.returnValue
    if (returnValue !== undefined) {
      context.runtimeReturnValue(returnValue);
    }

    return returnValue as Params;
  }

  /**
   * Execute multiple plugin hook functions
   * Supports executing multiple hook names in sequence
   * Automatically handles both sync and async hooks
   *
   * @template Params - Type of context parameters
   * @param plugins - Array of plugins to execute
   * @param hookNames - Single hook name or array of hook names to execute in sequence
   * @param context - Execution context containing data and runtime information
   * @param args - Additional arguments to pass to the hook functions
   * @returns Result of the last executed hook function (sync or async based on plugin return types)
   */
  public runHooks<Params>(
    plugins: ExecutorPluginInterface<Ctx>[],
    hookNames: ExecutorPluginNameType | ExecutorPluginNameType[],
    context: ExecutorContextImpl<Params>,
    ...args: unknown[]
  ): Params | Promise<Params> {
    const hookNameArray = Array.isArray(hookNames) ? hookNames : [hookNames];
    
    // Early return for empty hook names array
    if (hookNameArray.length === 0) {
      return undefined as Params;
    }

    let lastReturnValue: Params | undefined;

    // Execute each hook name in sequence
    // Use index-based loop to avoid O(n) indexOf lookup
    for (let hookIndex = 0; hookIndex < hookNameArray.length; hookIndex++) {
      const hookName = hookNameArray[hookIndex];
      const result = this.runHook(plugins, hookName, context, ...args);

      // Check if result is a Promise
      if (isPromise(result)) {
        // Handle async execution - return a Promise that resolves all hooks
        // Use hookIndex directly instead of indexOf for O(1) access
        return this.handleAsyncHooksExecution(
          plugins,
          hookNameArray,
          hookIndex,
          context,
          result,
          args,
          lastReturnValue
        );
      }

      // Handle sync result
      if (result !== undefined) {
        lastReturnValue = result;
      }

      // Check if we should break the chain after this hook
      if (context.shouldBreakChain()) {
        break;
      }
    }

    return lastReturnValue as Params;
  }

  /**
   * Handle async hooks execution when a Promise is detected
   *
   * @template Params - Type of context parameters
   * @param plugins - Array of plugins
   * @param hookNames - Array of hook names
   * @param startHookIndex - Starting hook index
   * @param context - Execution context
   * @param firstPromise - First Promise result
   * @param args - Additional arguments
   * @param currentReturnValue - Current return value
   * @returns Promise resolving to final result
   */
  protected async handleAsyncHooksExecution<Params>(
    plugins: ExecutorPluginInterface<Ctx>[],
    hookNames: ExecutorPluginNameType[],
    startHookIndex: number,
    context: ExecutorContextImpl<Params>,
    firstPromise: Promise<Params>,
    args: unknown[],
    currentReturnValue: Params | undefined
  ): Promise<Params> {
    // Security: Validate inputs
    this.validatePlugins(plugins);
    if (!context) {
      throw new Error('Context is required');
    }
    if (startHookIndex < 0 || startHookIndex >= hookNames.length) {
      throw new Error(`Invalid startHookIndex: ${startHookIndex}`);
    }

    let lastReturnValue: Params | undefined = currentReturnValue;

    // Wait for the first async hook
    // Security: Handle promise rejection properly
    let resolved: Params;
    try {
      resolved = await firstPromise;
    } catch (error) {
      // Re-throw to be handled by caller's error handling
      throw error;
    }
    if (resolved !== undefined) {
      lastReturnValue = resolved;
    }

    if (context.shouldBreakChain()) {
      return lastReturnValue as Params;
    }

    // Continue with remaining hooks
    for (let i = startHookIndex + 1; i < hookNames.length; i++) {
      const hookName = hookNames[i];
      const result = this.runHook(plugins, hookName, context, ...args);

      if (isPromise(result)) {
        const resolved = await result;
        if (resolved !== undefined) {
          lastReturnValue = resolved;
        }
      } else {
        if (result !== undefined) {
          lastReturnValue = result;
        }
      }

      if (context.shouldBreakChain()) {
        break;
      }
    }

    return lastReturnValue as Params;
  }
}

