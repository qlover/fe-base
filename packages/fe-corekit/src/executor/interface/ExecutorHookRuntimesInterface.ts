import {
  ExecutorPluginInterface,
  ExecutorContextInterface
} from './ExecutorInterface';

/**
 * Interface for runtime tracking of executor hooks
 *
 * @since 2.6.0
 */
export interface ExecutorHookRuntimesInterface {
  /**
   * Reset hooks runtime state to initial values
   *
   * Core concept:
   * Clears all runtime tracking information for fresh execution
   */
  resetHooksRuntimes(): void;

  /**
   * Reset entire context to initial state
   */
  reset(): void;

  /**
   * Check if a plugin hook should be skipped
   * @param plugin - The plugin to check
   * @param hookName - The name of the hook to validate
   * @returns True if the hook should be skipped, false otherwise
   */
  shouldSkipPluginHook<Ctx extends ExecutorContextInterface<unknown>>(
    plugin: ExecutorPluginInterface<Ctx>,
    hookName: string
  ): boolean;

  /**
   * Update runtime tracking information for plugin execution
   * @param plugin - The plugin being executed
   * @param hookName - The hook name being executed
   * @param index - The index of the plugin in the execution chain
   */
  runtimes<Ctx extends ExecutorContextInterface<unknown>>(
    plugin: ExecutorPluginInterface<Ctx>,
    hookName: string,
    index: number
  ): void;

  /**
   * Set return value in context runtime tracking
   * @param returnValue - The value to set as return value
   */
  runtimeReturnValue(returnValue: unknown): void;

  /**
   * Check if the execution chain should be broken
   * @returns True if the chain should be broken, false otherwise
   */
  shouldBreakChain(): boolean;

  /**
   * Check if the execution chain should be broken due to return value
   * @returns True if the chain should be broken due to return value, false otherwise
   */
  shouldBreakChainOnReturn(): boolean;
}
