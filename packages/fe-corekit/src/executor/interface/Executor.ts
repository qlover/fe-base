import { ExecutorError } from './ExecutorError';
import { ExecutorPlugin, Task } from './ExecutorPlugin';

export type HookType = string;

/**
 * Configuration interface for executor behavior customization
 *
 * Core concept:
 * Provides flexible configuration options to customize executor behavior,
 * including hook execution order, lifecycle management, and execution flow control
 *
 * Main features:
 * - Hook customization: Define custom hook names for different execution phases
 * - Execution flow control: Configure before/after execution hooks
 * - Plugin integration: Support for custom execution logic hooks
 *
 * @since 2.1.0
 *
 * @example Basic configuration
 * ```typescript
 * const config: ExecutorConfigInterface = {
 *   beforeHooks: ['validate', 'transform'],
 *   afterHooks: ['log', 'cleanup'],
 *   execHook: 'process'
 * };
 * ```
 */
export interface ExecutorConfigInterface {
  /**
   * Hook names to execute before task execution
   *
   * These hooks are executed in the order they appear in the array.
   * Each hook can modify the input data or perform validation.
   *
   * @default `'onBefore'`
   * @example `['validate', 'transform']`
   * @example `'preProcess'`
   */
  beforeHooks?: HookType | HookType[];

  /**
   * Hook names to execute after successful task execution
   *
   * These hooks are executed in the order they appear in the array.
   * Each hook can process the result or perform cleanup operations.
   *
   * @default `'onSuccess'`
   * @example `['log', 'cleanup']`
   * @example `'postProcess'`
   */
  afterHooks?: HookType | HookType[];

  /**
   * Hook name for the main execution logic
   *
   * This hook contains the core business logic for task execution.
   * If not specified, the default `'onExec'` hook is used.
   *
   * @default `'onExec'`
   * @example `'process'`
   * @example `'execute'`
   */
  execHook?: HookType;
}

/**
 * Base executor class providing plugin management and execution pipeline
 *
 * Core concept:
 * Implements a pluggable execution pipeline that enables modular task processing
 * with pre-processing, execution, and post-processing capabilities
 *
 * Main features:
 * - Plugin management: Add, remove, and manage execution plugins
 * - Hook system: Configurable lifecycle hooks for different execution phases
 * - Error handling: Comprehensive error management with optional error wrapping
 * - Task execution: Support for both synchronous and asynchronous task execution
 * - Pipeline orchestration: Coordinate multiple plugins in a defined execution order
 *
 * Execution flow:
 * 1. Before hooks: Validate and transform input data
 * 2. Execution hook: Perform the main business logic
 * 3. After hooks: Process results and perform cleanup
 * 4. Error handling: Manage errors at any stage of execution
 *
 * Design considerations:
 * - Plugin deduplication: Prevents duplicate plugins when `onlyOne` is true
 * - Error propagation: `execNoError` methods return errors instead of throwing
 * - Type safety: Full TypeScript support with generic type parameters
 * - Extensibility: Easy to extend with custom plugins and hooks
 *
 * @abstract
 * @class Executor
 * @category Executor
 *
 * @example Basic usage
 * ```typescript
 * // Create an executor instance
 * const executor = new AsyncExecutor({
 *   beforeHooks: ['validate'],
 *   afterHooks: ['log']
 * });
 *
 * // Add plugins
 * executor.use(new LoggerPlugin());
 * executor.use(new RetryPlugin({ maxAttempts: 3 }));
 *
 * // Execute a task
 * const result = await executor.exec(async (data) => {
 *   return await someAsyncOperation(data);
 * });
 * ```
 *
 * @example With input data
 * ```typescript
 * const result = await executor.exec(inputData, async (data) => {
 *   return await processData(data);
 * });
 * ```
 *
 * @example Error-safe execution
 * ```typescript
 * const result = await executor.execNoError(async (data) => {
 *   return await riskyOperation(data);
 * });
 *
 * if (result instanceof ExecutorError) {
 *   console.error('Task failed:', result.message);
 * } else {
 *   console.log('Task succeeded:', result);
 * }
 * ```
 */
