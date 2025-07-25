import {
  Executor,
  ExecutorConfigInterface,
  ExecutorContext,
  ExecutorError,
  ExecutorPlugin,
  HookType,
  SyncTask
} from '../interface';
import { ContextHandler, createContext } from './ContextHandler';

type PluginMethod<Params = unknown> = (
  context: ExecutorContext<Params>,
  ...args: unknown[]
) => unknown;

/**
 * Synchronous executor class that extends the base Executor
 * Provides synchronous task execution with plugin support
 *
 * Core concept:
 * Synchronous execution pipeline with plugin lifecycle management
 *
 * Main features:
 * - Synchronous plugin hook execution: All operations are immediate without Promise overhead
 * - Plugin lifecycle management: Support for onBefore, onExec, onSuccess, onError hooks
 * - Configurable hook execution: Customizable beforeHooks, afterHooks, and execHook
 * - Chain breaking support: Plugins can interrupt execution chain
 * - Error handling: Comprehensive error handling with plugin support
 *
 * Use this executor when:
 * - All operations are synchronous
 * - You need immediate results
 * - Performance is critical
 * - No async operations are involved
 *
 * @extends Executor
 *
 * @example Basic usage
 * ```typescript
 * const executor = new SyncExecutor();
 * executor.use(new ValidationPlugin());
 * executor.use(new LoggerPlugin());
 *
 * const result = executor.exec((data) => {
 *   return data.toUpperCase();
 * });
 * ```
 *
 * @example With custom configuration
 * ```typescript
 * const executor = new SyncExecutor({
 *   beforeHooks: ['onBefore', 'onValidate'],
 *   afterHooks: ['onSuccess', 'onLog'],
 *   execHook: 'onCustomExec'
 * });
 *
 * const result = executor.exec(data, (input) => {
 *   return input.value.toUpperCase();
 * });
 * ```
 *
 * @example Error handling
 * ```typescript
 * const result = executor.execNoError(() => {
 *   throw new Error('Validation Error');
 * }); // Returns ExecutorError instead of throwing
 * ```
 *
 * @category SyncExecutor
 */
export class SyncExecutor<
  ExecutorConfig extends ExecutorConfigInterface = ExecutorConfigInterface
