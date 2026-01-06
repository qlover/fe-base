import { HookRuntimes } from './ExecutorContext';
import { ExecutorError } from './ExecutorError';
import { ExecutorHookRuntimesInterface } from './ExecutorHookRuntimesInterface';

/**
 * Asynchronous task function type
 *
 * Represents a task that returns a Promise. Used for async operations
 * like API calls, file I/O, or any asynchronous work.
 *
 * @template R - Return type of the task
 * @template P - Parameter type for the context
 *
 * @example
 * ```typescript
 * const asyncTask: ExecutorAsyncTask<User, UserId> = async (ctx) => {
 *   const response = await fetch(`/api/users/${ctx.parameters.id}`);
 *   return response.json();
 * };
 * ```
 */
export type ExecutorAsyncTask<R, P> = (
  ctx: ExecutorContextInterface<P, R>
) => Promise<R>;

/**
 * Synchronous task function type
 *
 * Represents a task that returns immediately. Used for synchronous
 * operations like data transformation, validation, or computation.
 *
 * @template R - Return type of the task
 * @template P - Parameter type for the context
 *
 * @example
 * ```typescript
 * const syncTask: ExecutorSyncTask<string, string> = (ctx) => {
 *   return ctx.parameters.toUpperCase();
 * };
 * ```
 */
export type ExecutorSyncTask<R, P> = (ctx: ExecutorContextInterface<P, R>) => R;

/**
 * Union type for both sync and async tasks
 *
 * Allows a single type to represent either synchronous or asynchronous tasks.
 * The executor will automatically detect the return type and handle accordingly.
 *
 * @template R - Return type of the task
 * @template P - Parameter type for the context
 */
export type ExecutorTask<R, P> =
  | ExecutorAsyncTask<R, P>
  | ExecutorSyncTask<R, P>;

/**
 * Plugin hook name type
 *
 * Currently supports string names. Symbol support is planned for future versions
 * to allow for more advanced plugin identification and namespacing.
 *
 * @todo Add symbol support | symbol;
 */
export type ExecutorPluginNameType = string; // TODO: Add symbol support | symbol;

/**
 * Executor context interface with generic runtime support
 *
 * @template T - Type of execution parameters
 * @template R - Type of return value (required for type safety)
 * @template RuntimesType - Type of hook runtimes (extends HookRuntimes, defaults to HookRuntimes)
 *
 * @example Basic usage
 * ```typescript
 * const context: ExecutorContextInterface<UserParams, UserResult> = new ExecutorContextImpl(params);
 * ```
 *
 * @example With unknown return type
 * ```typescript
 * const context: ExecutorContextInterface<UserParams, unknown> = new ExecutorContextImpl(params);
 * ```
 *
 * @example Extended runtimes
 * ```typescript
 * interface CustomRuntimes extends HookRuntimes {
 *   executionTime: number;
 * }
 * const context: ExecutorContextInterface<UserParams, UserResult, CustomRuntimes>;
 * ```
 */
export interface ExecutorContextInterface<
  T,
  R = unknown,
  RuntimesType extends HookRuntimes = HookRuntimes
> extends ExecutorHookRuntimesInterface<RuntimesType> {
  /** Read-only access to execution parameters */
  readonly parameters: T;

  /** Current error state, if any */
  readonly error: unknown;

  /** Task return value */
  readonly returnValue: R | undefined;

  /**
   * Set the error state
   *
   * Accepts any type of error value and converts it to ExecutorError.
   * This matches the behavior of JavaScript's catch clause which can catch any type.
   *
   * @param error - Error to set (can be any type: Error, string, object, etc.)
   */
  setError(error: unknown): void;

  /**
   * Set the return value
   * @param value - Return value to set
   */
  setReturnValue(value: unknown): void;

  /**
   * Update parameters (clones internally for safety)
   * @param params - New parameters to set
   */
  setParameters(params: T): void;
}

/**
 * Base plugin interface for executor plugins
 *
 * ## Purpose
 * Defines the minimum contract that all executor plugins must implement.
 * Provides plugin identification, enablement checking, and basic metadata.
 *
 * Key Features:
 *
 * Plugin Identification:
 * - pluginName: Optional name for plugin identification
 * - onlyOne: Flag to ensure only one instance of this plugin type
 *
 * Enablement Checking:
 * - enabled: Method to check if plugin should execute for a given hook
 * - Context-Aware: Can check context state to determine enablement
 * - Hook-Specific: Can enable/disable per hook name
 *
 * Usage:
 * This is the base interface. Most plugins should extend `LifecyclePluginInterface`
 * which adds lifecycle hooks (onBefore, onExec, onSuccess, onError).
 *
 * @template Ctx - Type of executor context interface
 *
 * @example Basic plugin
 * ```typescript
 * const plugin: ExecutorPluginInterface<ExecutorContextInterface<unknown, unknown>> = {
 *   pluginName: 'myPlugin',
 *   onlyOne: true,
 *   enabled: (name, context) => {
 *     return name === 'onBefore' && context.parameters.shouldRun;
 *   }
 * };
 * ```
 *
 * @see LifecyclePluginInterface - Extended interface with lifecycle hooks
 * @see LifecycleExecutor - Executor that uses plugins
 */
export interface ExecutorPluginInterface<
  Ctx extends ExecutorContextInterface<unknown, unknown>
