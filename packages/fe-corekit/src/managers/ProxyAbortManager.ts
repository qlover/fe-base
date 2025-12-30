import { AbortManager } from './AbortManager';
import type { AbortManagerConfig, AbortManagerId } from './interface/AbortManagerInterface';
import { anySignal } from './utils/anySignal';
import { timeoutSignal } from './utils/timeoutSignal';
import type { ClearableSignal } from 'any-signal';

/**
 * Extended configuration interface for ProxyAbortManager with timeout and external signal support
 *
 * Extends `AbortManagerConfig` to add support for timeout and external `AbortSignal` delegation.
 * This allows integration with existing abort mechanisms (e.g., browser fetch API,
 * axios, or custom abort systems) and automatic timeout handling.
 */
export interface ProxyAbortManagerConfig extends AbortManagerConfig {
  /**
   * Timeout duration in milliseconds for automatic abort
   *
   * When set, the operation will be automatically aborted after this duration.
   * This prevents hanging operations and ensures timely resource cleanup.
   *
   * Timeout behavior:
   * - Timer starts when operation begins
   * - Triggers `onAbortedTimeout` callback when expired
   * - Automatically cleans up controller and timer
   * - Does not affect operations that complete before timeout
   *
   * `@optional`
   * @default `undefined` (no timeout)
   * @example `5000` // 5 seconds timeout for quick operations
   * @example `30000` // 30 seconds timeout for API requests
   * @example `60000` // 1 minute timeout for file uploads
   */
  abortTimeout?: number;

  /**
   * Callback triggered when operation times out via `abortTimeout`
   *
   * Only invoked when the timeout expires and aborts the operation.
   * NOT triggered by manual abort or external signal abort.
   *
   * Use cases:
   * - Show timeout-specific error messages
   * - Log timeout events for monitoring
   * - Retry logic for timed-out operations
   * - Cleanup timeout-specific resources
   *
   * `@optional`
   * @example Basic usage
   * ```typescript
   * onAbortedTimeout: (config) => {
   *   console.error(`Operation ${config.abortId} timed out after ${config.abortTimeout}ms`);
   *   showTimeoutNotification();
   * }
   * ```
   * @example With retry logic
   * ```typescript
   * onAbortedTimeout: (config) => {
   *   logger.warn(`Timeout: ${config.abortId}`);
   *   retryOperation(config);
   * }
   * ```
   */
  onAbortedTimeout?<T extends ProxyAbortManagerConfig>(config: T): void;

  /**
   * External `AbortSignal` for request cancellation
   *
   * When provided, the pool will combine this signal with the pool-managed controller signal.
   * If any signal (pool or external) aborts, the operation will be cancelled.
   *
   * This enables parent-child abort relationships where:
   * - External signal abort → cancels pool operation
   * - Pool abort → cancels pool operation (but not external signal)
   *
   * `@optional`
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | AbortSignal MDN}
   * @example
   * ```typescript
   * const parentController = new AbortController();
   * const config = { signal: parentController.signal };
   * // Later: parentController.abort() will cancel the operation
   * ```
   */
  signal?: AbortSignal;
}

/**
 * Proxy abort pool that extends AbortManager with timeout and external signal support
 *
 * `ProxyAbortManager` wraps `AbortManager` and adds support for timeout and external `AbortSignal` delegation.
 * It combines manager-managed signals with timeout and external signals, allowing comprehensive abort control.
 *
 * Key differences from `AbortManager`:
 * - Supports `abortTimeout` parameter for automatic timeout handling
 * - Supports `signal` parameter for external signal delegation
 * - Combines all signals (manager + timeout + external) using `anySignal`
 * - External signal abort → cancels manager operation (one-way sync)
 * - Timeout abort → cancels manager operation and invokes `onAbortedTimeout` callback
 * - Manager abort → cancels manager operation (but not external signal)
 *
 * Architecture:
 * Extends `AbortManager` to inherit core controller management functionality, while adding
 * signal combination logic on top. This keeps the codebase clean and maintainable.
 * `AbortManager` focuses solely on controller management, while `ProxyAbortManager` extends
 * it to handle timeout and external signal combination logic.
 *
 * @since 2.6.0
 * @template T - Configuration type extending `ProxyAbortManagerConfig`
 *
 * @example Basic usage with external signal
 * ```typescript
 * const parentController = new AbortController();
 * const proxyPool = new ProxyAbortManager('ProxyPool');
 *
 * const { abortId, signal } = proxyPool.register({
 *   abortId: 'child-operation',
 *   signal: parentController.signal
 * });
 *
 * fetch('/api/data', { signal })
 *   .finally(() => proxyPool.cleanup(abortId));
 *
 * // Both can cancel:
 * proxyPool.abort('child-operation');  // ✅ Pool can cancel
 * parentController.abort();            // ✅ Parent can cancel
 * ```
 *
 * @example With timeout and external signal
 * ```typescript
 * const parentController = new AbortController();
 * const proxyPool = new ProxyAbortManager('ProxyPool');
 *
 * const { abortId, signal } = proxyPool.register({
 *   abortId: 'complex-op',
 *   signal: parentController.signal,
 *   abortTimeout: 10000,
 *   onAbortedTimeout: (config) => {
 *     console.log('Timed out after 10s');
 *   }
 * });
 *
 * // Any of these will cancel:
 * // 1. proxyPool.abort('complex-op')
 * // 2. parentController.abort()
 * // 3. 10s timeout
 * ```
 */
