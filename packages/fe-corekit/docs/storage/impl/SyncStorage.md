## `src/storage/impl/SyncStorage` (Module)

**Type:** `unknown`

---

### `SyncStorage` (Class)

**Type:** `unknown`

Interface representing a synchronous storage mechanism.

**Template:** ValueType

The type of values stored, defaults to unknown.

**Example:**

```typescript
const storage: SyncStorage<string, number> = ...;
storage.setItem('key', 123);
const value = storage.getItem('key', 0);
```

---

#### `new SyncStorage` (Constructor)

**Type:** `(storage: SyncStorageInterface<Key, Opt>, pipes: PipeArg<Key> \| PipeArg<Key>[]) => SyncStorage<Key, Opt>`

#### Parameters

| Name      | Type                             | Optional | Default | Since | Deprecated | Description |
| --------- | -------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `storage` | `SyncStorageInterface<Key, Opt>` | ❌       | -       | -     | -          |             |
| `pipes`   | `PipeArg<Key> \| PipeArg<Key>[]` | ✅       | `[]`    | -     | -          |             |

---

#### `pipes` (Property)

**Type:** `PipeValue<Key>[]`

Internal pipe value list, pre-determined type

---

#### `storage` (Property)

**Type:** `SyncStorageInterface<Key, Opt>`

---

#### `length` (Accessor)

**Type:** `unknown`

The number of items stored.

---

#### `clear` (Method)

**Type:** `() => void`

---

##### `clear` (CallSignature)

**Type:** `void`

Clear all data, including storage in the pipeline

---

#### `getItem` (Method)

**Type:** `(key: Key, defaultValue: T, options: Opt) => null \| T`

#### Parameters

| Name           | Type  | Optional | Default | Since | Deprecated | Description                                          |
| -------------- | ----- | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `key`          | `Key` | ❌       | -       | -     | -          | The key of the value to retrieve.                    |
| `defaultValue` | `T`   | ✅       | -       | -     | -          | The default value to return if the key is not found. |
| `options`      | `Opt` | ✅       | -       | -     | -          | Optional parameters for retrieval.                   |

---

##### `getItem` (CallSignature)

**Type:** `null \| T`

Retrieves a value by key.

**Returns:**

The value associated with the key, or the default value if not found.

#### Parameters

| Name           | Type  | Optional | Default | Since | Deprecated | Description                                          |
| -------------- | ----- | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `key`          | `Key` | ❌       | -       | -     | -          | The key of the value to retrieve.                    |
| `defaultValue` | `T`   | ✅       | -       | -     | -          | The default value to return if the key is not found. |
| `options`      | `Opt` | ✅       | -       | -     | -          | Optional parameters for retrieval.                   |

---

#### `removeItem` (Method)

**Type:** `(key: Key, options: Opt) => void`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description    |
| --------- | ----- | -------- | ------- | ----- | ---------- | -------------- |
| `key`     | `Key` | ❌       | -       | -     | -          | Storage key    |
| `options` | `Opt` | ✅       | -       | -     | -          | Delete options |

---

##### `removeItem` (CallSignature)

**Type:** `void`

Delete data items, delete from all storage layers

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description    |
| --------- | ----- | -------- | ------- | ----- | ---------- | -------------- |
| `key`     | `Key` | ❌       | -       | -     | -          | Storage key    |
| `options` | `Opt` | ✅       | -       | -     | -          | Delete options |

---

#### `setItem` (Method)

**Type:** `(key: Key, value: T, options: Opt) => void`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description                           |
| --------- | ----- | -------- | ------- | ----- | ---------- | ------------------------------------- |
| `key`     | `Key` | ❌       | -       | -     | -          | The key to identify the stored value. |
| `value`   | `T`   | ❌       | -       | -     | -          | The value to store.                   |
| `options` | `Opt` | ✅       | -       | -     | -          | Optional parameters for storage.      |

---

##### `setItem` (CallSignature)

**Type:** `void`

Stores a value with the specified key.

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description                           |
| --------- | ----- | -------- | ------- | ----- | ---------- | ------------------------------------- |
| `key`     | `Key` | ❌       | -       | -     | -          | The key to identify the stored value. |
| `value`   | `T`   | ❌       | -       | -     | -          | The value to store.                   |
| `options` | `Opt` | ✅       | -       | -     | -          | Optional parameters for storage.      |

---

### `PipeArg` (TypeAlias)

**Type:** `PipeType<Key> \| PipeValue<Key>`

---
