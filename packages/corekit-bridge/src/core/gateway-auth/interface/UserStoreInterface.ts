import {
  AsyncStoreInterface,
  AsyncStoreStateInterface,
  PersistentStoreInterface
} from '../../store-state';

/**
 * User service store state interface
 *
 * - Significance: Unified state interface for user service authentication operations only
 * - Core idea: Extend AsyncStoreStateInterface to include credential and user info for authentication
 * - Main function: Provide unified state management for authentication operations (login/logout)
 * - Main purpose: Enable single store to manage authentication state efficiently
 *
 * **Important: This store is ONLY for authentication operations (login/logout).**
 * Other operations (getUserInfo, register, refreshUserInfo) should manage their own state separately.
 *
 * This interface combines:
 * - AsyncStoreStateInterface: Provides async operation lifecycle (loading, result, error, timing, status)
 * - Authentication-specific state: credential for authentication operations
 *
 * Core features:
 * - Unified state: Single state object managing credential and user info for authentication
 * - Async lifecycle: Inherits loading, error, timing, status from AsyncStoreStateInterface
 * - Authentication-focused: All state properties are for authentication operations only
 * - Type-safe: Generic types for Credential and User ensure type safety
 *
 * State property purposes (all for authentication operations only):
 * - `loading`: Indicates if authentication operation is in progress (login/logout)
 * - `result`: Stores user information (User type) after successful authentication
 * - `error`: Stores error information when authentication operation fails
 * - `startTime/endTime`: Tracks authentication operation duration for performance monitoring
 * - `status`: Authentication operation status ('draft' | 'pending' | 'success' | 'failed' | 'stopped')
 * - `credential`: Stores authentication credential separately from user info
 * - `userInfo`: Stores user information (same as result, but provides direct access)
 *
 * Design decisions:
 * - Extends AsyncStoreStateInterface<User>: Result type is fixed to User (user information)
 * - Separate credential: Credential is managed separately from result for independent lifecycle
 * - Single status tracking: Uses `status` for authentication state (no separate loginStatus)
 * - Authentication-only: This store is only for login/logout operations
 * - Other operations: getUserInfo, register, refreshUserInfo should manage their own state
 *
 * @template Credential - The type of credential data returned after login
 * @template User2 - The type of user object
 *
 * @example Basic usage
 * ```typescript
 * interface UserServiceState extends UserServiceStoreState<TokenCredential, User> {}
 *
 * const state: UserServiceState = {
 *   loading: false,        // Authentication operation in progress
 *   result: null,          // User information (after successful authentication)
 *   error: null,           // Error from failed authentication operation
 *   startTime: 0,          // Authentication operation start timestamp
 *   endTime: 0,            // Authentication operation end timestamp
 *   status: 'draft',       // Authentication operation status
 *   credential: null,     // Authentication credential (separate from user info)
 *   userInfo: null         // User information (same as result, direct access)
 * };
 * ```
 */
export interface UserStateInterface<User, Credential>
  extends AsyncStoreStateInterface<User> {
  /**
   * Authentication credential (typically a token)
   *
   * Stores the credential returned from login operation.
   * This is separate from `result` to allow independent management of credential and user info.
   * Credential lifecycle is independent from user info lifecycle.
   *
   * @optional
   */
  credential?: Credential | null;
}

/**
 * User service store interface
 *
 * - Significance: Unified store interface for user service authentication operations only
 * - Core idea: Extend AsyncStoreInterface to provide unified state management for authentication
 * - Main function: Manage credential and user info states for authentication operations (login/logout)
 * - Main purpose: Enable efficient state management for authentication with single store instance
 *
 * **Important: This store is ONLY for authentication operations (login/logout).**
 * Other operations (getUserInfo, register, refreshUserInfo) should manage their own state separately.
 *
 * Core features:
 * - Unified state: Single store managing both credential and user info for authentication
 * - Async lifecycle: Inherits async operation lifecycle from AsyncStoreInterface (start, success, failed, reset)
 * - Store access: Provides access to underlying store for reactive subscriptions
 * - Credential persistence: Only credential is persisted, user info is stored in memory only
 *
 * Design decisions:
 * - Extends AsyncStoreInterface: Inherits async operation lifecycle management
 * - Dual management: Manages credential and userInfo separately but in unified state
 * - Authentication-only: This store is only for login/logout operations
 * - Status tracking: Uses `status` field for authentication state (no separate loginStatus)
 * - Credential persistence: Only credential is persisted, user info is not persisted
 * - Store adapters: Can be adapted to AsyncStore<Credential> and AsyncStore<User> for compatibility
 *
 * @template User - The type of credential data returned after login
 * @template Credential - The type of user object
 *
 * @example Basic usage
 * ```typescript
 * const store = new UserServiceStore<TokenCredential, User>({
 *   credentialStorage: { key: 'token', storage: sessionStorage }
 * });
 *
 * // Start authentication
 * store.start();
 *
 * // Mark success with user info (credential will be set separately)
 * store.success(userInfo);
 * store.setCredential(credential);
 *
 * // Check authentication status
 * if (store.getStatus() === 'success') {
 *   const user = store.getUserInfo();
 *   const token = store.getCredential();
 * }
 * ```
 *
 * @example Reactive usage
 * ```typescript
 * const store = new UserServiceStore<TokenCredential, User>({});
 * const underlyingStore = store.getStore();
 *
 * // Subscribe to state changes
 * underlyingStore.observe((state) => {
 *   if (state.loading) {
 *     console.log('Authentication in progress...');
 *   } else if (state.status === 'success') {
 *     console.log('Authenticated:', state.userInfo);
 *   }
 * });
 * ```
 */
