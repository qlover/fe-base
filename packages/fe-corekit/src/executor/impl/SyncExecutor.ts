import {
  Executor,
  ExecutorContext,
  ExecutorError,
  ExecutorPlugin,
  SyncTask
} from '../interface';

/**
 * SyncExecutor implements a synchronous execution pattern with plugin support
 *
 * Purpose:
 * This class provides a robust framework for executing synchronous tasks with
 * plugin-based middleware support, immediate error handling, and direct execution flow.
 * It serves as a high-performance alternative to AsyncExecutor when dealing with
 * synchronous operations that require plugin support and error management.
 *
 * Design Philosophy:
 * - Synchronous First: Optimized for synchronous operations
 * - Zero Async Overhead: No Promise-based operations or async/await
 * - Direct Flow Control: Immediate execution and result handling
 * - Plugin Architecture: Extensible through a flexible plugin system
 * - Error Boundary: Comprehensive error handling without async complexities
 * - Type Safety: Strong TypeScript support with generics
 *
 * Working Process:
 * 1. Task Initialization
 *    - Validate and prepare the task
 *    - Set up execution context
 *    - Initialize plugin chain
 * 2. Plugin Pipeline Execution
 *    - Execute pre-task plugins (onBefore)
 *    - Run the main task directly
 *    - Execute post-task plugins (onSuccess)
 *    - Handle errors immediately (onError)
 * 3. Result Handling
 *    - Direct result return
 *    - Immediate error handling
 *    - Context cleanup
 *
 * Use Cases:
 * 1. Data Transformation
 *    - String manipulation
 *    - Object transformation
 *    - Data validation
 * 2. Computation Tasks
 *    - Mathematical calculations
 *    - Business logic processing
 *    - State transitions
 * 3. Synchronous Operations
 *    - In-memory operations
 *    - CPU-bound tasks
 *    - Real-time processing
 *
 * Plugin System:
 * - Synchronous plugin execution
 * - Direct result modification
 * - Execution order preservation
 * - Chain breaking support
 * - Shared context across plugins
 *
 * Error Handling:
 * - Immediate error catching
 * - Direct error wrapping
 * - Error type preservation
 * - Plugin-based error processing
 * - Error context maintenance
 *
 * Performance Considerations:
 * - No async overhead
 * - Direct execution path
 * - Minimal memory footprint
 * - Efficient plugin pipeline
 * - Optimized for CPU-bound tasks
 *
 * Important Notes:
 * - All operations must be synchronous
 * - No Promise or async/await support
 * - Plugins must return immediately
 * - Error handling is immediate
 * - Type safety is enforced at compile time
 * - Suitable for CPU-intensive tasks
 *
 * @example Basic Usage
 * ```typescript
 * const executor = new SyncExecutor();
 * executor.use(new ValidationPlugin());
 *
 * const result = executor.exec((data) => {
 *   return data.toUpperCase();
 * });
 * ```
 *
 * @example Advanced Usage with Data and Multiple Plugins
 * ```typescript
 * const executor = new SyncExecutor();
 *
 * // Add multiple plugins for different purposes
 * executor.use(new ValidationPlugin());
 * executor.use(new TransformPlugin());
 * executor.use(new LoggerPlugin());
 *
 * // Execute with context and data
 * const data = {
 *   value: 'hello',
 *   type: 'string',
 *   options: { uppercase: true }
 * };
 *
 * try {
 *   const result = executor.exec(data, (context) => {
 *     // Access validated data
 *     const { value, options } = context.parameters;
 *
 *     // Perform transformation
 *     return options.uppercase ? value.toUpperCase() : value;
 *   });
 *
 *   console.log('Operation completed:', result);
 * } catch (error) {
 *   console.error('Operation failed:', error);
 * }
 * ```
 *
 * @example Error Handling with Recovery
 * ```typescript
 * class ValidationPlugin implements ExecutorPlugin {
 *   onError(context: ExecutorContext) {
 *     if (context.error instanceof ValidationError) {
 *       // Provide default value for validation errors
 *       return context.parameters.defaultValue;
 *     }
 *     // Let other errors propagate
 *     return context.error;
 *   }
 * }
 *
 * const executor = new SyncExecutor();
 * executor.use(new ValidationPlugin());
 *
 * const result = executor.exec({
 *   value: null,
 *   defaultValue: 'default'
 * }, (context) => {
 *   const { value } = context.parameters;
 *   if (value === null) {
 *     throw new ValidationError('Value cannot be null');
 *   }
 *   return value;
 * });
 * ```
 */
export class SyncExecutor<
  ExecutorConfig = unknown
