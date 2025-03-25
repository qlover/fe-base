import type { IOCContainerInterface } from './IOCContainerInterface';

export interface IOCManagerInterface {
  get<T>(identifier: unknown): T;

  /**
   * implement IOC container
   */
  implement(container: IOCContainerInterface): void;

  get implemention(): IOCContainerInterface | null;
}
