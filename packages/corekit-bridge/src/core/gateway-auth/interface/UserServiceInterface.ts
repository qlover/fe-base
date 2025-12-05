import { LoginInterface } from './LoginInterface';
import { RegisterInterface } from './RegisterInterface';
import { UserInfoInterface } from './UserInfoInterface';
import { UserStoreInterface } from './UserStoreInterface';

/**
 * User service gateway interface
 *
 * - Significance: Defines the combined gateway contract for user-related operations
 * - Core idea: Combine login, registration, and user info operations into a single gateway
 * - Main function: Provide unified gateway interface for all user operations
 * - Main purpose: Enable single gateway to handle complete user lifecycle
 *
 * This interface combines three separate interfaces:
 * - `LoginInterface`: Handles user authentication (login/logout)
 * - `RegisterInterface`: Handles user registration
 * - `UserInfoInterface`: Handles user information retrieval
 *
 * @template User - The type of user object
 * @template Credential - The type of credential data returned after login
 *
 * @example Gateway implementation
 * ```typescript
 * class UserGateway implements UserServiceGateway<User, TokenCredential> {
 *   async login(params: LoginParams): Promise<TokenCredential | null> {
 *     // Implementation
 *   }
 *
 *   async logout(): Promise<void> {
 *     // Implementation
 *   }
 *
 *   async register(params: RegisterParams): Promise<User | null> {
 *     // Implementation
 *   }
 *
 *   async getUserInfo(): Promise<User | null> {
 *     // Implementation
 *   }
 *
 *   async refreshUserInfo(): Promise<User | null> {
 *     // Implementation
 *   }
 * }
 * ```
 */
export interface UserServiceGateway<User, Credential>
  extends LoginInterface<Credential>,
    RegisterInterface<User>,
    UserInfoInterface<User> {}

/**
 * User service interface
 *
 * - Significance: Defines the complete contract for user service operations
 * - Core idea: Combine gateway operations with service infrastructure and authentication checking
 * - Main function: Provide unified user service with login, registration, and user info capabilities
 * - Main purpose: Enable complete user management in a single service
 *
 * Core features:
 * - User operations: Login, logout, register, getUserInfo, refreshUserInfo
 * - Store access: Access to credential store
 * - Authentication check: Verify if user is currently authenticated
 *
 * Design decisions:
 * - Extends `UserServiceGateway`: Inherits all gateway operations
 * - Unified store: Single store manages both credential and user info
 * - Authentication check: Verifies unified store for authentication status
 *
 * @template User - The type of user object
 * @template Credential - The type of credential data returned after login
 *
 * @example Basic usage
 * ```typescript
 * class MyUserService implements UserServiceInterface<User, TokenCredential> {
 *   // Implementation
 * }
 * ```
 */
export interface UserServiceInterface<User, Credential>
  extends UserServiceGateway<User, Credential> {
  /**
   * Get the credential store instance
   *
   * Returns the store instance that manages credential state (from login service).
   * This store tracks login status, credentials, and authentication errors.
   *
   * @returns The async store instance for credential state
   *
   * @example Access credential store
   * ```typescript
   * const store = userService.getStore();
   * const credential = store.getResult();
   * const isLoading = store.getLoading();
   * ```
   */
  getStore(): UserStoreInterface<User, Credential>;

  /**
   * Check if user is authenticated
   *
   * Verifies that both credential and user info stores have successful results,
   * indicating that the user is fully authenticated.
   *
   * @returns `true` if user is authenticated (both stores have valid results), `false` otherwise
   *
   * @example Check authentication status
   * ```typescript
   * if (userService.isAuthenticated()) {
   *   console.log('User is authenticated');
   * } else {
   *   console.log('User is not authenticated');
   * }
   * ```
   */
  isAuthenticated(): boolean;
}