export interface UserStoreInterface<User, Credential>
  extends AsyncStoreInterface<UserStateInterface<User, Credential>> {
  /**
   * Get the underlying store instance
   *
   * Returns the store instance that provides reactive state access and subscription capabilities.
   * This enables reactive programming patterns with state subscriptions.
   *
   * @override
   * @returns The store instance for reactive state access and subscriptions
   *
   * @example Subscribe to state changes
   * ```typescript
   * const store = userServiceStore.getStore();
   * store.observe((state) => {
   *   console.log('State changed:', state);
   * });
   * ```
   */
  getStore(): PersistentStoreInterface<
    UserStateInterface<User, Credential>,
    unknown,
    unknown
  >;

  /**
   * Start authentication process
   *
   * Marks the beginning of an authentication operation (login or logout).
   * Optionally accepts a credential to set immediately when operation starts.
   *
   * **This method is ONLY for authentication operations (login/logout).**
   * Other operations (getUserInfo, register, refreshUserInfo) should manage their own state.
   *
   * @override
   * @param result - Optional user information to set before operation starts
   *   Useful for optimistic updates or when resuming a previous operation
   *   @optional
   * @param credential - Optional credential to set immediately when operation starts
   *   If provided, credential is set and persisted before operation begins
   *   @optional
   *
   * @example Start authentication
   * ```typescript
   * store.start();
   * ```
   *
   * @example Start with credential
   * ```typescript
   * store.start(undefined, credential);
   * ```
   */
  start(result?: User, credential?: Credential | string | null): void;

  /**
   * Mark authentication as successful
   *
   * Marks the end of an authentication operation (login or logout) with success.
   * Optionally accepts both user info and credential to update atomically.
   *
   * **This method is ONLY for authentication operations (login/logout).**
   * Other operations (getUserInfo, register, refreshUserInfo) should manage their own state.
   *
   * @override
   * @param result - User information to store upon successful authentication
   *   Both `userInfo` and `result` are updated to this value
   * @param credential - Optional credential to store (Credential object or string token)
   *   If provided, credential is set and persisted atomically with user info
   *   If string is provided, it will be stored as-is (for simple token scenarios)
   *   @optional
   *
   * @example Mark success with user info and credential
   * ```typescript
   * store.success(userInfo, credential);
   * ```
   *
   * @example Mark success with user info only
   * ```typescript
   * store.success(userInfo);
   * ```
   */
  success(result: User, credential?: Credential | string | null): void;

  /**
   * Get the current credential
   *
   * Returns the current credential data if available.
   * This is a convenience method
   * that accesses the state's credential property directly.
   *
   * @returns The current credential data, or `null` if not available
   *
   * @example Get credential
   * ```typescript
   * const credential = store.getCredential();
   * if (credential) {
   *   console.log('Token:', credential.token);
   * }
   * ```
   */
  getCredential(): Credential | null;

  /**
   * Set the credential
   *
   * Updates the credential in the store state and persists to storage (if configured).
   * **Only credential is persisted**, user information is stored in memory only.
   *
   * @param credential - The credential to store, or `null` to clear
   *
   * @example Set credential
   * ```typescript
   * store.setCredential({ token: 'abc123', expiresIn: 3600 });
   * ```
   *
   * @example Clear credential
   * ```typescript
   * store.setCredential(null);
   * ```
   */
  setCredential(credential: Credential | null): void;

  /**
   * Get the current user information
   *
   * Returns the current user information if available. This is a convenience method
   * that accesses the state's userInfo property directly.
   *
   * @returns The current user information, or `null` if not available
   *
   * @example Get user info
   * ```typescript
   * const user = store.getUser();
   * if (user) {
   *   console.log('User:', user.name);
   * }
   * ```
   */
  getUser(): User | null;

  /**
   * Set the user information
   *
   * Updates the user information in the store state (in memory only).
   * **User information is NOT persisted** - it will be cleared on page reload.
   * Only credential is persisted.
   *
   * @param user - The user information to store, or `null` to clear
   *
   * @example Set user info
   * ```typescript
   * store.setUser({ id: '123', name: 'John Doe', email: 'john@example.com' });
   * ```
   *
   * @example Clear user info
   * ```typescript
   * store.setUser(null);
   * ```
   */
  setUser(user: User | null): void;
}
