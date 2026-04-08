## `src/core/store-state/impl/SliceStoreAdapter` (Module)

**Type:** `module src/core/store-state/impl/SliceStoreAdapter`

---

### `SliceStoreAdapter` (Class)

**Type:** `class SliceStoreAdapter<T, Store>`

**Since:** `3.0.0`

<a href="#slicestoreadapter-class" class="tsd-kind-class">SliceStoreAdapter</a> implementation wrapping a SliceStore `Store`

- Significance: concrete adapter for slice-based apps and tests
- Core idea: delegate lifecycle to inner `SliceStore` while exposing `SliceStoreUpdateValue` updates
- Main function: `update` / `reset` / `getState` / `getStore`
- Main purpose: default implementation referenced from `WithStoreInterface` docs

Constructor overloads (order matters for TypeScript inference):

1. `init: () => Store` — reuse an instance; `init` runs once; `reset` uses that store’s maker
2. `init: () => T` — create `SliceStore` internally; first `init()` return is initial state; `init` runs again on each `reset`

**Example:** Overload 2 — state factory

```ts
const w = new SliceStoreAdapter(() => ({ count: 0 }));
w.update({ count: 1 });
expect(w.getState().count).toBe(1);
```

**Example:** Overload 1 — existing `SliceStore` subclass

```ts
class MyStore extends SliceStore<{ n: number }> {
  constructor() {
    super(() => ({ n: 0 }));
  }
}
const w = new SliceStoreAdapter(() => new MyStore());
w.getStore().emit({ n: 2 });
```

**Example:** Overload 1 — wrap `StoreInterface` subclass (see `interface/StoreInterface.ts`)

```ts
// class MyStore extends SliceStore<MyState> implements StoreInterface<MyState> { … }
const w = new SliceStoreAdapter<MyState, MyStore>(() => new MyStore());
w.getStore(); // MyStore
w.reset();
```

---

#### `new SliceStoreAdapter` (Constructor)

**Type:** `(init: SliceStoreInstanceInitFn<T, Store>) => SliceStoreAdapter<T, Store>`

#### Parameters

| Name   | Type                                 | Optional | Default | Since | Deprecated | Description                                                                   |
| ------ | ------------------------------------ | -------- | ------- | ----- | ---------- | ----------------------------------------------------------------------------- |
| `init` | `SliceStoreInstanceInitFn<T, Store>` | ❌       | -       | -     | -          | `() => Store` (overload 1) or `() => T` (overload 2); see class documentation |

---

#### `sliceStore` (Property)

**Type:** `Store`

Inner `SliceStore` (or subclass) backing this adapter

---

#### `getState` (Method)

**Type:** `() => T`

---

##### `getState` (CallSignature)

**Type:** `T`

**Returns:**

Current `state` from the inner store (same reference as `getStore().state` until next emit)

---

#### `getStore` (Method)

**Type:** `() => Store`

---

##### `getStore` (CallSignature)

**Type:** `Store`

**Returns:**

The inner `SliceStore` instance (use for subclass-specific APIs)

---

#### `reset` (Method)

**Type:** `() => void`

---

##### `reset` (CallSignature)

**Type:** `void`

Reset state via the inner store’s maker (overload 1: that store’s factory; overload 2: `init()` again)

---

#### `subscribe` (Method)

**Type:** `(listener: Object) => Object`

Subscribe to state changes

#### Parameters

| Name       | Type     | Optional | Default | Since | Deprecated | Description |
| ---------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `listener` | `Object` | ❌       | -       | -     | -          |             |

---

##### `subscribe` (CallSignature)

**Type:** `Object`

#### Parameters

| Name       | Type     | Optional | Default | Since | Deprecated | Description |
| ---------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `listener` | `Object` | ❌       | -       | -     | -          |             |

---

#### `update` (Method)

**Type:** `(value: T \| StoreUpdateValue<T>) => void`

#### Parameters

| Name    | Type                       | Optional | Default | Since | Deprecated | Description                                                                                                              |
| ------- | -------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| `value` | `T \| StoreUpdateValue<T>` | ❌       | -       | -     | -          | See <a href="../interface/StoreInterface.md#storeupdatevalue-typealias" class="tsd-kind-type-alias">StoreUpdateValue</a> |

---

##### `update` (CallSignature)

**Type:** `void`

Apply a patch and notify observers via SliceStore.emit

Behavior:

- If `Object.is(value, current)` — no-op (skips emit)
- If current is `null`, `undefined`, or not an object — emit `value` as full `T`
- If current is an array — emit `clone(value)` (full array replacement)
- Else — `clone(current)`, `Object.assign` with `value`, emit result (shallow merge for objects)

Aligns with `StoreInterface.cloneState` for plain objects (shallow clone + assign). Does not deep-merge.

#### Parameters

| Name    | Type                       | Optional | Default | Since | Deprecated | Description                                                                                                              |
| ------- | -------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| `value` | `T \| StoreUpdateValue<T>` | ❌       | -       | -     | -          | See <a href="../interface/StoreInterface.md#storeupdatevalue-typealias" class="tsd-kind-type-alias">StoreUpdateValue</a> |

---

### `SliceStoreInitFn` (TypeAlias)

**Type:** `Object`

**Since:** `2.3.0`

Union initializer: returns state `T` or an existing SliceStore

- Significance: single callback type for the implementing constructor signature
- Core idea: runtime chooses branch after one `init()` call
- Main function: support both “wrap state” and “reuse store” in one implementation
- Main purpose: keep implementation `constructor(init: …)` simple

Prefer the narrower <a href="#slicestorestateinitfn-typealias" class="tsd-kind-type-alias">SliceStoreStateInitFn</a> or <a href="#slicestoreinstanceinitfn-typealias" class="tsd-kind-type-alias">SliceStoreInstanceInitFn</a> overloads on
<a href="#slicestoreadapter-class" class="tsd-kind-class">SliceStoreAdapter</a> so `Store` is inferred correctly at call sites

---

### `SliceStoreInstanceInitFn` (TypeAlias)

**Type:** `Object`

**Since:** `2.3.0`

Constructor overload 1: `init` always returns a store instance

- Significance: preserve `Store` generic as a subclass (e.g. `StoreInterface` extension)
- Core idea: `init` runs once; inner `reset` uses that store’s maker
- Main function: typed `() => Store` for inference
- Main purpose: wrap existing stores without creating an extra `SliceStore`

---

### `SliceStoreStateInitFn` (TypeAlias)

**Type:** `Object`

**Since:** `2.3.0`

Constructor overload 2: `init` always returns state `T`; a SliceStore is created internally

- Significance: ergonomic factory for plain state without defining a store class
- Core idea: first return seeds initial state; further `init()` calls run on each `reset`
- Main function: typed `() => T` only
- Main purpose: smallest migration path from `new SliceStore(() => T)`

---
