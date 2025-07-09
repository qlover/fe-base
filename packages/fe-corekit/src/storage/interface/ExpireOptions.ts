export interface ExpireOptions {
  /**
   * Expire time
   *
   * maybe is
   * - number: milliseconds
   * - string: time string, like '1d', '1h', '1m', '1s'
   * - object: {}
   * - ...
   *
   * Subclass implementation
   */
  expires?: unknown;
}
