## `src/core/store-state/impl/createAsyncStore` (Module)

**Type:** `module src/core/store-state/impl/createAsyncStore`

---

### `CreateAsyncStoreType` (TypeAlias)

**Type:** `AsyncStoreInterface<AsyncStoreStateInterface<T>> \| AsyncStoreOptions<AsyncStoreStateInterface<T>, Key, Opt>`

Type for store parameter - can be an AsyncStoreInterface instance or configuration options

---

### `createAsyncStore` (Function)

**Type:** `(store: CreateAsyncStoreType<T, Key, Opt>) => AsyncStoreInterface<AsyncStoreStateInterface<T>>`

#### Parameters

| Name    | Type                                | Optional | Default | Since | Deprecated | Description                                                              |
| ------- | ----------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------------ |
| `store` | `CreateAsyncStoreType<T, Key, Opt>` | ✅       | -       | -     | -          | Store instance implementing AsyncStoreInterface or configuration options |

---

#### `createAsyncStore` (CallSignature)

**Type:** `AsyncStoreInterface<AsyncStoreStateInterface<T>>`

Create and configure async store

This factory function creates an AsyncStoreInterface instance with flexible configuration:

- If an AsyncStoreInterface instance is provided, it returns it directly
- If options are provided, it creates a new AsyncStore (default implementation) with those options
- If nothing is provided, it creates a default AsyncStore

**Returns:**

Configured AsyncStoreInterface instance (defaults to AsyncStore implementation)

**Example:**

```ts
// Using existing store instance
const existingStore = new AsyncStore<User, string>();
const store = createStore(existingStore);
```

**Example:**

```ts
// Using configuration object
const store = createStore<User, string>({
  storage: {
    key: 'user_data',
    storage: localStorage,
    expires: 'day'
  },
  defaultState: (defaultStorageState) => {
    return new AsyncStoreState<User>(defaultStorageState);
  }
});
```

**Example:**

```ts
// Using default options
const store = createStore<User, string>();
```

#### Parameters

| Name    | Type                                | Optional | Default | Since | Deprecated | Description                                                              |
| ------- | ----------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------------ |
| `store` | `CreateAsyncStoreType<T, Key, Opt>` | ✅       | -       | -     | -          | Store instance implementing AsyncStoreInterface or configuration options |

---
