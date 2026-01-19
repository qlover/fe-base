import {
  type ExecutorPluginInterface
} from '../interface/ExecutorInterface';
import type { ExecutorContextInterface } from '../interface/ExecutorContextInterface';
import { type HookRuntimes } from '../interface';

/**
 * Private storage for runtime state
 *
 * Why WeakMap?
 * - Provides true runtime privacy (cannot access from outside the module)
 * - Automatic garbage collection (when context is GC'd, runtime state is too)
 * - No memory leaks
 * - Better than static property (shared across all instances safely)
 *
 * Why not export?
 * - Not exported = truly private to this module
 * - External code cannot access even with `context._runtimesStorage`
 * - Module-level privacy
 *
 * Generic support:
 * - Stores any type that extends HookRuntimes
 * - Allows custom runtime properties
 * - Type-safe at compile time
 */
const runtimesStorage = new WeakMap<
  ExecutorContextImpl<unknown, unknown, HookRuntimes>,
  HookRuntimes
>();

/**
 * Base implementation of ExecutorContextInterface that integrates ContextHandler functionality
 *
 * ## Core Concept
 * Provides a complete implementation of the executor context interface, integrating
 * all context management functionality that was previously handled by ContextHandler.
 * This eliminates the need for a separate ContextHandler class and centralizes
 * all context-related operations in a single class.
 *
 * Key Differences from Original Implementation:
 *
 * No Separate ContextHandler:
 * - Integrated Functionality: All ContextHandler methods integrated into context
 *   - Original: Separate ContextHandler class managed context state
 *   - New: All functionality in ExecutorContextImpl
 *   - Benefits: Simpler API, fewer dependencies, clearer ownership
 *
 * - Direct Method Access: All methods available directly on context
 *   - No need to pass context to handler methods
 *   - More intuitive API
 *   - Better encapsulation
 *
 * Parameter Handling (Reference-Based):
 * - **No Cloning**: Parameters are stored by reference, not cloned
 *   - Original: Parameters were cloned automatically
 *   - New: Parameters are used directly (zero overhead)
 *   - Benefits: Better performance, user control, predictable behavior
 *
 * - **User Responsibility**: Users must clone parameters if isolation is needed
 *   - If you need isolation: `new ExecutorContextImpl({ ...params })`
 *   - If you don't need isolation: `new ExecutorContextImpl(params)`
 *   - Trade-off: More control vs. more responsibility
 *
 * - **Performance**: Zero cloning overhead
 *   - No Object.assign or spread operations
 *   - No memory allocation for parameter copies
 *   - Ideal for high-performance scenarios
 *
 * Enhanced Runtime Tracking:
 * - Integrated Tracking: All runtime tracking in context
 *   - Plugin execution metadata
 *   - Hook execution tracking
 *   - Chain breaking state
 *   - Return value tracking
 *
 * - Better Debugging: Comprehensive runtime information
 *   - Track which plugins executed
 *   - Track execution order
 *   - Track return values
 *   - Track chain breaking conditions
 *
 * Improved API Design:
 * - Consistent Naming: All methods follow consistent naming conventions
 * - Type Safety: Strong typing throughout
 * - Clear Responsibilities: Each method has a single, clear purpose
 * - Better Documentation: Comprehensive JSDoc comments
 *
 * Main Features:
 * - Context state management: Manages parameters, error, and return value
 * - Plugin runtime tracking: Tracks plugin execution metadata
 * - Chain control: Manages execution chain breaking conditions
 * - Error handling: Context error state management
 * - Hook validation: Checks plugin hook availability and enablement
 * - Reference-based parameters: No automatic cloning (user control)
 * - High performance: Zero overhead parameter handling
 *
 * Parameter Handling (Important):
 *
 * **No Automatic Cloning**:
 * - Parameters are stored by reference
 * - Modifications affect the original object
 * - Users must clone parameters themselves if isolation is needed
 *
 * **Usage Examples**:
 * ```typescript
 * // Without isolation (parameters will be modified)
 * const params = { userId: 123, data: 'test' };
 * const context = new ExecutorContextImpl(params);
 * context.setParameters({ userId: 456 });
 * console.log(params.userId); // 456 - original modified
 *
 * // With isolation (clone parameters first)
 * const params = { userId: 123, data: 'test' };
 * const context = new ExecutorContextImpl({ ...params }); // shallow clone
 * context.setParameters({ userId: 456 });
 * console.log(params.userId); // 123 - original unchanged
 * ```
 *
 * **Performance**:
 * - Constructor: Zero overhead (no cloning)
 * - Getter: Direct return (zero overhead)
 * - setParameters: Zero overhead (no cloning)
 *
 * Design Considerations:
 * - Integrates ContextHandler functionality directly into the context
 * - Provides all methods needed for executor plugin lifecycle management
 * - Maintains backward compatibility with existing ExecutorContext interface
 * - Eliminates the need for separate ContextHandler instance
 * - Delegates parameter isolation responsibility to users
 * - Optimized for maximum performance with zero-overhead parameter handling
 *
 * @since 3.0.0
 * @template T - Type of context parameters
 *
 * @example Basic usage
 * ```typescript
 * const context = new ExecutorContextImpl({ userId: 123, data: 'test' });
 *
 * // Use context methods directly
 * context.setReturnValue('result');
 * context.runtimes(plugin, 'onBefore', 0);
 * if (context.shouldBreakChain()) {
 *   // Handle chain breaking
 * }
 * ```
 *
 * @example Parameter isolation
 * ```typescript
 * const originalParams = { value: 'original' };
 * const context = new ExecutorContextImpl(originalParams);
 *
 * // Parameters are cloned - modifications don't affect original
 * const params = context.parameters;
 * params.value = 'modified';
 * expect(originalParams.value).toBe('original'); // Original unchanged
 * ```
 *
 * @example With error handling
 * ```typescript
 * const context = new ExecutorContextImpl(data);
 *
 * try {
 *   // Execute some operation
 * } catch (error) {
 *   context.setError(new ExecutorError('ERROR_CODE', error));
 * }
 *
 * if (context.error) {
 *   // Handle error
 * }
 * ```
 *
 * @see ExecutorContextInterface - Interface that this class implements
 * @see LifecycleExecutor - Executor that uses this context implementation
 *
 * @category ExecutorContextImpl
 */
