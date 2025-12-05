import {
  AsyncExecutor,
  ExecutorContext,
  PromiseTask
} from '@qlover/fe-corekit';
import { firstUppercase } from '../utils';
import { ExecutorServiceOptions } from '../interface/base/ExecutorServiceInterface';

/**
 * Gateway executor options
 *
 * This is a module/class that provides the core functionality for executing gateway actions.
 * It extends the AsyncExecutor class and adds support for [action][before|success] hooks.
 * It allows plugins to execute [action][before|success] hook logic.
 * It also provides a way to handle errors through the onError hook.
 *
 * - Significance: Configuration options for executing gateway actions
 * - Core idea: Provide context and configuration for gateway action execution
 * - Main function: Pass execution context to plugins and gateway methods
 * - Main purpose: Enable plugins to access service state and modify execution behavior
 *
 * Core features:
 * - Action identification: Identifies which action is being executed
 * - Service identification: Identifies which service is executing the action
 * - Execution parameters: Provides parameters for the gateway method
 * - Read-only context: Most properties are read-only to ensure execution stability
 *
 * Design decisions:
 * - Read-only properties: Prevents plugins from modifying critical execution context
 * - Mutable params: Allows plugins to modify parameters before execution
 * - Extends base options: Inherits store, gateway, and logger configuration
 *
 * @template Params - The type of parameters for executing the gateway method
 * @template T - The type of data stored in the async store
 * @template Gateway - The type of gateway object
 *
 * @example Plugin usage
 * ```typescript
 * executor.use({
 *   onBefore: (context) => {
 *     console.log('Action:', context.parameters.actionName);
 *     console.log('Service:', context.parameters.serviceName);
 *     console.log('Params:', context.parameters.params);
 *   }
 * });
 * ```
 */
export interface GatewayExecutorOptions<Params, T, Gateway>
  extends Readonly<ExecutorServiceOptions<T, Gateway>> {
  /**
   * Parameters for executing gateway method
   *
   * The parameters to pass to the gateway method.
   * This is the only mutable property, allowing plugins to modify parameters before execution.
   *
   * @example Modify params in plugin
   * ```typescript
   * executor.use({
   *   onBefore: (context) => {
   *     // Modify params before execution
   *     context.parameters.params = {
   *       ...context.parameters.params,
   *       additionalField: 'value'
   *     };
   *   }
   * });
   * ```
   */
  params: Params;
}

/**
 * GatewayExecutor for executing gateway actions with plugin support
 *
 * Extends `AsyncExecutor` to provide enhanced gateway action execution with action-specific hook support.
 * This executor allows plugins to hook into specific actions (e.g., `onLoginBefore`, `onLogoutSuccess`)
 * in addition to general execution hooks. It maintains consistency in error handling while providing
 * flexible plugin integration for custom execution logic.
 *
 * - Allow plugins to execute [action][before|success] hook logic
 * - Plugins can define hooks like: onLoginBefore, onLoginSuccess
 * - Error handling is done through Executor's onError hook, users can define on[Action]Error hooks manually
 *
 * Extends `AsyncExecutor` and adds support for [action][before|success] hooks.
 *
 * For example, if you need to execute a hook before action=login, you have two options:
 *
 * 1. Use the `use` method to register a plugin and check for action=login in the onBefore hook
 *
 * @example
 * ```typescript
 * this.use({
 *   onBefore: (context) => {
 *    if (context.parameters.actionName === 'login') {
 *      // onLoginBefore hook logic
 *    }
 *   }
 * });
 * ```
 *
 * 2. Use the more granular onLoginBefore hook directly
 *
 * @example
 * ```typescript
 * this.use({
 *   onLoginBefore: (context) => {
 *    // onLoginBefore hook logic
 *   }
 * });
 * ```
 *
 * However, if both onBefore and onLoginBefore hooks exist, both will be executed, with onBefore executing before onLoginBefore.
 *
 * If you have multiple actions and need before hooks for all of them, you can do this:
 *
 * @example action=['login', 'logout']
 * ```typescript
 * this.use({
 *   onBefore: (context) => {
 *    if (context.parameters.actionName === 'login') {
 *      // onLoginBefore hook logic
 *    }
 *
 *    if (context.parameters.actionName === 'logout') {
 *      // onLogoutBefore hook logic
 *    }
 *   }
 * });
 *
 * // Or use the more granular onLoginBefore and onLogoutBefore hooks
 * this.use({
 *   onLoginBefore: (context) => {
 *    // onLoginBefore hook logic
 *   },
 *   onLogoutBefore: (context) => {
 *    // onLogoutBefore hook logic
 *   }
 * });
 * ```
 *
 * When an error occurs, there is no corresponding [action][error] hook provided. This is to maintain consistency in error handling,
 * because all errors in AsyncExecutor are caught by catch and handled by onError. We don't modify the normal error handling flow to avoid increasing complexity.
 *
 * If you need error handling for a specific action, you can handle it in the onError hook:
 *
 * @example
 * ```typescript
 * this.use({
 *   onError: (context) => {
 *    // onError hook logic
 *
 *    if (context.parameters.actionName === 'login') {
 *      // onLoginError hook logic
 *    }
 *    if (context.parameters.actionName === 'logout') {
 *      // onLogoutError hook logic
 *    }
 *   }
 * });
 */
