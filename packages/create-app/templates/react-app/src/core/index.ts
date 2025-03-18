// ! dont't import tsx, only ts file
import type { IOCContainerInterface } from '@/base/port/IOCContainerInterface';
import type { IOCFunction } from '@/base/port/IOCFunction';
import type { ServiceIdentifier } from 'inversify';

let implemention: IOCContainerInterface | null;

function ioc<T>(serviceIdentifier: ServiceIdentifier<T>): T {
  if (!implemention) {
    throw new Error('IOC is not implemented');
  }
  return implemention.get(serviceIdentifier);
}

export const IOC: IOCFunction = Object.assign(ioc, {
  get implemention() {
    return implemention;
  },
  implement: (container: IOCContainerInterface) => {
    implemention = container;
  }
});