> {
  /** Optional plugin name for identification */
  readonly pluginName: ExecutorPluginNameType;

  /** If true, ensures only one instance of this plugin type */
  readonly onlyOne?: boolean;

  /**
   * Check if plugin should be enabled for a given hook
   * @param name - Hook name to check
   * @param context - Optional execution context
   * @returns true if plugin should execute, false otherwise
   */
  enabled?(name: ExecutorPluginNameType, context?: Ctx): boolean;
}

/**
 * Executor interface
 *
 * ## Purpose
 * Defines the core contract for executor implementations. Provides methods
 * for plugin registration and task execution with both sync and async support.
 *
 * Key Features:
 *
 * Plugin Management:
 * - use: Register plugins with the executor
 * - Type Safety: Generic Plugin type ensures type-safe plugin registration
 *
 * Task Execution:
 * - exec: Execute tasks with error throwing
 * - execNoError: Execute tasks with error returning (no throwing)
 * - Method Overloads: Type-safe overloads for sync/async tasks
 *
 * Type Safety:
 * - Generic Plugin Type: Ensures plugins match executor's expected type
 * - Task Type Inference: Automatically infers sync/async from task type
 * - Parameter Type Safety: Generic parameter types ensure type safety
 *
 * Differences from Original Implementation:
 *
 * Interface-Based Design:
 * - No Base Class: Pure interface, no implementation
 *   - Original: Base Executor class with implementation
 *   - New: Interface-only contract
 *   - Benefits: More flexible, easier to implement differently
 *
 * Generic Plugin Type:
 * - Plugin Type Parameter: Generic type for plugin type
 *   - Original: Fixed plugin type
 *   - New: Configurable plugin type
 *   - Benefits: Better type safety, extensibility
 *
 * Unified Sync/Async Support:
 * - Method Overloads: Single interface supports both sync and async
 *   - Original: Separate interfaces/classes
 *   - New: Unified interface with overloads
 *   - Benefits: Single API, better type inference
 *
 * Usage:
 * Implement this interface to create custom executor implementations.
 * LifecycleExecutor is the default implementation.
 *
 * @template Plugin - Type of plugin interface (defaults to ExecutorPluginInterface)
 *
 * @example Basic usage
 * ```typescript
 * const executor: ExecutorInterface<LifecyclePluginInterface<ExecutorContextInterface<unknown, unknown>>> =
 *   new LifecycleExecutor();
 *
 * executor.use({
 *   pluginName: 'myPlugin',
 *   enabled: () => true,
 *   onBefore: (ctx) => console.log('Before:', ctx.parameters)
 * });
 *
 * const result = await executor.exec(async (ctx) => {
 *   return await fetchData(ctx.parameters);
 * });
 * ```
 *
 * @example Sync usage
 * ```typescript
 * const executor = new LifecycleExecutor();
 * const result = executor.exec((ctx) => {
 *   return ctx.parameters.toUpperCase();
 * });
 * ```
 *
 * @example With parameters
 * ```typescript
 * const executor = new LifecycleExecutor();
 * const result = await executor.exec(
 *   { userId: 123 },
 *   async (ctx) => await fetchUser(ctx.parameters.userId)
 * );
 * ```
 *
 * @see LifecycleExecutor - Default implementation
 * @see LifecyclePluginInterface - Default plugin interface
 * @see ExecutorContextInterface - Context interface
 */
export interface ExecutorInterface<
  Plugin extends ExecutorPluginInterface<
    ExecutorContextInterface<unknown, unknown>
  > = ExecutorPluginInterface<ExecutorContextInterface<unknown, unknown>>
> {
  /**
   * Register a plugin with the executor
   * @param plugin - Plugin to register
   */
  use(plugin: Plugin): void;

  /**
   * Execute an async task (with data)
   * @param data - Input data for the task
   * @param task - Async task function
   * @returns Promise resolving to task result
   */
  exec<R, P>(data: P, task: ExecutorAsyncTask<R, P>): Promise<R>;

  /**
   * Execute an async task (without data)
   * @param task - Async task function
   * @returns Promise resolving to task result
   */
  exec<R, P>(task: ExecutorAsyncTask<R, P>): Promise<R>;

  /**
   * Execute a sync task (with data)
   * @param data - Input data for the task
   * @param task - Sync task function
   * @returns Task result
   */
  exec<R, P>(data: P, task: ExecutorSyncTask<R, P>): R;

  /**
   * Execute a sync task (without data)
   * @param task - Sync task function
   * @returns Task result
   */
  exec<R, P>(task: ExecutorSyncTask<R, P>): R;

  /**
   * Execute an async task without throwing errors (with data)
   * @param data - Input data for the task
   * @param task - Async task function
   * @returns Promise resolving to result or ExecutorError
   */
  execNoError<R, P>(
    data: P,
    task: ExecutorAsyncTask<R, P>
  ): Promise<R | ExecutorError>;

  /**
   * Execute an async task without throwing errors (without data)
   * @param task - Async task function
   * @returns Promise resolving to result or ExecutorError
   */
  execNoError<R, P>(task: ExecutorAsyncTask<R, P>): Promise<R | ExecutorError>;

  /**
   * Execute a sync task without throwing errors (with data)
   * @param data - Input data for the task
   * @param task - Sync task function
   * @returns Result or ExecutorError
   */
  execNoError<R, P>(data: P, task: ExecutorSyncTask<R, P>): R | ExecutorError;

  /**
   * Execute a sync task without throwing errors (without data)
   * @param task - Sync task function
   * @returns Result or ExecutorError
   */
  execNoError<R, P>(task: ExecutorSyncTask<R, P>): R | ExecutorError;
}
