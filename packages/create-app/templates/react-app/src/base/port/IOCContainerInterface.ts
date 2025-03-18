import { ServiceIdentifier } from 'inversify';

/**
 * IOC container
 *
 */
export interface IOCContainerInterface {
  /**
   * configure IOC container
   *
   * eg. may need to manually bind implementation classes
   */
  configure(): void;
  configure<Container>(registers?: IOCRegisterInterface<Container>[]): void;

  /**
   * bind instance
   *
   * @param serviceIdentifier
   * @param value
   */
  bind<T>(serviceIdentifier: ServiceIdentifier<T>, value: T): void;

  /**
   * get instance
   *
   * @param serviceIdentifier
   * @returns
   */
  get<T>(serviceIdentifier: ServiceIdentifier<T>): T;
}

export interface IOCRegisterInterface<T> {
  register(container: T, thisArg: IOCContainerInterface): void;
}
