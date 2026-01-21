import type { ExecutorHookRuntimesInterface, HookRuntimes } from "./ExecutorHookRuntimesInterface";

/**
 * Executor context interface with generic runtime support
 *
 * @since 3.0.0
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
