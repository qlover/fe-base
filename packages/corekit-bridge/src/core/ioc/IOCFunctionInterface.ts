/* eslint-disable @typescript-eslint/no-explicit-any*/

import { IOCContainerInterface } from './IOCContainerInterface';
import { IOCManagerInterface } from './IOCManagerInterface';

export type Constructor<T = any> = new (...args: any[]) => T;
export type ServiceIdentifier<T = any> =
  | string
  | symbol
  | Constructor<T>
  | (new (...args: any[]) => T)
  | (abstract new (...args: any[]) => T);

/**
 * IOC function
 *
 * eg.
 * ```ts
 * const a = IOC(A);
 * const logger = IOC(ConstanstIdentifier.Logger);
 * ```
 *
 */
export interface IOCFunctionInterface<
  IOCIdentifierMap,
  Container extends IOCContainerInterface = IOCContainerInterface
> extends IOCManagerInterface<Container> {
  /**
   * get constant identifier
   *
   * Preferred match for simple types
   */
  <K extends keyof IOCIdentifierMap>(serviceIdentifier: K): IOCIdentifierMap[K];

  /**
   * get service identifier
   */
  <T>(serviceIdentifier: ServiceIdentifier<T>): T;

  get<K extends keyof IOCIdentifierMap>(
    serviceIdentifier: K
  ): IOCIdentifierMap[K];
  get<T>(serviceIdentifier: ServiceIdentifier<T>): T;
}
