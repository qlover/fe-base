import { ExecutorContextInterface } from './ExecutorInterface';
import { ExecutorPluginInterface } from './ExecutorInterface';
import { ExecutorError } from './ExecutorError';
import { ExecutorSyncTask } from './ExecutorInterface';

/**
 * Synchronous lifecycle plugin interface for executor plugins
 *
 * Purpose:
 * This interface extends ExecutorPluginInterface and adds synchronous lifecycle hook methods
 * that plugins can implement to participate in the executor's execution pipeline.
 * It serves as the plugin type for SyncLifecycleExecutor.
 *
 * Key Differences from LifecyclePluginInterface:
 *
 * Synchronous Only:
 * - All hook methods must be synchronous
 * - Cannot return Promise
 * - Immediate execution guaranteed
 * - No async/await overhead
 *
 * Lifecycle Hooks:
 * - onBefore: Pre-execution hook that can modify parameters (sync only)
 *   - Can return new parameters to update context
 *   - Must return synchronously
 *   - No Promise allowed
 *
 * - onSuccess: Post-execution hook for result processing (sync only)
 *   - Executed after successful task completion
 *   - Can transform or log results
 *   - Must execute synchronously
 *
 * - onError: Error handling hook (sync only)
 *   - Executed when errors occur
 *   - Can handle, transform, or suppress errors
 *   - Must execute synchronously
 *
 * - onExec: Task modification hook (sync only)
 *   - Can modify or wrap the task
 *   - Only first plugin's onExec is used
 *   - Must be synchronous
 *
 * Use Cases:
 * - Performance-critical hot paths
 * - Constructors and getters
 * - Synchronous validation
 * - Simple data transformations
 * - Legacy synchronous APIs
 *
 * Relationship with LifecyclePluginInterface:
 * - Both extend ExecutorPluginInterface
 * - SyncLifecyclePluginInterface: All methods return non-Promise values
 * - LifecyclePluginInterface: Methods can return Promise or non-Promise values
 * - They are parallel interfaces, not hierarchical
 *
 * @template Ctx - Type of executor context interface
 *
 * @example Basic sync plugin
 * ```typescript
 * const validationPlugin: SyncLifecyclePluginInterface<ExecutorContextInterface<UserData>> = {
 *   pluginName: 'validation',
 *   enabled: () => true,
 *   onBefore: (ctx) => {
 *     if (!ctx.parameters.email) {
 *       throw new Error('Email is required');
 *     }
 *     return ctx.parameters;
 *   }
 * };
 * ```
 *
 * @example Parameter transformation
 * ```typescript
 * const transformPlugin: SyncLifecyclePluginInterface<ExecutorContextInterface<any>> = {
 *   pluginName: 'transform',
 *   onBefore: (ctx) => {
 *     // Synchronous transformation
 *     return {
 *       ...ctx.parameters,
 *       timestamp: Date.now(),
 *       normalized: ctx.parameters.text.toLowerCase()
 *     };
 *   }
 * };
 * ```
 *
 * @example Error handling
 * ```typescript
 * const errorPlugin: SyncLifecyclePluginInterface<ExecutorContextInterface<any>> = {
 *   pluginName: 'errorHandler',
 *   onError: (ctx) => {
 *     console.error('Sync error:', ctx.error);
 *     // Can return ExecutorError to modify error
 *     return new ExecutorError('VALIDATION_ERROR', ctx.error as Error);
 *   }
 * };
 * ```
 *
 * @since 2.6.0
 * @see LifecyclePluginInterface - Async version that supports Promise
 * @see SyncLifecycleExecutor - Executor that uses this interface
 * @see ExecutorPluginInterface - Base plugin interface
 *
 * @category SyncLifecyclePluginInterface
 */
export interface SyncLifecyclePluginInterface<
  Ctx extends ExecutorContextInterface<unknown> = ExecutorContextInterface<unknown>
