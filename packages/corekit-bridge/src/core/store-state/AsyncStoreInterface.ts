import { KeyStorageInterface } from '@qlover/fe-corekit';
import { AsyncStateInterface } from './AsyncStateInterface';
import { StoreInterface } from './StoreInterface';

export interface AsyncStateAction<T, State extends AsyncStateInterface<T>> {
  /**
   * Start authentication process
   * Marks the beginning of an async authentication operation
   */
  start(result?: T): void;

  /**
   * Stop authentication process
   * Marks the end of an async authentication operation
   */
  stopped(error?: unknown, result?: T): void;

  /**
   * Mark authentication as failed
   * @param error - The error that occurred
   * @param result - The result of the authentication operation
   */
  failed(error: unknown, result?: T): void;

  /**
   * Mark authentication as successful
   * @param result - The result of the authentication operation
   */
  success(result: T): void;

  /**
   * Reset store state to initial state
   * Clears all state data and resets to default values
   */
  reset(): void;

  /**
   * Get current store state
   * @returns Current state object
   */
  getState(): State;

  /**
   * Update store state
   * @param state - Partial state object to merge into current state
   */
  updateState(state: Partial<State>): void;
}

export interface AsyncStoreInterface<
  T,
  State extends AsyncStateInterface<T>,
  Key
> extends AsyncStateAction<T, State> {
  /**
   * The name of the auth store
   * @returns The name of the auth store
   */
  getAuthStoreName(): string;

  /**
   * Get the underlying store instance
   * This allows reactive state access and subscription
   *
   * - If this extends StoreInterface, it will return itself.
   *
   * @returns The store instance for reactive state access
   */
  getStore(): StoreInterface<State>;

  /**
   * Set the key storage implementation
   * @param storage - The key-value storage implementation for persistence
   */
  setStorage(storage: KeyStorageInterface<Key, T>): void;

  /**
   * Get the current key storage implementation
   * @returns The key storage instance or null if not set
   */
  getStorage(): KeyStorageInterface<Key, T> | null;
}
