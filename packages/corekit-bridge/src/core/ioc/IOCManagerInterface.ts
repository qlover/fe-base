import type { IOCContainerInterface } from './IOCContainerInterface';

export interface IOCManagerInterface<Container extends IOCContainerInterface> {
  get<T>(identifier: unknown): T;

  /**
   * implement IOC container
   */
  implement(container: Container): void;

  get implemention(): Container | null;
}
