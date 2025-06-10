import {
  StoreInterface,
  StoreStateInterface
} from '@/base/port/StoreInterface';
import { useSliceStore } from '@qlover/slice-store-react';

export function useStore<
  C extends StoreInterface<StoreStateInterface>,
  State = C['state']
>(store: C, selector?: (state: C['state']) => State): State {
  return useSliceStore(store, selector);
}
