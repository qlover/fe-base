/**
 * Executor error type constants
 *
 * These constants are used to identify the type of error that occurred
 * during executor execution (synchronous or asynchronous).
 *
 * @example
 * ```typescript
 * import { EXECUTOR_SYNC_ERROR, EXECUTOR_ASYNC_ERROR } from './utils/constants';
 *
 * if (errorType === EXECUTOR_SYNC_ERROR) {
 *   // Handle sync error
 * }
 * ```
 */

/**
 * Error type constant for synchronous execution errors
 *
 * Used when an error occurs during synchronous task execution
 * or synchronous plugin hook execution.
 */
export const EXECUTOR_SYNC_ERROR = 'UNKNOWN_SYNC_ERROR' as const;

/**
 * Error type constant for asynchronous execution errors
 *
 * Used when an error occurs during asynchronous task execution
 * or asynchronous plugin hook execution.
 */
export const EXECUTOR_ASYNC_ERROR = 'UNKNOWN_ASYNC_ERROR' as const;

/**
 * Type for executor error type constants
 */
export type ExecutorErrorType =
  | typeof EXECUTOR_SYNC_ERROR
  | typeof EXECUTOR_ASYNC_ERROR;

/**
 * Default hook name constants
 *
 * These constants define the default hook names used by the executor
 * for lifecycle management. They can be overridden via configuration.
 *
 * @example
 * ```typescript
 * import { DEFAULT_HOOK_NAMES } from './utils/constants';
 *
 * const executor = new LifecycleExecutor({
 *   beforeHooks: DEFAULT_HOOK_NAMES.ON_BEFORE,
 *   execHook: DEFAULT_HOOK_NAMES.ON_EXEC,
 *   afterHooks: DEFAULT_HOOK_NAMES.ON_SUCCESS
 * });
 * ```
 */

/**
 * Default hook name for pre-execution hooks
 *
 * Used to execute plugins before the main task execution.
 * Plugins can modify input data or perform validation.
 */
export const DEFAULT_HOOK_ON_BEFORE = 'onBefore' as const;

/**
 * Default hook name for main execution hooks
 *
 * Used to execute plugins that modify or wrap the main task.
 * Only the first plugin's onExec hook is used.
 */
export const DEFAULT_HOOK_ON_EXEC = 'onExec' as const;

/**
 * Default hook name for post-execution hooks
 *
 * Used to execute plugins after successful task execution.
 * Plugins can process results or perform cleanup operations.
 */
export const DEFAULT_HOOK_ON_SUCCESS = 'onSuccess' as const;

/**
 * Default hook name for error handling hooks
 *
 * Used to execute plugins when an error occurs during execution.
 * Plugins can handle or transform errors.
 */
export const DEFAULT_HOOK_ON_ERROR = 'onError' as const;

/**
 * Default hook name for finally hooks
 *
 * Used to execute plugins after the task execution, regardless of success or failure.
 * Plugins can perform cleanup operations or perform final actions.
 */
export const DEFAULT_HOOK_ON_FINALLY = 'onFinally' as const;