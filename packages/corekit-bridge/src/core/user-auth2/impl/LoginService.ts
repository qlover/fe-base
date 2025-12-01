import {
  AsyncStore,
  type AsyncStoreInterface,
  type AsyncStoreStateInterface
} from '../../store-state';
import type {
  LoginInterface,
  LoginParams
} from '../interface/base/LoginInterface';
import type { LoginServiceInterface } from '../interface/LoginServiceInterface';

export interface LoginCredential {
  token?: string;
}

/**
 * Login service implementation
 *
 * @template Credential - Login credential type
 * @template Store - Store type for login state
 * @param store - Store instance for login state
 * @param gateway - Gateway instance for authentication
 * @returns Login service instance
 *
 * @example Simple usage
 * ```typescript
 * const loginService = new LoginService();
 * const store = loginService.getStore();
 * store.start();
 * ```
 */
export class LoginService<
  Credential extends LoginCredential,
  Store extends AsyncStoreInterface<
    AsyncStoreStateInterface<Credential>
  > = AsyncStore<Credential, string>
> implements LoginServiceInterface<Credential, Store>
{
  protected readonly store: Store;

  constructor(
    store?: Store,
    protected readonly gateway: LoginInterface<Credential> | null = null
  ) {
    const targetStore: AsyncStoreInterface<
      AsyncStoreStateInterface<Credential>
    > =
      store ??
      // use default store if no store is provided
      new AsyncStore<Credential, string>();

    this.store = targetStore as Store;
  }

  /**
   * Get the store instance for reactive state access
   *
   * @override
   * @returns The store instance for reactive state access
   */
  getStore(): Store {
    return this.store as Store;
  }

  /**
   * Get the gateway instance for authentication
   *
   * @override
   * @returns The gateway instance for authentication
   */
  getGateway(): LoginInterface<Credential> | null {
    return this.gateway;
  }

  /**
   * Get the credential from the store
   *
   * @override
   * @returns The credential from the store
   */
  getCredential(): Credential | null {
    return this.store.getState().result;
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
  async login<Params extends LoginParams>(params: Params): Promise<Credential> {
    if (!this.gateway) {
      return Promise.resolve({} as Credential);
    }

    this.store.start();

    try {
      const result = await this.gateway.login(params);

      this.store.success(result);

      return result;
    } catch (error) {
      this.store.failed(error);
      throw error;
    }
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
  async logout<LogoutParams, LogoutResult = void>(
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
