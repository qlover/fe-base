import {
  AsyncStoreInterface,
  AsyncStoreStateInterface
} from '../../store-state';
import { ExecutorServiceInterface } from './base/ExecutorServiceInterface';

/**
 * User info interface
 *
 * Defines the contract for user information operations, providing a standardized way to retrieve
 * and refresh user data across different implementations. This interface abstracts user data access
 * logic from implementation details, supporting both cached and fresh data retrieval. It ensures
 * consistent user information access patterns and enables flexible user type handling through generic types.
 *
 * - Significance: Defines the contract for user information operations
 * - Core idea: Abstract user data retrieval and refresh logic from implementation details
 * - Main function: Handle fetching and refreshing user information
 * - Main purpose: Ensure consistent user information access across different implementations
 *
 * Core features:
 * - Get user info: Retrieve current user information (may use cached data)
 * - Refresh user info: Force refresh user information from server
 * - Flexible parameters: Supports generic parameter types for different user info requirements
 *
 * Design decisions:
 * - Generic user type: Allows different user structures to be returned
 * - Generic parameters: Allows different ways to fetch user info (by token, by ID, etc.)
 * - Returns null on failure: Provides clear indication when user info cannot be retrieved
 * - Separate refresh method: Allows explicit refresh without affecting get behavior
 *
 * @template User - The type of user object returned
 *
 * @example Basic implementation
 * ```typescript
 * class UserService implements UserInfoInterface<User> {
 *   async getUserInfo(): Promise<User | null> {
 *     // Implementation - may return cached data
 *   }
 *
 *   async refreshUserInfo(): Promise<User | null> {
 *     // Implementation - always fetches fresh data
 *   }
 * }
 * ```
 */
export interface UserInfoInterface<User> {
  /**
   * Get current user information
   *
   * Retrieves the current user's information. This method may return cached data
   * if available, or fetch from the server if no cache exists.
   *
   * Behavior:
   * - Returns cached user info if available and valid
   * - Fetches from server if no cache exists
   * - Returns `null` if user is not authenticated or info cannot be retrieved
   *
   * @template Params - The type of parameters for fetching user info
   * @param params - Optional parameters for fetching user info
   *   Common parameters include:
   *   - Login data (token, credential) for authentication
   *   - User ID for direct lookup
   *   - Additional fields as required by the implementation
   *   @optional
   * @returns Promise resolving to user information, or `null` if not available
   *
   * @example Get user info
   * ```typescript
   * const user = await userService.getUserInfo();
   * if (user) {
   *   console.log('User:', user.name);
   * }
   * ```
   *
   * @example Get user info with parameters
   * ```typescript
   * const user = await userAuthService.getUserInfo({ token: 'abc123' });
   * ```
   */
  getUserInfo(params?: unknown): Promise<User | null>;

  /**
   * Refresh user information
   *
   * Forces a refresh of user information from the server, bypassing any cache.
   * This is useful when user data may have changed on the server.
   *
   * Behavior:
   * - Always fetches fresh data from server
   * - Updates cache with new data
   * - Returns `null` if refresh fails or user is not authenticated
   *
   * @template Params - The type of parameters for refreshing user info
   * @param params - Optional parameters for refreshing user info
   *   Common parameters include:
   *   - Login data (token, credential) for authentication
   *   - Force refresh flag
   *   - Additional fields as required by the implementation
   *   @optional
   * @returns Promise resolving to refreshed user information, or `null` if refresh fails
   *
   * @example Refresh user info
   * ```typescript
   * const user = await userAuthService.refreshUserInfo();
   * if (user) {
   *   console.log('Refreshed user:', user);
   * }
   * ```
   *
   * @example Refresh with parameters
   * ```typescript
   * const user = await userAuthService.refreshUserInfo({ force: true });
   * ```
   */
  refreshUserInfo<Params>(params?: Params): Promise<User | null>;
}

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
    ExecutorServiceInterface<Store, UserInfoInterface<User>>,
    UserInfoGetter<User> {}
