import { LoggerInterface } from '@qlover/logger';
import {
  AsyncStoreInterface,
  AsyncStoreOptions,
  AsyncStoreStateInterface
} from '../../store-state';
import {
  BaseServiceInterface,
  ServiceGatewayType
} from '../interface/base/BaseServiceInterface';
import { ExecutorServiceOptions } from '../interface/base/ExecutorServiceInterface';
import { createAsyncStore } from '../../store-state/impl/createAsyncStore';

/**
 * Base service options
 *
 * Configuration options for creating a base service instance.
 * Combines executor service options and async store options to provide complete service configuration.
 * This interface merges the configuration needed for both service infrastructure (gateway, logger, service name)
 * and state management (store configuration).
 *
 * - Significance: Provides unified configuration for base services
 * - Core idea: Combine executor and store configuration into a single options object
 * - Main function: Configure service infrastructure and state management
 * - Main purpose: Simplify service initialization with all necessary options
 *
 * Core features:
 * - Service identification: Includes service name for logging and debugging
 * - Gateway configuration: Optional gateway instance for API operations
 * - Logger configuration: Optional logger instance for logging
 * - Store configuration: Store instance or options for state management
 *
 * Design decisions:
 * - Extends ExecutorServiceOptions: Inherits service infrastructure configuration
 * - Extends AsyncStoreOptions: Inherits store configuration options
 * - Flexible store configuration: Can accept store instance or store options
 *
 * @since 1.8.0
 * @template T - The type of data stored in the async store
 * @template Gateway - The type of gateway object
 * @template Key - The type of key used for store operations (default: string)
 *
 * @example Basic usage with store instance
 * ```typescript
 * const store = new AsyncStore<User>();
 * const options: BaseServiceOptions<User, UserGateway> = {
 *   serviceName: 'UserService',
 *   gateway: new UserGateway(),
 *   logger: new Logger(),
 *   store: store
 * };
 * ```
 *
 * @example Basic usage with store options
 * ```typescript
 * const options: BaseServiceOptions<User, UserGateway> = {
 *   serviceName: 'UserService',
 *   gateway: new UserGateway(),
 *   logger: new Logger(),
 *   storage: {
 *     key: 'user_data',
 *     storage: localStorage,
 *     expires: 'day'
 *   }
 * };
 * ```
 */
export interface BaseServiceOptions<T, Gateway, Key = string>
  extends ExecutorServiceOptions<T, Gateway>,
    AsyncStoreOptions<AsyncStoreStateInterface<T>, Key> {}

