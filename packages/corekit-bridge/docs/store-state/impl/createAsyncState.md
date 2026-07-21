## `src/core/store-state/impl/createAsyncState` (Module)

**Type:** `module src/core/store-state/impl/createAsyncState`

---

### `createAsyncState` (Function)

**Type:** `(options: AsyncStoreOptions<State, StorageKey, Opt>) => State`

#### Parameters

| Name      | Type                                        | Optional | Default | Since | Deprecated | Description                                                       |
| --------- | ------------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------------- |
| `options` | `AsyncStoreOptions<State, StorageKey, Opt>` | ✅       | -       | -     | -          | Optional async-store configuration (`defaultState`, `persist`, …) |

---

#### `createAsyncState` (CallSignature)

**Type:** `State`

Build initial [AsyncStoreStateInterface](./AsyncStore.md#asyncstorestateinterface-interface) for [AsyncStoreOptions](./AsyncStore.md#asyncstoreoptions-interface)

**Returns:**

Fresh state instance (from `defaultState` or `AsyncStoreState`)

#### Parameters

| Name      | Type                                        | Optional | Default | Since | Deprecated | Description                                                       |
| --------- | ------------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------------- |
| `options` | `AsyncStoreOptions<State, StorageKey, Opt>` | ✅       | -       | -     | -          | Optional async-store configuration (`defaultState`, `persist`, …) |

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

Resolve the [StoreInterface](../interface/StoreInterface.md#storeinterface-interface) used by AsyncStore

- If `options.store` is a [StoreInterface](../interface/StoreInterface.md#storeinterface-interface), it is reused.
- Otherwise a [SliceStoreAdapter](./SliceStoreAdapter.md#slicestoreadapter-class) is created around [createAsyncState](#createasyncstate-function).

#### Parameters

| Name      | Type                                        | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `options` | `AsyncStoreOptions<State, StorageKey, Opt>` | ✅       | -       | -     | -          |             |

---
