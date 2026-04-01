/**
 * SliceStoreAdapter test suite
 *
 * Coverage:
 * 1. initialization     – supports `init: () => T` and `init: () => SliceStore<T>`
 * 2. update semantics   – shallow-merge for object-like state, full replace for arrays
 * 3. reset semantics    – `init()` re-run only for state init branch
 * 4. subscription       – listener wiring and unsubscribe behavior
 *
 * Notes:
 * - These tests intentionally verify "why" behaviors: adapter branching and update/reset contracts,
 *   rather than internal implementation details of `@qlover/slice-store`.
 */
import { describe, it, expect, vi } from 'vitest';
import { SliceStore } from '@qlover/slice-store';
import {
  SliceStoreAdapter,
  type StoreStateInterface
} from '../../src/core/store-state';

interface CounterState extends StoreStateInterface {
  count: number;
  nested: { v: number };
}

describe('SliceStoreAdapter', () => {
  it('should create from state init fn, shallow-merge on update, and call init again on reset', () => {
    const init = vi.fn((): CounterState => ({
      count: 0,
      nested: { v: 1 }
    }));

    const adapter = new SliceStoreAdapter<CounterState>(init);
    expect(init).toHaveBeenCalledTimes(1);
    expect(adapter.getState()).toEqual({ count: 0, nested: { v: 1 } });

    const before = adapter.getState();
    adapter.update({ count: 2 });
    const after = adapter.getState();

    expect(after.count).toBe(2);
    expect(after).not.toBe(before);
    // Important: update is a shallow merge for object-like state.
    expect(after.nested).toBe(before.nested);

    adapter.reset();
    expect(init).toHaveBeenCalledTimes(2);
    const resetState = adapter.getState();
    expect(resetState.count).toBe(0);
    expect(resetState).not.toBe(after);
  });

  it('should wrap an existing SliceStore instance init fn and not re-call init on reset', () => {
    const init = vi.fn(
      () =>
        new SliceStore<CounterState>(() => ({
          count: 0,
          nested: { v: 1 }
        }))
    );

    const adapter = new SliceStoreAdapter<CounterState>(init);
    expect(init).toHaveBeenCalledTimes(1);

    adapter.update({ count: 5 });
    expect(adapter.getState().count).toBe(5);

    adapter.reset();
    expect(init).toHaveBeenCalledTimes(1);
    expect(adapter.getState().count).toBe(0);
  });

  it('should replace arrays by cloning the provided value', () => {
    type ArrState = Array<{ id: number }>;
    const adapter = new SliceStoreAdapter<ArrState>(() => [{ id: 1 }]);

    const next: ArrState = [{ id: 2 }];
    adapter.update(next);

    const state = adapter.getState();
    expect(state).toEqual([{ id: 2 }]);
    expect(state).not.toBe(next);
  });

  it('should subscribe and allow unsubscribe', () => {
    const adapter = new SliceStoreAdapter<CounterState>(() => ({
      count: 0,
      nested: { v: 1 }
    }));

    const listener = vi.fn();
    const unsubscribe = adapter.subscribe(listener);

    adapter.update({ count: 1 });
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    adapter.update({ count: 2 });
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

