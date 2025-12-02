import {
  AsyncStore,
  AsyncStoreOptions,
  AsyncStoreStateInterface
} from '../../store-state';
import { LoggerInterface } from '@qlover/logger';
import { BaseServiceInterface } from '../interface/BaseServiceInterface';
import { ExecutorError } from '@qlover/fe-corekit';

export interface BaseGatewayServiceOptions<T, Gateway, Key = string>
  extends AsyncStoreOptions<Key, AsyncStoreStateInterface<T>> {
  /**
   * Store instance for the service
   *
   * @default `AsyncStore<T, string>`
   */
  store?: AsyncStore<T, Key>;

  /**
   * Gateway instance for the service
   * @default `null`
   */
  gateway?: Gateway;

  /**
   * Logger instance for the service
   *
   * - Future use logger to record the log of service execution
   *
   * @default `null`
   */
  logger?: LoggerInterface;
}

type ExecuteFn<Params, Result, Gateway> = (
  params: Params,
  gateway: Gateway | null,
  action: keyof Gateway
) => Promise<Result | null>;

export abstract class BaseGatewayService<
  T,
  Gateway,
  Store extends AsyncStore<T, string>
> implements BaseServiceInterface<Store, Gateway>
{
  protected readonly store: Store;
  protected readonly gateway: Gateway | null = null;
  protected readonly logger?: LoggerInterface;

  constructor(
    readonly serviceName: string,
    options?: BaseGatewayServiceOptions<T, Gateway>
  ) {
    const targetStore = options?.store ?? new AsyncStore<T, string>(options);

    this.store = targetStore as Store;
    this.gateway = options?.gateway ?? null;
    this.logger = options?.logger;
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

  protected createDefaultFn(
    action: keyof Gateway
  ): ExecuteFn<unknown, unknown, Gateway> {
    if (
      typeof action === 'string' &&
      this.gateway &&
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
    this.store.start();

    try {
      const computedFn = fn ?? this.createDefaultFn(action);

      const result = await computedFn(params, this.gateway, action);

      if (result == null) {
        throw new ExecutorError(
          'SERVICE_RESULT_NULL',
          `${this.serviceName}: ${String(action)} - Result is null`
        );
      }

      this.store.success(result as T);

      if (this.logger) {
        const ms = this.store.getDuration();
        this.logger.debug(
          `${this.serviceName}: ${String(action)} - success(${ms}ms)`,
          result
        );
      }

      return result as Result;
    } catch (error) {
      this.store.failed(error);
      throw error;
    }
  }
}
