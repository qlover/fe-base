/**
 * Constant identifier for ExecutorError type
 *
 * Used to distinguish ExecutorError from other error types through the `name` property.
 * This constant ensures consistent error identification across the executor system.
 *
 * Design rationale:
 * - Using a constant instead of hardcoded strings prevents typos and ensures consistency
 * - The `as const` assertion provides literal type inference for better type safety
 * - This enables reliable error type checking in catch blocks and error handlers
 *
 * @example Error type checking
 * ```typescript
 * if (error.name === EXECUTOR_ERROR_NAME) {
 *   // Handle executor-specific error
 *   console.log('Executor error occurred:', error.id);
 * }
 * ```
 */
export const EXECUTOR_ERROR_NAME = 'ExecutorError' as const;

/**
 * Base error class for all executor-related errors in the system
 *
 * ExecutorError provides a standardized way to handle errors throughout the executor
 * lifecycle. It wraps underlying errors while maintaining error context through an
 * error ID system, enabling precise error categorization and handling.
 *
 * Core features:
 * - **Error identification**: Uses unique `id` to categorize different error types without relying on error messages
 * - **Error wrapping**: Preserves original error information through `cause` property, supporting error chaining
 * - **Stack trace preservation**: Maintains original error stack when wrapping errors for better debugging
 * - **Type safety**: Provides type-safe error handling with TypeScript, enabling compile-time error checking
 * - **Subclass support**: Designed to be extended by specific error types (RequestError, AbortError, etc.)
 *
 * Design considerations:
 * - The `id` field enables error categorization without relying on error messages, which may be localized or changed
 * - The `cause` field supports error chaining (similar to Java's exception chaining), preserving the original error context
 * - When `cause` is an Error, its message and stack are inherited for better debugging experience, and the Error object is stored in `cause`
 * - When `cause` is a string, it's used directly as the error message, but not stored in `cause` property (to avoid duplication)
 * - When `cause` is undefined or other types, the error message falls back to `id` value
 * - Stack trace is automatically captured in V8 environments (Node.js, Chrome) for better debugging
 * - For subclasses, `name` is set to `constructor.name`, which may be affected by bundling/minification (see TODO comment in constructor)
 *
 * Error handling strategy:
 * - Use specific error IDs for different failure scenarios to enable precise error handling
 * - Always wrap lower-level errors with ExecutorError to maintain consistent error interface
 * - Preserve original error information through the `cause` property for debugging
 * - Use `instanceof` checks for error type detection, and `id` for specific error scenario handling
 *
 * @example Basic usage with error ID only
 * ```typescript
 * throw new ExecutorError('VALIDATION_ERROR');
 * // Error message will be 'VALIDATION_ERROR' (falls back to id)
 * ```
 *
 * @example Wrapping an existing error
 * ```typescript
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   throw new ExecutorError('OPERATION_FAILED', error);
 * }
 * ```
 *
 * @example With custom string message
 * ```typescript
 * throw new ExecutorError(
 *   'CUSTOM_ERROR',
 *   'Invalid configuration: timeout must be positive'
 * );
 * ```
 *
 * @example Error identification and handling
 * ```typescript
 * try {
 *   await executor.exec(task);
 * } catch (error) {
 *   if (error instanceof ExecutorError) {
 *     switch (error.id) {
 *       case 'VALIDATION_ERROR':
 *         // Handle validation errors
 *         console.error('Validation failed:', error.message);
 *         break;
 *       case 'TIMEOUT_ERROR':
 *         // Handle timeout errors
 *         console.error('Operation timed out:', error.message);
 *         break;
 *       default:
 *         // Handle other executor errors
 *         console.error('Unknown executor error:', error.id);
 *     }
 *   }
 * }
 * ```
 *
 * @see RequestError - Extends ExecutorError for request-specific errors
 * @see AbortError - Extends ExecutorError for abort-specific errors
 */
