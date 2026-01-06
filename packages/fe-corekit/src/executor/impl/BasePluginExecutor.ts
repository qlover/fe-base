import type {
  ExecutorContextInterface,
  ExecutorInterface,
  ExecutorPluginNameType,
  ExecutorTask,
  ExecutorPluginInterface
} from '../interface/ExecutorInterface';
import { ExecutorContextImpl } from './ExecutorContextImpl';
import { ExecutorError } from '../interface';
import {
  DEFAULT_HOOK_ON_BEFORE,
  DEFAULT_HOOK_ON_SUCCESS,
  DEFAULT_HOOK_ON_EXEC,
  DEFAULT_HOOK_ON_ERROR,
  DEFAULT_HOOK_ON_FINALLY
} from '../utils/constants';

/**
 * Base configuration for lifecycle executors
 */
export interface PluginExecutorConfig {
  /**
   * Hook names to execute before task execution
   *
   * These hooks are executed in the order they appear in the array.
   * Each hook can modify the input data or perform validation.
   *
   * @default `'onBefore'`
   * @example `['validate', 'transform']`
   * @example `'preProcess'`
   */
  beforeHooks?: ExecutorPluginNameType | ExecutorPluginNameType[];

  /**
   * Hook names to execute after successful task execution
   *
   * These hooks are executed in the order they appear in the array.
   * Each hook can process the result or perform cleanup operations.
   *
   * @default `'onSuccess'`
   * @example `['log', 'cleanup']`
   * @example `'postProcess'`
   */
  afterHooks?: ExecutorPluginNameType | ExecutorPluginNameType[];

  /**
   * Hook name for the main execution logic
   *
   * This hook contains the core business logic for task execution.
   * If not specified, the default `'onExec'` hook is used.
   *
   * @default `'onExec'`
   * @example `'process'`
   * @example `'execute'`
   */
  execHook?: ExecutorPluginNameType;
}

/**
 * Abstract base class for lifecycle executors
 *
 * Core Concept:
 * Provides common functionality for both sync and async lifecycle executors,
 * eliminating code duplication while maintaining type safety and flexibility.
 *
 * Design Pattern:
 * - Template Method Pattern: Defines the skeleton of the execution algorithm
 * - Strategy Pattern: Subclasses implement sync/async execution strategies
 *
 * Shared Functionality:
 * - Plugin management (use, validation, deduplication)
 * - Context creation
 * - Configuration management
 *
 * Subclass Responsibilities:
 * - Implement hook execution (sync vs async)
 * - Implement task execution (sync vs async)
 * - Implement error handling (sync vs async)
 *
 * Benefits:
 * - DRY: No code duplication between sync and async executors
 * - Consistency: Same plugin management logic for both
 * - Maintainability: Changes to common logic only need to be made once
 * - Type Safety: Generic constraints ensure type correctness
 *
 * @template Ctx - Type of executor context interface
 * @template Plugin - Type of plugin interface
 *
 * @since 2.6.0
 * @category BaseLifecycleExecutor
 */
export abstract class BasePluginExecutor<
  Ctx extends ExecutorContextInterface<unknown>,
  Plugin extends ExecutorPluginInterface<Ctx>
