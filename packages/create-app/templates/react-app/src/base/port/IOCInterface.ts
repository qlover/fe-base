export interface Abstract<T> {
  prototype: T;
}
export type Newable<T, Args extends unknown[] = unknown[]> = new (
  ...args: Args
) => T;

export type ServiceIdentifier<T = unknown> =
  | string
  | symbol
  | Newable<T>
  | Abstract<T>;

/**
 * IOC container
 *
 */
export interface IOCInterface {
  /**
   * configure IOC container
   */
  configure(): void;

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

  /**
   * You can also use the override method to specify a replacement at runtime
   *
   * However, it may have performance issues because it creates an additional instance
   *
   * @param serviceIdentifier
   * @param value
   */
  override<T>(serviceIdentifier: ServiceIdentifier<T>, value: T): void;
}

export interface IOCRegisterInterface {
  register(container: IOCInterface): void;
}
