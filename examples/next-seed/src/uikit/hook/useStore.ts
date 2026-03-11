import { useSliceStore, type SliceStore } from '@qlover/slice-store-react';
import type {
  StoreInterface,
  StoreStateInterface
} from '@qlover/corekit-bridge';

export function useStore<
  C extends StoreInterface<StoreStateInterface>,
  State = C['state']
>(store: C, selector?: (state: C['state']) => State): State {
  return useSliceStore(
    store as unknown as SliceStore<StoreStateInterface>,
    selector
  );
}
