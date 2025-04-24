/* eslint-disable @typescript-eslint/no-explicit-any*/
import type { IOCManagerInterface } from '@qlover/corekit-bridge';

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
export interface IOCFunctionInterface<IOCIdentifierMap>
  extends IOCManagerInterface {
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
