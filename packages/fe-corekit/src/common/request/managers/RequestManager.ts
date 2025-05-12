import { AsyncExecutor, ExecutorPlugin } from '../..';
import {
  RequestAdapterConfig,
  RequestAdapterInterface
} from '../../../interface/request/RequestAdapter';
import merge from 'lodash/merge';

/**
 * Represents a manager for handling HTTP requests.
 *
 * This interface defines a manager that contains an adapter and an executor.
 * It provides methods for adding plugins to the executor and making requests.
 *
 * Why this is an abstract class?
 *
 * - Because the Executor can be overridden at runtime, the type cannot be fixed,
 *   so we need to reasonably flexibly control it.
 * - So we need to redefine the request type when implementing the current class.
 *
 * @since 1.2.2
 */
export abstract class RequestManager<Config extends RequestAdapterConfig> {
  constructor(
    protected readonly adapter: RequestAdapterInterface<Config>,
    protected readonly executor: AsyncExecutor = new AsyncExecutor()
  ) {}

  /**
   * Adds a plugin to the executor.
   *
   * @since 1.2.2
   *
   * @param plugin - The plugin to be used by the executor.
   * @returns The current instance of RequestManagerInterface for chaining.
   */
  usePlugin(plugin: ExecutorPlugin | ExecutorPlugin[]): this {
    if (Array.isArray(plugin)) {
      plugin.forEach((p) => this.executor.use(p));
    } else {
      this.executor.use(plugin);
    }
    return this;
  }

  /**
   * Executes a request with the given configuration.
   *
   * This method need to be overridden by the subclass, override type definition of request method.
   *
   * Of course, you can also override its logic.
   *
   * @param config - The configuration for the request.
   * @returns A promise that resolves to the response of the request.
   */
  request(config: unknown): Promise<unknown> {
    const mergedConfig = merge({}, this.adapter.getConfig(), config);
    return this.executor.exec(mergedConfig, (context) =>
      this.adapter.request(context.parameters)
    );
  }
}
