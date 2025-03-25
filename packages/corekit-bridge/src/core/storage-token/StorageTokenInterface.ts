import { ExpiresInType } from "./QuickerTime";

/**
 * Storage token interface
 *
 * @description
 * Storage token interface is used to store and retrieve token from the storage.
 */
export interface StorageTokenInterface<Value> {
  /**
   * Get token
   *
   * @returns {Value} token
   */
  getToken(): Value;

  /**
   * Set token
   *
   * @param {Value} token
   * @param {ExpiresInType} expiresIn
   */
  setToken(token: Value, expiresIn?: ExpiresInType): void;

  /**
   * Remove token
   */
  removeToken(): void;
}