export abstract class Executor<ExecutorConfig extends ExecutorConfigInterface> {
  /**
   * Array of active plugins for this executor
   *
   * Core concept:
   * Maintains an ordered collection of plugins that participate in the execution pipeline
   *
   * Main features:
   * - Plugin storage: Stores all registered plugins in execution order
   * - Lifecycle management: Manages plugin initialization and cleanup
   * - Execution coordination: Ensures plugins execute in the correct sequence
   * - Deduplication support: Prevents duplicate plugins when configured
   *
   * Plugin execution order:
   * 1. Plugins are executed in the order they were added
   * 2. Each plugin can modify data or control execution flow
   * 3. Plugin hooks are called based on executor configuration
   *
   * @example
   * ```typescript
   * protected plugins = [
   *   new LoggerPlugin(),
   *   new RetryPlugin({ maxAttempts: 3 }),
   *   new CachePlugin({ ttl: 300 })
   * ];
   * ```
   */
  protected plugins: ExecutorPlugin[] = [];

  /**
   * Creates a new Executor instance with optional configuration
   *
   * Core concept:
   * Initializes the executor with configuration that controls its behavior
   * and execution pipeline setup
   *
   * Main features:
   * - Configuration injection: Accepts custom configuration for hook names and behavior
   * - Default setup: Provides sensible defaults when no configuration is provided
   * - Plugin preparation: Sets up the environment for plugin registration
   *
   * @param config - Optional configuration object to customize executor behavior
   *
   * @example Basic instantiation
   * ```typescript
   * const executor = new AsyncExecutor();
   * ```
   *
   * @example With custom configuration
   * ```typescript
   * const executor = new AsyncExecutor({
   *   beforeHooks: ['validate', 'transform'],
   *   afterHooks: ['log', 'cleanup'],
   *   execHook: 'process'
   * });
   * ```
   */
  constructor(protected config: ExecutorConfig = {} as ExecutorConfig) {}

  /**
   * Add a plugin to the executor's execution pipeline
   *
   * Core concept:
   * Registers a plugin to participate in the executor's execution pipeline,
   * extending the executor's functionality with additional capabilities
   *
   * Main features:
   * - Plugin registration: Adds plugins to the execution pipeline
   * - Deduplication: Prevents duplicate plugins when `onlyOne` is true
   * - Order preservation: Maintains plugin execution order
   * - Validation: Ensures plugin is a valid object
   *
   * Deduplication logic:
   * - Checks for exact plugin instance match
   * - Checks for plugin name match
   * - Checks for constructor match
   * - Only prevents duplicates when `plugin.onlyOne` is true
   *
   * @param plugin - Plugin instance to add to the execution pipeline
   *
   * @throws {Error} When plugin is not a valid object
   *
   * @example Add a class-based plugin
   * ```typescript
   * executor.use(new LoggerPlugin());
   * executor.use(new RetryPlugin({ maxAttempts: 3 }));
   * ```
   *
   * @example Add a plain object plugin
   * ```typescript
   * executor.use({
   *   pluginName: 'CustomPlugin',
   *   onBefore: (data) => ({ ...data, modified: true }),
   *   onAfter: (result) => console.log('Result:', result)
   * });
   * ```
   *
   * @example Plugin with deduplication
   * ```typescript
   * const plugin = new LoggerPlugin();
   * plugin.onlyOne = true;
   *
   * executor.use(plugin); // First addition - succeeds
   * executor.use(plugin); // Second addition - skipped with warning
   * ```
   */
  public use(plugin: ExecutorPlugin): void {
    if (typeof plugin !== 'object' || plugin === null) {
      throw new Error('Plugin must be an object');
    }

    if (
      this.plugins.find(
        (p) =>
          p === plugin ||
          p.pluginName === plugin.pluginName ||
          p.constructor === plugin.constructor
      ) &&
      plugin.onlyOne
    ) {
      console.warn(`Plugin ${plugin.pluginName} is already used, skip adding`);
      return;
    }

    this.plugins.push(plugin);
  }

