import {
  AsyncStoreInterface,
  AsyncStoreStateInterface
} from '../../store-state';
import { ExecutorServiceInterface } from './base/ExecutorServiceInterface';

/**
 * Login parameters
 *
 * Parameters for user authentication. Supports multiple authentication methods:
 * - Email + password authentication
 * - Phone + password authentication
 * - Phone + verification code authentication
 *
 * @example Email and password login
 * ```typescript
 * const params: LoginParams = {
 *   email: 'user@example.com',
 *   password: 'password123'
 * };
 * ```
 *
 * @example Phone and code login
 * ```typescript
 * const params: LoginParams = {
 *   phone: '13800138000',
 *   code: '123456'
 * };
 * ```
 */
export interface LoginParams {
  /**
   * User email address
   *
   * Used for email + password authentication.
   * Required when using email-based login.
   *
   * @optional
   */
  email?: string;

  /**
   * User password
   *
   * Used for email/phone + password authentication.
   * Required when using password-based login.
   *
   * @optional
   */
  password?: string;

  /**
   * User phone number
   *
   * Used for phone + password or phone + code authentication.
   * Required when using phone-based login.
   *
   * @optional
   */
  phone?: string;

  /**
   * Verification code
   *
   * Used for phone + code authentication.
   * Required when using code-based login.
   *
   * @optional
   */
  code?: string;
}

/**
 * Login interface
 *
 * Defines the contract for user authentication operations, providing a standardized way to handle
 * login and logout functionality across different implementations. This interface abstracts authentication
 * logic from implementation details, supporting various authentication methods including email/phone
 * with password or verification code. It ensures consistent authentication behavior and enables flexible
 * credential handling through generic types.
 *
 * - Significance: Defines the contract for user authentication operations
 * - Core idea: Abstract login and logout operations from implementation details
 * - Main function: Handle user authentication lifecycle (login and logout)
 * - Main purpose: Ensure consistent authentication behavior across different implementations
 *
 * Core features:
 * - Login: Authenticate users with various credential types (email/phone + password/code)
 * - Logout: Clear authentication state and user data
 * - Flexible parameters: Supports generic parameter types for different authentication methods
 * - Flexible results: Supports generic result types for different credential structures
 *
 * Design decisions:
 * - Generic credential type: Allows different credential structures (tokens, sessions, etc.)
 * - Generic logout parameters: Allows different logout requirements (revokeAll, redirects)
 * - Generic logout result: Allows different logout responses (e.g., success status, redirect URLs)
 *
 * @since 1.8.0
 * @template CredentialType - The type of credential data returned after successful login
 *
 * @example Basic implementation
 * ```typescript
 * class AuthService implements LoginInterface<TokenCredential> {
 *   async login(params: LoginParams): Promise<TokenCredential | null> {
 *     // Implementation
 *   }
 *
 *   async logout(): Promise<void> {
 *     // Implementation
 *   }
 * }
 * ```
 */
export interface LoginInterface<CredentialType> {
  /**
   * Authenticate user with credentials
   *
   * Performs user authentication using provided credentials (email/phone + password, or phone + code).
   * Updates both user and credential stores with the authentication result.
   *
   * @param params - Login parameters (email/phone + password, or phone + code)
   * @returns Promise resolving to credential data
   * @throws Error if authentication fails
   *
   * @example
   * ```typescript
   * // Password login
   * await authService.login({
   *   email: 'user@example.com',
   *   password: 'password123'
   * });
   *
   * // Phone code login
   * await authService.login({
   *   phone: '13800138000',
   *   code: '123456'
   * });
   * ```
   */
  login(params: LoginParams): Promise<CredentialType | null>;

  /**
   * Logout current user
   *
   * Clears authentication state, user data, and credentials.
   * Resets both user and credential stores to initial state.
   *
   * @template LogoutParams - Type of logout parameters (default: void)
   * @template LogoutResult - Type of logout result (default: void)
   *
   * @param params - Optional logout parameters (e.g., revokeAll, redirectUrl, clearCache)
   * @returns Promise resolving to logout result (e.g., success status, redirect URL)
   *
   * @example
   * ```typescript
   * // Basic logout (no params, no return value)
   * await authService.logout();
   *
   * // Logout with parameters
   * await authService.logout<{ revokeAll: boolean }, void>({ revokeAll: true });
   *
   * // Logout with parameters and return value
   * const result = await authService.logout<
   *   { revokeAll: boolean },
   *   { success: boolean; message: string }
   * >({ revokeAll: true });
   * ```
   */
  logout<Parmas = unknown, Result = void>(params?: Parmas): Promise<Result>;
}

/**
 * Login service interface
 *
 * Combines login operations with service infrastructure, extending `LoginInterface` with store and gateway
 * access to provide a complete login service contract. This interface enables reactive login services with
 * persistent state management and API gateway integration. It provides both authentication operations and
 * convenient access to credential data through the integrated store.
 *
 * - Significance: Combines login operations with service infrastructure (store and gateway)
 * - Core idea: Extend `LoginInterface` with store and gateway access for complete login service
 * - Main function: Provide login/logout operations with state management and gateway integration
 * - Main purpose: Enable reactive login services with persistent state and API gateway support
 *
 * Core features:
 * - Login operations: Inherit login and logout methods from `LoginInterface`
 * - Store access: Provides access to async store for state management
 * - Gateway access: Provides access to login gateway for API operations
 * - Credential access: Provides convenient method to get current credential
 *
 * Design decisions:
 * - Extends `LoginInterface`: Inherits login/logout contract
 * - Extends `BaseServiceInterface`: Provides store and gateway infrastructure
 * - Store type matches credential: Store manages credential state
 * - Gateway type matches `LoginInterface`: Gateway provides login operations
 *
 * @template Credential - The type of credential data returned after successful login
 * @template Store - The async store type that manages credential state
 *
 * @example Basic usage
 * ```typescript
 * class LoginService implements LoginServiceInterface<TokenCredential, CredentialStore> {
 *   readonly serviceName = 'LoginService';
 *
 *   getStore(): CredentialStore {
 *     return this.store;
 *   }
 *
 *   getGateway(): LoginInterface<TokenCredential> | null {
 *     return this.gateway;
 *   }
 *
 *   async login(params: LoginParams): Promise<TokenCredential | null> {
 *     // Implementation
 *   }
 *
 *   async logout(): Promise<void> {
 *     // Implementation
 *   }
 *
 *   getCredential(): TokenCredential | null {
 *     return this.store.getResult();
 *   }
 * }
 * ```
 */
export interface LoginServiceInterface<
  Credential,
  Store extends AsyncStoreInterface<AsyncStoreStateInterface<Credential>>
> extends LoginInterface<Credential>,
    ExecutorServiceInterface<Store, LoginInterface<Credential>> {
  /**
   * Get current credential
   *
   * Returns the current credential data if the user is authenticated.
   * This is a convenience method that typically accesses the store's result.
   *
   * @returns The current credential data, or `null` if not authenticated
   *
   * @example Check authentication status
   * ```typescript
   * const credential = loginService.getCredential();
   * if (credential) {
   *   console.log('User is authenticated');
   *   console.log('Token:', credential.token);
   * }
   * ```
   *
   * @example Use credential for API calls
   * ```typescript
   * const credential = loginService.getCredential();
   * if (credential) {
   *   const headers = {
   *     Authorization: `Bearer ${credential.token}`
   *   };
   *   // Make authenticated API call
   * }
   * ```
   */
  getCredential(): Credential | null;
}
