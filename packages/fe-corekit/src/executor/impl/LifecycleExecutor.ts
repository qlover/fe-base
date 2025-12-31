import { ExecutorError } from '../interface';
import {
  ExecutorAsyncTask,
  ExecutorContextInterface,
  ExecutorInterface,
  ExecutorPluginNameType,
  ExecutorTask,
  ExecutorSyncTask
} from '../interface/ExecutorInterface';
import { LifecyclePluginInterface } from '../interface/LifecyclePluginInterface';
import { ExecutorContextImpl } from './ExecutorContextImpl';
import { HookExecutor } from './HookExecutor';
import { TaskExecutor } from './TaskExecutor';
import { ErrorProcessor } from './ErrorProcessor';
import { isPromise } from '../utils/isPromise';
import { EXECUTOR_SYNC_ERROR, EXECUTOR_ASYNC_ERROR } from '../utils/constants';

export interface LifecycleExecutorConfig {
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
  beforeHooks?: ExecutorPluginNameType | ExecutorPluginNameType[];

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
  afterHooks?: ExecutorPluginNameType | ExecutorPluginNameType[];

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
  execHook?: ExecutorPluginNameType;
}

/**
 * Lifecycle executor that supports both synchronous and asynchronous execution
 *
 * Core Concept:
 * Provides a unified executor implementation that automatically handles both
 * synchronous and asynchronous tasks based on method overloads and return types.
 * This eliminates the need to choose between AsyncExecutor and SyncExecutor.
 *
 * Key Differences from AsyncExecutor/SyncExecutor:
 *
 * Architecture Changes:
 * - No Base Class Inheritance: Directly implements `ExecutorInterface` instead of extending `Executor`
 *   - Eliminates dependency on base class
 *   - More flexible and maintainable
 *   - Clearer interface contract
 *
 * - Modular Design: Logic split into focused helper classes
 *   - `HookExecutor`: Handles all hook execution logic (onBefore, onSuccess, onError)
 *   - `TaskExecutor`: Handles main task execution and execHook pipeline
 *   - `ErrorProcessor`: Centralized error handling and onError hook execution
 *   - Benefits: Better separation of concerns, easier testing, improved maintainability
 *
 * - Integrated Context: No separate `ContextHandler` class
 *   - All context management integrated into `ExecutorContextImpl`
 *   - Simpler API, fewer dependencies
 *   - Direct access to context methods
 *
 * Parameter Safety and Performance:
 * - Parameter Isolation: Parameters are cloned in constructor to prevent memory leaks
 *   - Original parameters can be garbage collected independently
 *   - Prevents external code from holding references to internal state
 *   - Uses efficient shallow cloning strategy (primitives zero overhead, objects shallow copy)
 *
 * - Security: Parameters are isolated from original objects
 *   - External modifications don't affect executor's internal state
 *   - Prevents accidental parameter pollution
 *   - Safe for concurrent usage scenarios
 *
 * Type System Improvements:
 * - Default Plugin Type: Uses `LifecyclePluginInterface` as default plugin type
 *   - More specific type constraints than generic `ExecutorPluginInterface`
 *   - Better IDE support and type inference
 *   - Clearer plugin contract
 *
 * - Generic Constraints: Plugin type must extend `LifecyclePluginInterface`
 *   - Ensures plugins implement lifecycle hooks
 *   - Type-safe plugin registration
 *   - Better compile-time checks
 *
 * Hook Execution Enhancements:
 * - onBefore Return Value: Can return new parameters to update context
 *   - More flexible than direct parameter modification
 *   - Supports both sync and async return values
 *   - Automatically clones returned values for safety
 *
 * - Dynamic Sync/Async Handling: Automatically detects and handles sync/async plugins
 *   - No need to separate sync and async plugin implementations
 *   - Seamless mixing of sync and async plugins
 *   - Runtime type detection using is-promise
 *
 * Performance Optimizations:
 * - Cached Property Access: Hook methods are cached to avoid repeated property lookups
 * - Early Returns: Empty plugin arrays return early without processing
 * - Efficient Loops: Uses index-based loops instead of indexOf for O(1) access
 * - Minimal Object Creation: Reuses context instances, avoids unnecessary cloning
 *
 * Main Features:
 * - Automatic sync/async detection: Determines execution mode based on task return type
 * - Method overloads: Type-safe overloads for sync and async tasks
 * - Plugin compatibility: Works with both sync and async plugins
 * - Runtime type checking: Uses is-promise to detect Promise return values
 * - Unified API: Single executor class for all use cases
 * - Parameter safety: Cloned parameters prevent memory leaks and ensure isolation
 * - Modular architecture: Separated concerns for better maintainability
 *
 * Execution Flow:
 * 1. Parameters are cloned in constructor (prevents memory leaks)
 * 2. onBefore hooks execute (can return new parameters)
 * 3. Parameters updated if onBefore returned a value
 * 4. onExec hooks execute (can modify or wrap task)
 * 5. Main task executes
 * 6. onSuccess hooks execute (can transform result)
 * 7. On error, onError hooks execute
 * 8. Result returned (sync or async based on task type)
 *
 * Migration from AsyncExecutor/SyncExecutor:
 *
 * Simple Migration:
 * ```typescript
 * // Before (AsyncExecutor)
 * const executor = new AsyncExecutor();
 *
 * // After (LifecycleExecutor)
 * const executor = new LifecycleExecutor();
 * // Same API, works with both sync and async tasks
 * ```
 *
 * Plugin Migration:
 * ```typescript
 * // Plugins now use LifecyclePluginInterface by default
 * // Old plugins still work, but should be updated to use setParameters
 * const plugin = {
 *   onBefore: (ctx) => {
 *     // Old way (still works but not recommended)
 *     // ctx.parameters.newField = 'value';
 *
 *     // New way (recommended)
 *     ctx.setParameters({ ...ctx.parameters, newField: 'value' });
 *     // Or return new parameters
 *     return { ...ctx.parameters, newField: 'value' };
 *   }
 * };
 * ```
 *
 * Use Cases:
 * - Replacement for AsyncExecutor/SyncExecutor: Drop-in replacement with unified API
 * - Mixed Sync/Async Workflows: When you have both sync and async operations
 * - Type-Safe Plugin System: When you need strict plugin type checking
 * - Memory-Sensitive Applications: When parameter isolation is important
 * - Large-Scale Applications: When modular architecture is beneficial
 *
 * Performance Considerations:
 * - Parameter Cloning: One-time clone in constructor (minimal overhead)
 * - Hook Execution: Cached property access, early returns for empty arrays
 * - Memory: Parameters isolated, allowing garbage collection of original objects
 * - Type Checking: Runtime Promise detection (minimal overhead)
 *
 * @template Ctx - Type of executor context interface (defaults to ExecutorContextInterface<unknown>)
 * @template Plugin - Type of plugin interface (defaults to LifecyclePluginInterface<Ctx>)
 *
 * @example Basic async usage
 * ```typescript
 * const executor = new LifecycleExecutor();
 * executor.use(new LogPlugin());
 *
 * const result = await executor.exec(async (ctx) => {
 *   const response = await fetch('https://api.example.com/data');
 *   return response.json();
 * });
 * ```
 *
 * @example Basic sync usage
 * ```typescript
 * const executor = new LifecycleExecutor();
 * executor.use(new ValidationPlugin());
 *
 * const result = executor.exec((ctx) => {
 *   return ctx.parameters.toUpperCase();
 * });
 * ```
 *
 * @example With input data and parameter modification
 * ```typescript
 * const executor = new LifecycleExecutor();
 * executor.use({
 *   onBefore: (ctx) => {
 *     // Return new parameters to update context
 *     return { ...ctx.parameters, timestamp: Date.now() };
 *   }
 * });
 *
 * const result = await executor.exec(
 *   { userId: 123 },
 *   async (ctx) => {
 *     // ctx.parameters now includes timestamp
 *     return await fetchUserData(ctx.parameters.userId);
 *   }
 * );
 * ```
 *
 * @example Custom plugin type
 * ```typescript
 * interface CustomPlugin extends LifecyclePluginInterface<ExecutorContextInterface<UserParams>> {
 *   customMethod(): void;
 * }
 *
 * const executor = new LifecycleExecutor<
 *   ExecutorContextInterface<UserParams>,
 *   CustomPlugin
 * >();
 * ```
 *
 * @since 2.6.0
 * @see AsyncExecutor - Original async-only executor implementation
 * @see SyncExecutor - Original sync-only executor implementation
 * @see LifecyclePluginInterface - Default plugin interface
 * @see ExecutorContextImpl - Context implementation with integrated functionality
 *
 * @category LifecycleExecutor
 */
