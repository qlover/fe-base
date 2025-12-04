import {
  AsyncStoreInterface,
  AsyncStoreStateInterface
} from '../../store-state';
import { RegisterInterface } from './RegisterInterface';
import { BaseServiceInterface } from './BaseServiceInterface';
import { UserInfoGetter } from './UserInfoServiceInterface';

/**
 * Register service interface
 *
 * Combines registration operations with service infrastructure, extending `RegisterInterface` with store
 * and gateway access to provide a complete registration service contract. This interface enables reactive
 * registration services with persistent state management and API gateway integration. It provides both
 * registration operations and convenient access to registered user information through the integrated store.
 *
 * - Significance: Combines registration operations with service infrastructure (store and gateway)
 * - Core idea: Extend `RegisterInterface` with store and gateway access for complete registration service
 * - Main function: Provide registration operations with state management and gateway integration
 * - Main purpose: Enable reactive registration services with persistent state and API gateway support
 *
 * Core features:
 * - Registration operations: Inherit register method from `RegisterInterface`
 * - Store access: Provides access to async store for state management
 * - Gateway access: Provides access to registration gateway for API operations
 * - User access: Provides convenient method to get registered user information
 *
 * Design decisions:
 * - Extends `RegisterInterface`: Inherits registration contract
 * - Extends `BaseServiceInterface`: Provides store and gateway infrastructure
 * - Extends `UserInfoGetter`: Provides convenient user access method
 * - Store type matches user: Store manages registered user state
 * - Gateway type matches `RegisterInterface`: Gateway provides registration operations
 *
 * @template User - The type of user object returned after successful registration
 * @template Store - The async store type that manages user state
 *
 * @example Basic usage
 * ```typescript
 * class RegisterService implements RegisterServiceInterface<User, UserStore> {
 *   readonly serviceName = 'RegisterService';
 *
 *   getStore(): UserStore {
 *     return this.store;
 *   }
 *
 *   getGateway(): RegisterInterface<User> | null {
 *     return this.gateway;
 *   }
 *
 *   async register(params: RegisterParams): Promise<User | null> {
 *     // Implementation
 *   }
 *
 *   getUser(): User | null {
 *     return this.store.getResult();
 *   }
 * }
 * ```
 */
export interface RegisterServiceInterface<
  User,
  Store extends AsyncStoreInterface<AsyncStoreStateInterface<User>>
> extends RegisterInterface<User>,
    BaseServiceInterface<Store, RegisterInterface<User>>,
    UserInfoGetter<User> {}
