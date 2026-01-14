import { isString } from 'lodash-es';
import { AbortError } from './AbortError';
import type {
  AborterInterface,
  AborterConfig,
  AborterId
} from './AborterInterface';
import { anySignal } from './utils/anySignal';
import { timeoutSignal } from './utils/timeoutSignal';
import type { ClearableSignal } from 'any-signal';

/**
 * Internal wrapper for abort controller and cleanup callbacks
 *
 * Stores the abort controller, cleanup function, and original configuration
 * for each registered operation
 *
 * @internal
 */
interface AbortControllerWrapper<T extends AborterConfig = AborterConfig> {
  /**
   * AbortController instance for this operation
   */
  controller: AbortController;

  /**
   * Cleanup function to remove event listeners and clear timers
   *
   * @optional
   */
  cleanup?: () => void;

  /**
   * Original configuration for this operation
   */
  config: T;
}

/**
 * Abort manager for handling operation cancellation with timeout and signal composition
 *
 * A comprehensive abort management system that provides fine-grained control over
 * asynchronous operations, supporting timeout mechanisms, external signal composition,
 * and automatic resource cleanup.
 *
 * Core concept:
 * Centralized abort controller management with unique ID tracking, allowing multiple
 * operations to be managed independently while supporting signal composition and
 * automatic cleanup.
 *
 * Main features:
 * - Operation tracking: Unique ID generation and tracking for each operation
 *   - Auto-generated IDs with counter: `{aborterName}-{counter}`
 *   - Custom ID support via `abortId` config
 *   - Prevents duplicate registration with same ID
 *
 * - Timeout management: Automatic operation timeout with configurable duration
 *   - Configure via `abortTimeout` in milliseconds
 *   - Triggers `onAbortedTimeout` callback when timeout occurs
 *   - Uses native `AbortSignal.timeout()` when available (Node.js 17.3+)
 *   - Falls back to manual timer implementation for older environments
 *
 * - Signal composition: Combines multiple AbortSignals into one
 *   - Internal controller signal (for manual abort)
 *   - Timeout signal (if `abortTimeout` configured)
 *   - External signal (if `signal` provided in config)
 *   - Uses native `AbortSignal.any()` when available (Node.js 20+)
 *   - Falls back to `any-signal` library for older environments
 *
 * - Resource cleanup: Automatic cleanup of timers and event listeners
 *   - Clears timeout timers to prevent memory leaks
 *   - Removes event listeners from composed signals
 *   - Cleans up on success, error, or manual abort
 *   - Supports batch cleanup with `abortAll()`
 *
 * - Callback support: Flexible callback system for abort events
 *   - `onAborted`: Called on manual abort via `abort()` method
 *   - `onAbortedTimeout`: Called when operation times out
 *   - Callbacks receive sanitized config (without callback functions)
 *   - Errors in callbacks are caught and ignored to prevent breaking abort flow
 *
 * @template T - Configuration type extending `AborterConfig`
 *
 * @example Basic usage with timeout
 * ```typescript
 * const aborter = new Aborter('APIManager');
 * const { abortId, signal } = aborter.register({
 *   abortTimeout: 5000,
 *   onAbortedTimeout: (config) => {
 *     console.log('Request timed out after 5 seconds');
 *   }
 * });
 *
 * try {
 *   const response = await fetch('/api/data', { signal });
 *   const data = await response.json();
 * } finally {
 *   aborter.cleanup(abortId);
 * }
 * ```
 *
 * @example Composing with external signal
 * ```typescript
 * const aborter = new Aborter('FileUploader');
 * const userController = new AbortController();
 *
 * const { abortId, signal } = aborter.register({
 *   abortId: 'upload-avatar',
 *   abortTimeout: 30000, // 30 seconds
 *   signal: userController.signal, // User can cancel
 *   onAborted: (config) => {
 *     console.log('Upload cancelled by user');
 *   }
 * });
 *
 * // Upload will abort if:
 * // 1. User clicks cancel (userController.abort())
 * // 2. Timeout exceeds 30 seconds
 * // 3. Manual abort (aborter.abort('upload-avatar'))
 * ```
 *
 * @example Auto cleanup pattern
 * ```typescript
 * const aborter = new Aborter();
 *
 * const data = await aborter.autoCleanup(
 *   async ({ signal }) => {
 *     const response = await fetch('/api/data', { signal });
 *     return response.json();
 *   },
 *   { abortTimeout: 5000 }
 * );
 * // Cleanup is automatic, no need to call cleanup()
 * ```
 *
 * @example Managing multiple operations
 * ```typescript
 * const aborter = new Aborter('TaskManager');
 *
 * // Start multiple operations
 * const task1 = aborter.register({ abortId: 'task-1', abortTimeout: 5000 });
 * const task2 = aborter.register({ abortId: 'task-2', abortTimeout: 10000 });
 * const task3 = aborter.register({ abortId: 'task-3' });
 *
 * // Abort specific task
 * aborter.abort('task-1');
 *
 * // Abort all remaining tasks
 * aborter.abortAll();
 * ```
 */
