/**
 * Storage token interface
 *
 * @description
 * Storage token interface is used to store and retrieve token from the storage.
 */
export interface StorageTokenInterface {
  /**
   * Get token
   *
   * @returns {string} token
   */
  getToken(): string;

  /**
   * Set token
   *
   * @param {string} token
   * @param {number} expireTime
   */
  setToken(token: string, expireTime?: number): void;

  /**
   * Remove token
   */
  removeToken(): void;
}
