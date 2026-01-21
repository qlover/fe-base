import type {
  ExecutorHookRuntimesInterface,
  HookRuntimes
} from './ExecutorHookRuntimesInterface';

/**
 * Executor context interface with generic runtime support
 *
 * Core concept:
 * Provides a shared context for task execution, allowing plugins to access
 * and modify parameters, track execution state, and share data across the
 * execution lifecycle. The context acts as a communication bridge between
 * the executor, plugins, and the task being executed.
 *
 * Main features:
 * - Parameter management: Read and update execution parameters
 *   - Type-safe parameter access through generic type `T`
 *   - Immutable read access via `parameters` property
 *   - Safe updates via `setParameters()` with internal cloning
 *   - Prevents accidental parameter mutation
 *
 * - Error tracking: Store and retrieve error state
 *   - Captures errors from task execution
 *   - Accessible to error handling plugins
 *   - Supports any error type (Error, string, object, etc.)
 *   - Automatically converts to ExecutorError
 *
 * - Return value handling: Access task return values
 *   - Type-safe return value through generic type `R`
 *   - Available to afterHooks for result transformation
 *   - Undefined until task completes successfully
 *
 * - Runtime metadata: Track execution timing and state
 *   - Extensible runtime information via `RuntimesType`
 *   - Hook execution tracking
 *   - Performance monitoring support
 *   - Custom metadata storage
 *
 * Design considerations:
 * - Immutable core properties: `parameters`, `error`, `returnValue` are read-only
 * - Safe mutation methods: `setParameters()`, `setError()`, `setReturnValue()`
 * - Generic type safety: Full type inference for parameters and return values
 * - Extensible runtimes: Custom runtime metadata via `RuntimesType` generic
 *
 * @since `3.0.0`
 * @template T - Type of execution parameters
 * @template R - Type of return value (required for type safety)
 * @template RuntimesType - Type of hook runtimes (extends `HookRuntimes`, defaults to `HookRuntimes`)
 *
 * @example Basic usage
 * ```typescript
 * interface UserParams {
 *   userId: number;
 *   action: string;
 * }
 *
 * interface UserResult {
 *   success: boolean;
 *   data: User;
 * }
 *
 * const context: ExecutorContextInterface<UserParams, UserResult> =
 *   new ExecutorContextImpl({ userId: 123, action: 'fetch' });
 *
 * console.log(context.parameters.userId); // 123
 * ```
 *
 * @example In plugin hooks
 * ```typescript
 * const plugin: LifecyclePluginInterface<ExecutorContextInterface<UserParams, UserResult>> = {
 *   pluginName: 'logger',
 *
 *   onBefore: async (ctx) => {
 *     console.log('Starting with:', ctx.parameters);
 *     // Add timestamp to parameters
 *     ctx.setParameters({
 *       ...ctx.parameters,
 *       timestamp: Date.now()
 *     });
 *   },
 *
 *   onAfter: async (ctx, result) => {
 *     console.log('Completed with:', ctx.returnValue);
 *     return result;
 *   },
 *
 *   onError: async (ctx, error) => {
 *     console.error('Failed with:', ctx.error);
 *     throw error;
 *   }
 * };
 * ```
 *
 * @example Parameter transformation
 * ```typescript
 * const executor = new LifecycleExecutor();
 *
 * executor.use({
 *   pluginName: 'validator',
 *   onBefore: async (ctx) => {
 *     // Validate and transform parameters
 *     const validated = validateParams(ctx.parameters);
 *     ctx.setParameters(validated);
 *   }
 * });
 *
 * const result = await executor.exec(
 *   { userId: '123' }, // String input
 *   async (ctx) => {
 *     // ctx.parameters.userId is now validated and transformed
 *     return await fetchUser(ctx.parameters.userId);
 *   }
 * );
 * ```
 *
 * @example Error handling
 * ```typescript
 * executor.use({
 *   pluginName: 'errorHandler',
 *   onError: async (ctx, error) => {
 *     // Access error from context
 *     console.error('Task failed:', ctx.error);
 *
 *     // Transform error
 *     if (ctx.error instanceof NetworkError) {
 *       throw new UserFriendlyError('Network connection failed');
 *     }
 *     throw error;
 *   }
 * });
 * ```
 *
 * @example With unknown return type
 * ```typescript
 * // When return type is not known in advance
 * const context: ExecutorContextInterface<UserParams, unknown> =
 *   new ExecutorContextImpl(params);
 * ```
 *
 * @example Extended runtimes
 * ```typescript
 * interface CustomRuntimes extends HookRuntimes {
 *   executionTime: number;
 *   memoryUsage: number;
 *   cacheHits: number;
 * }
 *
 * const context: ExecutorContextInterface<UserParams, UserResult, CustomRuntimes> =
 *   new ExecutorContextImpl(params);
 *
 * // Access custom runtime metadata
 * console.log(context.runtimes.executionTime);
 * ```
 *
 * @see {@link ExecutorHookRuntimesInterface} for runtime metadata interface
 * @see {@link ExecutorContextImpl} for default implementation
 */
