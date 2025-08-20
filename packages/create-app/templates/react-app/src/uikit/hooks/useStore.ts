import {
  StoreInterface,
  type StoreStateInterface
} from '@qlover/corekit-bridge';
import { SliceStore, useSliceStore } from '@qlover/slice-store-react';

export function useStore<
  C extends StoreInterface<StoreStateInterface>,
  State = C['state']
>(store: C, selector?: (state: C['state']) => State): State {
  return useSliceStore(
    store as unknown as SliceStore<StoreStateInterface>,
    selector
  );
}
