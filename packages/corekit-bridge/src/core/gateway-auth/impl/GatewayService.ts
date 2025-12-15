import {
  AsyncStoreInterface,
  AsyncStoreStateInterface
} from '../../store-state';
import { ServiceGatewayType } from '../interface/base/BaseServiceInterface';
import { GatewayExecutor, GatewayExecutorOptions } from './GatewayExecutor';
import { ExecutorPlugin } from '@qlover/fe-corekit';
import { ExecutorServiceInterface } from '../interface/base/ExecutorServiceInterface';
import { BaseService, BaseServiceOptions } from './BaseService';

/**
 * Gateway service options
 *
 * Configuration options for creating a gateway service instance.
 * Combines executor options and store options to provide complete service configuration.
 *
 * - Significance: Provides unified configuration for gateway services
 * - Core idea: Combine executor and store configuration into a single options object
 * - Main function: Configure service behavior, store, gateway, and plugins
 * - Main purpose: Simplify service initialization with all necessary options
 *
 * @template T - The type of data stored in the async store
 * @template Gateway - The type of gateway object
 * @template Key - The type of key used for store operations (default: string)
 *
 * @example Basic usage
 * ```typescript
 * const options: GatewayServiceOptions<User, UserGateway> = {
 *   gateway: new UserGateway(),
 *   logger: new Logger(),
 *   storage: new LocalStorage()
 * };
 *
 * const service = new UserService('UserService', options);
 * ```
 */
export interface GatewayServiceOptions<T, Gateway, Key = string>
  extends BaseServiceOptions<T, Gateway, Key> {
  executor?: GatewayExecutor<T, Gateway>;
}

type ExecuteFn<Params, Result, Gateway> = (
  params: Params,
  gateway: Gateway | null,
  action: keyof Gateway
) => Promise<Result | null>;

/**
 * Gateway service base class
 *
 * Abstract base class that provides unified infrastructure for executing gateway actions with state
 * management and plugin support. This class serves as the foundation for all gateway services, handling
 * the common concerns of gateway execution, state tracking, and plugin integration. It enables consistent
 * service implementation patterns while allowing subclasses to focus on their specific business logic.
 *
 * - Significance: Abstract base class for all gateway services
 * - Core idea: Provide unified infrastructure for executing gateway actions with state management
 * - Main function: Execute gateway actions through executor with plugin support and state tracking
 * - Main purpose: Enable consistent service implementation pattern across different gateway services
 *
 * Core features:
 * - Gateway execution: Execute gateway methods through executor with plugin hooks
 * - State management: Manage async state via store (loading, success, error)
 * - Plugin support: Register plugins for custom execution logic
 * - Automatic state updates: Integrates with `GatewayBasePlugin` for automatic state management
 * - Default gateway method resolution: Automatically resolves gateway methods by action name
 *
 * Design decisions:
 * - Abstract class: Must be extended by concrete service implementations
 * - Generic types: Supports different data types, gateway types, and store types
 * - Protected execute method: Subclasses use `execute` to run gateway actions
 * - Executor pattern: Uses `GatewayExecutor` for plugin and hook management
 * - Store creation: Creates store from options if not provided
 *
 * Execution flow:
 * 1. Service calls `execute(action, params)`
 * 2. Executor runs `onBefore` hooks (including action-specific hooks like `onLoginBefore`)
 * 3. Gateway method is executed (or custom function if provided)
 * 4. Executor runs `onSuccess` hooks (including action-specific hooks like `onLoginSuccess`)
 * 5. Store state is updated (via `GatewayBasePlugin`)
 * 6. Result is returned
 *
 * @since 1.8.0
 * @template T - The type of data stored in the async store
 * @template Gateway - The type of gateway object (must be an object with methods)
 * @template Store - The async store type that manages state
 *
 * @example Basic service implementation
 * ```typescript
 * class MyService extends GatewayService<User, UserGateway, UserStore> {
 *   constructor(serviceName: string, options?: GatewayServiceOptions<User, UserGateway>) {
 *     super(serviceName, options);
 *   }
 *
 *   async getUser(id: string): Promise<User | null> {
 *     return this.execute('getUser', { id });
 *   }
 * }
 * ```
 *
 * @example With custom execution function
 * ```typescript
 * class MyService extends GatewayService<User, UserGateway, UserStore> {
 *   async getUser(id: string): Promise<User | null> {
 *     return this.execute('getUser', { id }, async (params, gateway) => {
 *       // Custom execution logic
 *       return await gateway?.customGetUser(params);
 *     });
 *   }
 * }
 * ```
 *
 * @example With plugins
 * ```typescript
 * const service = new MyService('MyService', { gateway: new UserGateway() });
 *
 * service.use({
 *   onBefore: async (context) => {
 *     console.log('Before action:', context.parameters.actionName);
 *   },
 *   onGetUserBefore: async (context) => {
 *     console.log('Before getUser action');
 *   }
 * });
 * ```
 */
