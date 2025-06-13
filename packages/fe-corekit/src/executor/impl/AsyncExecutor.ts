import {
  Executor,
  ExecutorContext,
  ExecutorError,
  ExecutorPlugin,
  PromiseTask
} from '../interface';

/**
 * AsyncExecutor implements an asynchronous execution pattern with plugin support
 *
 * Purpose:
 * This class provides a robust framework for executing asynchronous tasks with
 * plugin-based middleware support, error handling, and execution flow control.
 * It serves as a foundational component for building extensible async operations
 * with consistent error handling and lifecycle management.
 *
 * Design Philosophy:
 * - Separation of Concerns: Task execution is separated from business logic
 * - Plugin Architecture: Extensible through a flexible plugin system
 * - Error Boundary: Comprehensive error handling and propagation
 * - Type Safety: Strong TypeScript support with generics
 * - Context Preservation: Maintains execution context throughout the lifecycle
 *
 * Working Process:
 * 1. Task Initialization
 *    - Validate and prepare the task
 *    - Set up execution context
 *    - Initialize plugin chain
 * 2. Plugin Pipeline Execution
 *    - Execute pre-task plugins (onBefore)
 *    - Run the main task with context
 *    - Execute post-task plugins (onSuccess)
 *    - Handle errors if they occur (onError)
 * 3. Result Handling
 *    - Transform and return results
 *    - Proper error wrapping and propagation
 *    - Context cleanup
 *
 * Use Cases:
 * 1. API Request Handling
 *    - Request validation
 *    - Authentication/Authorization
 *    - Response transformation
 * 2. Data Processing Pipelines
 *    - Data validation
 *    - Transformation chains
 *    - Error recovery
 * 3. Business Logic Orchestration
 *    - Transaction management
 *    - Event handling
 *    - State management
 *
 * Plugin System:
 * - Plugins can intercept and modify execution at various stages
 * - Support for async operations in plugins
 * - Plugin execution order is preserved
 * - Plugins can break the execution chain
 * - Plugin context is shared across the pipeline
 *
 * Error Handling:
 * - Comprehensive error catching and wrapping
 * - Plugin-based error processing
 * - Error type preservation
 * - Recovery mechanisms
 * - Proper error context propagation
 *
 * Performance Considerations:
 * - Minimal overhead for basic operations
 * - Efficient plugin execution
 * - Context reuse when possible
 * - Proper cleanup of resources
 * - Optimized for async/await patterns
 *
 * Important Notes:
 * - All plugin hooks are executed sequentially
 * - Plugins can break the execution chain
 * - Error handling is comprehensive with plugin support
 * - Context is maintained throughout the execution lifecycle
 * - Type safety is enforced at compile time
 * - Memory management is handled automatically
 *
 * @example Basic Usage
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
 * @example Advanced Usage with Data and Multiple Plugins
 * ```typescript
 * const executor = new AsyncExecutor();
 *
 * // Add multiple plugins for different purposes
 * executor.use(new ValidationPlugin());
 * executor.use(new TransformPlugin());
 * executor.use(new LoggerPlugin());
 * executor.use(new ErrorHandlerPlugin());
 *
 * // Execute with context and data
 * const data = {
 *   userId: 123,
 *   operation: 'fetch',
 *   timestamp: Date.now()
 * };
 *
 * try {
 *   const result = await executor.exec(data, async (context) => {
 *     // Access validated and transformed data
 *     const { userId, operation } = context.parameters;
 *
 *     // Perform the operation
 *     const response = await fetchUserData(userId);
 *
 *     // Return result for further transformation
 *     return response;
 *   });
 *
 *   console.log('Operation completed:', result);
 * } catch (error) {
 *   // Error will be properly wrapped and handled
 *   console.error('Operation failed:', error);
 * }
 * ```
 *
 * @example Error Handling with Recovery
 * ```typescript
 * class RecoveryPlugin implements ExecutorPlugin {
 *   async onError(context: ExecutorContext) {
 *     if (context.error instanceof NetworkError) {
 *       // Attempt recovery for network errors
 *       return await retryOperation(context.parameters);
 *     }
 *     // Let other errors propagate
 *     return context.error;
 *   }
 * }
 *
 * const executor = new AsyncExecutor();
 * executor.use(new RecoveryPlugin());
 *
 * const result = await executor.exec(async () => {
 *   // This operation might fail
 *   return await riskyNetworkCall();
 * });
 * ```
 */
