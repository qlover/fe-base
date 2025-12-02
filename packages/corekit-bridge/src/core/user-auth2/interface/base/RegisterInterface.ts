/**
 * Register interface
 *
 * Defines the contract for user registration operations.
 * This interface focuses solely on registration behavior.
 *
 * @template Params - Type of registration parameters
 * @template Result - Type of user object returned after registration
 *
 * @example
 * ```typescript
 * class AuthService implements RegisterInterface<RegisterParams, User> {
 *   async register(params: RegisterParams): Promise<User> {
 *     // Implementation
 *   }
 * }
 * ```
 */
export interface RegisterInterface<Result> {
  /**
   * Register a new user
   *
   * Creates a new user account and returns the registered user information.
   *
   * @param params - Registration parameters (e.g., email, phone, password, verification code)
   * @returns Promise resolving to user information
   * @throws Error if registration fails
   *
   * @example
   * ```typescript
   * await authService.register({
   *   email: 'user@example.com',
   *   password: 'password123',
   *   code: '123456'
   * });
   * ```
   */
  register<Params>(params: Params): Promise<Result | null>;
}