> extends Executor<ExecutorConfig> {
  protected contextHandler: ContextHandler = new ContextHandler();

  /**
   * Execute a single plugin hook function synchronously
   *
   * Core concept:
   * Sequential plugin execution with chain breaking and return value handling
   *
   * Execution flow:
   * 1. Check if plugin is enabled for the hook
   * 2. Execute plugin hook if available
   * 3. Handle plugin results and chain breaking conditions
   * 4. Continue to next plugin or break chain
   *
   * Key features:
   * - Plugin enablement checking
   * - Chain breaking support
   * - Return value management
   * - Runtime tracking
   *
   * @param plugins - Array of plugins to execute
   * @param hookName - Name of the hook function to execute
   * @param context - Execution context containing data and runtime information
   * @param args - Additional arguments to pass to the hook function
   * @returns Result of the hook function execution
   *
   * @example Internal usage
   * ```typescript
   * const result = this.runHook(
   *   this.plugins,
   *   'onBefore',
   *   context,
   *   data
   * );
   * ```
   */
  protected runHook<Params>(
    plugins: ExecutorPlugin[],
    /**
     * Hook name to execute
     *
     * Allows any string as hook name. If the hook name is not a function,
     * the plugin will be skipped for this hook execution.
     *
     * @since 1.1.3
     */
    hookName: HookType,
    context?: ExecutorContext<Params>,
    ...args: unknown[]
  ): Params {
    let _index = -1;
    let returnValue: Params | undefined;

    const _context = context || createContext({} as Params);

    this.contextHandler.resetHooksRuntimes(_context.hooksRuntimes);

    for (const plugin of plugins) {
      _index++;

      // Skip plugin if hook name is not a function or plugin is disabled
      if (
        this.contextHandler.shouldSkipPluginHook(plugin, hookName, _context)
      ) {
        continue;
      }

      // Break chain if breakChain flag is set
      if (this.contextHandler.shouldBreakChain(_context)) {
        break;
      }

      this.contextHandler.runtimes(_context, plugin, hookName, _index);

      const pluginReturn = (
        plugin[hookName as keyof ExecutorPlugin] as PluginMethod<Params>
      )(_context, ...args);

      if (pluginReturn !== undefined) {
        returnValue = pluginReturn as Params;

        this.contextHandler.runtimeReturnValue(_context, pluginReturn);

        // Break chain if returnBreakChain flag is set
        if (this.contextHandler.shouldBreakChainOnReturn(_context)) {
          return returnValue;
        }
      }
    }

    return returnValue as Params;
  }

  /**
   * Execute multiple plugin hook functions synchronously
   * Supports executing multiple hook names in sequence
   *
   * Core concept:
   * Sequential execution of multiple hooks with chain breaking support
   *
   * Execution flow:
   * 1. For each hook name, check if plugin is enabled
   * 2. Execute plugin hook if available
   * 3. Handle plugin results and chain breaking conditions
   * 4. Continue to next hook name if chain is not broken
   *
   * Key features:
   * - Supports multiple hook names in sequence
   * - Chain breaking support for each hook
   * - Return value management across hooks
   * - Backward compatibility with single hook execution
   *
   * @param plugins - Array of plugins to execute
   * @param hookNames - Single hook name or array of hook names to execute in sequence
   * @param context - Execution context containing data and runtime information
   * @param args - Additional arguments to pass to the hook functions
   * @returns Result of the last executed hook function
   *
   * @example Execute multiple hooks in sequence
   * ```typescript
   * const result = this.runHooks(
   *   this.plugins,
   *   ['onBefore', 'onValidate', 'onProcess'],
   *   context,
   *   data
   * );
   * ```
   *
   * @example Execute single hook (backward compatibility)
   * ```typescript
   * const result = this.runHooks(
   *   this.plugins,
   *   'onBefore',
   *   context,
   *   data
   * );
   * ```
   */
  public override runHooks<Params>(
    plugins: ExecutorPlugin[],
    hookNames: HookType | HookType[],
    context?: ExecutorContext<Params>,
    ...args: unknown[]
  ): Params {
    // Convert single hook name to array for unified processing
    const hookNameArray = Array.isArray(hookNames) ? hookNames : [hookNames];
    let lastReturnValue: Params | undefined;

    // Execute each hook name in sequence
    for (const hookName of hookNameArray) {
      const result = this.runHook(plugins, hookName, context, ...args);

      // Update the last return value
      if (result !== undefined) {
        lastReturnValue = result;
      }

      // Check if we should break the chain after this hook
      if (context && this.contextHandler.shouldBreakChain(context)) {
        break;
      }
    }

    return lastReturnValue as Params;
  }

  /**
   * Execute task without throwing errors
   * Wraps all errors in ExecutorError for safe error handling
   *
   * Core concept:
   * Error-safe execution pipeline that returns errors instead of throwing
   *
   * Advantages over try-catch:
   * - Standardized error handling
   * - No exception propagation
   * - Consistent error types
   * - Plugin error handling support
   *
   * @template Result - Type of task return value
   * @template Params - Type of task input parameters
   * @param dataOrTask - Task data or task function
   * @param task - Task function (optional when dataOrTask is a function)
   * @returns Task result or ExecutorError if execution fails
   *
   * @throws Never throws - all errors are wrapped in ExecutorError
   *
   * @example Basic usage
   * ```typescript
   * const result = executor.execNoError((data) => {
   *   if (!data.isValid) {
   *     throw new Error('Invalid data');
   *   }
   *   return data.value;
   * });
   *
   * if (result instanceof ExecutorError) {
   *   console.log('Task failed:', result.message);
   * } else {
   *   console.log('Task succeeded:', result);
   * }
   * ```
   *
   * @example With input data
   * ```typescript
   * const result = executor.execNoError(
   *   { value: 'test' },
   *   (data) => data.value.toUpperCase()
   * );
   * ```
   */
  public override execNoError<Result, Params = unknown>(
    dataOrTask: Params | SyncTask<Result, Params>,
    task?: SyncTask<Result, Params>
  ): Result | ExecutorError {
    try {
      return this.exec(dataOrTask as Params, task);
    } catch (error) {
      if (error instanceof ExecutorError) {
        return error;
      }

      return new ExecutorError('UNKNOWN_SYNC_ERROR', error as Error);
    }
  }

  /**
   * Execute synchronous task with full plugin pipeline
   * Core method for task execution with plugin support
   *
   * Core concept:
   * Complete execution pipeline with plugin lifecycle management
   *
   * Execution flow:
   * 1. Validate and prepare task
   * 2. Execute beforeHooks (configured or default 'onBefore')
   * 3. Execute core task logic with execHook support
   * 4. Execute afterHooks (configured or default 'onSuccess')
   * 5. Handle errors with onError hooks if needed
   *
   * Performance considerations:
   * - No async overhead
   * - Direct execution path
   * - Immediate results
   * - Plugin chain optimization
   *
   * @template Result - Type of task return value
   * @template Params - Type of task input parameters
   * @param dataOrTask - Task data or task function
   * @param task - Task function (optional when dataOrTask is a function)
   * @throws {Error} When task is not a function
   * @throws {ExecutorError} When task execution fails
   * @returns Task execution result
   *
   * @example Basic task execution
   * ```typescript
   * const result = executor.exec((data) => {
   *   return data.toUpperCase();
   * });
   * ```
   *
   * @example With input data
   * ```typescript
   * const data = { numbers: [1, 2, 3] };
   * const task = (input) => {
   *   return input.numbers.map(n => n * 2);
   * };
   *
   * const result = executor.exec(data, task);
   * ```
   *
   * @example With validation
   * ```typescript
   * const result = executor.exec((data) => {
   *   if (typeof data !== 'string') {
   *     throw new Error('Data must be string');
   *   }
   *   return data.trim();
   * });
   * ```
   */
  public override exec<Result, Params = unknown>(
    dataOrTask: Params | SyncTask<Result, Params>,
    task?: SyncTask<Result, Params>
  ): Result {
    const actualTask = (task || dataOrTask) as SyncTask<Result, Params>;
    const data = (task ? dataOrTask : undefined) as Params;

    if (typeof actualTask !== 'function') {
      throw new Error('Task must be a function!');
    }

    return this.run(data, actualTask);
  }

  /**
   * Execute core task logic with execHook support
   *
   * Core concept:
   * Handles the execution phase with optional plugin intervention
   *
   * Execution logic:
   * 1. Execute configured execHook (default: 'onExec')
   * 2. If no execHook was executed, run the actual task
   * 3. Otherwise, use the return value from execHook
   *
   * @template Result - Type of task return value
   * @template Params - Type of task input parameters
   * @param context - Execution context
   * @param actualTask - Task function to execute
   */
  protected runExec<Result, Params = unknown>(
    context: ExecutorContext<Params>,
    actualTask: SyncTask<Result, Params>
  ): void {
    const execHook = this.config?.execHook || 'onExec';

    this.runHook(this.plugins, execHook, context, actualTask);

    // If exec times is 0, then execute task, otherwise return the result of the last hook
    context.returnValue = !context.hooksRuntimes.times
      ? actualTask(context)
      : context.hooksRuntimes.returnValue;
  }

  /**
   * Core method to run synchronous task with plugin hooks
   * Implements the complete execution pipeline with all plugin hooks
   *
   * Core concept:
   * Complete execution pipeline with configurable hook lifecycle
   *
   * Pipeline stages:
   * 1. beforeHooks - Pre-process input data (configurable, default: 'onBefore')
   * 2. Task execution - Run the actual task with execHook support
   * 3. afterHooks - Post-process results (configurable, default: 'onSuccess')
   * 4. onError hooks - Handle any errors
   *
   * Error handling strategy:
   * - Catches all errors
   * - Passes errors through plugin chain
   * - Wraps unhandled errors in ExecutorError
   * - Supports plugin error handling
   *
   * @template Result - Type of task return value
   * @template Params - Type of task input parameters
   * @param data - Data to pass to the task
   * @param actualTask - Actual task function to execute
   * @throws {ExecutorError} When task execution fails
   * @returns Task execution result
   *
   * @example Internal implementation
   * ```typescript
   * protected run(data, task) {
   *   try {
   *     // Execute beforeHooks (configurable)
   *     this.runHooks(this.plugins, beforeHooks, context);
   *
   *     // Execute core logic with execHook support
   *     this.runExec(context, actualTask);
   *
   *     // Execute afterHooks (configurable)
   *     this.runHooks(this.plugins, afterHooks, context);
   *
   *     return context.returnValue;
   *   } catch (error) {
   *     // Handle errors with onError hooks
   *     this.runHook(this.plugins, 'onError', context);
   *   }
   * }
   * ```
   */
  protected run<Result, Params = unknown>(
    data: Params,
    actualTask: SyncTask<Result, Params>
  ): Result {
    const context: ExecutorContext<Params> = createContext(data);

    // Use configured hooks or defaults
    const beforeHooks = this.config?.beforeHooks || 'onBefore';
    const afterHooks = this.config?.afterHooks || 'onSuccess';

    try {
      // Execute beforeHooks (configurable)
      this.runHooks(this.plugins, beforeHooks, context);

      // Execute core logic with execHook support
      this.runExec(context, actualTask);

      // Execute afterHooks (configurable)
      this.runHooks(this.plugins, afterHooks, context);

      return context.returnValue as Result;
    } catch (error) {
      this.contextHandler.setError(context, error as Error);

      // Handle errors with onError hooks
      this.runHook(this.plugins, 'onError', context);

      // If onError hook returns an ExecutorError, use it
      if (context.hooksRuntimes.returnValue) {
        this.contextHandler.setError(
          context,
          context.hooksRuntimes.returnValue as Error
        );
      }

      if (context.error instanceof ExecutorError) {
        throw context.error;
      }

      throw new ExecutorError('UNKNOWN_SYNC_ERROR', context.error);
    } finally {
      this.contextHandler.reset(context);
    }
  }
}
