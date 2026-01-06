import {
  ExecutorContextInterface,
  ExecutorPluginInterface,
  ExecutorPluginNameType
} from '../interface';
import { normalizeHookNames, runPluginHook } from './pluginHook';

/**
 * Execute a single plugin hook synchronously for all plugins
 *
 * Core concept:
 * Sequential sync plugin execution with chain breaking and return value handling.
 * This is the synchronous version of runPluginsHookAsync.
 *
 * Execution flow:
 * 1. Reset hook runtimes
 * 2. Iterate through plugins
 * 3. Check if plugin is enabled for the hook
 * 4. Execute plugin hook immediately (no await)
 * 5. Handle plugin results and chain breaking conditions
 * 6. Continue to next plugin or break chain
 *
 * Key features:
 * - Plugin enablement checking
 * - Chain breaking support
 * - Return value management
 * - Fully sync execution (no Promise overhead)
 *
 * Type Parameters:
 * - Uses flexible type constraints to work with any ExecutorPluginInterface subtype
 * - Returns Result type based on the hook's return value
 *
 * @template Result - Type of hook return value
 * @template Params - Type of parameters (inferred from context)
 * @param plugins - Array of plugins to execute (accepts any compatible plugin type)
 * @param hookName - Name of the hook function to execute
 * @param context - Execution context containing data and runtime information
 * @param args - Additional arguments to pass to the hook function
 * @returns Result of the hook function execution
 *
 * @example
 * ```typescript
 * const result = runPluginsHookSync(
 *   plugins,
 *   'onBefore',
 *   context,
 *   data
 * );
 * ```
 */
export function runPluginsHookSync<Result, Params = unknown>(
  plugins: ExecutorPluginInterface<ExecutorContextInterface<Params>>[],
  hookName: ExecutorPluginNameType,
  context: ExecutorContextInterface<Params>,
  ...args: unknown[]
): Result | undefined {
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
      const result = runPluginHook(plugin, hookName, context, ...args);

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
 * Execute multiple plugin hooks in sequence synchronously
 *
 * Core concept:
 * Sequential execution of multiple hooks with chain breaking support.
 * This is the synchronous version of runPluginsHooksAsync.
 *
 * Execution flow:
 * 1. Convert hookNames to array if single value
 * 2. Iterate through hook names
 * 3. Execute each hook using runPluginsHookSync
 * 4. Track last return value
 * 5. Check for chain breaking after each hook
 *
 * @template Result - Type of hook return value
 * @template Params - Type of parameters
 * @param plugins - Array of plugins to execute
 * @param hookNames - Single hook name or array of hook names to execute in sequence
 * @param context - Execution context containing data and runtime information
 * @param args - Additional arguments to pass to the hook functions
 * @returns Result of the last executed hook function
 *
 * @example
 * ```typescript
 * const result = runPluginsHooksSync(
 *   plugins,
 *   ['onBefore', 'onValidate'],
 *   context
 * );
 * ```
 */
export function runPluginsHooksSync<Result, Params = unknown>(
  plugins: ExecutorPluginInterface<ExecutorContextInterface<Params>>[],
  hookNames: ExecutorPluginNameType | ExecutorPluginNameType[],
  context: ExecutorContextInterface<Params>,
  ...args: unknown[]
): Result | undefined {
  const hookNameArray = normalizeHookNames(hookNames);
  let lastReturnValue: Result | undefined;

  for (const hookName of hookNameArray) {
    try {
      const result = runPluginsHookSync<Result, Params>(
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
