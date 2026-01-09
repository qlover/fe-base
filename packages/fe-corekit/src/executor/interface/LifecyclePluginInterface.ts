import { ExecutorContextInterface } from './ExecutorInterface';
import { ExecutorPluginInterface } from './ExecutorInterface';
import { ExecutorError } from './ExecutorError';
import { ExecutorTask } from './ExecutorInterface';

export type LifecycleErrorResult = ExecutorError | Error | void;
export type LifecycleExecResult<R, Param> = R | ExecutorTask<R, Param> | void;

/**
 * Lifecycle plugin interface for executor plugins
 *
 * Purpose:
 * This interface extends ExecutorPluginInterface and adds standardized lifecycle hook methods
 * that plugins can implement to participate in the executor's execution pipeline.
 * It serves as the default plugin type for LifecycleExecutor.
 *
 * Key Lifecycle Hooks:
 *
 * - onBefore: Pre-execution hook that can modify parameters
 *   - Can return new parameters to update context
 *   - Supports both sync and async return values
 *   - More flexible than direct parameter modification
 *
 * - onSuccess: Post-execution hook for result processing
 *   - Executed after successful task completion
 *   - Can transform or log results
 *   - Supports both sync and async execution
 *
 * - onError: Error handling hook
 *   - Executed when errors occur
 *   - Can handle, transform, or log errors
 *   - Supports both sync and async execution
 *
 * - onExec: Task modification hook
 *   - Can modify or wrap the task
 *   - Supports both sync and async task modifications
 *
 * - onFinally: Cleanup hook
 *   - Always executed after task completion
 *   - Guaranteed to run regardless of success or failure
 *   - Supports both sync and async execution
 *
 * Enhanced onBefore Hook:
 * - Return Value Support: Can return new parameters to update context
 *   ```typescript
 *   onBefore: (ctx) => {
 *     // Return new parameters - automatically updates context
 *     return { ...ctx.parameters, newField: 'value' };
 *   }
 *   ```
 *
 * - Type Safety: Return type inferred from context parameter type
 *   - TypeScript automatically infers correct return type
 *   - Compile-time type checking
 *   - Better IDE support
 *
 * Default Plugin Type for LifecycleExecutor:
 * - Type Constraint: LifecycleExecutor defaults to this interface
 *   - Ensures plugins implement lifecycle hooks
 *   - Better type safety
 *   - Clearer plugin contract
 *
 * - Backward Compatibility: Extends ExecutorPluginInterface
 *   - Compatible with existing plugin implementations
 *   - Can be used with other executor types
 *   - Gradual migration path
 *
 * Usage with LifecycleExecutor:
 *
 * Default Usage (Recommended):
 * ```typescript
 * const executor = new LifecycleExecutor();
 * // Plugin type defaults to LifecyclePluginInterface
 * executor.use({
 *   pluginName: 'myPlugin',
 *   enabled: () => true,
 *   onBefore: (ctx) => {
 *     return { ...ctx.parameters, timestamp: Date.now() };
 *   }
 * });
 * ```
 *
 * Explicit Type Usage:
 * ```typescript
 * interface MyPlugin extends LifecyclePluginInterface<ExecutorContextInterface<MyParams, MyResult>> {
 *   customMethod(): void;
 * }
 *
 * const executor = new LifecycleExecutor<
 *   ExecutorContextInterface<MyParams, MyResult>,
 *   MyPlugin
 * >();
 * ```
 *
 * Benefits:
 * - Type Safety: Stronger type constraints than generic ExecutorPluginInterface
 * - Clear Contract: Explicit lifecycle hook definitions
 * - Better IDE Support: Improved autocomplete and type checking
 * - Parameter Safety: Supports safe parameter updates via return values
 * - Unified API: Consistent interface across all lifecycle hooks
 *
 * @since 2.6.0
 * @template Ctx - Type of executor context interface
 *
 * @example Basic lifecycle plugin
 * ```typescript
 * const plugin: LifecyclePluginInterface<ExecutorContextInterface<UserParams, UserResult>> = {
 *   pluginName: 'userPlugin',
 *   enabled: () => true,
 *   onBefore: (ctx) => {
 *     // Modify parameters via return value
 *     return { ...ctx.parameters, timestamp: Date.now() };
 *   },
 *   onSuccess: (ctx) => {
 *     console.log('Task completed:', ctx.returnValue);
 *   },
 *   onError: (ctx) => {
 *     console.error('Error occurred:', ctx.error);
 *   }
 * };
 * ```
 *
 * @example onBefore returning new parameters (async)
 * ```typescript
 * const plugin: LifecyclePluginInterface<ExecutorContextInterface<ApiParams, ApiResult>> = {
 *   onBefore: async (ctx) => {
 *     const apiKey = await fetchApiKey();
 *     // Return new parameters - automatically updates context
 *     return { ...ctx.parameters, apiKey };
 *   }
 * };
 * ```
 *
 * @see LifecycleExecutor - Executor that uses this as default plugin type
 * @see ExecutorPluginInterface - Base plugin interface
 * @see ExecutorContextInterface - Context interface used by plugins
 *
 * @category Plugin
 */
export interface LifecyclePluginInterface<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Ctx extends ExecutorContextInterface<any, any>,
  Result = Ctx['returnValue'],
  Param = Ctx['parameters']
