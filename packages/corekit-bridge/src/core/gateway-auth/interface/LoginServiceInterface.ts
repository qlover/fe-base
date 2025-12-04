import {
  AsyncStoreInterface,
  AsyncStoreStateInterface
} from '../../store-state';
import { LoginInterface } from './LoginInterface';
import { BaseServiceInterface } from './BaseServiceInterface';

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
    BaseServiceInterface<Store, LoginInterface<Credential>> {
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
