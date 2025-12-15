import {
  ExecutorContext,
  ExecutorError,
  ExecutorPlugin
} from '@qlover/fe-corekit';
import { GatewayExecutorOptions } from './GatewayExecutor';
import { FirstUppercaseType } from '../utils/firstUppercase';

/**
 * Generate hook name type for a specific action
 * e.g., 'login' -> 'onLoginBefore' | 'onLoginSuccess'
 */
type ActionHookName<Action extends string> =
  | `on${FirstUppercaseType<Action>}Before`
  | `on${FirstUppercaseType<Action>}Success`;

/**
 * Generate hook name types for multiple actions
 * e.g., ['login', 'logout'] -> 'onLoginBefore' | 'onLoginSuccess' | 'onLogoutBefore' | 'onLogoutSuccess' | ...
 */
type ActionHookNames<Actions extends readonly string[]> = {
  [K in keyof Actions]: Actions[K] extends string
    ? ActionHookName<Actions[K]>
    : never;
}[number];

/**
 * Gateway base plugin type
 *
 * - Significance: Generates type-safe hook methods for gateway action plugins
 * - Core idea: Create hook method types based on action names (e.g., `onLoginBefore`, `onLogoutSuccess`)
 * - Main function: Provide type-safe plugin interface for specific gateway actions
 * - Main purpose: Enable IntelliSense and type checking for action-specific hooks
 *
 * Core features:
 * - Single action: Generates hooks for one action (e.g., `onLoginBefore`, `onLoginSuccess`)
 * - Multiple actions: Generates hooks for multiple actions (e.g., `onLoginBefore`, `onLogoutBefore`)
 * - Type-safe hooks: Each hook receives properly typed context
 * - Partial interface: All hooks are optional, allowing selective implementation
 *
 * Design decisions:
 * - Conditional types: Uses TypeScript conditional types to handle single vs multiple actions
 * - Hook naming convention: `on{Action}{Before|Success}` (e.g., `onLoginBefore`)
 * - Context type: Uses `ExecutorContext<GatewayExecutorOptions>` for consistent context
 * - Return type: Hooks can return `Promise<void>` or `void`
 *
 * @template Action - Single action name (string) or array of action names
 * @template Params - The type of parameters for executing the gateway method
 * @template T - The type of data stored in the async store
 * @template Gateway - The type of gateway object
 *
 * @example Single action plugin
 * ```typescript
 * type LoginPlugin = GatewayBasePluginType<'login', LoginParams, Credential, Gateway>;
 *
 * const plugin: LoginPlugin = {
 *   onLoginBefore: async (context) => {
 *     // Called before login action
 *   },
 *   onLoginSuccess: async (context) => {
 *     // Called after login succeeds
 *   }
 * };
 * ```
 *
 * @example Multiple actions plugin
 * ```typescript
 * type UserPlugin = GatewayBasePluginType<
 *   ['login', 'logout'],
 *   unknown,
 *   Credential,
 *   Gateway
 * >;
 *
 * const plugin: UserPlugin = {
 *   onLoginBefore: async (context) => {
 *     // Called before login
 *   },
 *   onLoginSuccess: async (context) => {
 *     // Called after login succeeds
 *   },
 *   onLogoutBefore: async (context) => {
 *     // Called before logout
 *   },
 *   onLogoutSuccess: async (context) => {
 *     // Called after logout succeeds
 *   }
 * };
 * ```
 */
export type GatewayBasePluginType<
  Action extends readonly string[],
  T,
  Gateway
> = Partial<{
  [K in ActionHookNames<Action>]: (
    context: ExecutorContext<GatewayExecutorOptions<T, Gateway, unknown>>
  ) => Promise<void> | void;
}>;