export class ExecutorContextImpl<
  T,
  R = unknown,
  RuntimesType extends HookRuntimes = HookRuntimes
> implements ExecutorContextInterface<T, R, RuntimesType> {
  private _parameters: T;
  private _error: unknown;
  private _returnValue?: R;

  /**
   * Creates a new ExecutorContextImpl instance
   *
   * **Important**: Parameters are stored by reference, not cloned.
   * If you need parameter isolation, clone them before passing to the constructor.
   *
   * @param parameters - The initial parameters for the context
   *
   * @example Without isolation (parameters will be modified)
   * ```typescript
   * const params = { value: 1 };
   * const context = new ExecutorContextImpl(params);
   * context.setParameters({ value: 2 });
   * console.log(params.value); // 2 - original object is modified
   * ```
   *
   * @example With isolation (clone parameters first)
   * ```typescript
   * const params = { value: 1 };
   * const context = new ExecutorContextImpl({ ...params }); // shallow clone
   * context.setParameters({ value: 2 });
   * console.log(params.value); // 1 - original object is unchanged
   * ```
   */
  constructor(parameters: T) {
    // Store parameters by reference - no cloning
    // Users should clone parameters themselves if isolation is needed
    this._parameters = parameters;

    // Initialize runtime state in module-private WeakMap
    runtimesStorage.set(this, {
      pluginName: '',
      pluginIndex: undefined,
      hookName: '',
      returnValue: undefined,
      returnBreakChain: false,
      times: 0,
      breakChain: false
    });
  }

  /**
   * Get the context parameters
   *
   * **Important**: Returns the parameters by reference.
   * Modifications to the returned object will affect the context's internal state.
   *
   * @override
   * @returns The parameters object (by reference)
   */
  public get parameters(): T {
    // Return the stored reference directly
    return this._parameters;
  }

  /**
   * Get the error, if any
   *
   * @override
   * @returns The error, if any
   */
  public get error(): unknown {
    return this._error;
  }

  /**
   * Get the return value, if any
   *
   * @override
   * @returns The return value, if any
   */
  public get returnValue(): R | undefined {
    return this._returnValue;
  }

  /**
   * Get read-only snapshot of hooks runtime information
   *
   * Core concept:
   * Provides safe read-only access to runtime tracking information.
   * Returns a frozen shallow copy to prevent accidental modifications.
   *
   * Security features:
   * - Stored in WeakMap, truly private (cannot access via ._hooksRuntimes)
   * - Returns a new frozen object (not the internal reference)
   * - Object is frozen to prevent modifications
   * - Setter throws error to prevent assignment
   *
   * Why WeakMap?
   * - TypeScript's `private` is only compile-time protection
   * - JavaScript runtime can still access `._hooksRuntimes`
   * - WeakMap provides true runtime privacy
   * - No way to access the internal state from outside
   *
   * @override
   * @returns Frozen shallow copy of hook runtime state
   *
   * @example Safe read access
   * ```typescript
   * const runtimes = context.hooksRuntimes;
   * console.log(`Hook ${runtimes.hookName} executed ${runtimes.times} times`);
   * ```
   *
   * @example Modification attempts fail
   * ```typescript
   * const runtimes = context.hooksRuntimes;
   * runtimes.times = 10; // Error: Cannot assign to read only property
   * context.hooksRuntimes = {}; // Error: hooksRuntimes is read-only
   * context._hooksRuntimes; // undefined - truly private!
   * ```
   */
  public get hooksRuntimes(): Readonly<RuntimesType> {
    const runtimes = runtimesStorage.get(this);
    if (!runtimes) {
      throw new Error('Runtime state not initialized');
    }
    return Object.freeze({ ...runtimes }) as Readonly<RuntimesType>;
  }

  /**
   * Set error in context
   *
   * Automatically converts standard Error objects to ExecutorError for consistency.
   * If the error is already an ExecutorError, it is stored as-is.
   * If the error is a standard Error, it is wrapped in an ExecutorError with id 'EXECUTOR_ERROR'.
   *
   * @override
   * @param error - The error to set in context (ExecutorError or standard Error)
   *
   * @example With ExecutorError
   * ```typescript
   * context.setError(new ExecutorError('VALIDATION_ERROR', 'Invalid input'));
   * console.log(context.error.id); // 'VALIDATION_ERROR'
   * ```
   *
   * @example With standard Error (auto-converted)
   * ```typescript
   * try {
   *   JSON.parse('invalid');
   * } catch (error) {
   *   context.setError(error); // Auto-converted to ExecutorError
   *   console.log(context.error.id); // 'EXECUTOR_ERROR'
   *   console.log(context.error.cause); // Original SyntaxError
   * }
   * ```
   */
  public setError(error: unknown): void {
    this._error = error;
  }

  /**
   * Set return value in context
   *
   * @override
   * @param value - The value to set as return value
   */
  public setReturnValue(value: R): void {
    this._returnValue = value;
  }

  /**
   * Set parameters in context
   *
   * **Important**: Parameters are stored by reference, not cloned.
   * The provided parameters object will be used directly.
   *
   * @override
   * @param params - The parameters to set (stored by reference)
   *
   * @example
   * ```typescript
   * const newParams = { value: 2 };
   * context.setParameters(newParams);
   * // context.parameters === newParams (same reference)
   * ```
   */
  public setParameters(params: T): void {
    // Store parameters by reference - no cloning
    this._parameters = params;
  }

  /**
   * Reset hooks runtime state to initial values
   *
   * Core concept:
   * Clears all runtime tracking information for fresh execution
   *
   * Reset operations:
   * - Clears plugin name and hook name
   * - Resets return value and chain breaking flags
   * - Resets execution counter and index
   *
   * @override
   */
  public resetHooksRuntimes(hookName?: string): void {
    const runtimes = runtimesStorage.get(this);
    if (!runtimes) {
      throw new Error('Runtime state not initialized');
    }

    if (hookName) {
      // Partial reset: only reset hook-specific state
      runtimesStorage.set(this, {
        ...runtimes,
        hookName,
        times: 0,
        returnValue: undefined
      });
      return;
    }

    // Full reset: reset all state
    runtimesStorage.set(this, {
      pluginName: '',
      pluginIndex: undefined,
      hookName: '',
      returnValue: undefined,
      returnBreakChain: false,
      times: 0,
      breakChain: false
    });
  }

  /**
   * Reset entire context to initial state
   *
   * Core concept:
   * Complete context cleanup for new execution cycle
   *
   * Reset operations:
   * - Resets hooks runtime state
   * - Clears return value
   * - Clears error state
   *
   * @override
   */
  public reset(): void {
    this.resetHooksRuntimes();
    this._returnValue = undefined;
    this._error = undefined;
  }

  /**
   * Check if a plugin hook should be skipped
   * Returns true if the hook should be skipped (invalid or disabled)
   *
   * Core concept:
   * Plugin hook validation and enablement checking
   *
   * Validation criteria:
   * - Hook method exists and is callable
   * - Plugin is enabled for the specific hook
   * - Plugin enablement function returns true
   *
   * @override
   * @template Ctx - Type of task context
   * @param plugin - The plugin to check
   * @param hookName - The name of the hook to validate
   * @returns True if the hook should be skipped, false otherwise
   */
  public shouldSkipPluginHook<
    Ctx extends ExecutorContextInterface<unknown, unknown>
  >(plugin: ExecutorPluginInterface<Ctx>, hookName: string): boolean {
    return (
      typeof plugin[hookName as keyof ExecutorPluginInterface<Ctx>] !==
      'function' ||
      (typeof plugin.enabled === 'function' &&
        !plugin.enabled(hookName, this as unknown as Ctx))
    );
  }

  /**
   * Update runtime tracking information for plugin execution
   *
   * Core concept:
   * Track plugin execution metadata for debugging and flow control.
   * Creates a new runtime object with merged updates to ensure immutability.
   *
   * Security:
   * - Always creates a new object (immutable updates)
   * - Stored in WeakMap (truly private)
   * - Cannot be accessed or modified from outside
   *
   * Tracking information:
   * - Current plugin name
   * - Current hook name
   * - Execution counter (times)
   * - Plugin index in execution chain
   *
   * @override
   * @param updates - Partial runtime updates to merge
   * @example
   * ```typescript
   * context.runtimes({
   *   pluginName: 'testPlugin',
   *   hookName: 'onBefore',
   *   times: 1,
   *   pluginIndex: 0
   * });
   * ```
   */
  public runtimes(updates: Partial<HookRuntimes>): void {
    const current = runtimesStorage.get(this);
    if (!current) {
      throw new Error('Runtime state not initialized');
    }

    // Create new object with merged updates (immutable update)
    runtimesStorage.set(this, {
      ...current,
      ...updates
    });
  }

  /**
   * Set return value in context runtime tracking
   *
   * Core concept:
   * Store plugin hook return value for chain control and debugging.
   * Creates a new runtime object with updated return value.
   *
   * Security:
   * - Creates new object (immutable update)
   * - Stored in WeakMap (truly private)
   *
   * Usage scenarios:
   * - Track plugin hook return values
   * - Enable chain breaking based on return values
   * - Debug plugin execution flow
   *
   * @override
   * @param returnValue - The value to set as return value
   */
  public runtimeReturnValue(returnValue: unknown): void {
    const current = runtimesStorage.get(this);
    if (!current) {
      throw new Error('Runtime state not initialized');
    }

    // Create new object with updated return value (immutable update)
    runtimesStorage.set(this, {
      ...current,
      returnValue
    });
  }

  /**
   * Check if the execution chain should be broken
   *
   * Core concept:
   * Chain breaking control for plugin execution flow
   *
   * Chain breaking scenarios:
   * - Plugin explicitly sets breakChain flag
   * - Error conditions requiring immediate termination
   * - Business logic requiring early exit
   *
   * @override
   * @returns True if the chain should be broken, false otherwise
   */
  public shouldBreakChain(): boolean {
    const runtimes = runtimesStorage.get(this);
    return !!runtimes?.breakChain;
  }

  /**
   * Check if the execution chain should be broken due to return value
   *
   * Core concept:
   * Return value-based chain breaking control
   *
   * Usage scenarios:
   * - Plugin returns a value that should terminate execution
   * - Error handling hooks return error objects
   * - Business logic requires return value-based flow control
   *
   * @override
   * @returns True if the chain should be broken due to return value, false otherwise
   */
  public shouldBreakChainOnReturn(): boolean {
    const runtimes = runtimesStorage.get(this);
    return !!runtimes?.returnBreakChain;
  }

  /**
   * Check if execution should continue on error
   *
   * Core concept:
   * Determines whether to continue executing subsequent plugins when a plugin hook
   * throws an error, enabling resilient execution pipelines
   *
   * @override
   * @returns True if execution should continue on error, false otherwise
   */
  public shouldContinueOnError(): boolean {
    const runtimes = runtimesStorage.get(this);
    return !!runtimes?.continueOnError;
  }
}
