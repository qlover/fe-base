import { IOCContainerInterface } from './IOCContainerInterface';
import type {
  IOCFunctionInterface,
  ServiceIdentifier
} from './IOCFunctionInterface';

/**
 * Creates an IOC function factory
 *
 * @description
 * Creates an IOC function for retrieving and managing dependency-injected service instances.
 * Supports service retrieval using strings, Symbols, or class constructors as identifiers.
 *
 * @template IdentifierMap - Type mapping from identifiers to service types, defaults to empty record
 * @param impl - IOC container implementation
 *
 * @example
 * ```typescript
 * // Basic usage
 * const ioc = createIOCFunction(container);
 * const service = ioc(ServiceClass);
 *
 * // Using type mapping
 * interface MyServices {
 *   'logger': Logger;
 *   'config': Config;
 * }
 * const ioc = createIOCFunction<MyServices>(container);
 * const logger = ioc('logger');
 * ```
 *
 * @returns Enhanced IOC function that includes:
 * - Direct invocation for service instance retrieval
 * - implemention property to get current container implementation
 * - implement method to update container implementation
 * - get method as an alias for function invocation
 */
export function createIOCFunction<IdentifierMap = Record<never, never>>(
  impl: IOCContainerInterface
): IOCFunctionInterface<IdentifierMap> {
  /**
   * IOC function overload
   * @param serviceIdentifier - Key from identifier mapping
   */
  function ioc<K extends keyof IdentifierMap>(
    serviceIdentifier: K
  ): IdentifierMap[K];
  /**
   * IOC function overload
   * @param serviceIdentifier - Service identifier (string, Symbol, or class constructor)
   */
  function ioc<S>(serviceIdentifier: ServiceIdentifier<S>): S;
  /**
   * IOC function implementation
   * @param serviceIdentifier - Service identifier
   * @returns Service instance
   * @throws {Error} When service is not found in container
   */
  function ioc<S, K extends keyof IdentifierMap>(
    serviceIdentifier: ServiceIdentifier<S> | K
  ): S | IdentifierMap[K] {
    return impl.get(serviceIdentifier);
  }

  return Object.assign(ioc, {
    /**
     * Gets the current IOC container implementation
     * @returns Current IOC container instance
     */
    get implemention() {
      return impl;
    },
    /**
     * Updates the IOC container implementation
     * @param container - New IOC container implementation
     */
    implement: (container: IOCContainerInterface) => {
      impl = container;
    },
    /**
     * Alias method for getting service instances
     * Functions identically to direct IOC function invocation
     */
    get: ioc
  });
}
