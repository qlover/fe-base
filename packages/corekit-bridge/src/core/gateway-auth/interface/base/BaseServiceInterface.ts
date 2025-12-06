import { LoggerInterface } from '@qlover/logger';
import {
  AsyncStoreInterface,
  AsyncStoreStateInterface
} from '../../../store-state';

export type ServiceGatewayType = object;

/**
 * Base service interface
 *
 * Defines the standard contract for all gateway services that use async stores and gateways.
 * This interface provides a common foundation ensuring consistent service structure across different
 * gateway implementations. It abstracts the core service infrastructure, allowing services to focus
 * on their specific business logic while maintaining a unified interface for store and gateway access.
 *
 * - Significance: Provides a common foundation for all gateway services
 * - Core idea: Define standard contract for services that use async stores and gateways
 * - Main function: Provide access to store and gateway instances
 * - Main purpose: Ensure consistent service structure across different gateway implementations
 *
 * Core features:
 * - Store access: Provides access to the async store instance for state management
 * - Gateway access: Provides access to the gateway instance for API operations
 * - Service identification: Includes service name for logging and debugging
 *
 * Design decisions:
 * - Store is required: All services must have a store for state management
 * - Gateway is optional: Services can work without gateway (e.g., mock services)
 * - Service name is readonly: Prevents accidental modification after construction
 *
 * @template Store - The async store type that extends `AsyncStoreInterface`
 * @template Gateway - The gateway type (can be any object type)
 *
 * @example Basic usage
 * ```typescript
 * class MyService implements BaseServiceInterface<MyStore, MyGateway> {
 *   readonly serviceName = 'MyService';
 *
 *   getStore(): MyStore {
 *     return this.store;
 *   }
 *
 *   getGateway(): MyGateway | null {
 *     return this.gateway;
 *   }
 * }
 * ```
 */
export interface BaseServiceInterface<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Store extends AsyncStoreInterface<AsyncStoreStateInterface<any>>,
  Gateway extends ServiceGatewayType
> {
  /**
   * Service name identifier
   *
   * Used for logging, debugging, and service identification.
   * Should be set during construction and remain constant.
   *
   * @readonly
   */
  readonly serviceName: string | symbol;

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
  getStore(): Store;

  /**
   * Get the gateway instance
   *
   * Returns the gateway instance used by this service for API operations.
   * Returns `null` if no gateway was configured.
   *
   * @returns The gateway instance, or `null` if not configured
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
  getGateway(): Gateway | undefined;

  /**
   * Get the logger instance
   *
   * Returns the logger instance used by this service for logging.
   * Returns `null` if no logger was configured.
   *
   * @returns The logger instance, or `null` if not configured
   */
  getLogger(): LoggerInterface | undefined;
}