  /**
   * Execute a specific hook across all plugins
   *
   * Core concept:
   * Provides the mechanism to execute plugin lifecycle hooks across all
   * registered plugins in the correct order
   *
   * Main features:
   * - Hook execution: Runs specified hook on all plugins
   * - Order preservation: Executes plugins in registration order
   * - Async support: Handles both synchronous and asynchronous hooks
   * - Error propagation: Manages errors from hook execution
   *
   * Hook execution flow:
   * 1. Iterate through plugins in registration order
   * 2. Check if plugin has the specified hook method
   * 3. Execute hook with provided arguments
   * 4. Handle return values and errors appropriately
   *
   * @param plugins - Array of plugins to execute the hook on
   * @param name - Name of the hook to execute (e.g., 'onBefore', 'onExec', 'onAfter')
   * @param args - Arguments to pass to the hook method
   *
   * @returns Hook execution result or void
   *
   * @example Execute before hook
   * ```typescript
   * await executor.runHooks(plugins, 'onBefore', inputData);
   * ```
   *
   * @example Execute custom hook
   * ```typescript
   * const result = await executor.runHooks(plugins, 'customHook', data, options);
   * ```
   */
  public abstract runHooks(
    plugins: ExecutorPlugin[],
    name: unknown,
    ...args: unknown[]
  ): void | unknown | Promise<void | unknown>;

  /**
   * Execute a task through the plugin pipeline
   *
   * Core concept:
   * Executes a task function through the complete plugin pipeline,
   * including before hooks, execution, and after hooks
   *
   * Main features:
   * - Pipeline execution: Runs task through configured plugin pipeline
   * - Hook integration: Executes before/after hooks as configured
   * - Error handling: Comprehensive error management and propagation
   * - Type safety: Full TypeScript support with generic types
   *
   * Execution pipeline:
   * 1. Execute before hooks (if configured)
   * 2. Execute main task function
   * 3. Execute after hooks (if configured)
   * 4. Return result or throw error
   *
   * @param task - Task function to execute through the pipeline
   * @returns Task execution result
   *
   * @throws {ExecutorError} When task execution fails or plugin errors occur
   *
   * @example Basic task execution
   * ```typescript
   * const result = await executor.exec(async (data) => {
   *   return await processData(data);
   * });
   * ```
   *
   * @example Synchronous task execution
   * ```typescript
   * const result = executor.exec((data) => {
   *   return transformData(data);
   * });
   * ```
   */
  public abstract exec<Result, Params = unknown>(
    task: Task<Result, Params>
  ): Promise<Result> | Result;

  /**
   * Execute a task with input data through the plugin pipeline
   *
   * Core concept:
   * Executes a task function with provided input data through the complete
   * plugin pipeline, enabling data transformation and processing
   *
   * Main features:
   * - Data processing: Passes input data through the execution pipeline
   * - Pipeline execution: Runs task through configured plugin pipeline
   * - Hook integration: Executes before/after hooks with input data
   * - Error handling: Comprehensive error management and propagation
   *
   * Data flow:
   * 1. Input data is passed to before hooks for validation/transformation
   * 2. Transformed data is passed to the main task function
   * 3. Task result is passed to after hooks for processing
   * 4. Final result is returned or error is thrown
   *
   * @param data - Input data to pass through the execution pipeline
   * @param task - Task function to execute with the input data
   * @returns Task execution result
   *
   * @throws {ExecutorError} When task execution fails or plugin errors occur
   *
   * @example Execute task with input data
   * ```typescript
   * const result = await executor.exec(inputData, async (data) => {
   *   return await processData(data);
   * });
   * ```
   *
   * @example Data transformation pipeline
   * ```typescript
   * const result = await executor.exec(rawData, (data) => {
   *   return transformAndValidate(data);
   * });
   * ```
   */
  public abstract exec<Result, Params = unknown>(
    data: unknown,
    task: Task<Result, Params>
  ): Promise<Result> | Result;

