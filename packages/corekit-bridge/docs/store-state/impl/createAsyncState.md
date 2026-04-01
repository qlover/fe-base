## `src/core/store-state/impl/createAsyncState` (Module)

**Type:** `module src/core/store-state/impl/createAsyncState`

---

### `createAsyncState` (Function)

**Type:** `(options: AsyncStoreOptions<State, StorageKey, Opt>) => State`

#### Parameters

| Name      | Type                                        | Optional | Default | Since | Deprecated | Description                                                     |
| --------- | ------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------------- |
| `options` | `AsyncStoreOptions<State, StorageKey, Opt>` | ✅       | -       | -     | -          | Optional async-store configuration (`defaultState`, storage, …) |

---

#### `createAsyncState` (CallSignature)

**Type:** `State`

Build initial
AsyncStoreStateInterface
for
AsyncStoreOptions

**Returns:**

Fresh state instance (from
`defaultState`
or
`AsyncStoreState`
)

#### Parameters

| Name      | Type                                        | Optional | Default | Since | Deprecated | Description                                                     |
| --------- | ------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------------- |
| `options` | `AsyncStoreOptions<State, StorageKey, Opt>` | ✅       | -       | -     | -          | Optional async-store configuration (`defaultState`, storage, …) |

---

### `createAsyncStoreInterface` (Function)

**Type:** `(options: AsyncStoreOptions<State, StorageKey, Opt>) => StoreInterface<State>`

#### Parameters

| Name      | Type                                        | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `options` | `AsyncStoreOptions<State, StorageKey, Opt>` | ✅       | -       | -     | -          |             |

---

#### `createAsyncStoreInterface` (CallSignature)

**Type:** `StoreInterface<State>`

Resolve the
StoreInterface
used by
AsyncStore

- If
  `options.store`
  is a
  StoreInterface
  , it is reused.
- Otherwise a
  SliceStoreAdapter
  is created around
  createAsyncState
  .

#### Parameters

| Name      | Type                                        | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `options` | `AsyncStoreOptions<State, StorageKey, Opt>` | ✅       | -       | -     | -          |             |

---