> implements ExecutorInterface<Plugin>
{
  /**
   * Array of active plugins for this executor
   * All plugins must be of type Plugin which extends ExecutorPluginInterface<Ctx>
   * Type safety is enforced at compile time through generic constraints
   */
  protected plugins: Plugin[] = [];

  constructor(
    /**
     * Configuration for this executor
     */
    protected readonly config?: PluginExecutorConfig
  ) {}

  /**
   * Add a plugin to the executor's execution pipeline
   *
   * Core concept:
   * Registers a plugin to participate in the executor's execution pipeline,
   * extending the executor's functionality with additional capabilities.
   * Plugin type is enforced at compile time through generic constraints.
   *
   * Main features:
   * - Plugin registration: Adds plugins to the execution pipeline
   * - Type safety: Only accepts plugins of type Plugin (enforced by generic constraint)
   * - Deduplication: Prevents duplicate plugins when `onlyOne` is true
   * - Order preservation: Maintains plugin execution order
   * - Validation: Ensures plugin is a valid object
   *
   * @override
   * @param plugin - Plugin instance of type Plugin to add to the execution pipeline
   *
   * @throws {Error} When plugin is not a valid object
   *
   * @example
   * ```typescript
   * const executor = new LifecycleExecutor2();
   * executor.use(new LogPlugin());
   * ```
   */
  public use(plugin: Plugin): void {
    this.validePlugin(plugin);

    this.plugins.push(plugin);
  }

  protected validePlugin(plugin: Plugin): void {
    // Security: Validate plugin input
    if (typeof plugin !== 'object' || plugin === null) {
      throw new Error('Plugin must be an object');
    }

    // Check for duplicate plugins if onlyOne is set
    if (plugin.onlyOne) {
      const isDuplicate = this.plugins.some(
        (p) =>
          p === plugin ||
          (p.pluginName &&
            plugin.pluginName &&
            p.pluginName === plugin.pluginName) ||
          p.constructor === plugin.constructor
      );

      if (isDuplicate) {
        const pluginName = plugin.pluginName || 'Unknown';
        throw new Error(`Plugin ${pluginName} is already used`);
      }
    }
  }

  /**
   * Create a new execution context instance
   *
   * Core concept:
   * Factory method for creating execution contexts. This allows subclasses
   * to override context creation behavior if needed.
   *
   * @template Params - Type of context parameters
   * @param parameters - The initial parameters for the context
   * @returns A new ExecutorContextImpl instance
   */
  protected createContext<Params>(
    parameters: Params
  ): ExecutorContextImpl<Params> {
    return new ExecutorContextImpl<Params>(parameters);
  }

  /**
   * Get configured beforeHooks or default
   */
  protected getBeforeHooks():
    | ExecutorPluginNameType
    | ExecutorPluginNameType[] {
    return this.config?.beforeHooks ?? DEFAULT_HOOK_ON_BEFORE;
  }

  /**
   * Get configured afterHooks or default
   */
  protected getAfterHooks(): ExecutorPluginNameType | ExecutorPluginNameType[] {
    return this.config?.afterHooks ?? DEFAULT_HOOK_ON_SUCCESS;
  }

  /**
   * Get configured execHook or default
   */
  protected getExecHook(): ExecutorPluginNameType {
    return this.config?.execHook ?? DEFAULT_HOOK_ON_EXEC;
  }

  /**
   * Get configured errorHook or default
   */
  protected getErrorHook(): ExecutorPluginNameType {
    return DEFAULT_HOOK_ON_ERROR;
  }

  /**
   * Get configured finallyHook or default
   */
  protected getFinallyHook(): ExecutorPluginNameType {
    return DEFAULT_HOOK_ON_FINALLY;
  }

  /**
   * Execute task with full plugin pipeline
   *
   * Abstract method that subclasses must implement.
   * Subclasses define whether execution is sync or async.
   *
   * @override
   * @template R - Type of task return value
   * @template P - Type of task input parameters
   * @param task - Task function to execute
   * @returns Task execution result (sync or async depending on implementation)
   */
  public abstract exec<R, P>(
    dataOrTask: P | ExecutorTask<R, P>,
    task?: ExecutorTask<R, P>
  ): R | Promise<R>;

  /**
   * Execute task without throwing errors
   *
   * Abstract method that subclasses must implement.
   * Subclasses define whether execution is sync or async.
   *
   * @override
   * @template R - Type of task return value
   * @template P - Type of task input parameters
   * @param task - Task function to execute
   * @returns Result or ExecutorError (sync or async depending on implementation)
   */
  public abstract execNoError<R, P>(
    dataOrTask: P | ExecutorTask<R, P>,
    task?: ExecutorTask<R, P>
  ): R | ExecutorError | Promise<R | ExecutorError>;
}
