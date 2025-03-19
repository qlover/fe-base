// ! dont't import tsx, only ts file
import type { IOCContainerInterface } from '@lib/bootstrap';
import type { IOCFunctionInterface } from '@/base/port/IOCFunctionInterface';
import type { JSONSerializer, JSONStorage, Logger } from '@qlover/fe-utils';
import type { ServiceIdentifier } from 'inversify';
import type { StorageTokenInterface } from '@/base/port/StorageTokenInterface';

/**
 * IOC identifier
 *
 * @description
 * IOC identifier is used to identify the service in the IOC container.
 *
 * @example
 * ```ts
 * const a = IOC(IOCIdentifier.JSON);
 * const b = IOC('JSON');
 * ```
 */
export const IOCIdentifier = Object.freeze({
  JSON: 'JSON',
  JSONStorage: 'JSONStorage',
  Logger: 'Logger',
  FeApiToken: 'FeApiToken'
});

/**
 * IOC identifier map
 */
export type IOCIdentifierMap = {
  [IOCIdentifier.JSON]: JSONSerializer;
  [IOCIdentifier.JSONStorage]: JSONStorage;
  [IOCIdentifier.Logger]: Logger;
  [IOCIdentifier.FeApiToken]: StorageTokenInterface;
};

ioc.implemention = null as IOCContainerInterface | null;

function ioc<T>(serviceIdentifier: ServiceIdentifier<T>): T;
function ioc<K extends keyof IOCIdentifierMap>(
  serviceIdentifier: K
): IOCIdentifierMap[K];
function ioc<T, K extends keyof IOCIdentifierMap>(
  serviceIdentifier: ServiceIdentifier<T> | K
): T | IOCIdentifierMap[K] {
  if (!ioc.implemention) {
    throw new Error('IOC is not implemented');
  }
  return ioc.implemention.get(serviceIdentifier);
}

/**
 * IOC manager function.
 *
 * eg.
 * ```ts
 * class A {}
 * const a = IOC(A);
 * ```
 *
 * or
 * ```ts
 * const a = IOC<A>();
 * ```
 *
 * or use get(),
 */
export const IOC: IOCFunctionInterface<IOCIdentifierMap> = Object.assign(ioc, {
  get implemention() {
    return ioc.implemention;
  },
  implement: (container: IOCContainerInterface) => {
    ioc.implemention = container;
  },
  get: ioc
});
