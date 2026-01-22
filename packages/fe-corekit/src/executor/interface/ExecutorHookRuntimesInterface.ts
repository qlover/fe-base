import { type ExecutorContextInterface } from './ExecutorContextInterface';
import { type ExecutorPluginInterface } from './ExecutorInterface';

/**
 * Runtime information interface for hook execution tracking
 *
 * Core concept:
 * Provides detailed runtime metadata for individual hook execution,
 * enabling performance monitoring, flow control, and execution state tracking
 *
 * Main features:
 * - Execution tracking: Monitors hook execution state and performance
 * - Flow control: Provides mechanisms to control execution pipeline flow
 * - Performance metrics: Tracks execution times and performance data
 * - State preservation: Maintains execution state throughout the pipeline
 * - Extensibility: Supports additional custom properties for specific use cases
 *
 * Flow control mechanisms:
 * - breakChain: Immediately stops execution pipeline
 * - returnBreakChain: Stops pipeline when return value is present
 * - times: Tracks execution frequency for optimization
 *
 * @since 3.0.0
 * @example Basic runtime information
 * ```typescript
 * const runtime: HookRuntimes = {
 *   hookName: 'onBefore',
 *   returnValue: { validated: true },
 *   times: 1,
 *   breakChain: false,
 *   returnBreakChain: false
 * };
 * ```
 *
 * @example Runtime with custom properties
 * ```typescript
 * const runtime: HookRuntimes = {
 *   hookName: 'customHook',
 *   returnValue: { processed: true },
 *   times: 3,
 *   breakChain: false,
 *   returnBreakChain: true,
 *   customMetric: 'performance_data',
 *   executionTime: 150
 * };
 * ```
 */
export interface HookRuntimes {
  /**
   * Name of the current plugin being executed
   *
   * Core concept:
   * Identifies which plugin is currently executing, enabling plugin-specific
   * debugging and tracking
   *
   * @optional
   * @example `'ValidationPlugin'`
   * @example `'CachePlugin'`
   */
  pluginName?: string;

  /**
   * Index of the current plugin in the plugins array
   *
   * Core concept:
   * Tracks the position of the current plugin in the execution chain,
   * useful for debugging execution order
   *
   * @optional
   * @example `0` // First plugin
   * @example `2` // Third plugin
   */
  pluginIndex?: number;

  /**
   * Name of the current hook being executed
   *
   * Core concept:
   * Identifies the specific hook that is currently being executed,
   * enabling targeted debugging and monitoring of hook performance
   *
   * Main features:
   * - Hook identification: Clearly identifies which hook is executing
   * - Debugging support: Enables targeted debugging of specific hooks
   * - Performance monitoring: Allows tracking of individual hook performance
   * - Pipeline visibility: Provides visibility into execution pipeline state
   *
   * @optional
   * @example `'onBefore'`
   * @example `'onExec'`
   * @example `'onAfter'`
   * @example `'customValidationHook'`
   */
  hookName?: string;

  /**
   * Return value from the current hook execution
   *
   * Core concept:
   * Captures the return value from the current hook execution,
   * enabling result tracking and flow control based on hook output
   *
   * Main features:
   * - Result tracking: Monitors what each hook returns
   * - Flow control: Enables conditional execution based on return values
   * - Debugging support: Provides visibility into hook output
   * - Pipeline integration: Results can influence downstream execution
   *
   * @readonly
   * @optional
   * @example `{ validated: true, data: 'processed' }`
   * @example `'hook_result'`
   * @example `{ error: 'validation_failed' }`
   */
  returnValue?: unknown;

  /**
   * Number of times the current hook has been executed
   *
   * Core concept:
   * Tracks how many plugins have executed the current hook (e.g., onBefore).
   * This counter increments for each plugin that successfully executes the hook.
   *
   * Important:
   * - This is per-hook, not global
   * - Reset when switching to a different hook
   * - Represents "which plugin is executing this hook" (1st, 2nd, 3rd, etc.)
   *
   * Main features:
   * - Execution counting: Monitors how many plugins executed this hook
   * - Performance analysis: Identifies frequently executed hooks
   * - Loop detection: Helps identify potential infinite loops
   * - Optimization insights: Provides data for performance optimization
   *
   * Usage scenarios:
   * - Know if any plugin executed the hook (times > 0)
   * - Track which plugin number is executing (useful for debugging)
   * - Detect if hook was skipped by all plugins (times === 0)
   *
   * @optional
   * @example `0` // No plugin has executed this hook yet
   * @example `1` // First plugin executed this hook
   * @example `3` // Third plugin is executing this hook
   */
  times?: number;