export interface ExecutorContextInterface<
  T,
  R = unknown,
  RuntimesType extends HookRuntimes = HookRuntimes
> extends ExecutorHookRuntimesInterface<RuntimesType> {
  /**
   * Read-only access to execution parameters
   *
   * Provides immutable access to the current parameters. To modify parameters,
   * use `setParameters()` method which ensures safe cloning.
   *
   * @example
   * ```typescript
   * console.log(ctx.parameters.userId);
   * console.log(ctx.parameters.action);
   * ```
   */
  readonly parameters: T;

  /**
   * Current error state, if any
   *
   * Contains the error that occurred during task execution. Only populated
   * when an error is thrown. Accessible in error handling hooks.
   *
   * @example
   * ```typescript
   * onError: (ctx, error) => {
   *   if (ctx.error instanceof NetworkError) {
   *     console.log('Network error occurred');
   *   }
   * }
   * ```
   */
  readonly error: unknown;

  /**
   * Task return value
   *
   * Contains the value returned by the task after successful execution.
   * Undefined until the task completes. Accessible in afterHooks for
   * result transformation.
   *
   * @example
   * ```typescript
   * onAfter: (ctx, result) => {
   *   console.log('Task returned:', ctx.returnValue);
   *   // Transform result
   *   return { ...result, timestamp: Date.now() };
   * }
   * ```
   */
  readonly returnValue: R | undefined;

  /**
   * Set the error state
   *
   * Stores an error in the context for access by error handling plugins.
   * Accepts any type of error value and converts it to `ExecutorError`.
   * This matches the behavior of JavaScript's catch clause which can catch any type.
   *
   * @param error - Error to set (can be any type: Error, string, object, etc.)
   *
   * @example
   * ```typescript
   * try {
   *   await riskyOperation();
   * } catch (error) {
   *   ctx.setError(error);
   * }
   * ```
   */
  setError(error: unknown): void;

  /**
   * Set the return value
   *
   * Stores the task's return value in the context. Typically called by
   * the executor after task completion, but can be used by plugins to
   * override the return value.
   *
   * @param value - Return value to set
   *
   * @example
   * ```typescript
   * onAfter: (ctx, result) => {
   *   // Override return value
   *   ctx.setReturnValue({ ...result, enhanced: true });
   *   return ctx.returnValue;
   * }
   * ```
   */
  setReturnValue(value: unknown): void;

  /**
   * Update parameters (clones internally for safety)
   *
   * Updates the execution parameters with a new value. The parameters are
   * cloned internally to prevent accidental mutation. This ensures that
   * plugins cannot inadvertently affect each other's parameter views.
   *
   * @param params - New parameters to set
   *
   * @example
   * ```typescript
   * onBefore: (ctx) => {
   *   // Add authentication token
   *   ctx.setParameters({
   *     ...ctx.parameters,
   *     authToken: getAuthToken()
   *   });
   * }
   * ```
   *
   * @example Parameter validation
   * ```typescript
   * onBefore: (ctx) => {
   *   const validated = validateAndTransform(ctx.parameters);
   *   ctx.setParameters(validated);
   * }
   * ```
   */
  setParameters(params: T): void;
}