/**
 * Base plugin for gateway actions
 *
 * A foundational plugin that provides automatic state management for gateway service actions. This plugin
 * handles the essential state transitions (loading, success, failed) during action execution, eliminating
 * the need for boilerplate state management code in services. It serves as the base implementation that
 * can be extended or replaced with custom logic while maintaining consistent state handling patterns.
 *
 * This is a basic gateway service plugin that only provides the basic gateway service plugin functionality
 *
 * - onBefore: Execute the store to start before executing the action
 * - onSuccess: Execute the store to success after executing the action successfully
 * - onError: Execute the store to failed after executing the action failed
 *
 * If you need to extend the functionality, you can render it or implement it separately
 *
 * - Significance: Provides automatic state management for gateway service actions
 * - Core idea: Automatically update store state during action execution lifecycle
 * - Main function: Handle store state transitions (start, success, failed) automatically
 * - Main purpose: Eliminate boilerplate state management code in services
 *
 * Core features:
 * - Automatic state management: Updates store state at each execution stage
 * - Before hook: Sets store to loading state (`store.start()`)
 * - Success hook: Sets store to success state with result (`store.success(result)`)
 * - Error hook: Sets store to failed state with error (`store.failed(error)`)
 * - Null result validation: Throws error if result is null on success
 * - Logging support: Logs success events with duration if logger is provided
 *
 * Design decisions:
 * - Base plugin: Should be used as foundation for all gateway services
 * - Extensible: Can be extended or replaced with custom implementations
 * - Null safety: Validates result is not null before updating store
 * - Error handling: Always updates store state even on errors for consistency
 *
 * @template Params - The type of parameters for executing the gateway method
 * @template T - The type of data stored in the async store
 * @template Gateway - The type of gateway object
 *
 * @example Extend plugin
 *
 * ```typescript
 * class MyGatewayPlugin extends GatewayBasePlguin<Params, T, Gateway> {
 *   readonly pluginName = 'MyGatewayPlugin';
 *
 *   async onBefore(
 *     context: ExecutorContext<GatewayExecutorOptions<T, Gateway, Params>>
 *   ): Promise<void> {
 *
 *     // your code here
 *   }
 * }
 * ```
 *
 * @example Implement plugin separately
 *
 * ```typescript
 * class MyGatewayPlugin implements ExecutorPlugin<GatewayExecutorOptions<T, Gateway, Params>> {
 *   readonly pluginName = 'MyGatewayPlugin';
 *
 *   async onBefore(
 *     context: ExecutorContext<GatewayExecutorOptions<T, Gateway, Params>>
 *   ): Promise<void> {
 *     // your code here
 *   }
 *
 *   async onSuccess(
 *     context: ExecutorContext<GatewayExecutorOptions<T, Gateway, Params>>
 *   ): Promise<void> {
 *     // your code here
 *   }
 *
 *   async onError(
 *     context: ExecutorContext<GatewayExecutorOptions<T, Gateway, Params>>
 *   ): Promise<void> {
 *     // your code here
 *   }
 * }
 * ```
 */
export class GatewayBasePlguin<Params, T, Gateway>
  implements ExecutorPlugin<GatewayExecutorOptions<T, Gateway, Params>>
{
  public readonly pluginName = 'GatewayBasePlguin';

  /**
   * Before action hook
   *
   * Sets the store to loading state before action execution.
   * This is called automatically by the executor before the gateway method runs.
   *
   * @override
   * @param context - The executor context containing store and action parameters
   *
   * @example Override for custom behavior
   * ```typescript
   * async onBefore(context: ExecutorContext<GatewayExecutorOptions<Params, T, Gateway>>): Promise<void> {
   *   await super.onBefore(context);
   *   // Add custom before logic
   * }
   * ```
   */
  public async onBefore(
    context: ExecutorContext<GatewayExecutorOptions<T, Gateway, Params>>
  ): Promise<void> {
    const store = context.parameters.store;

    store?.start();
  }

  /**
   * Success action hook
   *
   * Updates the store to success state with the action result.
   * Validates that the result is not null and logs success if logger is available.
   *
   * Behavior:
   * - Validates result is not null (throws `ExecutorError` if null)
   * - Updates store with result (`store.success(result)`)
   * - Logs success event with duration if logger is provided
   *
   * @override
   * @param context - The executor context containing return value, store, and action parameters
   * @throws {ExecutorError} If result is null (error code: 'SERVICE_RESULT_NULL')
   *
   * @example Override for custom behavior
   * ```typescript
   * async onSuccess(context: ExecutorContext<GatewayExecutorOptions<T, Gateway, Params>>): Promise<void> {
   *   await super.onSuccess(context);
   *   // Add custom success logic
   * }
   * ```
   */
  public async onSuccess(
    context: ExecutorContext<GatewayExecutorOptions<T, Gateway, Params>>
  ): Promise<void> {
    const { returnValue } = context;
    const { actionName, serviceName, logger, store } = context.parameters;

    if (returnValue == null) {
      throw new ExecutorError(
        'SERVICE_RESULT_NULL',
        `${serviceName.toString()}: ${String(actionName)} - Result is null`
      );
    }

    store?.success(returnValue as T);
    if (logger) {
      const ms = store?.getDuration();
      logger.debug(
        `${serviceName.toString()}: ${String(actionName)} - success(${ms}ms)`,
        returnValue
      );
    }
  }

  /**
   * Error action hook
   *
   * Updates the store to failed state with the error.
   * This is called automatically by the executor when an error occurs during action execution.
   *
   * @override
   * @param context - The executor context containing error and store
   *
   * @example Override for custom error handling
   * ```typescript
   * async onError(context: ExecutorContext<GatewayExecutorOptions<T, Gateway, Params>>): Promise<void> {
   *   await super.onError(context);
   *   // Add custom error handling logic
   *   console.error('Action failed:', context.error);
   * }
   * ```
   */
  public async onError(
    context: ExecutorContext<GatewayExecutorOptions<T, Gateway, Params>>
  ): Promise<void> {
    const error = context.error;
    const store = context.parameters.store;

    store?.failed(error);
  }
}
