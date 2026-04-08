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

Build initial <a href="./AsyncStore.md#asyncstorestateinterface-interface" class="tsd-kind-interface">AsyncStoreStateInterface</a> for <a href="./AsyncStore.md#asyncstoreoptions-interface" class="tsd-kind-interface">AsyncStoreOptions</a>

**Returns:**

Fresh state instance (from `defaultState` or `AsyncStoreState`)

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

Resolve the <a href="../interface/StoreInterface.md#storeinterface-interface" class="tsd-kind-interface">StoreInterface</a> used by AsyncStore

- If `options.store` is a <a href="../interface/StoreInterface.md#storeinterface-interface" class="tsd-kind-interface">StoreInterface</a>, it is reused.
- Otherwise a <a href="./SliceStoreAdapter.md#slicestoreadapter-class" class="tsd-kind-class">SliceStoreAdapter</a> is created around <a href="#createasyncstate-function" class="tsd-kind-function">createAsyncState</a>.

#### Parameters

| Name      | Type                                        | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `options` | `AsyncStoreOptions<State, StorageKey, Opt>` | ✅       | -       | -     | -          |             |

---