> extends ExecutorPluginInterface<Ctx> {
  /**
   * Hook executed before the main task
   * Can modify the input data before it reaches the task
   *
   * Return value behavior:
   * - If returns a value (non-void), it will be used to update context parameters
   * - If returns void or undefined, parameters remain unchanged
   * - Supports both sync and async return values
   *
   * @param ctx - Execution context
   * @returns Modified parameters (will update context parameters), void, or Promise of either
   */
  onBefore?(ctx: Ctx): Param | Promise<Param> | void | Promise<void>;

  /**
   * Hook executed after successful task completion
   * Can transform the task result
   *
   * @param ctx - Execution context
   * @returns void or Promise<void>
   */
  onSuccess?(ctx: Ctx): void | Promise<void>;

  /**
   * Error handling hook
   * - For `exec`: returning a value or throwing will break the chain
   * - For `execNoError`: returning a value or throwing will return the error
   *
   * Because `onError` can break the chain, best practice is each plugin only handle plugin related error
   *
   * @param ctx - Execution context containing error information
   * @returns ExecutorError, Error, void, or Promise of either
   */
  onError?(ctx: Ctx): LifecycleErrorResult | Promise<LifecycleErrorResult>;

  /**
   * Custom execution logic hook
   *
   * Purpose:
   * Allows plugins to intercept, wrap, or replace the task execution.
   * Plugins can return a value directly, return a new task function, or execute
   * the task within the hook.
   *
   * Return value behavior:
   * - If returns a function (ExecutorTask): The function will be executed as the new task
   * - If returns any other value: The value will be used as the task result (skips task execution)
   * - Supports both sync and async return values
   *
   * Type inference:
   * - The return type `R` is automatically inferred from the task parameter
   * - Return values are type-safe and match the task's return type
   * - TypeScript can infer types from return statements without explicit annotations
   *
   * Use cases:
   * - Return a wrapped task function to add middleware behavior
   * - Return a direct value to bypass task execution
   * - Execute the task with custom logic and return the result
   *
   * @template R - Return type of the task (automatically inferred from task parameter)
   * @param ctx - Execution context
   * @param task - Original task to be executed
   * @returns Task result (type R), modified task function, or Promise of either
   *
   * @example Return a direct value (bypass task) - type automatically inferred
   * ```typescript
   * onExec: async () => {
   *   return 'intercepted-result'; // Type inferred as Promise<string>
   * }
   * ```
   *
   * @example Return a wrapped task function
   * ```typescript
   * onExec: (ctx, task) => {
   *   // Return a new task function that wraps the original
   *   return async (wrappedCtx) => {
   *     console.log('Before task execution');
   *     const result = await task(wrappedCtx);
   *     console.log('After task execution');
   *     return result;
   *   };
   * }
   * ```
   *
   * @example Return a direct value (bypass task)
   * ```typescript
   * onExec: (ctx, task) => {
   *   // Return cached result, skip task execution
   *   if (cache.has(ctx.parameters.id)) {
   *     return cache.get(ctx.parameters.id);
   *   }
   *   // Or execute task and return result
   *   return task(ctx);
   * }
   * ```
   *
   * 如果需要手动覆盖返回类型，可以使用提供的 R 泛型手动推断类型，但是这样不够安全，
   * 未来可能会加入接口类型的泛型
   *
   * @example 使用手动推断类型
   * ```typescript
   * interface TestResult {
   *   data: string;
   *   processed?: boolean;
   * }
   *
   * type TestContext = ExecutorContextInterface<TestParams>;
   *
   * const plugin: LifecyclePluginInterface<TestContext> = {
   *   pluginName: 'plugin',
   *   onExec: async <R>(ctx, task) => {
   *     const result = await task(ctx);
   *     return `wrapped: ${result}` as R;
   *   }
   * };
   * ```
   */
  onExec?: (
    ctx: Ctx,
    task: ExecutorTask<Result, Param>
  ) =>
    | LifecycleExecResult<Result, Param>
    | Promise<LifecycleExecResult<Result, Param>>;

  /**
   * Hook executed in finally block after task execution
   *
   * Purpose:
   * Allows plugins to perform cleanup operations that must run regardless
   * of whether the task succeeded or failed. Supports both sync and async execution.
   *
   * Execution Guarantees:
   * - Always executed after task completion (success or error)
   * - Executed in finally block, ensuring cleanup even if errors occur
   * - Runs after onSuccess or onError hooks
   * - Cannot prevent error propagation
   *
   * Use Cases:
   * - Resource cleanup
   * - Logging completion status
   * - Resetting state
   * - Closing connections
   * - Finalizing transactions
   *
   * @param ctx - Execution context (may contain error if task failed)
   * @returns void or Promise<void>
   *
   * @example Resource cleanup
   * ```typescript
   * onFinally: async (ctx) => {
   *   if (ctx.parameters.connection) {
   *     await ctx.parameters.connection.close();
   *   }
   * }
   * ```
   *
   * @example Logging completion
   * ```typescript
   * onFinally: (ctx) => {
   *   const status = ctx.error ? 'failed' : 'succeeded';
   *   console.log(`Task ${status}`);
   * }
   * ```
   */
  onFinally?(ctx: Ctx): void | Promise<void>;
}
