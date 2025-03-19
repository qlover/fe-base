import type { IOCManagerInterface } from '@lib/bootstrap';
import type { JSONSerializer, JSONStorage, Logger } from '@qlover/fe-utils';
import type { ServiceIdentifier } from 'inversify';
import type { IOCIdentifier } from '@/base/consts/IOCIdentifier';
import type { StorageTokenInterface } from '@/base/port/StorageTokenInterface';

export type IOCIdentifierMap = {
  [IOCIdentifier.JSON]: JSONSerializer;
  [IOCIdentifier.JSONStorage]: JSONStorage;
  [IOCIdentifier.Logger]: Logger;
  [IOCIdentifier.FeApiToken]: StorageTokenInterface;
};

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
export interface IOCFunctionInterface extends IOCManagerInterface {
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