  /**
   * Flag to immediately break the execution chain
   *
   * Core concept:
   * Provides a mechanism to immediately stop the execution pipeline,
   * enabling early termination when certain conditions are met
   *
   * Main features:
   * - Immediate termination: Stops execution pipeline immediately
   * - Conditional control: Enables conditional execution flow
   * - Error handling: Allows early termination on critical errors
   * - Performance optimization: Avoids unnecessary processing
   *
   * Use cases:
   * - Error conditions: Stop execution when critical errors occur
   * - Validation failures: Terminate when validation fails
   * - Early success: Stop when desired result is achieved early
   * - Resource constraints: Terminate when resources are exhausted
   *
   * @optional
   * @example `true` // Break execution chain immediately
   * @example `false` // Continue normal execution
   */
  breakChain?: boolean;

  /**
   * Flag to break chain when return value exists
   *
   * Core concept:
   * Enables conditional chain breaking based on the presence of a return value,
   * commonly used in error handling and early termination scenarios
   *
   * Main features:
   * - Conditional termination: Breaks chain only when return value exists
   * - Error handling: Commonly used in `onError` lifecycle hooks
   * - Result-based control: Enables flow control based on hook results
   * - Flexible termination: Provides more nuanced control than `breakChain`
   *
   * Common usage:
   * - Error handlers: Break chain when error is handled and result is returned
   * - Validation: Stop processing when validation result is returned
   * - Caching: Terminate when cached result is found
   * - Early success: Stop when desired result is achieved
   *
   * @optional
   * @example `true` // Break chain if returnValue exists
   * @example `false` // Continue regardless of returnValue
   */
  returnBreakChain?: boolean;

  /**
   * Flag to continue execution on error
   *
   * Core concept:
   * Provides a mechanism to continue executing subsequent plugins even when
   * a plugin hook throws an error, enabling resilient execution pipelines
   *
   * Main features:
   * - Error resilience: Continues execution despite individual plugin failures
   * - Fault tolerance: Enables graceful degradation in plugin chains
   * - Cleanup guarantees: Ensures all cleanup hooks execute even if some fail
   * - Flexible error handling: Allows selective error suppression
   *
   * Use cases:
   * - Finally hooks: Ensure all cleanup operations execute even if one fails
   * - Logging hooks: Continue logging even if one logger fails
   * - Monitoring hooks: Collect metrics from all plugins despite failures
   * - Non-critical operations: Continue execution for non-critical hooks
   *
   * @optional
   * @example `true` // Continue to next plugin even if current plugin throws error
   * @example `false` // Stop execution and throw error (default behavior)
   */
  continueOnError?: boolean;

  /**
   * Additional custom properties for extensibility
   *
   * Core concept:
   * Provides a flexible mechanism to add custom properties to runtime
   * information, enabling plugin-specific metadata and custom tracking
   *
   * Main features:
   * - Extensibility: Allows plugins to add custom runtime data
   * - Custom metrics: Enables plugin-specific performance tracking
   * - Metadata storage: Provides space for custom execution metadata
   * - Plugin integration: Enables rich plugin-to-plugin communication
   *
   * Common custom properties:
   * - executionTime: Hook execution time in milliseconds
   * - memoryUsage: Memory consumption during hook execution
   * - customMetrics: Plugin-specific performance metrics
   * - debugInfo: Additional debugging information
   *
   * @example
   * ```typescript
   * {
   *   executionTime: 150,
   *   memoryUsage: '2.5MB',
   *   customMetric: 'validation_score',
   *   debugInfo: { step: 'validation', level: 'info' }
   * }
   * ```
   */
  [key: string]: unknown;
}

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
  shouldSkipPluginHook<Ctx extends ExecutorContextInterface<unknown, unknown>>(
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
