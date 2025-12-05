/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExecutorPlugin } from '@qlover/fe-corekit';
import {
  AsyncStoreInterface,
  AsyncStoreStateInterface
} from '../../../store-state';
import {
  BaseServiceInterface,
  ServiceGatewayType
} from './BaseServiceInterface';
import { LoggerInterface } from '@qlover/logger';

export interface ExecutorServiceOptions<T, Gateway> {
  serviceName: string | symbol;
  gateway?: Gateway;
  logger?: LoggerInterface;
  store?: AsyncStoreInterface<AsyncStoreStateInterface<T>>;
}

export interface ExecutorServiceInterface<
  Store extends AsyncStoreInterface<AsyncStoreStateInterface<any>>,
  Gateway extends ServiceGatewayType
> extends BaseServiceInterface<Store, Gateway> {
  /**
   * Register a plugin with the service
   *
   * Registers one or more plugins to extend service functionality.
   * Plugins can hook into execution lifecycle (before, success, error) and
   * action-specific hooks (e.g., `onLoginBefore`, `onLogoutSuccess`).
   *
   * Plugins are executed in registration order for each hook type.
   */
  use<Plugin extends ExecutorPlugin<ExecutorServiceOptions<any, Gateway>>>(
    plugin: Plugin
  ): void;

  /**
   * Execute a gateway action
   *
   * Supports multiple calling patterns:
   * 1. execute(action) - Execute action without parameters
   * 2. execute(action, params) - Execute action with single parameter
   * 3. execute(action, ...params) - Execute action with multiple parameters
   * 4. execute(action, fn) - Execute action with custom function that receives gateway
   *
   * @template Result - The type of result returned by the action
   * @template Action - The gateway action name type (string or keyof Gateway)
   */
  // Overload for custom function - must be first for proper type inference
  execute<Result, Action>(
    action: Action,
    fn: (gateway: Gateway | null) => Promise<Result>
  ): Promise<Result>;
  // Overload for no parameters
  execute<Result, Action>(action: Action): Promise<Result>;
  // Implementation signature for params patterns
  execute<Result, Action>(
    action: Action,
    paramsOrFn?: unknown,
    ...restParams: unknown[]
  ): Promise<Result>;
}