> extends Executor<ExecutorConfig> {
  /**
   * Execute plugin hook functions synchronously
   * Manages the plugin execution chain and handles results
   *
   * Plugin execution flow:
   * 1. Check if plugin is enabled for the hook
   * 2. Execute plugin hook if available
   * 3. Handle plugin results and chain breaking conditions
   *
   * Key differences from AsyncExecutor:
   * - All operations are synchronous
   * - Results are immediately available
   * - No await statements needed
   *
   * @param plugins - Array of plugins to execute
   * @param hookName - Name of the hook function to execute
   * @param args - Arguments to pass to the hook function
   * @returns Result of the hook function execution
   *
   * @example
   * ```typescript
   * // Internal usage example
   * const result = this.runHook(
   *   this.plugins,
   *   'onBefore',
   *   { value: 'test' }
   * );
   * ```
   */
  runHooks<Params>(
    plugins: ExecutorPlugin[],
    /**
     * allow any string as hook name.
     * if the hook name is not a function, it will be skipped
     *
     * @since 1.1.3
     */
    hookName: string,
    context?: ExecutorContext<Params>,
    ...args: unknown[]
  ): Params {
    let _index = -1;
    let returnValue: Params | undefined;

    const _context: ExecutorContext<Params> = context || {
      parameters: undefined as Params,
      hooksRuntimes: {}
    };

    // reset hooksRuntimes times and index
    _context.hooksRuntimes.times = 0;
    _context.hooksRuntimes.index = undefined;

    for (const plugin of plugins) {
      _index++;

      if (
        typeof plugin[hookName as keyof ExecutorPlugin] !== 'function' ||
        (typeof plugin.enabled == 'function' &&
          !plugin.enabled(hookName as keyof ExecutorPlugin, _context))
      ) {
        continue;
      }

      // if breakChain is true, stop the chain
      if (_context.hooksRuntimes?.breakChain) {
        break;
      }

      _context.hooksRuntimes.pluginName = plugin.pluginName;
      _context.hooksRuntimes.hookName = hookName;
      _context.hooksRuntimes.times++;
      _context.hooksRuntimes.index = _index;

      // @ts-expect-error
      const pluginReturn = plugin[hookName](context, ...args);

      if (pluginReturn !== undefined) {
        returnValue = pluginReturn as Params;
        // set runtimes returnValue
        _context.hooksRuntimes.returnValue = pluginReturn;

        // When returnBreakChain is true, stop the chain
        if (_context.hooksRuntimes.returnBreakChain) {
          return returnValue;
        }
      }
    }

    return returnValue as Params;
  }

  /**
   * Execute task without throwing errors
   * Wraps all errors in ExecutorError for safe error handling
   *
   * Advantages over try-catch:
   * 1. Standardized error handling
   * 2. No exception propagation
   * 3. Consistent error types
   *
   * @template T - Type of task return value
   * @param dataOrTask - Task data or task function
   * @param task - Task function (optional)
   * @returns Task result or ExecutorError
   *
   * @example
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
   */
  execNoError<Result, Params = unknown>(
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
   * Execution flow:
   * 1. Validate and prepare task
   * 2. Check for custom execution plugins
   * 3. Execute task with plugin pipeline
   *
   * Performance considerations:
   * - No async overhead
   * - Direct execution path
   * - Immediate results
   *
   * @template T - Type of task return value
   * @template D - Type of task data
   * @param dataOrTask - Task data or task function
   * @param task - Task function (optional)
   * @throws {Error} When task is not a function
   * @returns Task execution result
   *
   * @example
   * ```typescript
   * // Example with data transformation
   * const data = { numbers: [1, 2, 3] };
   * const task = (input) => {
   *   return input.numbers.map(n => n * 2);
   * };
   *
   * const result = executor.exec(data, task);
   *
   * // Example with validation
   * const result = executor.exec((data) => {
   *   if (typeof data !== 'string') {
   *     throw new Error('Data must be string');
   *   }
   *   return data.trim();
   * });
   * ```
   */
  exec<Result, Params = unknown>(
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
   * Core method to run synchronous task with plugin hooks
   * Implements the complete execution pipeline with all plugin hooks
   *
   * Pipeline stages:
   * 1. onBefore hooks - Pre-process input data
   * 2. Task execution - Run the actual task
   * 3. onSuccess hooks - Post-process results
   * 4. onError hooks - Handle any errors
   *
   * Error handling strategy:
   * - Catches all errors
   * - Passes errors through plugin chain
   * - Wraps unhandled errors in ExecutorError
   *
   * @template T - Type of task return value
   * @template D - Type of task data
   * @param data - Data to pass to the task
   * @param actualTask - Actual task function to execute
   * @throws {ExecutorError} When task execution fails
   * @returns Task execution result
   *
   * @example
   * ```typescript
   * // Internal implementation example
   * private run(data, task) {
   *   try {
   *     const preparedData = this.runHook(this.plugins, 'onBefore', data);
   *     const result = task(preparedData);
   *     return this.runHook(this.plugins, 'onSuccess', result);
   *   } catch (error) {
   *     const handledError = this.runHook(
   *       this.plugins,
   *       'onError',
   *       error,
   *       data
   *     );
   *     // Error handling logic
   *   }
   * }
   * ```
   */
  run<Result, Params = unknown>(
    data: Params,
    actualTask: SyncTask<Result, Params>
  ): Result {
    const context: ExecutorContext<Params> = {
      parameters: data,
      returnValue: undefined,
      error: undefined,
      hooksRuntimes: {
        pluginName: '',
        hookName: '',
        returnValue: undefined,
        returnBreakChain: false,
        times: 0
      }
    };

    const runExec = (ctx: ExecutorContext<Params>): void => {
      this.runHooks(this.plugins, 'onExec', ctx, actualTask);

      // if exec times is 0, then execute task, otherwise return the result of the last hook
      ctx.returnValue = !ctx.hooksRuntimes.times
        ? actualTask(ctx)
        : ctx.hooksRuntimes.returnValue;
    };

    try {
      this.runHooks(this.plugins, 'onBefore', context);

      runExec(context);

      this.runHooks(this.plugins, 'onSuccess', context);

      return context.returnValue as Result;
    } catch (error) {
      context.error = error as Error;

      this.runHooks(this.plugins, 'onError', context);

      // if onError hook return a ExecutorError, then throw it
      if (context.hooksRuntimes.returnValue) {
        context.error = context.hooksRuntimes.returnValue as Error;
      }

      if (context.error instanceof ExecutorError) {
        throw context.error;
      }

      throw new ExecutorError('UNKNOWN_SYNC_ERROR', context.error);
    } finally {
      // reset hooksRuntimes
      context.hooksRuntimes = {
        pluginName: '',
        hookName: '',
        returnValue: undefined,
        returnBreakChain: false,
        times: 0
      };
    }
  }
}