/**
 * Base service implementation
 *
 * Concrete implementation of `BaseServiceInterface` that provides the foundational infrastructure
 * for all gateway services. This class handles the initialization and management of core service
 * components: store, gateway, and logger. It serves as the base class for more specialized service
 * implementations like `GatewayService`.
 *
 * **Core Implementation Principles:**
 *
 * 1. **Unified Initialization**: The constructor accepts `BaseServiceOptions` which combines
 *    executor service options and store options, providing a single point of configuration.
 *
 * 2. **Flexible Store Creation**: Uses `createAsyncStore` factory function to handle store creation:
 *    - If a store instance is provided, it uses it directly (allows dependency injection)
 *    - If store options are provided, it creates a new store instance
 *    - If nothing is provided, it creates a default store instance
 *    This flexibility enables both dependency injection and configuration-based initialization.
 *
 * 3. **Protected Access**: All internal properties are `protected readonly`, allowing:
 *    - Subclasses to access and extend functionality
 *    - Prevention of external modification after construction
 *    - Clear encapsulation boundaries
 *
 * 4. **Interface Compliance**: Implements `BaseServiceInterface` to ensure consistent service
 *    structure across all service implementations.
 *
 * - Significance: Foundation implementation for all gateway services
 * - Core idea: Provide unified infrastructure initialization and management
 * - Main function: Initialize and manage store, gateway, and logger instances
 * - Main purpose: Enable consistent service structure with flexible configuration
 *
 * Core features:
 * - Service initialization: Unified constructor for all service infrastructure
 * - Store management: Flexible store creation (instance or configuration)
 * - Gateway access: Optional gateway instance for API operations
 * - Logger access: Optional logger instance for logging
 * - Property accessors: Public methods to access protected properties
 *
 * Design decisions:
 * - Concrete class: Provides default implementation that can be extended
 * - Generic types: Supports different data types, store types, and gateway types
 * - Protected properties: Allows subclasses to access while preventing external modification
 * - Factory pattern: Uses `createAsyncStore` for flexible store creation
 * - Readonly properties: Prevents accidental modification after construction
 *
 * Initialization flow:
 * 1. Constructor receives `BaseServiceOptions`
 * 2. Service name is assigned (required, readonly)
 * 3. Gateway is assigned (optional, readonly)
 * 4. Logger is assigned (optional, readonly)
 * 5. Store is created via `createAsyncStore` factory:
 *    - If store instance provided → use directly
 *    - If store options provided → create new store
 *    - If nothing provided → create default store
 *
 * @since 1.8.0
 * @template T - The type of data stored in the async store
 * @template Store - The async store type that extends `AsyncStoreInterface`
 * @template Gateway - The gateway type (must be an object type)
 *
 * @example Basic usage - extending BaseService
 * ```typescript
 * class MyService extends BaseService<User, UserStore, UserGateway> {
 *   constructor(options: BaseServiceOptions<User, UserGateway>) {
 *     super(options);
 *   }
 *
 *   // Add custom service methods
 *   async getUser(id: string): Promise<User | null> {
 *     const store = this.getStore();
 *     const gateway = this.getGateway();
 *     // Use store and gateway for business logic
 *   }
 * }
 * ```
 *
 * @example With store instance (dependency injection)
 * ```typescript
 * const store = new UserStore();
 * const service = new MyService({
 *   serviceName: 'MyService',
 *   gateway: new UserGateway(),
 *   logger: new Logger(),
 *   store: store // Use existing store instance
 * });
 * ```
 *
 * @example With store options (configuration-based)
 * ```typescript
 * const service = new MyService({
 *   serviceName: 'MyService',
 *   gateway: new UserGateway(),
 *   logger: new Logger(),
 *   storage: {
 *     key: 'user_data',
 *     storage: localStorage,
 *     expires: 'day'
 *   }
 *   // Store will be created from options
 * });
 * ```
 *
 * @example Accessing service infrastructure
 * ```typescript
 * const service = new MyService(options);
 *
 * // Access store
 * const store = service.getStore();
 * const state = store.getState();
 *
 * // Access gateway
 * const gateway = service.getGateway();
 * if (gateway) {
 *   await gateway.someMethod();
 * }
 *
 * // Access logger
 * const logger = service.getLogger();
 * if (logger) {
 *   logger.info('Service initialized');
 * }
 * ```
 */
export class BaseService<
  T,
  Store extends AsyncStoreInterface<AsyncStoreStateInterface<T>>,
  Gateway extends ServiceGatewayType