export abstract class GatewayService<
    T,
    Gateway extends ServiceGatewayType,
    Store extends AsyncStoreInterface<AsyncStoreStateInterface<T>>
  >
  extends BaseService<T, Store, Gateway>
  implements ExecutorServiceInterface<Store, Gateway>
{
  protected readonly executor?: GatewayExecutor<T, Gateway>;

  constructor(options: GatewayServiceOptions<T, Gateway, string>) {
    const { executor, ...baseOptions } = options;
    super(baseOptions);

    this.executor = executor;
  }

  public getExecutor(): GatewayExecutor<T, Gateway> | undefined {
    return this.executor;
  }

  /**
   * Register a plugin with the service
   *
   * Registers one or more plugins to extend service functionality.
   * Plugins can hook into execution lifecycle (before, success, error) and
   * action-specific hooks (e.g., `onLoginBefore`, `onLogoutSuccess`).
   *
   * Plugins are executed in registration order for each hook type.
   *
   * @override
   * @template Plugin - The plugin type that extends `ExecutorPlugin`
   * @param plugin - The plugin(s) to register with the service
   *   Can be a single plugin or an array of plugins
   * @returns The GatewayService instance for method chaining
   *
   * @example Register single plugin
   * ```typescript
   * service.use({
   *   pluginName: 'MyPlugin',
   *   onBefore: async (context) => {
   *     console.log('Before action');
   *   }
   * });
   * ```
   *
   * @example Register multiple plugins
   * ```typescript
   * service.use([
   *   {
   *     pluginName: 'Plugin1',
   *     onBefore: async (context) => { /* ... *\/ }
   *   },
   *   {
   *     pluginName: 'Plugin2',
   *     onSuccess: async (context) => { /* ... *\/ }
   *   }
   * ]);
   * ```
   *
   * @example Action-specific hooks
   * ```typescript
   * service.use({
   *   onLoginBefore: async (context) => {
   *     console.log('Before login');
   *   },
   *   onLogoutSuccess: async (context) => {
   *     console.log('After logout');
   *   }
   * });
   * ```
   */
  public use<
    Plugin extends ExecutorPlugin<GatewayExecutorOptions<T, Gateway, unknown>>
  >(plugin: Plugin | Plugin[]): this {
    if (!this.executor) {
      throw new Error(`${String(this.serviceName)} Executor is not set`);
    }

    if (Array.isArray(plugin)) {
      plugin.forEach((p) => this.getExecutor()?.use(p));
      return this;
    }

    this.executor.use(plugin);
    return this;
  }

  /**
   * Create default execution function for a gateway action
   *
   * Creates a function that automatically resolves and calls the gateway method
   * matching the action name. If the gateway method doesn't exist, returns `null`.
   *
   * This is used as the default execution function when `execute` is called without
   * a custom function parameter.
   *
   * @param action - The gateway action name (must match a method name on the gateway)
   * @returns Execution function that calls the gateway method, or a function that returns `null`
   *
   * @example Automatic gateway method resolution
   * ```typescript
   * // Gateway has a method named 'login'
   * class UserGateway {
   *   async login(params: LoginParams): Promise<Credential> {
   *     // Implementation
   *   }
   * }
   *
   * // Service automatically resolves 'login' method
   * await service.execute('login', params);
   * // Equivalent to: await gateway.login(params);
   * ```
   */
  protected createDefaultFn(
    action: keyof Gateway
  ): ExecuteFn<unknown, unknown, Gateway> {
    if (
      typeof action === 'string' &&
      typeof this.gateway === 'object' &&
      // is not null or undefined
      this.gateway != null &&
      typeof this.gateway[action] === 'function'
    ) {
      return async (params, _gateway, _action) => {
        if (!_gateway) {
          return null;
        }

        const gatewayMethod = _gateway[_action] as unknown as (
          ...args: unknown[]
        ) => Promise<unknown>;

        // Bind this context to gateway to preserve gateway's this
        const boundMethod = gatewayMethod.bind(_gateway);

        // If params is an array, spread it; otherwise pass as single argument
        if (Array.isArray(params)) {
          return (await boundMethod(...params)) ?? null;
        } else {
          return (await boundMethod(params)) ?? null;
        }
      };
    }

    return () => Promise.resolve(null);
  }

  /**
   * Create executor options for a service action
   *
   * Creates the options object passed to the executor for executing a gateway action.
   * This includes action name, service name, store, gateway, logger, and parameters.
   *
   * The `actionName` is read-only to ensure execution stability.
   *
   * @override
   * @template Params - The type of parameters for the action
   * @param action - The gateway action name
   * @param params - The parameters to pass to the gateway method
   * @returns Executor options object with all necessary context
   *
   * @internal This method is used internally by `execute` and typically doesn't need to be called directly
   */
  public createExecOptions<Params>(
    action: keyof Gateway,
    params?: Params
  ): GatewayExecutorOptions<T, Gateway, Params> {
    return {
      // Do not allow to modify actionName, this is to ensure the stability of the executor
      get actionName() {
        return String(action);
      },
      serviceName: this.serviceName,
      store: this.store,
      gateway: this.gateway,
      logger: this.logger,
      params: params
    };
  }

  /**
   * Execute a gateway action
   *
   * Executes a gateway action through the executor with plugin support and state management.
   * This is the main method used by subclasses to execute gateway operations.
   *
   * Supports multiple calling patterns:
   * 1. `execute(action)` - Execute action without parameters
   * 2. `execute(action, params)` - Execute action with single parameter
   * 3. `execute(action, ...params)` - Execute action with multiple parameters
   * 4. `execute(action, fn)` - Execute action with custom function that receives gateway
   *
   * Execution flow:
   * 1. Creates executor options with action context
   * 2. Resolves execution function (custom function or default gateway method)
   * 3. Executes through executor which runs hooks:
   *    - `onBefore` hooks (including action-specific hooks like `onLoginBefore`)
   *    - Gateway method execution
   *    - `onSuccess` hooks (including action-specific hooks like `onLoginSuccess`)
   * 4. Returns the result
   *
   * If an error occurs, the executor's `onError` hooks are called and the error is rethrown.
   *
   * @override
   * @template Result - The type of result returned by the action
   * @template Action - The gateway action name type
   * @param action - The gateway action name
   * @param paramsOrFn - Either parameters (single or multiple) or a custom execution function
   * @param restParams - Additional parameters if multiple parameters are provided
   * @returns Promise resolving to the action result
   *
   * @example Execute without parameters
   * ```typescript
   * await this.execute(ServiceAction.LOGOUT);
   * ```
   *
   * @example Execute with single parameter
   * ```typescript
   * await this.execute(ServiceAction.LOGIN, { email, password });
   * ```
   *
   * @example Execute with multiple parameters
   * ```typescript
   * await this.execute(ServiceAction.LOGIN, params1, params2, params3);
   * ```
   *
   * @example Execute with custom function
   * ```typescript
   * await this.execute(ServiceAction.LOGIN, (gateway) => {
   *   return gateway.login(params1, params2);
   * });
   * ```
   */
  // Overload 1: execute(action, fn) - custom function (must be first for proper type inference)
  public async execute<Result, Action extends string | keyof Gateway>(
    action: Action,
    fn: (gateway: Gateway | null) => Promise<Result>
  ): Promise<Result>;
  // Overload 1.5: execute(action, params, fn) - custom function with params (for type inference)
  /**
   * @override
   */
  public async execute<Result, Action extends string | keyof Gateway, Params>(
    action: Action,
    params: Params,
    fn: (gateway: Gateway | null) => Promise<Result>
  ): Promise<Result>;
  // Overload 2: execute(action) - no parameters
  /**
   * @override
   */
  public async execute<Result, Action extends string | keyof Gateway>(
    action: Action
  ): Promise<Result>;
  // Overload 3: execute(action, params) - single parameter
  /**
   * @override
   */
  public async execute<Result, Action extends string | keyof Gateway, Params>(
    action: Action,
    params: Params
  ): Promise<Result>;
  // Overload 4: execute(action, ...params) - multiple parameters
  /**
   * @override
   */
  public async execute<Result, Action extends string | keyof Gateway>(
    action: Action,
    ...params: unknown[]
  ): Promise<Result>;
  // Implementation
  /**
   * @override
   */
  public async execute<Result, Action extends string | keyof Gateway>(
    action: Action,
    paramsOrFn?: unknown | ((gateway: Gateway | null) => Promise<Result>),
    ...restParams: unknown[]
  ): Promise<Result> {
    // Determine if paramsOrFn is a function (custom execution function)
    const isFunction = typeof paramsOrFn === 'function';

    // Check if the last parameter in restParams is a function (Pattern: execute(action, params, fn))
    const lastParamIsFunction =
      restParams.length > 0 &&
      typeof restParams[restParams.length - 1] === 'function';

    let params: unknown;
    let executionFn: ((gateway: Gateway | null) => Promise<Result>) | undefined;

    if (isFunction) {
      // Pattern 4: execute(action, fn)
      executionFn = paramsOrFn as (gateway: Gateway | null) => Promise<Result>;
      params = undefined;
    } else if (lastParamIsFunction) {
      // Pattern 1.5: execute(action, params, fn) - custom function with params
      executionFn = restParams[restParams.length - 1] as (
        gateway: Gateway | null
      ) => Promise<Result>;
      // Use paramsOrFn as params, ignore the function in restParams
      params = paramsOrFn;
    } else {
      // Pattern 1, 2, 3: execute(action) or execute(action, params) or execute(action, ...params)
      if (restParams.length > 0) {
        // Pattern 3: Multiple parameters - combine into array
        params = [paramsOrFn, ...restParams];
      } else {
        // Pattern 1 or 2: No params or single param
        params = paramsOrFn;
      }
    }

    const actionKey = action as keyof Gateway;
    const options = this.createExecOptions(actionKey, params);

    // Create execution function
    const computedFn = executionFn
      ? async (
          _params: unknown,
          gateway: Gateway | null,
          _action: keyof Gateway
        ) => {
          return await executionFn!(gateway);
        }
      : this.createDefaultFn(actionKey);

    // If no executor, directly execute the function
    if (!this.executor) {
      return (await computedFn(
        params,
        this.gateway ?? null,
        actionKey
      )) as Result;
    }

    return await this.executor.exec(options, async (context) => {
      await this.executor!.runBeforeAction(context);

      const result = await computedFn(params, this.gateway ?? null, actionKey);

      await this.executor!.runSuccessAction(context);

      return result as Result;
    });
  }
}
