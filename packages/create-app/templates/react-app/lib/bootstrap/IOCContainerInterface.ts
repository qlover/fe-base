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
  bind<T>(serviceIdentifier: unknown, value: T): void;

  /**
   * get instance
   *
   * @param serviceIdentifier
   * @returns
   */
  get<T>(serviceIdentifier: unknown): T;
}

export interface IOCRegisterInterface<T> {
  register(container: T, thisArg: IOCContainerInterface): void;
}
