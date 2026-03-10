import { useState, useEffect } from 'react';
import type {
  StoreInterface,
  StoreStateInterface
} from '@qlover/corekit-bridge';

/** Store with observe() (SliceStore-compatible). */
interface ObservableStore<S> {
  state: S;
  observe(
    selectorOrSetter: ((s: S) => unknown) | ((v: unknown) => void),
    setState?: (v: unknown) => void
  ): () => void;
}

export function useStore<
  C extends StoreInterface<StoreStateInterface>,
  State = C['state']
>(store: C, selector?: (state: C['state']) => State): State {
  const s = store as unknown as ObservableStore<C['state']>;
  const initial = selector ? selector(s.state) : s.state;
  const [value, setValue] = useState<State>(initial as State);

  useEffect(() => {
    const unsubscribe = selector
      ? s.observe(selector, setValue as (v: unknown) => void)
      : s.observe(setValue as (v: unknown) => void);
    return () => unsubscribe?.();
  }, [s, selector]);

  return value;
}
