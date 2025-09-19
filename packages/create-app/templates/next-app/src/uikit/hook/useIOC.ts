import { useContext } from 'react';
import type { IOCIdentifierMap } from '@config/IOCIdentifier';
import { IOCContext } from '../context/IOCContext';
import type {
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IOCIdentifier = keyof IOCIdentifierMap | (new (...args: any[]) => any);

export function useIOC(): IOCFunctionInterface<
  IOCIdentifierMap,
  IOCContainerInterface
>;
export function useIOC<T extends IOCIdentifier>(
  identifier: T
): T extends keyof IOCIdentifierMap
  ? IOCIdentifierMap[T]
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends new (...args: any[]) => any
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
