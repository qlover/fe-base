import { AsyncStore } from '../../store-state';
import type { UserInfoInterface } from '../interface/UserInfoInterface';
import type { UserInfoServiceInterface } from '../interface/UserInfoServiceInterface';
import { GatewayService } from './GatewayService';
import { ServiceAction } from './ServiceAction';

/**
 * User info service implementation
 *
 * Concrete implementation of the user info service that provides user information retrieval and refresh
 * functionality with integrated state management. This service extends `GatewayService` to handle user
 * info operations, automatically managing user state through an async store. It supports both cached data
 * retrieval and forced refresh from the server, enabling efficient user data management.
 *
 * - Significance: Provides user information retrieval functionality with state management
 * - Core idea: Extend `GatewayService` to handle user information operations
 * - Main function: Execute user info retrieval through gateway and manage user state
 * - Main purpose: Enable reactive user info services with persistent state and API gateway support
 *
 * Core features:
 * - Get user info: Retrieve user information (may use cached data)
 * - Refresh user info: Force refresh user information from server
 * - State management: Track user info state (loading, success, error) via async store
 * - Gateway integration: Execute user info operations through gateway interface
 * - Plugin support: Supports plugins for custom user info logic
 *
 * Design decisions:
 * - Extends `GatewayService`: Inherits store, gateway, and executor infrastructure
 * - Implements `UserInfoServiceInterface`: Provides user info contract
 * - Uses `ServiceAction.GET_USER_INFO` and `ServiceAction.REFRESH_USER`: Identifies actions for plugin hooks
 * - Generic user type: Supports different user structures
 *
 * @template User - The type of user object returned
 * @template Store - The async store type that manages user state
 *
 * @example Basic usage
 * ```typescript
 * const userInfoService = new UserInfoService<User>(
 *   'UserInfoService',
 *   {
 *     gateway: new UserGateway(),
 *     logger: new Logger()
 *   }
 * );
 *
 * const user = await userInfoService.getUserInfo();
 * ```
 *
 * @example With plugin
 * ```typescript
 * userInfoService.use({
 *   onGetUserInfoBefore: async (context) => {
 *     console.log('Fetching user info...');
 *   },
 *   onRefreshUserInfoSuccess: async (context) => {
 *     console.log('User info refreshed:', context.returnValue);
 *   }
 * });
 * ```
 */
export class UserInfoService<User, Store extends AsyncStore<User, string>>
  extends GatewayService<User, UserInfoInterface<User>, Store>
  implements UserInfoServiceInterface<User, Store>
{
  /**
   * Get current user from the store
   *
   * Returns the user information from the store's result.
   * This is a convenience method that accesses the store's result directly.
   *
   * @override
   * @returns The current user information, or `null` if not available
   *
   * @example Get current user
   * ```typescript
   * const user = userInfoService.getUser();
   * if (user) {
   *   console.log('Current user:', user.name);
   * }
   * ```
   *
   * @example Check authentication status
   * ```typescript
   * const user = userInfoService.getUser();
   * const isAuthenticated = user !== null;
   * ```
   */
  getUser(): User | null {
    return this.store.getResult();
  }

  /**
   * Get current user information
   *
   * Retrieves the current user's information. This method may return cached data
   * if available, or fetch from the server if no cache exists.
   *
   * Behavior:
   * - Sets store to loading state before execution
   * - Calls gateway's `getUserInfo` method with provided parameters
   * - Updates store with user info on success
   * - Updates store with error on failure
   * - Triggers plugin hooks (`onGetUserInfoBefore`, `onGetUserInfoSuccess`, `onError`)
   *
   * @template Params - The type of parameters for fetching user info
   * @param params - Optional parameters for fetching user info
   *   Common parameters include:
   *   - Login data (token, credential) for authentication
   *   - User ID for direct lookup
   *   - Additional fields as required by the gateway implementation
   *   @optional
   * @returns Promise resolving to user information, or `null` if not available
   *
   * @example Get user info
   * ```typescript
   * const user = await userInfoService.getUserInfo();
   * if (user) {
   *   console.log('User:', user.name);
   * }
   * ```
   *
   * @example Get user info with parameters
   * ```typescript
   * const user = await userInfoService.getUserInfo({ token: 'abc123' });
   * ```
   *
   * @example Check user info state
   * ```typescript
   * const store = userInfoService.getStore();
   * await userInfoService.getUserInfo();
   *
   * if (store.isSuccess()) {
   *   const user = store.getResult();
   *   console.log('User info:', user);
   * } else if (store.isFailed()) {
   *   const error = store.getError();
   *   console.error('Failed to get user info:', error);
   * }
   * ```
   */
  async getUserInfo<Params>(params?: Params): Promise<User | null> {
    return this.execute(ServiceAction.GET_USER_INFO, params);
  }

  /**
   * Refresh user information
   *
   * Forces a refresh of user information from the server, bypassing any cache.
   * This is useful when user data may have changed on the server.
   *
   * Behavior:
   * - Sets store to loading state before execution
   * - Calls gateway's `refreshUserInfo` method with provided parameters
   * - Always fetches fresh data from server (bypasses cache)
   * - Updates store with refreshed user info on success
   * - Updates store with error on failure
   * - Triggers plugin hooks (`onRefreshUserInfoBefore`, `onRefreshUserInfoSuccess`, `onError`)
   *
   * @template Params - The type of parameters for refreshing user info
   * @param params - Optional parameters for refreshing user info
   *   Common parameters include:
   *   - Login data (token, credential) for authentication
   *   - Force refresh flag
   *   - Additional fields as required by the gateway implementation
   *   @optional
   * @returns Promise resolving to refreshed user information, or `null` if refresh fails
   *
   * @example Refresh user info
   * ```typescript
   * const user = await userInfoService.refreshUserInfo();
   * if (user) {
   *   console.log('Refreshed user:', user);
   * }
   * ```
   *
   * @example Refresh with parameters
   * ```typescript
   * const user = await userInfoService.refreshUserInfo({ force: true });
   * ```
   *
   * @example Periodic refresh
   * ```typescript
   * // Refresh user info every 5 minutes
   * setInterval(async () => {
   *   await userInfoService.refreshUserInfo();
   * }, 5 * 60 * 1000);
   * ```
   */
  async refreshUserInfo<Params>(params?: Params): Promise<User | null> {
    return this.execute(ServiceAction.REFRESH_USER, params);
  }
}
