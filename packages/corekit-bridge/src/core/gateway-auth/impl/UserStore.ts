import { AsyncStore } from '../../store-state/impl/AsyncStore';
import { AsyncStoreStatus } from '../../store-state/impl/AsyncStoreStatus';
import {
  UserStateInterface,
  UserStoreInterface
} from '../interface/UserStoreInterface';

/**
 * User store implementation
 *
 * - Significance: Unified store for user authentication operations with credential persistence
 * - Core idea: Extends AsyncStore to manage both user info and credential in a single store
 * - Main function: Provide unified state management for authentication operations (login/logout)
 * - Main purpose: Enable efficient authentication state management with credential persistence
 *
 * **Important: This store is ONLY for authentication operations (login/logout).**
 * Other operations (getUserInfo, register, refreshUserInfo) should manage their own state separately.
 *
 * Core features:
 * - Unified state: Single store managing both credential and user info for authentication
 * - Async lifecycle: Inherits async operation lifecycle from AsyncStore (start, success, failed, reset)
 * - Credential persistence: Only credential is persisted, user info is stored in memory only
 * - Enhanced methods: `start` and `success` support optional credential parameter for convenience
 *
 * Design decisions:
 * - Extends AsyncStore: Inherits async operation lifecycle management
 * - Dual management: Manages credential and userInfo separately but in unified state
 * - Authentication-only: This store is only for login/logout operations
 * - Credential persistence: Only credential is persisted, user info is not persisted
 * - Enhanced methods: `start` and `success` can accept credential for atomic updates
 *
 * @template Credential - The type of credential data returned after login
 * @template User - The type of user object
 *
 * @example Basic usage
 * ```typescript
 * const store = new UserStore<TokenCredential, User>({
 *   credentialStorage: { key: 'token', storage: sessionStorage }
 * });
 *
 * // Start authentication
 * store.start();
 *
 * // Mark success with user info and credential
 * store.success(userInfo, credential);
 *
 * // Check authentication status
 * if (store.getStatus() === 'success') {
 *   const user = store.getUserInfo();
 *   const token = store.getCredential();
 * }
 * ```
 *
 * @example Using start with credential
 * ```typescript
 * store.start(undefined, credential);
 * // Credential is set immediately when operation starts
 * ```
 *
 * @example Reactive usage
 * ```typescript
 * const store = new UserStore<TokenCredential, User>({});
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
export class UserStore<Credential, User, Key = string, Opt = unknown>
  extends AsyncStore<User, UserStateInterface<Credential, User>, Key, Opt>
  implements UserStoreInterface<Credential, User>
{
  /**
   * Start authentication process
   *
   * Marks the beginning of an authentication operation (login or logout).
   * Optionally accepts a credential to set immediately when operation starts.
   *
   * **This method is ONLY for authentication operations (login/logout).**
   * Other operations (getUserInfo, register, refreshUserInfo) should manage their own state.
   *
   * Behavior:
   * - Sets `status` to `'pending'` (authentication operation started)
   * - Sets `loading` to `true` (indicates authentication operation in progress)
   * - Records `startTime` timestamp (for performance tracking)
   * - Clears `error` (sets to `null`)
   * - Optionally sets `credential` if provided
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
   * // Now: status === 'pending', loading === true, startTime === Date.now()
   * ```
   *
   * @example Start with credential
   * ```typescript
   * store.start(undefined, credential);
   * // Credential is set immediately when operation starts
   * ```
   */
  override start(result?: User, credential?: Credential): void {
    super.start(result);
    this.setCredential(credential ?? null);
  }

  /**
   * Mark authentication as successful
   *
   * Marks the end of an authentication operation (login or logout) with success.
   * Optionally accepts both user info and credential to update atomically.
   *
   * **This method is ONLY for authentication operations (login/logout).**
   * Other operations (getUserInfo, register, refreshUserInfo) should manage their own state.
   *
   * Behavior:
   * - Sets `status` to `'success'` (authentication operation succeeded)
   * - Sets `loading` to `false` (operation completed)
   * - Records `endTime` timestamp (for performance tracking and duration calculation)
   * - Clears `error` (sets to `null`)
   * - Updates `userInfo`, `result`, and optionally `credential` if provided
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
   * store.success(
   *   { id: '123', name: 'John Doe' },
   *   { token: 'abc123', expiresIn: 3600 }
   * );
   * // Now:
   * // - userInfo === { id: '123', name: 'John Doe' }
   * // - result === { id: '123', name: 'John Doe' }
   * // - credential === { token: 'abc123', expiresIn: 3600 }
   * // - status === 'success'
   * // - loading === false
   * ```
   *
   * @example Mark success with user info only
   * ```typescript
   * store.success(userInfo);
   * // Only updates userInfo and result, credential remains unchanged
   * ```
   */
  override success(result: User, credential?: Credential | null): void {
    // Update state with success status and user info
    this.updateState({
      loading: false,
      result,
      error: null,
      status: AsyncStoreStatus.SUCCESS,
      endTime: Date.now()
    });

    // Set credential if provided
    if (credential !== undefined) {
      this.setCredential(credential ?? null);
    }
  }

  /**
   * Get the current credential
   *
   * Returns the current credential data if available.
   * This is a convenience method that accesses the state's credential property directly.
   *
   * @returns The current credential data, or `null` if not available
   */
  getCredential(): Credential | null {
    return this.getState().credential ?? null;
  }

  /**
   * Set the credential
   *
   * Updates the credential in the store state and persists to storage (if configured).
   * **Only credential is persisted**, user information is stored in memory only.
   *
   * @param credential - The credential to store, or `null` to clear
   */
  setCredential(credential: Credential | null): void {
    // Update state with credential
    this.updateState<UserStateInterface<Credential, User>>({
      credential: credential
    });
  }

  /**
   * Get the current user information
   *
   * Returns the current user information if available. This is a convenience method
   * that accesses the state's userInfo property directly.
   *
   * @returns The current user information, or `null` if not available
   */
  getUser(): User | null {
    return this.getState().result ?? null;
  }

  /**
   * Set the user information
   *
   * Updates the user information in the store state (in memory only).
   * **User information is NOT persisted** - it will be cleared on page reload.
   * Only credential is persisted.
   *
   * @param userInfo - The user information to store, or `null` to clear
   */
  setUser(userInfo: User | null): void {
    this.updateState({
      result: userInfo
    });
  }
}
