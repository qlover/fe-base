// ! dont't import tsx, only ts file
import type { IOCContainerInterface } from '@lib/bootstrap';
import type {
  IOCIdentifierMap,
  IOCFunctionInterface
} from '@/base/port/IOCFunctionInterface';
import type { ServiceIdentifier } from 'inversify';

let implemention: IOCContainerInterface | null;

function ioc<T>(serviceIdentifier: ServiceIdentifier<T>): T;
function ioc<K extends keyof IOCIdentifierMap>(
  serviceIdentifier: K
): IOCIdentifierMap[K];
function ioc<T, K extends keyof IOCIdentifierMap>(
  serviceIdentifier: ServiceIdentifier<T> | K
): T | IOCIdentifierMap[K] {
  if (!implemention) {
    throw new Error('IOC is not implemented');
  }
  return implemention.get(serviceIdentifier);
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
export const IOC: IOCFunctionInterface = Object.assign(ioc, {
  get implemention() {
    return implemention;
  },
  implement: (container: IOCContainerInterface) => {
    implemention = container;
  },
  get: ioc
});
