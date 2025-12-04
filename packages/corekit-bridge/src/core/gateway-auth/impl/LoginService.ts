import { AsyncStore } from '../../store-state';
import type { LoginInterface, LoginParams } from '../interface/LoginInterface';
import type { LoginServiceInterface } from '../interface/LoginServiceInterface';
import { GatewayService } from './GatewayService';
import { ServiceAction } from './ServiceAction';

/**
 * Login service implementation
 *
 * Concrete implementation of the login service that provides user authentication functionality with
 * integrated state management. This service extends `GatewayService` to handle login and logout operations,
 * automatically managing credential state through an async store. It supports various authentication methods
 * and ensures security by always clearing local state on logout, even if the gateway logout fails.
 *
 * - Significance: Provides user authentication functionality with state management
 * - Core idea: Extend `GatewayService` to handle login and logout operations
 * - Main function: Execute authentication through gateway and manage credential state
 * - Main purpose: Enable reactive login services with persistent state and API gateway support
 *
 * Core features:
 * - User login: Authenticate users with various credential types (email/phone + password/code)
 * - User logout: Clear authentication state and call logout gateway
 * - State management: Track login state (loading, success, error) via async store
 * - Gateway integration: Execute login/logout through gateway interface
 * - Plugin support: Supports plugins for custom login logic
 * - Security: Always clears local state on logout, even if gateway logout fails
 *
 * Design decisions:
 * - Extends `GatewayService`: Inherits store, gateway, and executor infrastructure
 * - Implements `LoginServiceInterface`: Provides login contract
 * - Uses `ServiceAction.LOGIN`: Identifies login action for plugin hooks
 * - Generic credential type: Supports different credential structures (tokens, sessions, etc.)
 * - Logout security: Always resets local state in `finally` block for security
 *
 * @template Credential - The type of credential data returned after successful login
 * @template Store - The async store type that manages credential state
 *
 * @example Basic usage
 * ```typescript
 * const loginService = new LoginService<TokenCredential>(
 *   'LoginService',
 *   {
 *     gateway: new AuthGateway(),
 *     logger: new Logger()
 *   }
 * );
 *
 * const credential = await loginService.login({
 *   email: 'user@example.com',
 *   password: 'password123'
 * });
 * ```
 *
 * @example With plugin
 * ```typescript
 * loginService.use({
 *   onLoginBefore: async (context) => {
 *     console.log('Starting login...');
 *   },
 *   onLoginSuccess: async (context) => {
 *     console.log('Login successful:', context.returnValue);
 *   }
 * });
 * ```
 */
export class LoginService<
    Credential,
    Store extends AsyncStore<Credential, string> = AsyncStore<
      Credential,
      string
    >
  >
  extends GatewayService<Credential, LoginInterface<Credential>, Store>
  implements LoginServiceInterface<Credential, Store>
{
  /**
   * Get the credential from the store
   *
   * @override
   * @returns The credential from the store
   */
  public getCredential(): Credential | null {
    return this.store.getResult();
  }

  /**
   * Authenticate user with credentials
   *
   * Performs user authentication using provided credentials through the configured gateway.
   * Updates the store state with the authentication result.
   *
   * @override
   * @param params - Login parameters (email/phone + password, or phone + code)
   * @returns Promise resolving to credential data
   * @throws Error if gateway is not set or authentication fails
   *
   * @example
   * ```typescript
   * // Password login
   * await loginService.login({
   *   email: 'user@example.com',
   *   password: 'password123'
   * });
   *
   * // Phone code login
   * await loginService.login({
   *   phone: '13800138000',
   *   code: '123456'
   * });
   * ```
   */
  public async login<Params extends LoginParams>(
    params: Params
  ): Promise<Credential | null> {
    return this.execute(ServiceAction.LOGIN, params);
  }

  /**
   * Logout current user
   *
   * Clears authentication credential state and calls the logout gateway if configured.
   * Always resets local store state regardless of gateway logout result for security.
   *
   * @override
   * @template LogoutParams - Type of logout parameters (default: void)
   * @template LogoutResult - Type of logout result (default: void)
   * @param params - Optional logout parameters (e.g., revokeAll, redirectUrl, clearCache)
   * @returns Promise resolving to logout result (e.g., success status, redirect URL)
   * @throws Error if gateway logout fails (note: local state is still cleared for security)
   *
   * @example
   * ```typescript
   * // Basic logout
   * await loginService.logout();
   *
   * // Logout with parameters
   * await loginService.logout<{ revokeAll: boolean }, void>({ revokeAll: true });
   *
   * // Logout with error handling
   * try {
   *   await loginService.logout();
   *   console.log('Successfully logged out');
   * } catch (error) {
   *   console.error('Logout API error:', error.message);
   *   // User is still logged out locally for security
   * }
   * ```
   */
  public async logout<LogoutParams, LogoutResult = void>(
    params?: LogoutParams
  ): Promise<LogoutResult> {
    try {
      if (this.gateway) {
        return await this.gateway.logout(params);
      }
      return undefined as LogoutResult;
    } finally {
      // Always reset local state regardless of gateway logout result for security
      this.store.reset();
    }
  }
}
