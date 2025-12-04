import { AsyncStore, AsyncStoreOptions, createStore } from '../../store-state';
import { LoggerInterface } from '@qlover/logger';
import { BaseServiceInterface } from '../interface/BaseServiceInterface';
import {
  GatewayExecutor,
  GatewayExecutorBaseOptions,
  GatewayExecutorOptions
} from './GatewayExecutor';
import { ExecutorPlugin } from '@qlover/fe-corekit';

export interface GatewayServiceOptions<T, Gateway, Key = string>
  extends GatewayExecutorBaseOptions<T, Gateway, Key>,
    AsyncStoreOptions<T, Key> {}

type ExecuteFn<Params, Result, Gateway> = (
  params: Params,
  gateway: Gateway | null,
  action: keyof Gateway
) => Promise<Result | null>;

/**
 * GatewayService is a base class for all gateway services
 *
 * - It is used to execute the gateway actions
 * - It is used to execute the gateway actions with plugins
 * - It is used to execute the gateway actions with plugins
 */
export abstract class GatewayService<
  T,
  Gateway extends object,
  Store extends AsyncStore<T, string>
> implements BaseServiceInterface<Store, Gateway>
{
  protected readonly store: Store;
  protected readonly gateway: Gateway | null = null;
  protected readonly logger?: LoggerInterface;
  protected readonly executor: GatewayExecutor<T, Gateway>;

  constructor(
    readonly serviceName: string,
    options?: GatewayServiceOptions<T, Gateway, string>
  ) {
    this.store = createStore(options) as Store;
    this.gateway = options?.gateway ?? null;
    this.logger = options?.logger;
    this.executor = new GatewayExecutor<T, Gateway>();
  }

  /**
   * Get the store instance for the service
   *
   * @override
   * @returns The store instance for the service
   */
  public getStore(): Store {
    return this.store.getStore();
  }

  /**
   * Get the gateway instance for the service
   *
   * @override
   * @returns The gateway instance for the service
   */
  public getGateway(): Gateway | null {
    return this.gateway;
  }

  /**
   * Register a plugin with the service
   *
   * @param plugin - The plugin to register with the service
   * @returns The GatewayService instance
   */
  public use<
    Plugin extends ExecutorPlugin<GatewayExecutorOptions<unknown, T, Gateway>>
  >(plugin: Plugin | Plugin[]): this {
    if (Array.isArray(plugin)) {
      plugin.forEach((p) => this.executor.use(p));
      return this;
    }

    this.executor.use(plugin);
    return this;
  }

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
      return async (params, _gateway, _action) =>
        (await (
          _gateway?.[_action] as unknown as (
            params: unknown
          ) => Promise<unknown>
        )(params)) ?? null;
    }

    return () => Promise.resolve(null);
  }

  protected createServiceOptions<Params>(
    action: keyof Gateway,
    params: Params
  ): GatewayExecutorOptions<Params, T, Gateway> {
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
   * Execute the service action
   *
   * - If fn is empty, it will try to use the action method of the gateway
   * - If the action method of the gateway is not found, it will return null
   * - If the action method of the gateway is found, it will return the result of the action
   * - If the action method of the gateway is found, it will return the result of the action
   *
   * @param action - The action to execute
   * @param params - The parameters to pass to the action
   * @param fn - The function to execute the action
   * @returns The result of the action
   */
  protected async execute<Params, Result, Action extends keyof Gateway>(
    action: Action,
    params: Params,
    fn?: ExecuteFn<Params, Result, Gateway>
  ): Promise<Result> {
    const options = this.createServiceOptions(action, params);
    const computedFn = fn ?? this.createDefaultFn(action);

    return await this.executor.exec(options, async (context) => {
      await this.executor.runBeforeAction(context);

      const result = await computedFn(params, this.gateway, action);

      await this.executor.runSuccessAction(context);

      return result as Result;
    });
  }
}
