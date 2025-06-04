import { IOCManagerInterface } from './IOCManagerInterface';

/**
 * IOC container
 *
 */
export interface IOCContainerInterface {
  /**
   * bind instance
   *
   * @param serviceIdentifier
   * @param value
   */
  bind<T>(serviceIdentifier: unknown, value: T): void;

  /**
   * get instance
   *
   * @param serviceIdentifier
   * @returns
   */
  get<T>(serviceIdentifier: unknown): T;
}

/**
 * IOC register
 */
export interface IOCRegisterInterface<
  Container extends IOCContainerInterface,
  Opt = unknown
> {
  register(
    container: Container,
    manager: IOCManagerInterface<Container>,
    options?: Opt
  ): void;
}
