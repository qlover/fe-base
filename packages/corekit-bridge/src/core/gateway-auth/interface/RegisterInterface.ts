import {
  AsyncStoreInterface,
  AsyncStoreStateInterface
} from '../../store-state';
import { ExecutorServiceInterface } from './base/ExecutorServiceInterface';
import { UserInfoGetter } from './UserInfoInterface';

/**
 * Register interface
 *
 * Defines the contract for user registration operations, providing a standardized way to create new
 * user accounts across different implementations. This interface abstracts registration logic from
 * implementation details, supporting various registration methods and user data structures. It ensures
 * consistent registration behavior and enables flexible user type handling through generic result types.
 *
 * - Significance: Defines the contract for user registration operations
 * - Core idea: Abstract registration logic from implementation details
 * - Main function: Handle user account creation
 * - Main purpose: Ensure consistent registration behavior across different implementations
 *
 * Core features:
 * - User registration: Create new user accounts with validation
 * - Flexible parameters: Supports generic parameter types for different registration methods
 * - Flexible results: Supports generic result types for different user structures
 *
 * Design decisions:
 * - Generic result type: Allows different user structures to be returned
 * - Generic parameters: Allows different registration methods (email, phone, etc.)
 * - Returns null on failure: Provides clear indication of registration failure
 *
 * @since 1.8.0
 * @template Result - The type of user object returned after successful registration
 *
 * @example Basic implementation
 * ```typescript
 * class AuthService implements RegisterInterface<User> {
 *   async register(params: RegisterParams): Promise<User | null> {
 *     // Implementation
 *   }
 * }
 * ```
 *
 * @example With custom parameters
 * ```typescript
 * interface CustomRegisterParams {
 *   email: string;
 *   password: string;
 *   code: string;
 * }
 *
 * class AuthService implements RegisterInterface<User> {
 *   async register(params: CustomRegisterParams): Promise<User | null> {
 *     // Implementation
 *   }
 * }
 * ```
 */
export interface RegisterInterface<Result> {
  /**
   * Register a new user
   *
   * Creates a new user account with the provided registration parameters.
   * Validates input, creates the account, and returns the registered user information.
   *
   * Behavior:
   * - Validates registration parameters (email, phone, password, code, etc.)
   * - Creates new user account in the system
   * - Returns user information upon successful registration
   * - Returns `null` if registration fails
   *
   * @template Params - The type of registration parameters
   * @param params - Registration parameters containing user information
   *   Common parameters include:
   *   - `email`: User email address
   *   - `phone`: User phone number
   *   - `password`: User password
   *   - `code`: Verification code (for phone/email verification)
   *   - Additional fields as required by the implementation
   * @returns Promise resolving to user information if registration succeeds, or `null` if it fails
   *
   * @example Email registration
   * ```typescript
   * const user = await authService.register({
   *   email: 'user@example.com',
   *   password: 'password123',
   *   code: '123456'
   * });
   * ```
   *
   * @example Phone registration
   * ```typescript
   * const user = await authService.register({
   *   phone: '13800138000',
   *   password: 'password123',
   *   code: '123456'
   * });
   * ```
   *
   * @example Handle registration failure
   * ```typescript
   * const user = await authService.register(params);
   * if (!user) {
   *   console.error('Registration failed');
   * }
   * ```
   */
  register(params: unknown): Promise<Result | null>;
}

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
    ExecutorServiceInterface<Store, RegisterInterface<User>>,
    UserInfoGetter<User> {}