export class GatewayExecutor<T, Gateway> extends AsyncExecutor {
  /**
   * Generate hook name for a specific action and type
   *
   * Converts an action name and hook type into a hook method name.
   * Follows the naming convention: `on{Action}{Type}` (e.g., `onLoginBefore`, `onLogoutSuccess`).
   *
   * @param action - The action name (e.g., 'login', 'logout')
   * @param type - The hook type ('before' or 'success')
   * @returns The generated hook name (e.g., 'onLoginBefore', 'onLogoutSuccess')
   *
   * @example
   * ```typescript
   * executor.getHookName('login', 'before'); // Returns 'onLoginBefore'
   * executor.getHookName('logout', 'success'); // Returns 'onLogoutSuccess'
   * ```
   *
   * @internal This method is used internally to resolve hook names for plugins
   */
  getHookName(action: string, type: 'before' | 'success'): string {
    return `on${firstUppercase(String(action))}${firstUppercase(type)}`;
  }

  /**
   * Execute the actual task and return the result
   *
   * - Do not allow to modify onExec hook logic, only execute gateway method
   *
   * @example Do not allow to modify onExec hook logic
   * ```typescript
   * const executor = new GatewayExecutor();
   * executor.use(new Plugin({
   *   onExec: async (context) => {
   *     return await context.actualTask(context);
   *   }
   * }));
   *
   * executor.exec(options, async (context) => {
   *  // do something ...
   *  // But onExec hook not be executed
   * });
   * ```
   *
   * @param context - The context of the executor
   * @param actualTask - The actual task to execute
   * @returns The result of the task
   */
  protected override async runExec<Result, Params = unknown>(
    context: ExecutorContext<Params>,
    actualTask: PromiseTask<Result, Params>
  ): Promise<void> {
    // Execute the actual task and return the result
    // don't use execHook to execute the task
    context.returnValue = await actualTask(context);
  }

  /**
   * Run before-action hooks for a specific action
   *
   * Executes action-specific before hooks (e.g., `onLoginBefore`, `onLogoutBefore`)
   * for the action being executed. These hooks run after general `onBefore` hooks
   * but before the gateway method execution.
   *
   * Hook execution order:
   * 1. General `onBefore` hooks (from `AsyncExecutor`)
   * 2. Action-specific before hooks (this method, e.g., `onLoginBefore`)
   * 3. Gateway method execution
   *
   * @template Params - The type of parameters for the action
   * @param context - The executor context containing action parameters and state
   *
   * @example Hook execution order
   * ```typescript
   * executor.use({
   *   onBefore: async (context) => {
   *     console.log('1. General before hook');
   *   },
   *   onLoginBefore: async (context) => {
   *     console.log('2. Login-specific before hook');
   *   }
   * });
   * // Output: 1, then 2
   * ```
   *
   * @internal This method is called by `GatewayService.execute` during action execution
   */
  async runBeforeAction<Params = unknown>(
    context: ExecutorContext<GatewayExecutorOptions<Params, T, Gateway>>
  ): Promise<void> {
    await this.runHook(
      this.plugins,
      this.getHookName(context.parameters.actionName, 'before'),
      context
    );
  }

  /**
   * Run success-action hooks for a specific action
   *
   * Executes action-specific success hooks (e.g., `onLoginSuccess`, `onLogoutSuccess`)
   * for the action being executed. These hooks run after the gateway method execution
   * succeeds but before general `onSuccess` hooks.
   *
   * Hook execution order:
   * 1. Gateway method execution
   * 2. Action-specific success hooks (this method, e.g., `onLoginSuccess`)
   * 3. General `onSuccess` hooks (from `AsyncExecutor`)
   *
   * @template Params - The type of parameters for the action
   * @param context - The executor context containing action parameters, state, and return value
   *
   * @example Hook execution order
   * ```typescript
   * executor.use({
   *   onLoginSuccess: async (context) => {
   *     console.log('1. Login-specific success hook');
   *   },
   *   onSuccess: async (context) => {
   *     console.log('2. General success hook');
   *   }
   * });
   * // Output: 1, then 2
   * ```
   *
   * @internal This method is called by `GatewayService.execute` after successful action execution
   */
  async runSuccessAction<Params = unknown>(
    context: ExecutorContext<GatewayExecutorOptions<Params, T, Gateway>>
  ): Promise<void> {
    await this.runHook(
      this.plugins,
      this.getHookName(context.parameters.actionName, 'success'),
      context
    );
  }
}
