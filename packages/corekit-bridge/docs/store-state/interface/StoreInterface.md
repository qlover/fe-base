## `src/core/store-state/interface/StoreInterface` (Module)

**Type:** `module src/core/store-state/interface/StoreInterface`

---

### `StoreInterface` (Interface)

**Type:** `interface StoreInterface<State>`

**Since:** `3.0.0`

Minimal store adapter contract (implementation-agnostic)

- Significance: lets modules depend on a stable surface without importing
  `@qlover/slice-store`

- Core idea: four operations —
  `reset`
  ,
  `update`
  ,
  `getState`
  ,
  `subscribe`

- Main function: act as the widest adapter type when state shape is not fixed at compile time
- Main purpose: bridge custom stores, tests, or facades that are not
  `SliceStore`
  -shaped

Core features:

- `reset`
  — restore initial or maker-defined state (exact semantics are implementation-defined)
- `update`
  — apply a patch or replacement (
  `State`
  or
  StoreUpdateValue
  )
- `getState`
  — read the current typed snapshot
- `subscribe`
  — reactive updates
  `(state, prevState) => void`

Design decisions:

- `StoreInterface`
  is a **contract only** (since 3.0.0); it is not a runtime class — implement it
  with
  SliceStoreAdapter
  ,
  ZustandStoreAdapter
  , or your own adapter.
- Prefer narrowing at boundaries (validate then cast) instead of
  `any`

Relationship to higher-level stores:

- Features like
  `AsyncStore`
  hold an internal
  `StoreInterface<State>`
  (often a
  `SliceStoreAdapter`
  )
  and expose
  `getStore()`
  for
  `subscribe`
  /
  `reset`
  /
  `update`
  /
  `getState`
  .
- Legacy “extend abstract StoreInterface + cloneState + emit” patterns should migrate to

`SliceStore`

- `implements StoreInterface`
  or composition (see
  MessagesStore
  ).

**Example:** Default adapter (`SliceStore` under the hood)

```ts
import { SliceStoreAdapter } from '@qlover/corekit-bridge'; // package entry

class MyState implements StoreStateInterface {
  data = '';
}

const port: StoreInterface<MyState> = new SliceStoreAdapter(
  () => new MyState()
);
port.subscribe((state) => console.log(state.data));
```

**Example:** When use zustand

```ts
import { createStore, type StoreApi } from 'zustand';

class MyState implements StoreStateInterface {
  count = 0;
}

export class ZustandStoreAdapter implements StoreInterface<MyState> {
  private readonly store: StoreApi<MyState>;
  constructor(init: () => MyState = () => new MyState()) {
    this.store = createStore<MyState>(() => init());
  }
  reset(): void {
    this.store.setState(this.store.getInitialState(), true);
  }
  update(value: MyState): void;
  update(value: StoreUpdateValue<MyState>): void;
  update(value: StoreUpdateValue<MyState>): void {
    const prev = this.store.getState();
    const next = shallowMerge(prev, value); // align with {@link StoreUpdateValue} rules
    this.store.setState(next, true);
  }
  getState(): MyState {
    return this.store.getState();
  }
  subscribe(
    listener: (state: MyState, prevState: MyState) => void
  ): () => void {
    return this.store.subscribe(listener);
  }
}
```

**Example:** Consume through a generic helper

```ts
function resetAll(...adapters: WithStoreInterface<unknown>[]) {
  for (const a of adapters) a.reset();
}
```

**Example:** Partial `update` on object state

```ts
port.update({ data: 'patched' }); // shallow merge into current snapshot from {@link StoreInterface.getState}
```

**Example:** `isStoreInterface` at module boundaries

```ts
function asStorePort(x: unknown): StoreInterface<MyState> | undefined {
  return isStoreInterface<MyState>(x) ? x : undefined;
}
```

**Example:** Composition — facade exposes `readonly store`

