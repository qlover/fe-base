export interface AutoCleanupFinalizer {
  /**
   * Call signature: `finalizer(fn)` is equivalent to `finalizer.add(fn)`.
   */
  (fn: AutoCleanupCleanupFn): void;

  /**
   * Add a cleanup callback. Multiple callbacks are supported and executed in LIFO order.
   * Cleanup callbacks are executed at most once.
   */
  add(fn: AutoCleanupCleanupFn): void;

  /**
   * Alias of `add`.
   */
  addCleanup(fn: AutoCleanupCleanupFn): void;
}

export type AutoCleanupCleanupFn = () => void;

interface AutoCleanupFinalizerState {
  ran: boolean;
  stack: AutoCleanupCleanupFn[];
}

/**
 * A lightweight utility to attach one or more cleanup callbacks to a Promise-like workflow.
 *
 * Design goals:
 * - Return a **native Promise** (do not extend Promise) for maximum compatibility.
 * - Support multiple cleanup callbacks (LIFO order).
 * - Ensure cleanup is executed **at most once** (idempotent).
 * - Swallow cleanup errors (cleanup should not change the main promise outcome).
 *
 * This utility is intentionally independent of AbortPool. You can integrate it with
 * AbortPool by registering `pool.cleanup(abortId)` as a finalizer.
 */
export class AutoCleanupPromise {
  /**
   * Runs a factory which can return a value or Promise-like, and guarantees all registered
   * cleanup callbacks are executed when the returned promise settles.
   */
  public static run<T>(
    factory: (finalizer: AutoCleanupFinalizer) => PromiseLike<T> | T
  ): Promise<T> {
    const state = AutoCleanupPromise.createFinalizerState();
    const finalizer = AutoCleanupPromise.createFinalizer(state);

    let result: PromiseLike<T> | T;
    try {
      result = factory(finalizer);
    } catch (err) {
      AutoCleanupPromise.runCleanupOnce(state);
      return Promise.reject(err);
    }

    return Promise.resolve(result).finally(() => {
      AutoCleanupPromise.runCleanupOnce(state);
    });
  }

  /**
   * Runs a Promise-constructor-style executor and guarantees all registered cleanup callbacks
   * are executed when the returned promise settles.
   */
  public static fromExecutor<T>(
    executor: (
      resolve: (value: T | PromiseLike<T>) => void,
      reject: (reason?: unknown) => void,
      finalizer: AutoCleanupFinalizer
    ) => void
  ): Promise<T> {
    const state = AutoCleanupPromise.createFinalizerState();
    const finalizer = AutoCleanupPromise.createFinalizer(state);

    const p = new Promise<T>((resolve, reject) => {
      try {
        executor(resolve, reject, finalizer);
      } catch (err) {
        reject(err);
      }
    });

    return p.finally(() => {
      AutoCleanupPromise.runCleanupOnce(state);
    });
  }

  private static createFinalizerState(): AutoCleanupFinalizerState {
    return {
      ran: false,
      stack: []
    };
  }

  private static createFinalizer(
    state: AutoCleanupFinalizerState
  ): AutoCleanupFinalizer {
    const add = (fn: AutoCleanupCleanupFn) => {
      if (typeof fn !== 'function') return;

      // If cleanup has already run, execute immediately to avoid leaks.
      if (state.ran) {
        try {
          fn();
        } catch {
          // swallow
        }
        return;
      }

      state.stack.push(fn);
    };

    // Make finalizer callable: finalizer(fn)
    const finalizer = ((fn: AutoCleanupCleanupFn) => {
      add(fn);
    }) as AutoCleanupFinalizer;

    // Also expose explicit methods for discoverability / style preference
    finalizer.add = add;
    finalizer.addCleanup = add;

    return finalizer;
  }

  private static runCleanupOnce(state: AutoCleanupFinalizerState): void {
    if (state.ran) return;
    state.ran = true;

    // LIFO execution
    while (state.stack.length > 0) {
      const fn = state.stack.pop();
      if (!fn) continue;
      try {
        fn();
      } catch {
        // swallow
      }
    }
  }
}
