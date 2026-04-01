/**
 * ZustandStoreAdapter test suite
 *
 * Coverage:
 * 1. initialization     – supports `init: () => T` and `init: StoreApi<T>`
 * 2. update semantics   – shallow-merge for object-like state, full replace for arrays, Object.is no-op
 * 3. reset semantics    – restore `getInitialState()` snapshot
 * 4. subscription       – listener receives `(state, prevState)` and supports unsubscribe
 *
 * Notes:
 * - The adapter is built on zustand vanilla `StoreApi`, so tests focus on adapter contracts,
 *   not zustand internals.
 */
import { describe, it, expect, vi } from 'vitest';
import { createStore } from 'zustand/vanilla';
import {
  ZustandStoreAdapter,
  type StoreStateInterface
} from '../../src/core/store-state';

interface CounterState extends StoreStateInterface {
  count: number;
  nested: { v: number };
}

describe('ZustandStoreAdapter', () => {
  it('should create from state init, shallow-merge on update, and reset to initial state', () => {
    const adapter = new ZustandStoreAdapter<CounterState>(() => ({
      count: 0,
      nested: { v: 1 }
    }));

    const before = adapter.getState();
    adapter.update({ count: 3 });
    const after = adapter.getState();

    expect(after.count).toBe(3);
    expect(after).not.toBe(before);
    expect(after.nested).toBe(before.nested);

    adapter.reset();
    expect(adapter.getState().count).toBe(0);
  });

  it('should accept a StoreApi instance directly and expose it via getStore()', () => {
    const store = createStore<CounterState>(() => ({
      count: 0,
      nested: { v: 1 }
    }));

    const adapter = new ZustandStoreAdapter<CounterState>(store);
    expect(adapter.getStore()).toBe(store);
    expect(adapter.getState().count).toBe(0);
  });

  it('should subscribe with prevState and allow unsubscribe', () => {
    const adapter = new ZustandStoreAdapter<CounterState>(() => ({
      count: 0,
      nested: { v: 1 }
    }));

    const calls: Array<{ state: CounterState; prev: CounterState }> = [];
    const unsubscribe = adapter.subscribe((state, prev) => {
      calls.push({ state, prev });
    });

    adapter.update({ count: 1 });
    adapter.update({ count: 2 });

    expect(calls.length).toBe(2);
    expect(calls[0].state.count).toBe(1);
    expect(calls[0].prev.count).toBe(0);
    expect(calls[1].state.count).toBe(2);
    expect(calls[1].prev.count).toBe(1);

    unsubscribe();
    adapter.update({ count: 3 });
    expect(calls.length).toBe(2);
  });

  it('should replace arrays by cloning the provided value', () => {
    type ArrState = Array<{ id: number }>;
    const adapter = new ZustandStoreAdapter<ArrState>(() => [{ id: 1 }]);

    const next: ArrState = [{ id: 2 }];
    adapter.update(next);

    const state = adapter.getState();
    expect(state).toEqual([{ id: 2 }]);
    expect(state).not.toBe(next);
  });

  it('should no-op update when Object.is(value, current) is true', () => {
    const adapter = new ZustandStoreAdapter<CounterState>(() => ({
      count: 0,
      nested: { v: 1 }
    }));

    const listener = vi.fn();
    const unsubscribe = adapter.subscribe(listener);

    const current = adapter.getState();
    adapter.update(current);
    expect(listener).toHaveBeenCalledTimes(0);

    unsubscribe();
  });
});