```ts
import { SliceStoreAdapter } from '../impl/SliceStoreAdapter';

class FeatureState implements StoreStateInterface {
  count = 0;
}

class FeatureStore {
  readonly store: StoreInterface<FeatureState>;

  constructor(store = new SliceStoreAdapter(() => new FeatureState())) {
    this.store = store;
  }

  emit(patch: Partial<FeatureState>) {
    this.store.update(patch);
  }
}
```

---

#### `subscribe` (Property)

**Type:** `Object`

Subscribe to state changes

---

#### `getState` (Method)

**Type:** `() => State`

---

##### `getState` (CallSignature)

**Type:** `State`

Read the current state snapshot

---

#### `reset` (Method)

**Type:** `() => void`

---

##### `reset` (CallSignature)

**Type:** `void`

Reset state using implementation-defined rules (typically the store’s initial maker or factory)

Implementations should document whether listeners/observers run and whether storage side effects occur

---

#### `update` (Method)

**Type:** `(value: State) => void`

#### Parameters

| Name    | Type    | Optional | Default | Since | Deprecated | Description |
| ------- | ------- | -------- | ------- | ----- | ---------- | ----------- |
| `value` | `State` | ❌       | -       | -     | -          |             |

---

##### `update` (CallSignature)

**Type:** `void`

Apply a patch or replacement to state

#### Parameters

| Name    | Type    | Optional | Default | Since | Deprecated | Description |
| ------- | ------- | -------- | ------- | ----- | ---------- | ----------- |
| `value` | `State` | ❌       | -       | -     | -          |             |

---

##### `update` (CallSignature)

**Type:** `void`

#### Parameters

| Name    | Type                      | Optional | Default | Since | Deprecated | Description |
| ------- | ------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `value` | `StoreUpdateValue<State>` | ❌       | -       | -     | -          |             |

---

### `StoreStateInterface` (Interface)

**Type:** `interface StoreStateInterface`

Store state interface

Significance: Defines the contract for store state objects
Core idea: Enforce a consistent structure for store state
Main function: Used as a base for all store state types
Main purpose: Type safety and extensibility for store state

**Example:**

```ts
class ChatStoreState implements StoreStateInterface {
  isChatRunning: boolean = false;
}
```

---

### `StoreUpdateValue` (TypeAlias)

**Type:** `type StoreUpdateValue<T>`

**Since:** `2.3.0`

Patch argument for
SliceStoreAdapter.update

- Significance: keep
  `update`
  sound for shallow-merge semantics used by
  `WithSliceStore`

- Core idea: use
  `Partial<T>`
  only for ordinary objects; arrays and scalars need a full replacement value
- Main function: drive overload-friendly typings at call sites
- Main purpose: avoid
  `Partial`
  on arrays (weak typings and misleading “partial array” meaning)

Resolution rules:

- If
  `T`
  is a readonly tuple or array type →
  `StoreUpdateValue<T>`
  is
  `T`
  (replace whole value)
- Else if
  `T`
  is an
  `object`
  (includes plain objects and class instances) →
  `Partial<T>`

- Else (primitives,
  `null`
  /
  `undefined`
  as non-object) →
  `T`

Runtime note: implementations should shallow-clone object state before merge; they must not deep-merge
nested objects unless explicitly documented elsewhere

**Example:**

```ts
type Row = { id: string; name: string };
// object: partial patch
const p: StoreUpdateValue<Row> = { name: 'x' };
// array: full array
const ids: StoreUpdateValue<string[]> = ['a', 'b'];
// primitive: full value
const n: StoreUpdateValue<number> = 42;
```

---

### `isStoreInterface` (Function)

**Type:** `(value: unknown) => callsignature isStoreInterface<T>`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description |
| ------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `value` | `unknown` | ❌       | -       | -     | -          |             |

---

#### `isStoreInterface` (CallSignature)

**Type:** `callsignature isStoreInterface<T>`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description |
| ------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `value` | `unknown` | ❌       | -       | -     | -          |             |

---
