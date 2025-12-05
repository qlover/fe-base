import {
  AsyncStoreInterface,
  AsyncStoreStateInterface
} from '../../store-state';
import { UserInfoInterface } from './UserInfoInterface';
import { BaseServiceInterface } from './base/BaseServiceInterface';

/**
 * User info getter interface
 *
 * Provides a convenient method to access current user information without directly accessing the store.
 * This interface abstracts user data access from store implementation details, enabling easy retrieval
 * of user information. It is typically implemented by services that manage user information and provides
 * a simple getter method that accesses the store's result.
 *
 * - Significance: Provides a convenient method to access current user information
 * - Core idea: Abstract user data access from store implementation details
 * - Main function: Return current user data from the store
 * - Main purpose: Enable easy access to user information without directly accessing the store
 *
 * This interface is typically implemented by services that manage user information.
 * It provides a simple getter method that accesses the store's result.
 *
 * @template User - The type of user object returned
 *
 * @example Basic usage
 * ```typescript
 * class UserService implements UserInfoGetter<User> {
 *   getUser(): User | null {
 *     return this.store.getResult();
 *   }
 * }
 * ```
 */
export interface UserInfoGetter<User> {
  /**
   * Get current user
   *
   * Returns the current user information from the store.
   * This is a convenience method that typically accesses the store's result.
   *
   * @returns The current user information, or `null` if not available
   *
   * @example Get current user
   * ```typescript
   * const user = userService.getUser();
   * if (user) {
   *   console.log('Current user:', user.name);
   * }
   * ```
   *
   * @example Check authentication status
   * ```typescript
   * const user = userService.getUser();
   * const isAuthenticated = user !== null;
   * ```
   */
  getUser(): User | null;
}

/**
 * User info service interface
 *
 * Combines user info operations with service infrastructure, extending `UserInfoInterface` with store
 * and gateway access to provide a complete user info service contract. This interface enables reactive
 * user info services with persistent state management and API gateway integration. It provides both
 * user information retrieval operations and convenient access to current user data through the integrated store.
 *
 * - Significance: Combines user info operations with service infrastructure (store and gateway)
 * - Core idea: Extend `UserInfoInterface` with store and gateway access for complete user info service
 * - Main function: Provide user info operations with state management and gateway integration
 * - Main purpose: Enable reactive user info services with persistent state and API gateway support
 *
 * Core features:
 * - User info operations: Inherit getUserInfo and refreshUserInfo methods from `UserInfoInterface`
 * - Store access: Provides access to async store for state management
 * - Gateway access: Provides access to user info gateway for API operations
 * - User access: Provides convenient method to get current user information
 *
 * Design decisions:
 * - Extends `UserInfoInterface`: Inherits user info contract
 * - Extends `BaseServiceInterface`: Provides store and gateway infrastructure
 * - Extends `UserInfoGetter`: Provides convenient user access method
 * - Store type matches user: Store manages user state
 * - Gateway type matches `UserInfoInterface`: Gateway provides user info operations
 *
 * @template User - The type of user object returned
 * @template Store - The async store type that manages user state
 *
 * @example Basic usage
 * ```typescript
 * class UserInfoService implements UserInfoServiceInterface<User, UserStore> {
 *   readonly serviceName = 'UserInfoService';
 *
 *   getStore(): UserStore {
 *     return this.store;
 *   }
 *
 *   getGateway(): UserInfoInterface<User> | null {
 *     return this.gateway;
 *   }
 *
 *   async getUserInfo(): Promise<User | null> {
 *     // Implementation
 *   }
 *
 *   async refreshUserInfo(): Promise<User | null> {
 *     // Implementation
 *   }
 *
 *   getUser(): User | null {
 *     return this.store.getResult();
 *   }
 * }
 * ```
 */
export interface UserInfoServiceInterface<
  User,
  Store extends AsyncStoreInterface<AsyncStoreStateInterface<User>>
> extends UserInfoInterface<User>,
    BaseServiceInterface<Store, UserInfoInterface<User>>,
    UserInfoGetter<User> {}