> extends ExecutorPluginInterface<Ctx> {
  /**
   * Hook executed before task execution (synchronous only)
   *
   * Purpose:
   * Allows plugins to pre-process input data, validate parameters, or perform
   * setup operations before the main task executes. Must be synchronous.
   *
   * Return Value Behavior:
   * - If returns a value: Context parameters are updated with the returned value
   * - If returns undefined: Context parameters remain unchanged
   * - Cannot return Promise
   *
   * Execution Order:
   * - Executed in plugin registration order
   * - All onBefore hooks execute before the task
   * - Each hook can see parameter changes from previous hooks
   *
   * @param context - Execution context containing parameters and runtime information
   * @returns New parameters to update context, or undefined to keep current parameters
   *
   * @example Parameter validation
   * ```typescript
   * onBefore: (ctx) => {
   *   if (!ctx.parameters.userId) {
   *     throw new Error('userId is required');
   *   }
   * }
   * ```
   *
   * @example Parameter transformation
   * ```typescript
   * onBefore: (ctx) => {
   *   return {
   *     ...ctx.parameters,
   *     timestamp: Date.now(),
   *     normalized: true
   *   };
   * }
   * ```
   */
  onBefore?: (context: Ctx) => Ctx['parameters'] | undefined | void;

  /**
   * Hook executed after successful task execution (synchronous only)
   *
   * Purpose:
   * Allows plugins to process results, perform cleanup, or trigger side effects
   * after successful task completion. Must be synchronous.
   *
   * Use Cases:
   * - Logging results
   * - Caching results
   * - Triggering notifications
   * - Cleanup operations
   *
   * @param context - Execution context with result in returnValue
   *
   * @example Result logging
   * ```typescript
   * onSuccess: (ctx) => {
   *   console.log('Task completed:', ctx.returnValue);
   * }
   * ```
   *
   * @example Result caching
   * ```typescript
   * onSuccess: (ctx) => {
   *   cache.set(ctx.parameters.key, ctx.returnValue);
   * }
   * ```
   */
  onSuccess?: (context: Ctx) => void;

  /**
   * Hook executed when an error occurs (synchronous only)
   *
   * Purpose:
   * Allows plugins to handle errors, transform error messages, or perform
   * error recovery. Must be synchronous.
   *
   * Return Value Behavior:
   * - If returns ExecutorError: Replaces the current error
   * - If returns undefined: Keeps the current error
   *
   * @param context - Execution context with error information
   * @returns ExecutorError to replace current error, or undefined
   *
   * @example Error logging
   * ```typescript
   * onError: (ctx) => {
   *   console.error('Error occurred:', ctx.error);
   * }
   * ```
   *
   * @example Error transformation
   * ```typescript
   * onError: (ctx) => {
   *   return new ExecutorError(
   *     'CUSTOM_ERROR',
   *     ctx.error as Error,
   *     { customData: 'value' }
   *   );
   * }
   * ```
   */
  onError?: (context: Ctx) => ExecutorError | undefined | void;

  /**
   * Hook for modifying or wrapping the task (synchronous only)
   *
   * Purpose:
   * Allows plugins to modify the task execution behavior, wrap the task,
   * or completely replace it. Must be synchronous.
   *
   * Execution Rules:
   * - Only the first plugin's onExec is executed
   * - If onExec is executed, the original task is not run
   * - Use context.hooksRuntimes.times to check if onExec was called
   *
   * @param context - Execution context
   * @param task - The task function to execute or wrap
   * @returns Result of task execution
   *
   * @example Task wrapping
   * ```typescript
   * onExec: (ctx, task) => {
   *   console.log('Before task');
   *   const result = task(ctx);
   *   console.log('After task');
   *   return result;
   * }
   * ```
   *
   * @example Task replacement
   * ```typescript
   * onExec: (ctx, task) => {
   *   // Completely replace task logic
   *   return customLogic(ctx.parameters);
   * }
   * ```
   */
  onExec?: <Result>(
    context: Ctx,
    task: ExecutorSyncTask<Result, Ctx['parameters']>
  ) => Result;
}
