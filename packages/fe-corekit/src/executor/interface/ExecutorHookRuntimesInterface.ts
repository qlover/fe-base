import { HookRuntimes } from './ExecutorContext';
import {
  ExecutorPluginInterface,
  ExecutorContextInterface
} from './ExecutorInterface';

/**
 * Interface for runtime tracking of executor hooks
 *
 * Core concept:
 * Generic interface that allows extending HookRuntimes with custom properties.
 * This enables plugins to add their own runtime tracking data.
 *
 * @template RuntimesType - Type of hook runtimes (extends HookRuntimes)
 *
 * @example Basic usage (default HookRuntimes)
 * ```typescript
 * class MyContext implements ExecutorHookRuntimesInterface {
 *   // Uses default HookRuntimes
 * }
 * ```
 *
 * @example Extended runtimes with custom properties
 * ```typescript
 * interface CustomRuntimes extends HookRuntimes {
 *   executionTime?: number;
 *   memoryUsage?: number;
 *   customMetric?: string;
 * }
 *
 * class MyContext implements ExecutorHookRuntimesInterface<CustomRuntimes> {
 *   get hooksRuntimes(): Readonly<CustomRuntimes> {
 *     // Return extended runtime data
 *   }
 * }
 * ```
 *
 * @since 2.6.0
 */
export interface ExecutorHookRuntimesInterface<
  RuntimesType extends HookRuntimes = HookRuntimes
> {
  /**
   * Reset hooks runtime state to initial values
   *
   * If hookName is provided, only reset the runtime state for that hook.
   *
   * Core concept:
   * Clears all runtime tracking information for fresh execution
   */
  resetHooksRuntimes(hookName?: string): void;

  /**
   * Reset entire context to initial state
   */
  reset(): void;

  /**
   * Check if a plugin hook should be skipped
   * @param plugin - The plugin to check
   * @param hookName - The name of the hook to validate
   * @returns True if the hook should be skipped, false otherwise
   */
  shouldSkipPluginHook<Ctx extends ExecutorContextInterface<unknown>>(
    plugin: ExecutorPluginInterface<Ctx>,
    hookName: string
  ): boolean;

  /**
   * Get read-only snapshot of hooks runtime information
   *
   * Core concept:
   * Provides safe read-only access to runtime tracking information.
   * Returns a frozen copy to prevent accidental modifications.
   *
   * Generic support:
   * - Can return extended HookRuntimes with custom properties
   * - Type-safe access to custom runtime data
   * - Maintains immutability through Readonly
   *
   * @returns Frozen snapshot of hook runtime state (can include custom properties)
   *
   * @example Access standard properties
   * ```typescript
   * const runtimes = context.hooksRuntimes;
   * console.log(runtimes.hookName, runtimes.times);
   * ```
   *
   * @example Access custom properties (with extended type)
   * ```typescript
   * interface CustomRuntimes extends HookRuntimes {
   *   executionTime: number;
   * }
   * const context: ExecutorHookRuntimesInterface<CustomRuntimes>;
   * const runtimes = context.hooksRuntimes;
   * console.log(runtimes.executionTime); // Type-safe!
   * ```
   */
  get hooksRuntimes(): Readonly<RuntimesType>;

  /**
   * Update runtime tracking information for plugin execution
   *
   * Core concept:
   * Controlled way to update runtime state through partial updates.
   * This is the only safe way to modify runtime state.
   *
   * Generic support:
   * - Can update custom properties in extended HookRuntimes
   * - Type-safe updates with partial type checking
   * - Maintains immutability through object replacement
   *
   * @param runtimes - Partial runtime updates to apply (can include custom properties)
   *
   * @example Update standard properties
   * ```typescript
   * context.runtimes({
   *   pluginName: 'ValidationPlugin',
   *   hookName: 'onBefore',
   *   pluginIndex: 0,
   *   times: 1
   * });
   * ```
   *
   * @example Update custom properties (with extended type)
   * ```typescript
   * interface CustomRuntimes extends HookRuntimes {
   *   executionTime: number;
   * }
   * const context: ExecutorHookRuntimesInterface<CustomRuntimes>;
   * context.runtimes({
   *   executionTime: 150,
   *   customMetric: 'performance'
   * });
   * ```
   */
  runtimes(runtimes: Partial<RuntimesType>): void;

  /**
   * Set return value in context runtime tracking
   * @param returnValue - The value to set as return value
   */
  runtimeReturnValue(returnValue: unknown): void;

  /**
   * Check if the execution chain should be broken
   * @returns True if the chain should be broken, false otherwise
   */
  shouldBreakChain(): boolean;

  /**
   * Check if the execution chain should be broken due to return value
   * @returns True if the chain should be broken due to return value, false otherwise
   */
  shouldBreakChainOnReturn(): boolean;

  /**
   * Check if execution should continue on error
   *
   * Core concept:
   * Determines whether to continue executing subsequent plugins when a plugin hook
   * throws an error, enabling resilient execution pipelines
   *
   * Main features:
   * - Error resilience: Allows execution to continue despite individual failures
   * - Fault tolerance: Enables graceful degradation in plugin chains
   * - Cleanup guarantees: Ensures all cleanup hooks execute even if some fail
   *
   * Use cases:
   * - Finally hooks: Ensure all cleanup operations execute even if one fails
   * - Logging hooks: Continue logging even if one logger fails
   * - Monitoring hooks: Collect metrics from all plugins despite failures
   *
   * @returns True if execution should continue on error, false otherwise
   *
   * @example
   * ```typescript
   * // Enable continue on error for finally hooks
   * context.runtimes({ continueOnError: true });
   * await runPluginsHookAsync(plugins, 'onFinally', context);
   * ```
   */
  shouldContinueOnError(): boolean;
}
