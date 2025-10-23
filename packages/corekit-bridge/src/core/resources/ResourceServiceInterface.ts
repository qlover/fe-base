import type { LifecycleInterface } from './LifecycleInterface';
import type { ResourceInterface } from './ResourceInterface';
import type { ResourceStateInterface, ResourceStore } from './ResourceStore';

/**
 * Service interface for managing resource lifecycle and state
 *
 * Combines resource operations with lifecycle management and state handling.
 * This interface provides a complete service layer for resource management,
 * including:
 * - Resource CRUD operations
 * - State management through store
 * - Lifecycle hooks
 * - Resource API integration
 *
 * @template T The resource data type
 * @template Store The store type for state management, defaults to ResourceStore
 *
 * @example Basic implementation
 * ```typescript
 * class UserService implements ResourceServiceInterface<User> {
 *   readonly unionKey = 'users';
 *   readonly serviceName = 'UserService';
 *   readonly store = new ResourceStore<UserState>();
 *   readonly resourceApi = new UserResource();
 *
 *   getStore() {
 *     return this.store;
 *   }
 *   // ... implement other methods
 * }
 * ```
 */
export interface ResourceServiceInterface<
  T,
  Store extends
    ResourceStore<ResourceStateInterface> = ResourceStore<ResourceStateInterface>
> extends LifecycleInterface,
    ResourceInterface<T> {
  /**
   * Unique identifier for the resource collection
   *
   * Used to:
   * - Identify resource type in store
   * - Generate unique keys for caching
   * - Map resources in state management
   *
   * @example `'users'` | `'products'` | `'orders'`
   */
  readonly unionKey: string;

  /**
   * Service identifier for logging and debugging
   *
   * Used in:
   * - Error messages
   * - Debug logs
   * - Service registration
   *
   * @example `'UserService'` | `'ProductService'`
   */
  readonly serviceName: string;

  /**
   * Store instance for state management
   *
   * Handles:
   * - Resource state
   * - Loading states
   * - Search parameters
   * - State updates
   */
  readonly store: Store;

  /**
   * Resource API implementation
   *
   * Provides:
   * - Backend communication
   * - Data transformation
   * - API error handling
   */
  readonly resourceApi: ResourceInterface<T>;

  /**
   * Returns the store instance for external state access
   *
   * @returns Current store instance
   */
  getStore(): Store;
}
