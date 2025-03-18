/**
 * IOC identifier
 *
 * @description
 * IOC identifier is used to identify the service in the IOC container.
 *
 * @example
 * ```ts
 * const a = IOC(IOCIdentifier.JSON);
 * ```
 */
export const IOCIdentifier = Object.freeze({
  JSON: 'JSON',
  JSONStorage: 'JSONStorage',
  Logger: 'Logger'
});
