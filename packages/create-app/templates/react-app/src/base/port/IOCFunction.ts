import { ServiceIdentifier } from 'inversify';
import type { IOCContainerInterface } from './IOCContainerInterface';

export type IOCFunction = {
  <T>(serviceIdentifier: ServiceIdentifier<T>): T;

  /**
   * implement IOC container
   */
  implement(container: IOCContainerInterface): void;

  get implemention(): IOCContainerInterface | null;
};
