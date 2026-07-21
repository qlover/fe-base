import type { StoreUpdateValue } from '../../store-state';
import {
  AsyncStore,
  type AsyncStoreOptions
} from '../../store-state/impl/AsyncStore';
import type {
  UserStateInterface,
  UserStoreInterface
} from '../interface/UserStoreInterface';

/**
 * Options for creating a UserStore instance
 *
 * Extends {@link AsyncStoreOptions}. Persistence uses a single `persist` port with
 * `persistKeys` (default `['credential']`). Pass `persistKeys: ['result', 'credential']`
 * to also cache user info in the same snapshot.
 *
 * @template State - State extending {@link UserStateInterface}
 * @template Key - Persist key type
 * @template Opt - Persist options type
 */
export interface UserStoreOptions<
  State extends UserStateInterface<unknown, unknown>,
  Key,
  Opt = unknown
> extends AsyncStoreOptions<State, Key, Opt> {}

/**
 * User store implementation
 *
 * - Significance: Unified store for user authentication operations with credential persistence
 * - Core idea: Extends {@link AsyncStore} to manage both user info and credential in a single store
 * - Main function: Provide unified state management for authentication operations (login/logout)
 * - Main purpose: Enable efficient authentication state management with credential persistence
 *
 * **Important: This store is ONLY for authentication operations (login/logout).**
 * Other operations (getUserInfo, register, refreshUserInfo) should manage their own state separately.
 *
 * **Persistence Behavior:**
 * - **Default**: `persistKeys` is `['credential']` — only credential is written to `persist`
 *   - User info (`result`) stays in memory unless you add `'result'` to `persistKeys`
 * - **Dual pick** (optional): `persistKeys: ['result', 'credential']` stores both in one snapshot
 * - When `persist` is set, `initRestore` defaults to `true` (pass `false` to skip)
 *
 * Core features:
 * - Unified state: Single store managing both credential and user info for authentication
 * - Async lifecycle: Inherits async operation lifecycle from AsyncStore (start, success, failed, reset)
 * - Credential-first persistence: Default pick is credential only
 * - Enhanced methods: `start` and `success` support optional credential parameter for convenience
 *
 * Design decisions:
 * - Extends AsyncStore: Inherits async lifecycle and `persistKeys` pick persistence
 * - Dual management: Manages credential and userInfo separately but in unified state
 * - Authentication-only: This store is only for login/logout operations
 * - Restore does **not** set status to `SUCCESS`; callers decide after validation
 *
 * @since `1.8.0`
 * @template User - The type of user object
 * @template Credential - The type of credential data returned after login
 * @template Key - The type of keys used in storage
 * @template Opt - The type of options for storage operations
 *
 * @example Basic usage (persist only credential)
 * ```typescript
 * const store = new UserStore<User, Credential>({
 *   persist: new KeyStorage('auth-session', storageAdapter)
 * });
 *
 * store.start();
 * store.success(userInfo, credential);
 * // Credential is persisted; user info is in memory only (default persistKeys)
 *
 * if (store.getStatus() === 'success') {
 *   const user = store.getUser();
 *   const token = store.getCredential();
 * }
 * ```
 *
 * @example Persist credential and user info in one snapshot
 * ```typescript
 * const store = new UserStore<User, Credential>({
 *   persist: new KeyStorage('auth-session', storageAdapter),
 *   persistKeys: ['result', 'credential']
 * });
 *
 * store.success(userInfo, credential);
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
 * const store = new UserStore<User, Credential>({});
 * const port = store.getStore();
 *
 * port.subscribe((state) => {
 *   if (state.loading) {
 *     console.log('Authentication in progress...');
 *   } else if (state.status === 'success') {
 *     console.log('Authenticated:', state.result);
 *   }
 * });
 * ```
 */
