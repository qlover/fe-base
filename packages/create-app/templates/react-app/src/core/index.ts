// ! dont't import tsx, only ts file
import { ServiceIdentifier, IOCInterface } from '@/base/port/IOCInterface';

export type IOCFunction = {
  <T>(serviceIdentifier: ServiceIdentifier<T>): T;
  /**
   * IOC container instance
   */
  implemention: IOCInterface | null;
  /**
   * implement IOC container
   */
  implement(container: IOCInterface): void;
};

export const IOC: IOCFunction = Object.assign(
  function <T>(serviceIdentifier: ServiceIdentifier<T>): T {
    if (!IOC.implemention) {
      throw new Error('IOC is not implemented');
    }
    return IOC.implemention.get(serviceIdentifier);
  },
  {
    implemention: null,
    implement: (container: IOCInterface) => {
      // FIXME: maybe runtimes configure
      container.configure();
      IOC.implemention = container;
    }
  }
);