export class ExecutorError extends Error {
  /**
   * Creates a new ExecutorError instance
   *
   * The constructor intelligently handles different types of `cause` values:
   * - If `cause` is an Error: Inherits its message and stack trace for seamless error wrapping
   * - If `cause` is a string: Uses it as the error message directly
   * - If `cause` is undefined or other types: Uses the `id` as the error message
   *
   * Implementation details:
   * - Uses `super()` to initialize the parent Error class first
   * - Sets the error name based on whether this is the base class or a subclass
   * - For base ExecutorError, uses the constant `EXECUTOR_ERROR_NAME`
   * - For subclasses, uses `this.constructor.name` (note: may be affected by bundling/minification)
   * - When `cause` is an Error, inherits its stack trace directly
   * - When `cause` is not an Error, uses the default Error stack trace (captured by V8 automatically)
   * - The `cause` property is only set when `this.message !== cause` to avoid redundancy
   *
   * Message resolution logic:
   * 1. If `cause` is an Error: `message = cause.message`
   * 2. Else if `cause` is a string: `message = cause`
   * 3. Else: `message = id` (fallback to error ID)
   *
   * Cause property logic:
   * - Set `this.cause = cause` only when `this.message !== cause`
   * - This means: Error objects always set `cause`, strings don't (to avoid duplication), undefined sets `cause` to undefined
   *
   * @param id - Unique identifier for the error type
   *
   * Used to categorize and identify specific error scenarios. Common IDs include:
   * - `'UNKNOWN_ASYNC_ERROR'` (EXECUTOR_ASYNC_ERROR) - Async execution failures in executor lifecycle
   * - `'UNKNOWN_SYNC_ERROR'` (EXECUTOR_SYNC_ERROR) - Sync execution failures in executor lifecycle
   * - `'VALIDATION_ERROR'` - Input validation failures
   * - `'TIMEOUT_ERROR'` - Operation timeout
   * - `'ABORT_ERROR'` - Operation aborted by user or system
   * - `'PLUGIN_ERROR'` - Plugin execution failures
   * - `'CONTEXT_ERROR'` - Context-related errors
   *
   * @param cause - Optional underlying cause of the error
   *
   * Can be:
   * - An Error object: Original error to wrap, preserving its message and stack. The Error object will be stored in `cause` property.
   * - A string: Custom error message describing the failure. The string will be used as `message`, but won't be stored in `cause` (to avoid duplication).
   * - Undefined: Error message will be set to `id`. The `cause` property will be set to `undefined`.
   * - Any other value: Error message will be set to `id`. The value will be stored in `cause` property.
   *
   * @example Create error with ID only
   * ```typescript
   * const error = new ExecutorError('UNKNOWN_ERROR');
   * console.log(error.id); // 'UNKNOWN_ERROR'
   * console.log(error.message); // 'UNKNOWN_ERROR' (falls back to id)
   * console.log(error.cause); // undefined
   * console.log(error.name); // 'ExecutorError'
   * ```
   *
   * @example Wrap an existing error
   * ```typescript
   * try {
   *   JSON.parse(invalidJson);
   * } catch (err) {
   *   const error = new ExecutorError('PARSE_ERROR', err);
   *   console.log(error.id); // 'PARSE_ERROR'
   *   console.log(error.message); // 'Unexpected token...' (from err.message)
   *   console.log(error.cause); // Original SyntaxError (stored in cause)
   *   console.log(error.stack); // Stack trace from original error
   * }
   * ```
   *
   * @example Create error with custom message
   * ```typescript
   * const error = new ExecutorError(
   *   'CONFIG_ERROR',
   *   'Timeout must be a positive number'
   * );
   * console.log(error.id); // 'CONFIG_ERROR'
   * console.log(error.message); // 'Timeout must be a positive number'
   * console.log(error.cause); // undefined (not stored to avoid duplication)
   * ```
   *
   * @example Subclass usage
   * ```typescript
   * class RequestError extends ExecutorError {
   *   constructor(cause?: unknown) {
   *     super('REQUEST_ERROR', cause);
   *     // Note: constructor.name may be mangled during bundling
   *     // Consider explicitly setting this.name if needed
   *   }
   * }
   * const error = new RequestError('Network failure');
   * console.log(error.name); // 'RequestError' (from constructor.name)
   * console.log(error.id); // 'REQUEST_ERROR'
   * console.log(error.message); // 'Network failure'
   * ```
   */
  constructor(
    /**
     * Unique identifier for categorizing the error type
     *
     * This ID enables programmatic error handling without relying on error messages,
     * which may change or be localized. It serves as a stable contract for error types
     * across the entire executor system.
     *
     * Best practices:
     * - Use UPPER_SNAKE_CASE for consistency
     * - Make IDs descriptive and specific to the error scenario
     * - Document common error IDs in the class-level documentation
     * - Avoid changing existing IDs to maintain backward compatibility
     *
     * @example `'VALIDATION_ERROR'`
     * @example `'EXECUTOR_ASYNC_ERROR'`
     * @example `'REQUEST_TIMEOUT'`
     */
    public readonly id: string,
    /**
     * Optional underlying cause of the error
     *
     * Supports error chaining by preserving the original error or message.
     * The behavior differs based on the type:
     *
     * - **Error object**: Its message and stack trace are inherited, and the Error object is stored in `cause` property
     * - **String**: Used as the error message directly, but not stored in `cause` property (to avoid duplication)
     * - **Undefined**: Error message falls back to `id`, and `cause` is set to `undefined`
     * - **Other types**: Error message falls back to `id`, and the value is stored in `cause` property
     *
     * Use cases:
     * - Wrapping lower-level errors (network errors, parse errors, etc.) - use Error object
     * - Providing custom error messages for specific scenarios - use string
     * - Storing additional error context (objects, metadata, etc.) - use any other type
     *
     * @optional
     * @example Error object: `new Error('Connection failed')` - message and stack inherited, Error stored in cause
     * @example String message: `'Invalid input format'` - used as message, not stored in cause
     * @example Other values: `{ code: 500, details: '...' }` - message falls back to id, value stored in cause
     */
    cause?: unknown
  ) {
    // Initialize parent Error class
    // The message will be set below based on the cause type
    super();


    // TODO: Maybe the constructor name is compressed after bundling, we need to consider other ways to ensure the error name is correct
    this.name =
      this.constructor !== ExecutorError
        ? this.constructor.name
        : EXECUTOR_ERROR_NAME;

    if (cause instanceof Error) {
      this.message = cause.message;
      this.stack = cause.stack;
    } else if (typeof cause === 'string') {
      this.message = cause;
    }

    if (!this.message) {
      this.message = id;
    }

    if (this.message !== cause) {
      this.cause = cause;
    }
  }
}