export class LifecycleExecutor<
  Ctx extends
    ExecutorContextInterface<unknown> = ExecutorContextInterface<unknown>,
  Plugin extends LifecyclePluginInterface<Ctx> = LifecyclePluginInterface<Ctx>
> implements ExecutorInterface<Plugin>
{
  /**
   * Array of active plugins for this executor
   * All plugins must be of type Plugin which extends ExecutorPluginInterface<Ctx>
   * Type safety is enforced at compile time through generic constraints
   */
  protected plugins: Plugin[] = [];

  /**
   * Hook executor for handling plugin hooks
   */
  private hookExecutor: HookExecutor<Ctx>;

  /**
   * Task executor for handling task execution
   */
  private taskExecutor: TaskExecutor<Ctx, Plugin>;

  /**
   * Error processor for handling errors
   */
  private errorProcessor: ErrorProcessor<Ctx>;

  constructor(
    /**
     * Configuration for this executor
     */
    protected config: LifecycleExecutorConfig = {}
  ) {
    // Initialize helper classes
    this.hookExecutor = new HookExecutor<Ctx>();
    this.errorProcessor = new ErrorProcessor<Ctx>(this.hookExecutor);
    this.taskExecutor = new TaskExecutor<Ctx, Plugin>(
      this.plugins,
      this.config,
      this.hookExecutor,
      this.errorProcessor
    );
  }

  /**
   * Add a plugin to the executor's execution pipeline
   *
   * Core concept:
   * Registers a plugin to participate in the executor's execution pipeline,
   * extending the executor's functionality with additional capabilities.
   * Plugin type is enforced at compile time through generic constraints.
   *
   * Main features:
   * - Plugin registration: Adds plugins to the execution pipeline
   * - Type safety: Only accepts plugins of type Plugin (enforced by generic constraint)
   * - Deduplication: Prevents duplicate plugins when `onlyOne` is true
   * - Order preservation: Maintains plugin execution order
   * - Validation: Ensures plugin is a valid object
   *
   * Type constraints:
   * - Plugin type is constrained by class generic: Plugin extends ExecutorPluginInterface<Ctx>
   * - All plugins must be of the same type Plugin
   * - Type safety is enforced at compile time, preventing mixing different plugin types
   *
   * @override
   * @param plugin - Plugin instance of type Plugin to add to the execution pipeline
   *
   * @throws {Error} When plugin is not a valid object
   *
   * @example
   * ```typescript
   * // Define a specific plugin type
   * interface UserPlugin extends ExecutorPluginInterface<ExecutorContextInterface<UserParams>> {
   *   onBefore?(ctx: ExecutorContextInterface<UserParams>): void;
   * }
   *
   * // Create executor with plugin type constraint
   * const executor = new LifecycleExecutor<ExecutorContextInterface<UserParams>, UserPlugin>();
   * executor.use(new UserPlugin()); // ✅ Correct type
   * executor.use(new AdminPlugin()); // ❌ Type error - AdminPlugin is not UserPlugin
   * ```
   */
  public use(plugin: Plugin): void {
    // Security: Validate plugin input
    if (typeof plugin !== 'object' || plugin === null) {
      throw new Error('Plugin must be an object');
    }

    // Check for duplicate plugins if onlyOne is set
    if (plugin.onlyOne) {
      const isDuplicate = this.plugins.some(
        (p) =>
          p === plugin ||
          (p.pluginName &&
            plugin.pluginName &&
            p.pluginName === plugin.pluginName) ||
          p.constructor === plugin.constructor
      );

      if (isDuplicate) {
        const pluginName = plugin.pluginName || 'Unknown';
        console.warn(`Plugin ${pluginName} is already used, skip adding`);
        return;
      }
    }

    this.plugins.push(plugin);

    // Performance optimization: TaskExecutor holds a reference to plugins array
    // so it automatically sees new plugins. No need to recreate TaskExecutor.
    // This avoids unnecessary object creation on every plugin addition.
  }

  /**
   * Create a new execution context instance
   *
   * Core concept:
   * Factory method for creating execution contexts. This allows subclasses
   * to override context creation behavior if needed.
   *
   * @template Params - Type of context parameters
   * @param parameters - The initial parameters for the context
   * @returns A new ExecutorContextImpl instance
   *
   * @example Override in subclass
   * ```typescript
   * protected createContext<Params>(parameters: Params): ExecutorContextImpl<Params> {
   *   return new CustomContextImpl(parameters);
   * }
   * ```
   */
  protected createContext<Params>(
    parameters: Params
  ): ExecutorContextImpl<Params> {
    return new ExecutorContextImpl<Params>(parameters);
  }

  /**
   * Execute task without throwing errors
   * Automatically handles both sync and async tasks
   * @override
   */
  public execNoError<R, P>(
    task: ExecutorAsyncTask<R, P>
  ): Promise<R | ExecutorError>;
  /** @override */
  public execNoError<R, P>(
    data: P,
    task: ExecutorAsyncTask<R, P>
  ): Promise<R | ExecutorError>;
  /** @override */
  public execNoError<R, P>(task: ExecutorSyncTask<R, P>): R | ExecutorError;
  /** @override */
  public execNoError<R, P>(
    data: P,
    task: ExecutorSyncTask<R, P>
  ): R | ExecutorError;
  /** @override */
  public execNoError<R, P>(
    dataOrTask: P | ExecutorTask<R, P>,
    task?: ExecutorTask<R, P>
  ): R | ExecutorError | Promise<R | ExecutorError> {
    try {
      // Call exec directly - it will handle both sync and async cases
      const result =
        task !== undefined
          ? (
              this.exec as <R, P>(
                data: P,
                task: ExecutorTask<R, P>
              ) => R | Promise<R>
            )(dataOrTask as P, task)
          : (this.exec as <R, P>(task: ExecutorTask<R, P>) => R | Promise<R>)(
              dataOrTask as ExecutorTask<R, P>
            );

      // Check if result is a Promise (async case)
      if (isPromise(result)) {
        return result.catch((error) => {
          if (error instanceof ExecutorError) {
            return error;
          }
          const errorObj =
            error instanceof Error ? error : new Error(String(error));
          return new ExecutorError(EXECUTOR_ASYNC_ERROR, errorObj);
        }) as Promise<R | ExecutorError>;
      }

      // Sync result - return directly
      return result;
    } catch (error) {
      // Sync error case
      if (error instanceof ExecutorError) {
        return error;
      }
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      return new ExecutorError(EXECUTOR_SYNC_ERROR, errorObj);
    }
  }

  /**
   * Execute task with full plugin pipeline
   * Automatically handles both sync and async tasks based on method overloads
   * @override
   */
  public exec<R, P>(task: ExecutorAsyncTask<R, P>): Promise<R>;
  /** @override */
  public exec<R, P>(data: P, task: ExecutorAsyncTask<R, P>): Promise<R>;
  /** @override */
  public exec<R, P>(task: ExecutorSyncTask<R, P>): R;
  /** @override */
  public exec<R, P>(data: P, task: ExecutorSyncTask<R, P>): R;
  /** @override */
  public exec<R, P>(
    dataOrTask: P | ExecutorTask<R, P>,
    task?: ExecutorTask<R, P>
  ): R | Promise<R> {
    const actualTask = (task || dataOrTask) as ExecutorTask<R, P>;
    const data = (task ? dataOrTask : undefined) as P | undefined;

    if (typeof actualTask !== 'function') {
      throw new Error('Task must be a function!');
    }

    const context = this.createContext<P>(data ?? ({} as P));
    return this.taskExecutor.run(context, actualTask);
  }
}
