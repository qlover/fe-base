import {
  Executor,
  ExecutorConfigInterface,
  ExecutorContext,
  ExecutorError,
  ExecutorPlugin,
  HookType,
  PromiseTask
} from '../interface';
import { ContextHandler, createContext } from './ContextHandler';

type PluginMethod<Params = unknown> = (
  context: ExecutorContext<Params>,
  ...args: unknown[]
) => Promise<unknown>;

/**
 * Asynchronous implementation of the Executor pattern
 *
 * Core concept:
 * Asynchronous execution pipeline with plugin lifecycle management
 *
 * Main features:
 * - Asynchronous plugin hook execution: All operations are Promise-based
 * - Plugin lifecycle management: Support for onBefore, onExec, onSuccess, onError hooks
 * - Configurable hook execution: Customizable beforeHooks, afterHooks, and execHook
 * - Chain breaking support: Plugins can interrupt execution chain
 * - Error handling: Comprehensive error handling with plugin support
 *
 * Use this executor when:
 * - Operations involve async operations (API calls, file I/O, etc.)
 * - You need to handle Promise-based workflows
 * - Performance allows for async overhead
 * - Async operations are involved
 *
 * @extends Executor
 *
 * @example Basic usage
 * ```typescript
 * const executor = new AsyncExecutor();
 * executor.use(new LogPlugin());
 *
 * const result = await executor.exec(async (data) => {
 *   const response = await fetch('https://api.example.com/data');
 *   return response.json();
 * });
 * ```
 *
 * @example With custom configuration
 * ```typescript
 * const executor = new AsyncExecutor({
 *   beforeHooks: ['onBefore', 'onValidate'],
 *   afterHooks: ['onSuccess', 'onLog'],
 *   execHook: 'onCustomExec'
 * });
 *
 * const result = await executor.exec(data, async (input) => {
 *   return await fetchUserData(input.userId);
 * });
 * ```
 *
 * @category AsyncExecutor
 */
export class AsyncExecutor<
  ExecutorConfig extends ExecutorConfigInterface = ExecutorConfigInterface
