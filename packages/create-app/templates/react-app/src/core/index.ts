// ! dont't import tsx, only ts file
import type { IOCContainerInterface } from '@/base/port/IOCContainerInterface';
import type { IOCFunction } from '@/base/port/IOCFunction';
import type { ServiceIdentifier } from 'inversify';

let implemention: IOCContainerInterface | null;

export const IOC: IOCFunction = Object.assign(
  function <T>(serviceIdentifier: ServiceIdentifier<T>): T {
    if (!implemention) {
      throw new Error('IOC is not implemented');
    }
    return implemention.get(serviceIdentifier);
  },
  {
    get implemention() {
      return implemention;
    },
    implement: (container: IOCContainerInterface) => {
      // FIXME: maybe runtimes configure
      container.configure();
      implemention = container;
    }
  }
);