export class Aborter<T extends AborterConfig = AborterConfig>
  implements AborterInterface<T>
{
  /**
   * Counter for generating unique abort IDs
   *
   * Incremented each time a new operation is registered without a custom ID
   *
   * @private
   */
  private requestCounter = 0;

  /**
   * Map of abort controller wrappers indexed by abort ID
   *
   * Stores all active operations with their controllers, cleanup functions, and configs
   *
   * @protected
   */
  protected readonly wrappers: Map<string, AbortControllerWrapper<T>> =
    new Map();

  /**
   * Creates a new Aborter instance
   *
   * @param aborterName - Name used for auto-generated abort IDs
   *
   * @default `'Aborter'`
   *
   * @example
   * ```typescript
   * const aborter = new Aborter('MyAborter');
   * // Auto-generated IDs will be: MyAborter-1, MyAborter-2, etc.
   * ```
   */
  constructor(public readonly aborterName: string = 'Aborter') {}

  /**
   * Generates unique abort ID from configuration
   *
   * Priority order:
   * 1. Use `config.abortId` if provided
   * 2. Auto-generate: `{aborterName}-{counter}`
   *
   * @param config - Abort configuration (optional)
   * @returns Unique abort identifier
   *
   * @override
   * @example
   * ```typescript
   * const aborter = new Aborter('MyAborter');
   *
   * // Auto-generated ID
   * aborter.generateAbortedId(); // "MyAborter-1"
   *
   * // Custom ID
   * aborter.generateAbortedId({ abortId: 'custom-id' }); // "custom-id"
   *
   * // Auto-generated when not provided
   * aborter.generateAbortedId({}); // "MyAborter-2"
   * ```
   */
  public generateAbortedId(config?: T): AborterId {
    if (!config) {
      return `${this.aborterName}-${++this.requestCounter}`;
    }
    return config.abortId ?? `${this.aborterName}-${++this.requestCounter}`;
  }

  /**
   * Registers a new abort operation and returns abort ID and composed signal
   *
   * Creates an AbortController for the operation and composes it with timeout
   * and external signals if provided. The returned signal will abort when:
   * - Manual abort via `abort()` method
   * - Timeout expires (if `abortTimeout` configured)
   * - External signal aborts (if `signal` provided)
   *
   * @override
   * @param config - Abort configuration
   * @param {string} [config.abortId] - Custom abort ID (auto-generated if not provided)
   * @param {number} [config.abortTimeout] - Timeout in milliseconds
   * @param {AbortSignal} [config.signal] - External signal to compose
   * @param {Function} [config.onAborted] - Callback for manual abort
   * @param {Function} [config.onAbortedTimeout] - Callback for timeout abort
   *
   * @returns Object containing abort ID and composed signal
   *
   * @throws {Error} If operation with same ID is already registered
   *
   * @example Basic registration
   * ```typescript
   * const aborter = new Aborter();
   * const { abortId, signal } = aborter.register({});
   *
   * await fetch('/api/data', { signal });
   * aborter.cleanup(abortId);
   * ```
   *
   * @example With timeout and callbacks
   * ```typescript
   * const { abortId, signal } = aborter.register({
   *   abortId: 'fetch-user',
   *   abortTimeout: 5000,
   *   onAbortedTimeout: (config) => {
   *     console.log(`Operation ${config.abortId} timed out`);
   *   }
   * });
   * ```
   *
   * @example Composing with external signal
   * ```typescript
   * const userController = new AbortController();
   * const { signal } = aborter.register({
   *   signal: userController.signal,
   *   abortTimeout: 10000
   * });
   * // Aborts if user cancels OR timeout expires
   * ```
   */
  public register(config: T): {
    abortId: AborterId;
    signal: AbortSignal;
  } {
    const abortId = this.generateAbortedId(config);

    if (this.wrappers.has(abortId)) {
      throw new Error(
        `Operation with ID "${abortId}" is already registered in ${this.aborterName}`
      );
    }

    // Security fix: Check if external signal is already aborted BEFORE registration
    // If already aborted, return immediately without registering to avoid race condition
    if (config.signal?.aborted) {
      const controller = new AbortController();
      // Preserve the abort reason from external signal
      controller.abort(config.signal.reason);
      return { abortId, signal: controller.signal };
    }

    const controller = new AbortController();
    const { signal, cleanup } = this.createComposedSignal(
      config,
      controller.signal,
      abortId
    );

    this.wrappers.set(abortId, {
      controller,
      config,
      cleanup
    });

    return { abortId, signal };
  }

  /**
   * Creates composed signal from controller signal, timeout, and external signal
   *
   * Combines multiple abort signals into a single signal that aborts when any
   * source signal aborts. Also sets up cleanup callbacks for timers and listeners.
   *
   * Signal composition logic:
   * 1. Always include internal controller signal
   * 2. Add timeout signal if `abortTimeout` is valid
   * 3. Add external signal if `signal` is provided
   * 4. Return single signal if no composition needed
   * 5. Use `anySignal()` to combine multiple signals
   *
   * @param config - Abort configuration
   * @param controllerSignal - Internal controller signal
   * @param abortId - Pre-generated abort ID to avoid regeneration in callbacks
   * @returns Object containing composed signal and cleanup function
   *
   * @protected
   */
  protected createComposedSignal(
    config: T,
    controllerSignal: AbortSignal,
    abortId: AborterId
  ): { signal: AbortSignal; cleanup?: () => void } {
    const signals: AbortSignal[] = [controllerSignal];
    const cleanupCallbacks: Array<() => void> = [];

    // Add timeout signal if configured
    if (this.hasValidTimeout(config)) {
      const timeoutSig = timeoutSignal(config.abortTimeout!);
      signals.push(timeoutSig);

      if (this.isClearable(timeoutSig)) {
        cleanupCallbacks.push(() => timeoutSig.clear());
      }
    }

    // Add external signal if provided
    if (config.signal) {
      signals.push(config.signal);
    }

    // Return single signal if no composition needed
    if (signals.length === 1) {
      return { signal: controllerSignal };
    }

    // Compose multiple signals
    const combinedSignal = anySignal(signals);

    // Security fix: Use pre-generated abortId to prevent memory leak
    // If we call generateAbortedId() again here, it may generate a different ID
    // when config doesn't have abortId, causing cleanup to fail
    const abortListener = () => {
      const reason = combinedSignal.reason;

      // Invoke timeout callback if timeout triggered
      if (this.isTimeoutError(reason)) {
        this.invokeCallback(config, 'onAbortedTimeout');
      }

      // Use cached abortId instead of regenerating
      this.cleanup(abortId);
    };

    combinedSignal.addEventListener('abort', abortListener, { once: true });

    cleanupCallbacks.push(
      () => combinedSignal.removeEventListener('abort', abortListener),
      () => combinedSignal.clear()
    );

    return {
      signal: combinedSignal,
      cleanup: () => cleanupCallbacks.forEach((cb) => cb())
    };
  }

  /**
   * Checks if configuration has valid timeout value
   *
   * Valid timeout must be:
   * - Present in config
   * - Integer number
   * - Greater than 0
   *
   * @param config - Abort configuration
   * @returns `true` if timeout is valid
   *
   * @protected
   */
  protected hasValidTimeout(config: T): boolean {
    return (
      'abortTimeout' in config &&
      Number.isInteger(config.abortTimeout) &&
      config.abortTimeout! > 0
    );
  }

  /**
   * Type guard to check if signal has `clear()` method
   *
   * @param signal - AbortSignal to check
   * @returns `true` if signal is clearable
   *
   * @protected
   */
  protected isClearable(signal: AbortSignal): signal is ClearableSignal {
    return (
      'clear' in signal &&
      typeof (signal as ClearableSignal).clear === 'function'
    );
  }

  /**
   * Checks if abort reason is a timeout error
   *
   * Detects timeout errors by checking:
   * - Error name is 'TimeoutError'
   * - Error message contains 'timed out'
   *
   * @param reason - Abort reason to check
   * @returns `true` if reason is timeout error
   *
   * @protected
   */
  protected isTimeoutError(reason: unknown): boolean {
    return (
      (reason as Error)?.name === 'TimeoutError' ||
      (reason as Error)?.message?.includes('timed out')
    );
  }

  /**
   * Generic callback invoker with error handling
   *
   * Passes sanitized config (without callback functions) to prevent
   * circular references and memory leaks.
   *
   * Error handling strategy:
   * - Errors are caught to prevent breaking abort flow
   * - In development mode, errors are logged to console for debugging
   * - In production mode, errors are silently ignored
   *
   * @param config - Abort configuration
   * @param callbackName - Name of the callback to invoke
   * @protected
   */
  protected invokeCallback(
    config: T,
    callbackName: 'onAborted' | 'onAbortedTimeout'
  ): void {
    if (callbackName in config && typeof config[callbackName] === 'function') {
      try {
        (config[callbackName] as (cfg: T) => void)({
          ...config,
          onAborted: undefined,
          onAbortedTimeout: undefined
        });
      } catch (error) {
        // Security improvement: Log errors in development for debugging
        // but ignore in production to prevent breaking abort flow
        if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
          console.error(
            `[${this.aborterName}] Error in ${callbackName} callback:`,
            error
          );
        }
      }
    }
  }

  /**
   * Resolves abort ID from config or string
   *
   * @param config - Configuration object or abort ID string
   * @returns Abort ID string
   * @protected
   */
  protected resolveAbortId(config: T | AborterId): AborterId {
    return isString(config) ? config : this.generateAbortedId(config);
  }

  /**
   * Cleans up resources for an operation
   *
   * Removes the operation from tracking and executes cleanup callbacks
   * to clear timers and remove event listeners
   *
   * @override
   * @param config - Configuration object or abort ID string
   * @returns `true` if operation was cleaned up, `false` if not found
   *
   * @example
   * ```typescript
   * // Cleanup by ID
   * const cleaned = aborter.cleanup('fetch-user-data');
   * console.log(cleaned ? 'Cleaned up' : 'Not found');
   *
   * // Cleanup by config
   * aborter.cleanup({ abortId: 'fetch-user-data' });
   * ```
   */
  public cleanup(config: T | AborterId): boolean {
    const key = this.resolveAbortId(config);
    const wrapper = this.wrappers.get(key);

    if (wrapper) {
      this.wrappers.delete(key);
      try {
        wrapper.cleanup?.();
      } catch {
        // Note: Ignore cleanup errors to ensure wrapper is always removed
      }
      return true;
    }

    return false;
  }

  /**
   * Manually aborts a specific operation
   *
   * Triggers abort on the operation's controller, calls `onAborted` callback
   * if configured, and cleans up all resources
   *
   * @override
   * @param config - Configuration object or abort ID string
   * @returns `true` if operation was aborted, `false` if not found
   *
   * @example Abort by ID
   * ```typescript
   * const success = aborter.abort('fetch-user-data');
   * if (success) {
   *   console.log('Operation aborted successfully');
   * }
   * ```
   *
   * @example Abort by config
   * ```typescript
   * aborter.abort({ abortId: 'upload-file' });
   * ```
   */
  public abort(config: T | AborterId): boolean {
    const key = this.resolveAbortId(config);
    const wrapper = this.wrappers.get(key);

    if (!wrapper) {
      return false;
    }

    const configToUse = isString(config) ? wrapper.config : config;

    wrapper.controller.abort(new AbortError('The operation was aborted', key));
    this.cleanup(key);

    // Note: Invoke onAborted callback (not onAbortedTimeout)
    this.invokeCallback(configToUse, 'onAborted');

    return true;
  }

  /**
   * Aborts all pending operations
   *
   * Iterates through all active operations, aborts each one, and clears
   * all resources. Useful for cleanup when component unmounts or user logs out.
   *
   * @override
   * @example Component cleanup
   * ```typescript
   * class MyComponent {
   *   private aborter = new Aborter('MyComponent');
   *
   *   onDestroy() {
   *     this.aborter.abortAll();
   *   }
   * }
   * ```
   *
   * @example User logout
   * ```typescript
   * function logout() {
   *   aborter.abortAll(); // Cancel all API calls
   *   clearUserData();
   *   redirectToLogin();
   * }
   * ```
   */
  public abortAll(): void {
    const wrappersSnapshot = Array.from(this.wrappers.entries());
    this.wrappers.clear();

    wrappersSnapshot.forEach(([key, wrapper]) => {
      try {
        if (!wrapper.controller.signal.aborted) {
          wrapper.controller.abort(
            new AbortError('All operations were aborted', key)
          );
        }
      } catch {
        // Note: Ignore abort errors to ensure all operations are processed
      }

      try {
        wrapper.cleanup?.();
      } catch {
        // Note: Ignore cleanup errors to ensure all operations are processed
      }
    });
  }

  /**
   * Executes factory function with automatic cleanup
   *
   * Registers operation, executes factory, and automatically cleans up
   * when promise settles (success or error). Simplifies abort management
   * by removing need for manual cleanup.
   *
   * @template R - Return type of factory function
   * @param factory - Async function that receives abort context
   * @param config - Optional abort configuration
   * @returns Promise that resolves to factory result
   *
   * @example Basic usage
   * ```typescript
   * const data = await aborter.autoCleanup(
   *   async ({ signal }) => {
   *     const response = await fetch('/api/data', { signal });
   *     return response.json();
   *   },
   *   { abortTimeout: 5000 }
   * );
   * ```
   *
   * @example With abort ID
   * ```typescript
   * const result = await aborter.autoCleanup(
   *   async ({ abortId, signal }) => {
   *     console.log(`Starting operation: ${abortId}`);
   *     return await someAsyncOperation(signal);
   *   },
   *   { abortId: 'my-operation' }
   * );
   * ```
   */
  public autoCleanup<R>(
    factory: (ctx: { abortId: AborterId; signal: AbortSignal }) => Promise<R>,
    config?: T
  ): Promise<R> {
    const { abortId, signal } = this.register(config ?? ({} as T));

    try {
      const result = factory({ abortId, signal });
      return Promise.resolve(result).finally(() => this.cleanup(abortId));
    } catch (error) {
      // Note: Handle synchronous errors from factory
      this.cleanup(abortId);
      return Promise.reject(error);
    }
  }

  /**
   * Retrieves abort signal for a specific operation
   *
   * @param abortId - Abort ID to look up
   * @returns AbortSignal if found, `undefined` otherwise
   *
   * @example
   * ```typescript
   * const signal = aborter.getSignal('fetch-user-data');
   * if (signal) {
   *   console.log('Signal aborted:', signal.aborted);
   * }
   * ```
   */
  public getSignal(abortId: AborterId): AbortSignal | undefined {
    return this.wrappers.get(abortId)?.controller.signal;
  }
}
