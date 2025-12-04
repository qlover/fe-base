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
