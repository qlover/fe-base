/**
 * Execution context interface for task execution state management
 *
 * Core concept:
 * Encapsulates the complete execution state of a task, including input parameters,
 * execution results, error information, and runtime metadata. Provides a centralized
 * way to manage and track task execution throughout the plugin pipeline.
 *
 * Main features:
 * - State management: Centralized storage for task execution state
 * - Error tracking: Captures and preserves error information during execution
 * - Parameter passing: Maintains input parameters throughout the execution pipeline
 * - Result storage: Stores task execution results and return values
 * - Runtime monitoring: Tracks execution time and hook performance metrics
 * - Extensibility: Supports dynamic property addition for custom use cases
 *
 * Design considerations:
 * - Immutable runtime data: Hook runtime information is read-only and frozen
 * - Type safety: Full TypeScript support with generic parameter types
 * - Pipeline integration: Seamlessly integrates with executor plugin pipeline
 * - Memory management: Runtime data is automatically cleared after execution
 *
 * @template Params - Type of parameters that the task accepts
 *
 * @since `1.0.14`
 *
 * @example Basic context creation
 * ```typescript
 * const context: ExecutorContext<MyParams> = {
 *   parameters: { id: 1, name: 'test' },
 *   error: undefined,
 *   returnValue: undefined,
 *   hooksRuntimes: {}
 * };
 * ```
 *
 * @example Context with error state
 * ```typescript
 * const context: ExecutorContext<MyParams> = {
 *   parameters: { id: 1 },
 *   error: new Error('Task failed'),
 *   returnValue: undefined,
 *   hooksRuntimes: {}
 * };
 * ```
 *
 * @example Context with successful result
 * ```typescript
 * const context: ExecutorContext<MyParams> = {
 *   parameters: { id: 1 },
 *   error: undefined,
 *   returnValue: { success: true, data: 'processed' },
 *   hooksRuntimes: {}
 * };
 * ```
 */
export interface ExecutorContext<Params = unknown> {
  /**
   * Error that occurred during task execution
   *
   * Core concept:
   * Captures and preserves error information when task execution fails,
   * enabling comprehensive error handling and debugging capabilities
   *
   * Main features:
   * - Error preservation: Maintains original error objects with stack traces
   * - Pipeline integration: Errors are propagated through the execution pipeline
   * - Debugging support: Provides detailed error information for troubleshooting
   * - Optional presence: Only populated when errors occur during execution
   *
   * Error handling flow:
   * 1. Error occurs during task execution or plugin hook execution
   * 2. Error is captured and assigned to this property
   * 3. Error information is preserved for downstream processing
   * 4. Error can be handled by error-specific plugins or hooks
   *
   * @optional
   * @example `new Error('Database connection failed')`
   * @example `new ValidationError('Invalid input parameters')`
   */
  error?: Error;

  /**
   * Input parameters passed to the task for execution
   *
   * Core concept:
   * Contains all input data required for task execution, providing
   * the necessary context and parameters for the task to perform its operations
   *
   * Main features:
   * - Type safety: Generic type parameter ensures type safety for different parameter types
   * - Pipeline persistence: Parameters are maintained throughout the execution pipeline
   * - Plugin access: All plugins can access and potentially modify parameters
   * - Validation support: Parameters can be validated by validation plugins
   *
   * Parameter lifecycle:
   * 1. Initial parameters are set when context is created
   * 2. Parameters can be modified by before hooks (validation, transformation)
   * 3. Modified parameters are passed to the main task function
   * 4. Parameters remain available for after hooks (logging, cleanup)
   *
   * @example Simple parameters
   * ```typescript
   * parameters: { id: 1, name: 'test' }
   * ```
   *
   * @example Complex parameters
   * ```typescript
   * parameters: {
   *   user: { id: 1, name: 'John' },
   *   options: { timeout: 5000, retries: 3 },
   *   metadata: { source: 'api', version: 'v2' }
   * }
   * ```
   */
  parameters: Params;

  /**
   * Return value from successful task execution
   *
   * Core concept:
   * Stores the result of successful task execution, providing a centralized
   * location for accessing task output and results
   *
   * Main features:
   * - Result storage: Captures task execution results for downstream processing
   * - Pipeline integration: Results are available to after hooks and plugins
   * - Type flexibility: Supports any return type from task execution
   * - Optional presence: Only populated when task execution succeeds
   *
   * Result lifecycle:
   * 1. Task function executes and produces a result
   * 2. Result is stored in this property
   * 3. Result is available to after hooks for processing
   * 4. Result can be transformed or enhanced by plugins
   *
   * @optional
   * @example `{ success: true, data: 'processed result' }`
   * @example `'simple string result'`
   * @example `{ items: [], total: 0, page: 1 }`
   */
  returnValue?: unknown;

  /**
   * Runtime information and metadata for hook execution
   *
   * Core concept:
   * Provides detailed runtime information about hook execution, including
   * performance metrics, execution state, and control flow information
   *
   * Main features:
   * - Performance tracking: Monitors hook execution time and performance
   * - State management: Tracks current hook name and execution state
   * - Flow control: Provides mechanisms to control execution flow
   * - Read-only access: Runtime data is frozen and cannot be modified
   * - Auto-cleanup: Data is automatically cleared after execution completes
   *
   * Runtime data structure:
   * - hookName: Current hook being executed
   * - returnValue: Return value from current hook execution
   * - times: Number of times hook has been executed
   * - breakChain: Flag to break the execution chain
   * - returnBreakChain: Flag to break chain when return value exists
   *
   * Security and performance:
   * - Data is frozen to prevent modification during execution
   * - Memory is automatically managed and cleared after execution
   * - Provides audit trail for debugging and monitoring
   *
   * @readonly
   * @example
   * ```typescript
   * hooksRuntimes: {
   *   hookName: 'onBefore',
   *   returnValue: { validated: true },
   *   times: 1,
   *   breakChain: false,
   *   returnBreakChain: false
   * }
   * ```
   */
  hooksRuntimes: HookRuntimes;
}

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
