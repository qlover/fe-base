import { describe, it, expect, beforeEach } from 'vitest';
import {
  StoreInterface,
  StoreStateInterface
} from '../../src/core/store-state/StoreInterface';

class CounterState implements StoreStateInterface {
  count = 0;
  meta = { updated: false };
}

class CounterStore extends StoreInterface<CounterState> {
  constructor() {
    super(() => new CounterState());
  }
  increment(): void {
    this.emit({ ...this.state, count: this.state.count + 1 });
  }
  setMeta(updated: boolean): void {
    this.emit({ ...this.state, meta: { updated } });
  }
}

describe('StoreInterface', () => {
  let store: CounterStore;

  beforeEach(() => {
    store = new CounterStore();
  });

  it('should initialize with default state', () => {
    expect(store.state.count).toBe(0);
    expect(store.state.meta).toEqual({ updated: false });
  });

  it('resetState should reset to initial state', () => {
    store.increment();
    store.setMeta(true);
    expect(store.state.count).toBe(1);
    expect(store.state.meta.updated).toBe(true);
    store.resetState();
    expect(store.state.count).toBe(0);
    expect(store.state.meta).toEqual({ updated: false });
  });

  it('cloneState should return a shallow clone with overrides', () => {
    store.increment();
    const cloned = store.cloneState({ count: 100 });
    expect(cloned.count).toBe(100);
    // meta is shallow cloned
    expect(cloned.meta).toBe(store.state.meta);
  });

  it('cloneState should not mutate the original state', () => {
    const originalMeta = store.state.meta;
    const cloned = store.cloneState({ count: 5 });
    expect(store.state.count).toBe(0);
    expect(cloned.count).toBe(5);
    expect(cloned.meta).toBe(originalMeta);
  });

  it('cloneState should override multiple fields and not affect original', () => {
    store.increment();
    store.setMeta(true);
    const cloned = store.cloneState({ count: 42, meta: { updated: false } });
    expect(cloned.count).toBe(42);
    expect(cloned.meta).toEqual({ updated: false });
    // original state is not affected
    expect(store.state.count).toBe(1);
    expect(store.state.meta).toEqual({ updated: true });
  });

  it('cloneState is shallow: mutating nested object in clone affects original', () => {
    const cloned = store.cloneState({});
    cloned.meta.updated = true;
    expect(store.state.meta.updated).toBe(true);
  });

  it('resetState can be called multiple times and always resets', () => {
    store.increment();
    store.setMeta(true);
    store.resetState();
    expect(store.state.count).toBe(0);
    expect(store.state.meta).toEqual({ updated: false });
    store.increment();
    store.resetState();
    expect(store.state.count).toBe(0);
    expect(store.state.meta).toEqual({ updated: false });
  });

  it('cloneState can override fields with undefined', () => {
    const cloned = store.cloneState({ count: undefined });
    expect(cloned).toHaveProperty('count', undefined);
  });

  it('resetState should create a new state object each time', () => {
    const first = store.state;
    store.resetState();
    const second = store.state;
    expect(first).not.toBe(second);
  });

  it('cloneState returns a new object, does not mutate state', () => {
    const before = store.state;
    const cloned = store.cloneState({ count: 123 });
    expect(cloned).not.toBe(before);
    expect(store.state.count).toBe(0);
  });

  it('cloneState works with class instance state', () => {
    class CustomState implements StoreStateInterface {
      value = 1;
      get double(): number {
        return this.value * 2;
      }
    }
    class CustomStore extends StoreInterface<CustomState> {
      constructor() {
        super(() => new CustomState());
      }
    }
    const customStore = new CustomStore();
    const cloned = customStore.cloneState({ value: 10 });
    expect(cloned.value).toBe(10);
    expect(cloned.double).toBe(20);
  });

  it('cloneState preserves class methods and getter/setter', () => {
    class AdvancedState implements StoreStateInterface {
      value = 5;
      _hidden = 10;
      get double(): number {
        return this.value * 2;
      }
      // eslint-disable-next-line fe-dev/ts-class-method-return
      set double(v: number) {
        this.value = v / 2;
      }
      inc(): void {
        this.value++;
      }
    }
    class AdvancedStore extends StoreInterface<AdvancedState> {
      constructor() {
        super(() => new AdvancedState());
      }
    }
    const advStore = new AdvancedStore();
    advStore.state.inc();
    expect(advStore.state.value).toBe(6);
    advStore.state.double = 20;
    expect(advStore.state.value).toBe(10);

    const cloned = advStore.cloneState({ value: 100 });
    expect(cloned.value).toBe(100);
    expect(cloned.double).toBe(200);
    cloned.inc();
    expect(cloned.value).toBe(101);
    expect(typeof cloned.inc).toBe('function');
    expect(Object.getPrototypeOf(cloned)).toBe(AdvancedState.prototype);
  });

  it('cloneState handles nested objects, arrays, symbol and function properties', () => {
    const sym = Symbol('test');
    class ComplexState implements StoreStateInterface {
      arr = [1, 2, { deep: 3 }];
      nested = { foo: { bar: 1 } };
      [sym] = 42;
      fn = (): string => 'hello';
    }
    class ComplexStore extends StoreInterface<ComplexState> {
      constructor() {
        super(() => new ComplexState());
      }
    }
    const store = new ComplexStore();
    const cloned = store.cloneState({});

    // cloneState creates a new state object but properties are shallow cloned
    expect(cloned).not.toBe(store.state);
    expect(cloned.arr).toBe(store.state.arr); // shallow clone - same reference
    expect(cloned.arr[2]).toBe(store.state.arr[2]);
    expect(cloned.nested).toBe(store.state.nested); // shallow clone - same reference
    expect(cloned.nested.foo).toBe(store.state.nested.foo);
    expect(cloned[sym]).toBe(42);
    expect(cloned.fn()).toBe('hello');
  });

  it('cloneState can override class methods (not recommended, but possible)', () => {
    class MethodState implements StoreStateInterface {
      value = 1;
      fn(): string {
        return 'original';
      }
    }
    class MethodStore extends StoreInterface<MethodState> {
      constructor() {
        super(() => new MethodState());
      }
    }
    const store = new MethodStore();
    const newFn = () => 'patched';
    const cloned = store.cloneState({ fn: newFn });
    expect(cloned.fn()).toBe('patched');
    expect(store.state.fn()).toBe('original');
  });

  it('cloneState works with readonly properties', () => {
    class ReadonlyState implements StoreStateInterface {
      readonly foo = 123;
    }
    class ReadonlyStore extends StoreInterface<ReadonlyState> {
      constructor() {
        super(() => new ReadonlyState());
      }
    }
    const store = new ReadonlyStore();
    const cloned = store.cloneState({});
    expect(cloned.foo).toBe(123);
  });

  it('cloneState handles empty or null state gracefully', () => {
    class NullState implements StoreStateInterface {}
    class NullStore extends StoreInterface<NullState> {
      constructor() {
        super(() => null as unknown as NullState);
      }
    }
    const store = new NullStore();
    expect(() => store.cloneState({})).not.toThrow();
  });
});
