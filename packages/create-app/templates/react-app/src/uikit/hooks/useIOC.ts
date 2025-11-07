import { useContext } from 'react';
import type { IOCIdentifierMap } from '@config/IOCIdentifier';
import { IOCContext } from './../contexts/IOCContext';
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
  const IOC = useContext(IOCContext);

  if (!IOC) {
    throw new Error('IOC is not found');
  }

  if (identifier === undefined) {
    return IOC;
  }

  return IOC(identifier);
}
