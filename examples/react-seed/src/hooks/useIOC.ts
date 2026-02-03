import { IOC as GIOC } from '@/globals';
import type { IOCIdentifierMap } from '@config/IOCIdentifier';
import type {
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge';

type IOCIdentifier =
  | keyof IOCIdentifierMap
  | (new (...args: unknown[]) => unknown);

export function useIOC(): IOCFunctionInterface<
  IOCIdentifierMap,
  IOCContainerInterface
>;
export function useIOC<T extends IOCIdentifier>(
  identifier: T
): T extends keyof IOCIdentifierMap
  ? IOCIdentifierMap[T]
  : T extends new (...args: unknown[]) => unknown
    ? InstanceType<T>
    : never;

export function useIOC<T extends IOCIdentifier>(identifier?: T) {
  if (identifier === undefined) {
    return GIOC;
  }

  return GIOC(identifier);
}
