/**
 * Unique identifier for an abort operation
 *
 * String identifier used to track and manage abort operations.
 * Can be auto-generated or custom-provided.
 *
 * @example `"MyAborter-1"` // Auto-generated
 * @example `"fetch-user-data"` // Custom
 */
export type AborterId = string;

/**
 * Base configuration for abort operations
 *
 * Defines all available options for configuring abort behavior,
 * including timeout, external signal composition, and callbacks.
 */
export interface AborterConfig {
  /**
   * Unique identifier for the abort operation
   *
   * If not provided, an ID will be auto-generated using the pattern:
   * `{aborterName}-{counter}`
   *
   * @optional
   * @example `"fetch-user-profile"`
   * @example `"upload-avatar-123"`
   */
  abortId?: AborterId;

  /**
   * Callback invoked when operation is manually aborted via `abort()` method
   *
   * Receives sanitized config (without callback functions) to prevent
   * circular references. Use this to handle cleanup or notify users
   * when operation is cancelled.
   *
   * @optional
   * @example
   * ```typescript
   * onAborted: (config) => {
   *   console.log(`Operation ${config.abortId} was cancelled`);
   *   showNotification('Upload cancelled');
   * }
   * ```
   */
  onAborted?<T extends AborterConfig>(config: T): void;

  /**
   * Timeout duration in milliseconds for automatic abort
   *
   * When set, the operation will be automatically aborted after this duration.
   * Triggers `onAbortedTimeout` callback when timeout expires.
   *
   * @optional
   * @default `undefined` (no timeout)
   * @example `5000` // 5 seconds
   * @example `30000` // 30 seconds
   */
  abortTimeout?: number;

  /**
   * Callback invoked when operation times out via `abortTimeout`
   *
   * Only triggered when timeout expires. NOT triggered by manual abort
   * or external signal abort. Use this to show timeout-specific messages
   * or implement retry logic.
   *
   * @optional
   * @example
   * ```typescript
   * onAbortedTimeout: (config) => {
   *   console.error(`Operation timed out after ${config.abortTimeout}ms`);
   *   showNotification('Request timed out, please try again');
   * }
   * ```
   */
  onAbortedTimeout?<T extends AborterConfig>(config: T): void;

  /**
   * External AbortSignal for request cancellation
   *
   * When provided, the operation will abort if either:
   * - External signal aborts
   * - Internal abort is triggered
   * - Timeout expires (if configured)
   *
   * This enables parent-child abort relationships where parent
   * can cancel all child operations.
   *
   * @optional
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal MDN}
   * @example
   * ```typescript
   * const parentController = new AbortController();
   * const config = {
   *   signal: parentController.signal,
   *   abortTimeout: 5000
   * };
   * // Aborts if parent cancels OR timeout expires
   * ```
   */
  signal?: AbortSignal | null;
}

/**
 * Interface defining the common API for abort management
 *
 * Provides a standardized interface for abort manager implementations,
 * ensuring consistent API across different abort strategies.
 *
 * All methods are designed to be safe and idempotent:
 * - Cleanup of non-existent operations is a no-op
 * - Aborting non-existent operations returns `false`
 * - Multiple cleanups of same operation are safe
 *
 * @since 3.0.0
 * @template T - Configuration type extending `AborterConfig`
 *
 * @example Basic implementation
 * ```typescript
 * class CustomAborter implements AborterInterface<AborterConfig> {
 *   // Implement all required methods
 * }
 * ```
 */
export interface AborterInterface<T extends AborterConfig> {
  /**
   * Registers a new abort operation
   *
   * @param config - Abort configuration
   * @returns Object containing abort ID and composed signal
   * @throws {Error} If operation with same ID is already registered
   */
  register(config: T): {
    abortId: AborterId;
    signal: AbortSignal;
  };

  /**
   * Cleans up resources for an operation
   *
   * @param config - Configuration object or abort ID string
   * @returns `true` if operation was cleaned up, `false` if not found
   */
  cleanup(config: T | AborterId): boolean;

  /**
   * Manually aborts a specific operation
   *
   * @param config - Configuration object or abort ID string
   * @returns `true` if operation was aborted, `false` if not found
   */
  abort(config: T | AborterId): boolean;

  /**
   * Aborts all operations
   */
  abortAll(): void;
}
