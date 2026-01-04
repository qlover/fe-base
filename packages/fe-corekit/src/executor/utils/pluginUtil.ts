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
export function runPluginHook<Ctx extends ExecutorContextInterface<unknown>>(
  plugin: ExecutorPluginInterface<Ctx>,
  hookName: ExecutorPluginNameType,
  context: ExecutorContextInterface<unknown>,
  ...args: unknown[]
): unknown | Promise<unknown> {
  // Validate hook exists and is a function
  if (typeof plugin[hookName as keyof typeof plugin] !== 'function') {
    return;
  }

  return (
    plugin[hookName as keyof typeof plugin] as unknown as (
      ctx: ExecutorContextInterface<unknown>,
      ...args: unknown[]
    ) => unknown
  )(context, ...args);
}
