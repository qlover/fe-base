import { AsyncStore } from '../../store-state';
import type { RegisterInterface } from '../interface/RegisterInterface';
import type { RegisterServiceInterface } from '../interface/RegisterServiceInterface';
import { GatewayService } from './GatewayService';
import { ServiceAction } from './ServiceAction';

/**
 * Register service implementation
 *
 * Concrete implementation of the registration service that provides user account creation functionality
 * with integrated state management. This service extends `GatewayService` to handle user registration
 * operations, automatically managing registration state through an async store. It supports various
 * registration methods and provides reactive state updates for UI integration.
 *
 * - Significance: Provides user registration functionality with state management
 * - Core idea: Extend `GatewayService` to handle user registration operations
 * - Main function: Execute registration through gateway and manage registration state
 * - Main purpose: Enable reactive registration services with persistent state and API gateway support
 *
 * Core features:
 * - User registration: Register new users through configured gateway
 * - State management: Track registration state (loading, success, error) via async store
 * - Gateway integration: Execute registration through gateway interface
 * - Plugin support: Supports plugins for custom registration logic
 *
 * Design decisions:
 * - Extends `GatewayService`: Inherits store, gateway, and executor infrastructure
 * - Implements `RegisterServiceInterface`: Provides registration contract
 * - Uses `ServiceAction.REGISTER`: Identifies registration action for plugin hooks
 * - Generic result type: Supports different user structures returned after registration
 *
 * @template Result - The type of user object returned after successful registration
 * @template Store - The async store type that manages registration state
 *
 * @example Basic usage
 * ```typescript
 * const registerService = new RegisterService<User>(
 *   'RegisterService',
 *   {
 *     gateway: new UserGateway(),
 *     logger: new Logger()
 *   }
 * );
 *
 * const user = await registerService.register({
 *   email: 'user@example.com',
 *   password: 'password123',
 *   code: '123456'
 * });
 * ```
 *
 * @example With plugin
 * ```typescript
 * registerService.use({
 *   onRegisterBefore: async (context) => {
 *     console.log('Starting registration...');
 *   },
 *   onRegisterSuccess: async (context) => {
 *     console.log('Registration successful:', context.returnValue);
 *   }
 * });
 * ```
 */
export class RegisterService<
    Result,
    Store extends AsyncStore<Result, string> = AsyncStore<Result, string>
  >
  extends GatewayService<Result, RegisterInterface<Result>, Store>
  implements RegisterServiceInterface<Result, Store>
{
  /**
   * Get the registered user from the store
   *
   * Returns the user information from the store's result.
   * This is a convenience method that accesses the store's result directly.
   *
   * @override
   * @returns The registered user information, or `null` if registration hasn't succeeded
   *
   * @example Get registered user
   * ```typescript
   * const user = registerService.getUser();
   * if (user) {
   *   console.log('Registered user:', user.name);
   * }
   * ```
   */
  public getUser(): Result | null {
    return this.store.getResult();
  }

  /**
   * Register a new user
   *
   * Creates a new user account with the provided registration parameters.
   * Executes the registration through the configured gateway and updates the store state.
   *
   * Behavior:
   * - Sets store to loading state before execution
   * - Calls gateway's `register` method with provided parameters
   * - Updates store with registration result on success
   * - Updates store with error on failure
   * - Triggers plugin hooks (`onRegisterBefore`, `onRegisterSuccess`, `onError`)
   *
   * @template Params - The type of registration parameters
   * @param params - Registration parameters containing user information
   *   Common parameters include:
   *   - `email`: User email address
   *   - `phone`: User phone number
   *   - `password`: User password
   *   - `code`: Verification code (for phone/email verification)
   *   - Additional fields as required by the gateway implementation
   * @returns Promise resolving to user information if registration succeeds, or `null` if it fails
   *
   * @example Email registration
   * ```typescript
   * const user = await registerService.register({
   *   email: 'user@example.com',
   *   password: 'password123',
   *   code: '123456'
   * });
   *
   * if (user) {
   *   console.log('Registration successful:', user);
   * }
   * ```
   *
   * @example Phone registration
   * ```typescript
   * const user = await registerService.register({
   *   phone: '13800138000',
   *   password: 'password123',
   *   code: '123456'
   * });
   * ```
   *
   * @example Check registration state
   * ```typescript
   * const store = registerService.getStore();
   * await registerService.register(params);
   *
   * if (store.isSuccess()) {
   *   const user = store.getResult();
   *   console.log('User registered:', user);
   * } else if (store.isFailed()) {
   *   const error = store.getError();
   *   console.error('Registration failed:', error);
   * }
   * ```
   */
  public async register<Params>(params: Params): Promise<Result | null> {
    return this.execute(ServiceAction.REGISTER, params);
  }
}
