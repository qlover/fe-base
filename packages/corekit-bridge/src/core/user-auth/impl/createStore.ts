import { KeyStorageInterface } from '@qlover/fe-corekit';
import {
  UserAuthStoreOptions,
  type UserAuthStoreInterface
} from '../interface/UserAuthStoreInterface';
import { UserAuthStore } from './UserAuthStore';
import { PickUser } from './UserAuthState';
import { InferState, UserAuthOptions } from './UserAuthService';
import { TokenStorage, TokenStorageOptions } from '../../storage';

const defaultCredentialKey = 'auth_token';

/**
 * Token storage value type definition
 *
 * Significance: Provides flexible storage configuration options
 * Core idea: Union type supporting both direct storage instances and configuration objects
 * Main function: Enable pluggable storage strategies for authentication tokens
 * Main purpose: Support different storage backends (localStorage, sessionStorage, memory, etc.)
 *
 * @example
 * // Using direct storage instance
 * const storage: TokenStorageValueType<string, User> = new TokenStorage('user_key');
 *
 * // Using configuration object
 * const storageConfig: TokenStorageValueType<string, User> = {
 *   key: 'user_data',
 *   expiresIn: 'month',
 *   storage: localStorage
 * };
 */
export type TokenStorageValueType<Key, Value> =
  | KeyStorageInterface<Key, Value>
  | (TokenStorageOptions<Key> & {
      /**
       * Storage key identifier
       */
      key: Key;
    });

/**
 *
 * Extract property value from URL query parameters
 *
 * Significance: Utility function for secure URL parameter extraction
 * Core idea: Safe parsing of URL query parameters with error handling
 * Main function: Extract and decode specific parameter values from URLs
 * Main purpose: Support OAuth redirects and magic link authentication flows
 *
 * @param href - Complete URL string to parse
 * @param key - Parameter name to extract
 * @returns Decoded parameter value or empty string if not found/invalid
 *
 * @example
 * const token = getURLProperty(
 *   'https://app.com/callback?token=abc123&state=xyz',
 *   'token'
 * );
 * console.log(token); // 'abc123'
 */
function getURLProperty(href: string, key: string): string {
  try {
    // Remove fragment identifier first
    const urlWithoutFragment = href.split('#')[0];
    const queryString = urlWithoutFragment.split('?')[1];

    if (!queryString) {
      return '';
    }

    const params = new URLSearchParams(queryString);
    const rawValue = params.get(key);

    if (rawValue == null || rawValue === '') {
      return '';
    }

    // Decode and guard against malformed URI sequences
    try {
      return decodeURIComponent(rawValue);
    } catch {
      return '';
    }
  } catch {
    return '';
  }
}

function isUserAuthStore<User>(
  store: unknown
): store is UserAuthStoreInterface<User> {
  if (store == null || typeof store !== 'object') {
    return false;
  }

  // Check if the store has the required methods
  const storeObj = store as Record<string, unknown>;
  return (
    typeof storeObj.setUserStorage === 'function' &&
    typeof storeObj.getUserStorage === 'function' &&
    typeof storeObj.setCredentialStorage === 'function' &&
    typeof storeObj.getCredentialStorage === 'function' &&
    typeof storeObj.startAuth === 'function' &&
    typeof storeObj.authSuccess === 'function' &&
    typeof storeObj.authFailed === 'function' &&
    typeof storeObj.reset === 'function'
  );
}

/**
 * Parse and create storage implementation from configuration
 *
 * Converts storage configuration into concrete storage instances:
 * - Returns null if storage is disabled (false)
 * - Returns existing instance if already a storage implementation
 * - Creates new TokenStorage instance from configuration object
 *
 * @param value - Storage configuration, instance, or false to disable
 * @returns Storage implementation or null if disabled
 */
function parseStorage<Value>(
  value?: TokenStorageValueType<string, Value> | false
): KeyStorageInterface<string, Value> | null {
  if (value === false || value === undefined) {
    return null;
  }

  if (value instanceof KeyStorageInterface) {
    return value;
  }

  const { key, ...options } = value;
  return new TokenStorage(key, options);
}

/**
 * Create and configure user authentication store
 *
 * Significance: Factory function for creating properly configured authentication stores
 * Core idea: Flexible store creation supporting both direct instances and configuration objects
 * Main function: Initialize store with appropriate storage backends and URL token extraction
 * Main purpose: Simplify store setup with pluggable storage and configuration options
 *
 * @param options - Authentication service configuration options
 * @returns Configured user authentication store instance
 *
 * @example
 * // Using existing store instance
 * const store = createStore({
 *   store: existingStoreInstance
 * });
 *
 * // Using configuration object
 * const store = createStore({
 *   store: {
 *     userStorage: {
 *       key: 'user_profile',
 *       storage: localStorage,
 *       expiresIn: 'week'
 *     },
 *     credentialStorage: {
 *       key: 'auth_token',
 *       storage: sessionStorage
 *     }
 *   },
 *   href: window.location.href,
 *   tokenKey: 'access_token'
 * });
 */
export function createStore<T>(
  options: UserAuthOptions<InferState<T>>
): UserAuthStoreInterface<PickUser<InferState<T>>> {
  const { store, userStorage, credentialStorage, href, tokenKey } = options;

  // Create or use existing store
  let _store: UserAuthStoreInterface<PickUser<InferState<T>>>;

  // Parse storage configurations
  const _userStorage = parseStorage<PickUser<InferState<T>>>(userStorage);
  const _credentialStorage = parseStorage<string>(credentialStorage);

  if (isUserAuthStore<PickUser<InferState<T>>>(store)) {
    // Use existing store instance
    _store = store;
  } else {
    // Create new UserAuthStore from configuration
    const storeOptions = store || {};

    // Create UserAuthStore with parsed storage options
    const userAuthStoreOptions: UserAuthStoreOptions<PickUser<InferState<T>>> =
      {
        userStorage: _userStorage,
        credentialStorage: _credentialStorage,
        ...storeOptions
      };

    _store = new UserAuthStore(userAuthStoreOptions) as UserAuthStoreInterface<
      PickUser<InferState<T>>
    >;
  }

  // Set credential storage if not already configured
  if (!_store.getCredentialStorage() && _credentialStorage) {
    const credentialStorage = parseStorage<string>(_credentialStorage);
    if (credentialStorage) {
      _store.setCredentialStorage(credentialStorage);
    }
  }

  // Extract and set credential from URL if configured
  const urlCredential = getURLCredential(
    href,
    tokenKey || _store.getCredentialStorage()?.key || defaultCredentialKey
  );

  if (urlCredential) {
    _store.setCredential(urlCredential);
  }

  return _store;
}

/**
 * Extract authentication credential from URL
 *
 * @param href - URL string to parse for credentials
 * @param key - Parameter name to extract from URL
 * @returns Extracted credential or empty string if not found
 */
function getURLCredential(href?: string, key?: string): string {
  if (!href || !key) {
    return '';
  }

  return getURLProperty(href, key);
}