  /**
   * Execute a task without throwing errors, returning errors as values
   *
   * Core concept:
   * Provides error-safe task execution by wrapping errors in `ExecutorError`
   * instances instead of throwing them, enabling explicit error handling
   *
   * Main features:
   * - Error wrapping: All errors are wrapped in `ExecutorError` instances
   * - Non-throwing: Never throws errors, always returns a value
   * - Pipeline execution: Runs through complete plugin pipeline
   * - Type safety: Returns union type of result or error
   *
   * Error handling:
   * - Task execution errors are wrapped in `ExecutorError`
   * - Plugin hook errors are wrapped in `ExecutorError`
   * - Network/async errors are wrapped in `ExecutorError`
   * - All errors include original error information and context
   *
   * @param task - Task function to execute safely
   * @returns Task result or `ExecutorError` instance
   *
   * @example Safe task execution
   * ```typescript
   * const result = await executor.execNoError(async (data) => {
   *   return await riskyOperation(data);
   * });
   *
   * if (result instanceof ExecutorError) {
   *   console.error('Task failed:', result.message);
   *   console.error('Original error:', result.cause);
   * } else {
   *   console.log('Task succeeded:', result);
   * }
   * ```
   *
   * @example Error handling with type guards
   * ```typescript
   * const result = await executor.execNoError(async (data) => {
   *   return await apiCall(data);
   * });
   *
   * if (result instanceof ExecutorError) {
   *   // Handle error case
   *   return { success: false, error: result.message };
   * } else {
   *   // Handle success case
   *   return { success: true, data: result };
   * }
   * ```
   */
  public abstract execNoError<Result, Params = unknown>(
    task: Task<Result, Params>
  ): Promise<Result | ExecutorError> | Result | ExecutorError;

  /**
   * Execute a task with input data without throwing errors
   *
   * Core concept:
   * Provides error-safe task execution with input data by wrapping errors
   * in `ExecutorError` instances, enabling explicit error handling with data processing
   *
   * Main features:
   * - Error wrapping: All errors are wrapped in `ExecutorError` instances
   * - Non-throwing: Never throws errors, always returns a value
   * - Data processing: Passes input data through the execution pipeline
   * - Pipeline execution: Runs through complete plugin pipeline
   *
   * Data and error flow:
   * 1. Input data is processed through before hooks
   * 2. Task function executes with processed data
   * 3. Result is processed through after hooks
   * 4. Final result or error is returned (never thrown)
   *
   * @param data - Input data to pass through the execution pipeline
   * @param task - Task function to execute with the input data
   * @returns Task result or `ExecutorError` instance
   *
   * @example Safe execution with input data
   * ```typescript
   * const result = await executor.execNoError(inputData, async (data) => {
   *   return await processData(data);
   * });
   *
   * if (result instanceof ExecutorError) {
   *   console.error('Processing failed:', result.message);
   * } else {
   *   console.log('Processing succeeded:', result);
   * }
   * ```
   *
   * @example Batch processing with error handling
   * ```typescript
   * const results = await Promise.all(
   *   dataItems.map(item =>
   *     executor.execNoError(item, async (data) => {
   *       return await processItem(data);
   *     })
   *   )
   * );
   *
   * const successes = results.filter(r => !(r instanceof ExecutorError));
   * const errors = results.filter(r => r instanceof ExecutorError);
   * ```
   */
  public abstract execNoError<Result, Params = unknown>(
    data: unknown,
    task: Task<Result, Params>
  ): Promise<Result | ExecutorError> | Result | ExecutorError;
}