export class AsyncExecutor<
  ExecutorConfig = unknown
> extends Executor<ExecutorConfig> {
  /**
   * Executes plugin hook functions in an asynchronous sequence
   *
   * Purpose:
   * Provides a mechanism for executing plugin hooks in a controlled, sequential manner
   * while maintaining context and supporting chain breaking.
   *
   * Working Process:
   * 1. Context Initialization
   *    - Create or use provided context
   *    - Reset runtime metrics
   * 2. Plugin Iteration
   *    - Check plugin enablement
   *    - Execute enabled hooks
   *    - Handle return values
   * 3. Chain Control
   *    - Support early termination
   *    - Maintain execution context
   *
   * Important Notes:
   * - Plugins are executed in order of registration
   * - Chain can be broken via context or return flags
   * - Hook execution times are tracked
   * - Plugin names and hook details are recorded
   *
   * @param plugins Array of plugins to execute
   * @param hookName Name of the hook function to execute
   * @param context Optional execution context
   * @param args Additional arguments for the hook
   * @returns Promise resolving to the hook execution result
   *
   * @example Plugin Hook Execution
   * ```typescript
   * const result = await this.runHooks(
   *   this.plugins,
   *   'beforeExec',
   *   {
   *     parameters: { userId: 123 },
   *     hooksRuntimes: {}
   *   }
   * );
   * ```
   */
  async runHooks<Params>(
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
  ): Promise<unknown> {
    let _index = -1;
    let returnValue: unknown;

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
          !plugin.enabled(hookName as keyof ExecutorPlugin, context))
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
      const pluginReturn = await plugin[hookName](context, ...args);

      if (pluginReturn !== undefined) {
        returnValue = pluginReturn;
        // set runtimes returnValue
        _context.hooksRuntimes.returnValue = pluginReturn;

        // When returnBreakChain is true, stop the chain
        if (_context.hooksRuntimes.returnBreakChain) {
          return returnValue;
        }
      }
    }

    return returnValue;
  }

  /**
   * Executes a task with error handling and wrapping
   *
   * Purpose:
   * Provides a safe execution environment that catches and properly wraps all errors,
   * making error handling more predictable and manageable.
   *
   * Working Process:
   * 1. Task Execution
   *    - Attempt to execute the task
   *    - Catch any thrown errors
   * 2. Error Processing
   *    - Identify error type
   *    - Wrap unknown errors
   *    - Return error object
   *
   * Important Notes:
   * - Never throws errors directly
   * - Always returns either Result or ExecutorError
   * - Maintains type safety with generics
   *
   * @template Result Type of the successful result
   * @template Params Type of the input parameters
   * @param dataOrTask Task data or function
   * @param task Optional separate task function
   * @returns Promise<Result | ExecutorError>
   *
   * @example Safe Task Execution
   * ```typescript
   * const result = await executor.execNoError(async () => {
   *   const response = await riskyOperation();
   *   return response.data;
   * });
   *
   * if (result instanceof ExecutorError) {
   *   console.error('Operation failed:', result);
   * } else {
   *   console.log('Success:', result);
   * }
   * ```
   */
  async execNoError<Result, Params = unknown>(
    dataOrTask: unknown | PromiseTask<Result, Params>,
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
   * Primary method for executing tasks with full plugin pipeline support
   *
   * Purpose:
   * Provides the main entry point for task execution with complete plugin lifecycle
   * support and proper type handling.
   *
   * Working Process:
   * 1. Input Processing
   *    - Validate task and data
   *    - Prepare execution context
   * 2. Task Execution
   *    - Run through plugin pipeline
   *    - Execute main task
   *    - Handle results
   * 3. Error Management
   *    - Validate task type
   *    - Proper error propagation
   *
   * Important Notes:
   * - Task must be an async function
   * - Supports both combined and separate data/task patterns
   * - Maintains type safety throughout execution
   *
   * @template Result Type of the task result
   * @template Params Type of the input parameters
   * @param dataOrTask Task data or function
   * @param task Optional separate task function
   * @throws {Error} When task is not a function
   * @returns Promise<Result>
   *
   * @example Combined Task Pattern
   * ```typescript
   * const result = await executor.exec(async () => {
   *   return await fetchData();
   * });
   * ```
   *
   * @example Separate Data and Task
   * ```typescript
   * const data = { userId: 123 };
   * const result = await executor.exec(data, async (input) => {
   *   return await fetchUserData(input.userId);
   * });
   * ```
   */
  exec<Result, Params = unknown>(
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
   * Core internal method implementing the execution pipeline
   *
   * Purpose:
   * Implements the complete execution pipeline with proper plugin hook integration,
   * error handling, and result processing.
   *
   * Working Process:
   * 1. Context Setup
   *    - Initialize execution context
   *    - Prepare plugin environment
   * 2. Hook Execution
   *    - Run onBefore hooks
   *    - Execute main task
   *    - Run onSuccess hooks
   * 3. Error Handling
   *    - Catch and process errors
   *    - Run onError hooks
   *    - Wrap and propagate errors
   *
   * Important Notes:
   * - Maintains complete execution context
   * - Supports plugin intervention at all stages
   * - Proper error wrapping and propagation
   * - Context cleanup in finally block
   *
   * @template Result Type of the task result
   * @template Params Type of the input parameters
   * @param data Input data for the task
   * @param actualTask Task function to execute
   * @returns Promise<Result>
   * @throws {ExecutorError} When execution fails
   *
   * @example Internal Usage
   * ```typescript
   * private async run(data, task) {
   *   const context = {
   *     parameters: data,
   *     returnValue: undefined,
   *     error: undefined,
   *     hooksRuntimes: {}
   *   };
   *
   *   try {
   *     await this.runHooks(this.plugins, 'onBefore', context);
   *     context.returnValue = await task(context);
   *     await this.runHooks(this.plugins, 'onSuccess', context);
   *     return context.returnValue;
   *   } catch (error) {
   *     // Error handling
   *   }
   * }
   * ```
   */
  async run<Result, Params = unknown>(
    data: Params,
    actualTask: PromiseTask<Result, Params>
  ): Promise<Result> {
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

    const runExec = async (ctx: ExecutorContext<Params>): Promise<void> => {
      await this.runHooks(this.plugins, 'onExec', ctx, actualTask);

      // if exec times is 0, then execute task, otherwise return the result of the last hook
      if (ctx.hooksRuntimes.times === 0) {
        ctx.returnValue = await actualTask(ctx);
        return;
      }

      ctx.returnValue = ctx.hooksRuntimes.returnValue;
    };

    try {
      await this.runHooks(this.plugins, 'onBefore', context);

      await runExec(context);

      await this.runHooks(this.plugins, 'onSuccess', context);

      return context.returnValue as Result;
    } catch (error) {
      context.error = error as Error;

      await this.runHooks(this.plugins, 'onError', context);

      // if onError hook return a ExecutorError, then throw it
      if (context.hooksRuntimes.returnValue) {
        context.error = context.hooksRuntimes.returnValue as Error;
      }

      if (context.error instanceof ExecutorError) {
        throw context.error;
      }

      throw new ExecutorError('UNKNOWN_ASYNC_ERROR', context.error);
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
