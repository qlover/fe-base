import {
  ExecutorContextInterface,
  ExecutorPluginInterface,
  ExecutorPluginNameType
} from '../interface';

/**
 * Execute a plugin hook function
 *
 * Core concept:
 * Universal hook execution that works with both sync and async hooks.
 * Automatically handles undefined hooks and returns appropriate values.
 *
 * Key features:
 * - Type safety: Ensures hook is a function before execution
 * - Sync/Async support: Returns sync value or Promise based on hook implementation
 * - Safe execution: Returns undefined if hook doesn't exist
 * - No overhead: Direct function call without wrapper logic
 *
 * Execution flow:
 * 1. Check if hook exists and is a function
 * 2. If not, return undefined
 * 3. Otherwise, execute hook with context and args
 * 4. Return result (can be sync value or Promise)
 *
 * @template Ctx - Type of executor context interface
 * @param plugin - Plugin instance containing the hook
 * @param hookName - Name of the hook function to execute
 * @param context - Execution context to pass to the hook
 * @param args - Additional arguments to pass to the hook
 * @returns Hook execution result (sync value or Promise) or undefined if hook doesn't exist
 *
 * @example Async usage
 * ```typescript
 * const result = await PluginUtil.runHook(
 *   plugin,
 *   'onBefore',
 *   context,
 *   data
 * );
 * ```
 *
 * @example Sync usage
 * ```typescript
 * const result = PluginUtil.runHook(
 *   plugin,
 *   'onBefore',
 *   context,
 *   data
 * );
 * ```
 */
export function runPluginHook<Ctx extends ExecutorContextInterface<unknown, unknown>>(
  plugin: ExecutorPluginInterface<Ctx>,
  hookName: ExecutorPluginNameType,
  context: ExecutorContextInterface<unknown, unknown>,
  ...args: unknown[]
): unknown | Promise<unknown> {
  // Validate hook exists and is a function
  if (typeof plugin[hookName as keyof typeof plugin] !== 'function') {
    return;
  }

  return (
    plugin[hookName as keyof typeof plugin] as unknown as (
      ctx: ExecutorContextInterface<unknown, unknown>,
      ...args: unknown[]
    ) => unknown
  )(context, ...args);
}

/**
 * Normalize hook names to array format
 *
 * Shared utility to ensure hook names are always in array format for iteration.
 * Used by both sync and async versions.
 *
 * @param hookNames - Single hook name or array of hook names
 * @returns Array of hook names
 */
export function normalizeHookNames(
  hookNames: ExecutorPluginNameType | ExecutorPluginNameType[]
): ExecutorPluginNameType[] {
  return Array.isArray(hookNames) ? hookNames : [hookNames];
}

/**
 * Execute a single plugin hook asynchronously for all plugins
 *
 * Core concept:
 * Sequential async plugin execution with chain breaking and return value handling
 *
 * Execution flow:
 * 1. Reset hook runtimes
 * 2. Iterate through plugins
 * 3. Check if plugin is enabled for the hook
 * 4. Execute plugin hook with await
 * 5. Handle plugin results and chain breaking conditions
 * 6. Continue to next plugin or break chain
 *
 * Key features:
 * - Plugin enablement checking
 * - Chain breaking support
 * - Return value management
 * - Fully async execution with await
 *
 * Type Parameters:
 * - Uses flexible type constraints to work with any ExecutorPluginInterface subtype
 * - Accepts plugins with any Ctx that extends ExecutorContextInterface<unknown, unknown>
 * - Returns Params type based on the context's parameter type
 *
 * Why flexible types?
 * - LifecycleExecutor has class-level Ctx generic (ExecutorContextInterface<unknown, unknown>)
 * - runHook has method-level Params generic
 * - These are independent type parameters that TypeScript can't automatically relate
 * - Flexible constraint allows safe type coercion at call site
 *
 * @template Params - Type of parameters (inferred from context)
 * @param plugins - Array of plugins to execute (accepts any compatible plugin type)
 * @param hookName - Name of the hook function to execute
 * @param context - Execution context containing data and runtime information
 * @param args - Additional arguments to pass to the hook function
 * @returns Promise resolving to the result of the hook function execution
 *
 * @example
 * ```typescript
 * const result = await runPluginsHookAsync(
 *   plugins,
 *   'onBefore',
 *   context,
 *   data
 * );
 * ```
 */
export async function runPluginsHookAsync<Result, Params = unknown>(
  plugins: ExecutorPluginInterface<ExecutorContextInterface<Params, unknown>>[],
  hookName: ExecutorPluginNameType,
  context: ExecutorContextInterface<Params, unknown>,
  ...args: unknown[]
): Promise<Result | undefined> {
  let returnValue: Result | undefined;

  context.resetHooksRuntimes(hookName);

  for (let pluginIndex = 0; pluginIndex < plugins.length; pluginIndex++) {
    const plugin = plugins[pluginIndex];

    if (context.shouldSkipPluginHook(plugin, hookName)) {
      continue;
    }

    if (context.shouldBreakChain()) {
      break;
    }

    const currentTimes = (context.hooksRuntimes.times || 0) + 1;

    context.runtimes({
      pluginName: plugin.pluginName,
      hookName,
      pluginIndex,
      times: currentTimes
    });

    try {
      const result = await runPluginHook(plugin, hookName, context, ...args);

      if (result !== undefined) {
        returnValue = result as Result;
        context.runtimeReturnValue(result);

        if (context.shouldBreakChainOnReturn()) {
          break;
        }
      }
    } catch (error) {
      // If continueOnError is enabled, silently ignore errors and continue to next plugin
      if (context.shouldContinueOnError()) {
        continue;
      }
      // Otherwise, rethrow the error to stop execution
      throw error;
    }
  }

  return returnValue;
}

/**
 * Execute multiple plugin hooks in sequence asynchronously
 *
 * Core concept:
 * Sequential execution of multiple hooks with chain breaking support
 *
 * Execution flow:
 * 1. Convert hookNames to array if single value
 * 2. Iterate through hook names
 * 3. Execute each hook using runPluginHookAsync
 * 4. Track last return value
 * 5. Check for chain breaking after each hook
 *
 * @template Params - Type of parameters
 * @template Ctx - Type of executor context interface
 * @param plugins - Array of plugins to execute
 * @param hookNames - Single hook name or array of hook names to execute in sequence
 * @param context - Execution context containing data and runtime information
 * @param args - Additional arguments to pass to the hook functions
 * @returns Promise resolving to the result of the last executed hook function
 *
 * @example
 * ```typescript
 * const result = await runPluginHooksAsync(
 *   plugins,
 *   ['onBefore', 'onValidate'],
 *   context
 * );
 * ```
 */
export async function runPluginsHooksAsync<Result, Params = unknown>(
  plugins: ExecutorPluginInterface<ExecutorContextInterface<Params, unknown>>[],
  hookNames: ExecutorPluginNameType | ExecutorPluginNameType[],
  context: ExecutorContextInterface<Params, unknown>,
  ...args: unknown[]
): Promise<Result | undefined> {
  const hookNameArray = normalizeHookNames(hookNames);
  let lastReturnValue: Result | undefined;

  for (const hookName of hookNameArray) {
    try {
      const result = await runPluginsHookAsync<Result, Params>(
        plugins,
        hookName,
        context,
        ...args
      );

      if (result !== undefined) {
        lastReturnValue = result;
      }

      if (context.shouldBreakChain()) {
        break;
      }
    } catch (error) {
      if (context.shouldContinueOnError()) {
        continue;
      }

      throw error;
    }
  }

  return lastReturnValue;
}