export class ProxyAbortManager<
  T extends ProxyAbortManagerConfig = ProxyAbortManagerConfig
> extends AbortManager<AbortManagerConfig> {
  /**
   * Creates a new `ProxyAbortManager` instance
   *
   * @param poolName - Name of the pool for identification and debugging
   *
   * @example Minimal setup
   * ```typescript
   * const proxyPool = new ProxyAbortManager('ProxyPool');
   * ```
   */
  constructor(
    /**
     * Unique name identifying this pool instance
     *
     * @readonly
     */
    public readonly poolName: string = 'ProxyAbortManager'
  ) {
    super(poolName);
  }

  /**
   * @param config - Configuration object with `abortId`, `abortTimeout`, `signal`, `onAborted`, `onAbortedTimeout`
   * @returns Object containing the operation ID and `AbortSignal` for the operation
   * @example Basic usage
   * ```typescript
   * const proxyPool = new ProxyAbortManager('ProxyPool');
   * const { abortId, signal } = proxyPool.register({ abortId: 'fetch-users' });
   * ```
   */
  public override register(config: T): {
    abortId: AbortManagerId;
    signal: AbortSignal;
  } {
    const { abortId, signal: poolSignal } = super.register(config);

    const { allSignals, cleanupCallbacks } = this.collectSignals(
      config,
      poolSignal
    );

    const combinedSignal =
      allSignals.length > 1 ? anySignal(allSignals) : poolSignal;

    if (combinedSignal !== poolSignal) {
      this.setupAbortListener(
        config,
        abortId,
        combinedSignal,
        cleanupCallbacks
      );
    }

    this.setupCleanupCallbacks(abortId, cleanupCallbacks);

    if (config.signal?.aborted) {
      this.cleanup(abortId);
    }

    return { abortId, signal: combinedSignal };
  }

  /**
   * Collects all signals (pool + timeout + external) and their cleanup callbacks
   *
   * @protected
   */
  protected collectSignals(
    config: T,
    poolSignal: AbortSignal
  ): {
    allSignals: AbortSignal[];
    cleanupCallbacks: Array<() => void>;
  } {
    const allSignals: AbortSignal[] = [poolSignal];
    const cleanupCallbacks: Array<() => void> = [];

    const timeoutSig = this.createTimeoutSignal(config, cleanupCallbacks);
    if (timeoutSig) {
      allSignals.push(timeoutSig);
    }

    if (config.signal) {
      allSignals.push(config.signal);
    }

    return { allSignals, cleanupCallbacks };
  }

  /**
   * Creates timeout signal if configured
   *
   * @protected
   */
  protected createTimeoutSignal(
    config: T,
    cleanupCallbacks: Array<() => void>
  ): AbortSignal | ClearableSignal | undefined {
    if (!Number.isInteger(config.abortTimeout) || config.abortTimeout! <= 0) {
      return undefined;
    }

    const timeoutSig = timeoutSignal(config.abortTimeout!);

    if (
      typeof timeoutSig === 'object' &&
      'clear' in timeoutSig &&
      typeof timeoutSig.clear === 'function'
    ) {
      cleanupCallbacks.push(timeoutSig.clear.bind(timeoutSig));
    }

    return timeoutSig;
  }

  /**
   * Sets up abort listener for combined signal
   *
   * @protected
   */
  protected setupAbortListener(
    config: T,
    abortId: AbortManagerId,
    combinedSignal: AbortSignal,
    cleanupCallbacks: Array<() => void>
  ): void {
    const abortListener = () => {
      if (!this.getSignal(abortId)) {
        return;
      }

      const reason = combinedSignal.reason;

      if (
        reason?.name === 'TimeoutError' ||
        reason?.message?.includes('timed out')
      ) {
        this.invokeTimeoutCallback(config);
      }

      // Note: We don't call onAborted for external signal abort
      // (only for manual pool.abort() calls)
      this.cleanup(abortId);
    };

    combinedSignal.addEventListener('abort', abortListener, { once: true });

    cleanupCallbacks.push(() => {
      combinedSignal.removeEventListener('abort', abortListener);
    });

    if (
      typeof combinedSignal === 'object' &&
      'clear' in combinedSignal &&
      typeof (combinedSignal as ClearableSignal).clear === 'function'
    ) {
      cleanupCallbacks.push(
        (combinedSignal as ClearableSignal).clear.bind(combinedSignal)
      );
    }
  }

  /**
   * Invokes timeout callback if provided
   *
   * @protected
   */
  protected invokeTimeoutCallback(config: T): void {
    if (typeof config.onAbortedTimeout === 'function') {
      try {
        config.onAbortedTimeout({
          ...config,
          onAborted: undefined,
          onAbortedTimeout: undefined
        });
      } catch {
        // Ignore callback errors
      }
    }
  }

  /**
   * Sets up cleanup callbacks in wrapper
   *
   * @protected
   */
  protected setupCleanupCallbacks(
    abortId: AbortManagerId,
    cleanupCallbacks: Array<() => void>
  ): void {
    if (cleanupCallbacks.length === 0) {
      return;
    }

    const wrapper = this.wrappers.get(abortId);
    if (wrapper) {
      wrapper.cleanup = () => {
        cleanupCallbacks.forEach((cb) => cb());
      };
    }
  }
}
