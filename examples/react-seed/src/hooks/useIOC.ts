/* eslint-disable @typescript-eslint/no-explicit-any */
import { IOC as GIOC } from '@/globals';
import type { IOCIdentifierMap } from '@config/ioc-identifier';
import type {
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge';

type IOCIdentifier = keyof IOCIdentifierMap | (new (...args: any[]) => any);

export function useIOC(): IOCFunctionInterface<
  IOCIdentifierMap,
  IOCContainerInterface
>;
export function useIOC<T extends IOCIdentifier>(
  identifier: T
): T extends keyof IOCIdentifierMap
  ? IOCIdentifierMap[T]
  : T extends new (...args: any[]) => any
    ? InstanceType<T>
    : never;

export function useIOC<T extends IOCIdentifier>(identifier?: T) {
  if (identifier === undefined) {
    return GIOC;
  }

  return GIOC(identifier);
}
