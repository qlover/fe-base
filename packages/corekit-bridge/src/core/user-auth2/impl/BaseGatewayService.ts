import {
  AsyncStore,
  AsyncStoreInterface,
  AsyncStoreStateInterface
} from '../../store-state';
import { LoggerInterface } from '@qlover/logger';
import { BaseServiceInterface } from '../interface/BaseServiceInterface';
import { ExecutorError } from '@qlover/fe-corekit';

export interface BaseGatewayServiceOptions<T, Gateway> {
  /**
   * Store instance for the service
   *
   * @default `AsyncStore<T, string>`
   */
  store?: AsyncStoreInterface<AsyncStoreStateInterface<T>>;

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
    const targetStore = options?.store ?? new AsyncStore<T, string>();
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

  /**
   * Execute the service action
   *
   * @param action - The action to execute
   * @param params - The parameters to pass to the action
   * @param fn - The function to execute the action
   * @returns The result of the action
   */
  protected async execute<Params, Result, Action extends string>(
    action: Action,
    params: Params,
    fn: (
      params: Params,
      gateway: Gateway | null,
      action: Action
    ) => Promise<Result>
  ): Promise<Result> {
    this.store.start();

    try {
      const result = await fn(params, this.gateway, action);

      if (result == null) {
        throw new ExecutorError(
          'SERVICE_RESULT_NULL',
          `${this.serviceName}: ${action} - Result is null`
        );
      }

      this.store.success(result as T);

      if (this.logger) {
        const ms = this.store.getDuration();
        this.logger.debug(
          `${this.serviceName}: ${action} - success(${ms}ms)`,
          result
        );
      }

      return result;
    } catch (error) {
      this.store.failed(error);
      throw error;
    }
  }
}