> implements BaseServiceInterface<Store, Gateway>
{
  /**
   * Service name identifier
   *
   * Used for logging, debugging, and service identification.
   * Set during construction and remains constant throughout the service lifecycle.
   *
   * @readonly
   */
  readonly serviceName: string | symbol;

  /**
   * Gateway instance for API operations
   *
   * The gateway object that provides methods for executing API calls.
   * Optional - services can work without gateway (e.g., mock services).
   * Protected to allow subclasses to access while preventing external modification.
   *
   * @protected
   * @readonly
   */
  protected readonly gateway?: Gateway;

  /**
   * Logger instance for logging execution events
   *
   * Used for logging execution flow, errors, and debugging information.
   * Optional - services can work without logger.
   * Protected to allow subclasses to access while preventing external modification.
   *
   * @protected
   * @readonly
   */
  protected readonly logger?: LoggerInterface;

  /**
   * Store instance for state management
   *
   * The async store that manages service state (loading, success, error).
   * Always initialized - created from provided instance or options, or defaults to new store.
   * Protected to allow subclasses to access while preventing external modification.
   *
   * @protected
   * @readonly
   */
  protected readonly store: Store;

  /**
   * Create a new base service instance
   *
   * Initializes the service with the provided options. The constructor handles:
   * - Service name assignment (required)
   * - Gateway assignment (optional)
   * - Logger assignment (optional)
   * - Store creation via `createAsyncStore` factory (flexible: instance, options, or default)
   *
   * The store creation uses the `createAsyncStore` factory function which:
   * - Returns the provided store instance if it's already an `AsyncStoreInterface`
   * - Creates a new store from options if store options are provided
   * - Creates a default store if nothing is provided
   *
   * @param options - Configuration options for the service
   * @param options.serviceName - Required service name identifier
   * @param options.gateway - Optional gateway instance for API operations
   * @param options.logger - Optional logger instance for logging
   * @param options.store - Optional store instance or store options for state management
   *
   * @example Basic initialization
   * ```typescript
   * const service = new BaseService({
   *   serviceName: 'MyService',
   *   gateway: new MyGateway(),
   *   logger: new Logger()
   * });
   * ```
   *
   * @example With store instance
   * ```typescript
   * const store = new AsyncStore<User>();
   * const service = new BaseService({
   *   serviceName: 'MyService',
   *   store: store
   * });
   * ```
   *
   * @example With store options
   * ```typescript
   * const service = new BaseService({
   *   serviceName: 'MyService',
   *   storage: {
   *     key: 'my_data',
   *     storage: localStorage
   *   }
   * });
   * ```
   */
  constructor(options: BaseServiceOptions<T, Gateway, string>) {
    this.serviceName = options.serviceName;
    this.gateway = options.gateway;
    this.logger = options.logger;
    this.store = createAsyncStore(options.store) as Store;
  }

  /**
   * Get the async store instance
   *
   * Returns the store instance used by this service for state management.
   * The store provides reactive state access and subscription capabilities.
   *
   * @returns The store instance for state management
   *
   * @example Access store state
   * ```typescript
   * const store = service.getStore();
   * const state = store.getState();
   * console.log('Current state:', state);
   * ```
   *
   * @example Subscribe to state changes
   * ```typescript
   * const store = service.getStore();
   * store.observe((state) => {
   *   console.log('State changed:', state);
   * });
   * ```
   */
  getStore(): Store {
    return this.store;
  }

  /**
   * Get the gateway instance
   *
   * Returns the gateway instance used by this service for API operations.
   * Returns `undefined` if no gateway was configured.
   *
   * @returns The gateway instance, or `undefined` if not configured
   *
   * @example Access gateway methods
   * ```typescript
   * const gateway = service.getGateway();
   * if (gateway) {
   *   await gateway.login(params);
   * }
   * ```
   *
   * @example Check if gateway is available
   * ```typescript
   * const gateway = service.getGateway();
   * if (!gateway) {
   *   console.warn('Gateway not configured');
   * }
   * ```
   */
  getGateway(): Gateway | undefined {
    return this.gateway;
  }

  /**
   * Get the logger instance
   *
   * Returns the logger instance used by this service for logging.
   * Returns `undefined` if no logger was configured.
   *
   * @returns The logger instance, or `undefined` if not configured
   *
   * @example Use logger for logging
   * ```typescript
   * const logger = service.getLogger();
   * if (logger) {
   *   logger.info('Service operation started');
   *   logger.error('Service operation failed', error);
   * }
   * ```
   */
  getLogger(): LoggerInterface | undefined {
    return this.logger;
  }
}
