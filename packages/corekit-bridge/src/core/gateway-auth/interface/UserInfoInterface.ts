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
  getUserInfo<Params>(params?: Params): Promise<User | null>;

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