> extends Executor<ExecutorConfig> {
  protected contextHandler: ContextHandler = new ContextHandler();

  /**
   * Execute a single plugin hook function asynchronously
   *
   * Core concept:
   * Sequential async plugin execution with chain breaking and return value handling
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
   * - Async execution with await
   *
   * @param plugins - Array of plugins to execute
   * @param hookName - Name of the hook function to execute
   * @param context - Execution context containing data and runtime information
   * @param args - Additional arguments to pass to the hook function
   * @returns Promise resolving to the result of the hook function execution
   *
   * @example Internal usage
   * ```typescript
   * const result = await this.runHook(
   *   this.plugins,
   *   'onBefore',
   *   context,
   *   data
   * );
   * ```
   */
  protected async runHook<Params>(
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
  ): Promise<Params> {
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

      const pluginReturn = await (
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
   * Execute multiple plugin hook functions asynchronously
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
   * - Async execution with await
   *
   * @param plugins - Array of plugins to execute
   * @param hookNames - Single hook name or array of hook names to execute in sequence
   * @param context - Execution context containing data and runtime information
   * @param args - Additional arguments to pass to the hook functions
   * @returns Promise resolving to the result of the last executed hook function
   *
   * @example Execute multiple hooks in sequence
   * ```typescript
   * const result = await this.runHooks(
   *   this.plugins,
   *   ['onBefore', 'onValidate', 'onProcess'],
   *   context,
   *   data
   * );
   * ```
   *
   * @example Execute single hook (backward compatibility)
   * ```typescript
   * const result = await this.runHooks(
   *   this.plugins,
   *   'onBefore',
   *   context,
   *   data
   * );
   * ```
   */
  public override async runHooks<Params>(
    plugins: ExecutorPlugin[],
    hookNames: HookType | HookType[],
    context?: ExecutorContext<Params>,
    ...args: unknown[]
  ): Promise<Params> {
    // Convert single hook name to array for unified processing
    const hookNameArray = Array.isArray(hookNames) ? hookNames : [hookNames];
    let lastReturnValue: Params | undefined;

    // Execute each hook name in sequence
    for (const hookName of hookNameArray) {
      const result = await this.runHook(plugins, hookName, context, ...args);

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
   * @returns Promise resolving to task result or ExecutorError if execution fails
   *
   * @throws Never throws - all errors are wrapped in ExecutorError
   *
   * @example Basic usage
   * ```typescript
   * const result = await executor.execNoError(async () => {
   *   const response = await riskyOperation();
   *   return response.data;
   * });
   *
   * if (result instanceof ExecutorError) {
   *   console.error('Operation failed:', result);
   * }
   * ```
   *
   * @example With input data
   * ```typescript
   * const result = await executor.execNoError(
   *   { userId: 123 },
   *   async (data) => await fetchUserData(data.userId)
   * );
   * ```
   */
  public override async execNoError<Result, Params = unknown>(
    dataOrTask: Params | PromiseTask<Result, Params>,
    task?: PromiseTask<Result, Params>
  ): Promise<Result | ExecutorError> {
    try {
      return await this.exec(dataOrTask as Params, task);
    } catch (error) {
      if (error instanceof ExecutorError) {
        return error;
      }

      return new ExecutorError('UNKNOWN_ASYNC_ERROR', error as Error);
    }
  }

  /**
   * Execute asynchronous task with full plugin pipeline
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
   * - Async overhead for Promise handling
   * - Sequential execution path
   * - Plugin chain optimization
   *
   * @template Result - Type of task return value
   * @template Params - Type of task input parameters
   * @param dataOrTask - Task data or task function
   * @param task - Task function (optional when dataOrTask is a function)
   * @throws {Error} When task is not an async function
   * @throws {ExecutorError} When task execution fails
   * @returns Promise resolving to task execution result
   *
   * @example Basic task execution
   * ```typescript
   * const result = await executor.exec(async (data) => {
   *   const response = await fetch('https://api.example.com/data');
   *   return response.json();
   * });
   * ```
   *
   * @example With input data
   * ```typescript
   * const data = { userId: 123 };
   * const result = await executor.exec(data, async (input) => {
   *   return await fetchUserData(input.userId);
   * });
   * ```
   *
   * @example With validation
   * ```typescript
   * const result = await executor.exec(async (data) => {
   *   if (typeof data !== 'string') {
   *     throw new Error('Data must be string');
   *   }
   *   return await processData(data);
   * });
   * ```
   */
  public override exec<Result, Params = unknown>(
    dataOrTask: Params | PromiseTask<Result, Params>,
    task?: PromiseTask<Result, Params>
  ): Promise<Result> {
    const actualTask = (task || dataOrTask) as PromiseTask<Result, Params>;
    const data = (task ? dataOrTask : undefined) as Params;

    if (typeof actualTask !== 'function') {
      throw new Error('Task must be a async function!');
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
  protected async runExec<Result, Params = unknown>(
    context: ExecutorContext<Params>,
    actualTask: PromiseTask<Result, Params>
  ): Promise<void> {
    const execHook = this.config?.execHook || 'onExec';

    await this.runHook(this.plugins, execHook, context, actualTask);

    // If exec times is 0, then execute task, otherwise return the result of the last hook
    context.returnValue = !context.hooksRuntimes.times
      ? await actualTask(context)
      : context.hooksRuntimes.returnValue;
  }

  /**
   * Core task execution method with plugin hooks
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
   * @returns Promise resolving to task execution result
   *
   * @example Internal implementation
   * ```typescript
   * protected async run(data, task) {
   *   try {
   *     // Execute beforeHooks (configurable)
   *     await this.runHooks(this.plugins, beforeHooks, context);
   *
   *     // Execute core logic with execHook support
   *     await this.runExec(context, actualTask);
   *
   *     // Execute afterHooks (configurable)
   *     await this.runHooks(this.plugins, afterHooks, context);
   *
   *     return context.returnValue;
   *   } catch (error) {
   *     // Handle errors with onError hooks
   *     await this.runHook(this.plugins, 'onError', context);
   *   }
   * }
   * ```
   */
  protected async run<Result, Params = unknown>(
    data: Params,
    actualTask: PromiseTask<Result, Params>
  ): Promise<Result> {
    const context: ExecutorContext<Params> = createContext(data);

    // Use configured hooks or defaults
    const beforeHooks = this.config?.beforeHooks || 'onBefore';
    const afterHooks = this.config?.afterHooks || 'onSuccess';

    try {
      // Execute beforeHooks (configurable)
      await this.runHooks(this.plugins, beforeHooks, context);

      // Execute core logic with execHook support
      await this.runExec(context, actualTask);

      // Execute afterHooks (configurable)
      await this.runHooks(this.plugins, afterHooks, context);

      return context.returnValue as Result;
    } catch (error) {
      this.contextHandler.setError(context, error as Error);

      // Handle errors with onError hooks
      await this.runHook(this.plugins, 'onError', context);

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

      throw new ExecutorError('UNKNOWN_ASYNC_ERROR', context.error);
    } finally {
      this.contextHandler.reset(context);
    }
  }
}