export class UserStore<User, Credential, Key, Opt = unknown>
  extends AsyncStore<UserStateInterface<User, Credential>, Key, Opt>
  implements UserStoreInterface<User, Credential>
{
  /**
   * Constructor for UserStore
   *
   * Defaults `persistKeys` to `['credential']`. When `persist` is set, `initRestore`
   * defaults to `true` (auth stores usually hydrate on construct).
   *
   * @param options - Optional AsyncStore options (`persist`, `persistKeys`, `initRestore`, …)
   *   @optional
   *
   * @example Persist only credential (default)
   * ```typescript
   * const store = new UserStore<User, Credential>({
   *   persist: new KeyStorage('auth-session', storageAdapter)
   * });
   * ```
   *
   * @example Persist credential and user info
   * ```typescript
   * const store = new UserStore<User, Credential>({
   *   persist: new KeyStorage('auth-session', storageAdapter),
   *   persistKeys: ['result', 'credential']
   * });
   * ```
   */
  constructor(
    options?: UserStoreOptions<UserStateInterface<User, Credential>, Key, Opt>
  ) {
    super({
      ...options,
      persistKeys:
        options?.persistKeys ??
        (['credential'] as (keyof UserStateInterface<User, Credential>)[]),
      initRestore: options?.initRestore ?? !!options?.persist
    });
  }

  /**
   * Restore state from storage
   *
   * Restores fields listed in `persistKeys` via {@link AsyncStore.restore}.
   * Returns the restored credential (or `null`).
   *
   * **Important Design Decision:**
   * This method **does NOT automatically set status to `SUCCESS`** when credential is restored.
   * Different applications have different authentication requirements:
   * - Some may need to validate credential expiration
   * - Some may need to verify credential validity with the server
   * - Some may require additional permission checks
   * - Some may consider restored credential as valid immediately
   *
   * **Developers must decide** when to set status to `SUCCESS` based on their application's
   * authentication logic. The store only restores the data; it does not make authentication decisions.
   *
   * @override
   * @returns The restored credential value, or `null` if not available
   *
   * @example Restore credential and manually set status based on validation
   * ```typescript
   * const store = new UserStore<User, Credential>({
   *   persist: new KeyStorage('auth-session', storageAdapter),
   *   initRestore: true
   * });
   *
   * const credential = store.getCredential();
   * if (credential) {
   *   if (credential.expiresAt && Date.now() < credential.expiresAt) {
   *     store.emit({
   *       status: AsyncStoreStatus.SUCCESS,
   *       loading: false,
   *       error: null
   *     });
   *   } else {
   *     store.setCredential(null);
   *   }
   * }
   * ```
   *
   * @example Treat restored credential as valid immediately
   * ```typescript
   * const store = new UserStore<User, Credential>({
   *   persist: new KeyStorage('auth-session', storageAdapter),
   *   initRestore: true
   * });
   *
   * const credential = store.getCredential();
   * if (credential) {
   *   store.emit({
   *     status: AsyncStoreStatus.SUCCESS,
   *     loading: false,
   *     error: null,
   *     endTime: Date.now()
   *   });
   * }
   * ```
   */
  public override restore<R = Credential | null>(): R | null {
    super.restore();
    return this.getCredential() as R;
  }

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
  public start(result?: User, credential?: Credential): void {
    super.start(result);

    if (credential) {
      this.setCredential(credential);
    }
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
   * - Updates `result`, and optionally `credential` if provided
   *
   * @override
   * @param result - User information to store upon successful authentication
   * @param credential - Optional credential to store
   *   If provided, credential is set and persisted (when in `persistKeys`) with user info
   *   @optional
   *
   * @example Mark success with user info and credential
   * ```typescript
   * store.success(
   *   { id: '123', name: 'John Doe' },
   *   { token: 'abc123', expiresIn: 3600 }
   * );
   * // Now:
   * // - result === { id: '123', name: 'John Doe' }
   * // - credential === { token: 'abc123', expiresIn: 3600 }
   * // - status === 'success'
   * // - loading === false
   * ```
   *
   * @example Mark success with user info only
   * ```typescript
   * store.success(userInfo);
   * // Only updates result; credential remains unchanged
   * ```
   */
  public success(result: User | null, credential?: Credential | null): void {
    super.success(result);

    // Set credential only if explicitly provided (including null)
    // If not provided (undefined), preserve existing credential
    if (credential !== undefined) {
      this.setCredential(credential);
    }
  }

  /**
   * Get the current credential
   *
   * Returns the current credential data if available.
   * This is a convenience method that accesses the state's credential property directly.
   *
   * @override
   * @returns The current credential data, or `null` if not available
   */
  public getCredential(): Credential | null {
    return this.getState().credential ?? null;
  }

  /**
   * Set the credential
   *
   * Updates the credential in the store state and persists when `'credential'` is in
   * `persistKeys` (the default).
   *
   * @override
   * @param credential - The credential to store, or `null` to clear
   */
  public setCredential(credential: Credential | null): void {
    this.emit({
      credential: credential
    } as StoreUpdateValue<UserStateInterface<User, Credential>>);
  }

  /**
   * Get the current user information
   *
   * Returns the current user information if available. This is a convenience method
   * that accesses the state's `result` property directly.
   *
   * @override
   * @returns The current user information, or `null` if not available
   */
  public getUser(): User | null {
    return this.getState().result ?? null;
  }

  /**
   * Set the user information
   *
   * Updates the user information in the store state.
   * Persists only when `'result'` is included in `persistKeys`
   * (not the default — default pick is credential only).
   *
   * @override
   * @param user - The user information to store, or `null` to clear
   */
  public setUser(user: User | null): void {
    this.emit({
      result: user
    } as StoreUpdateValue<UserStateInterface<User, Credential>>);
  }
}
