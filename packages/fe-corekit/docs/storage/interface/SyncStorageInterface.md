## `src/storage/interface/SyncStorageInterface` (Module)

**Type:** `module src/storage/interface/SyncStorageInterface`

---

### `SyncStorageInterface` (Interface)

**Type:** `interface SyncStorageInterface<Key, Opt>`

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

#### `length` (Property)

**Type:** `number`

The number of items stored.

---

#### `clear` (Method)

**Type:** `() => void`

---

##### `clear` (CallSignature)

**Type:** `void`

Clears all stored values.

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

#### `getRawValue` (Method)

**Type:** `(value: unknown, defaultValue: T, options: Opt) => null \| T`

#### Parameters

| Name           | Type      | Optional | Default | Since | Deprecated | Description                          |
| -------------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------ |
| `value`        | `unknown` | ❌       | -       | -     | -          | The value to get the raw value from. |
| `defaultValue` | `T`       | ✅       | -       | -     | -          |                                      |
| `options`      | `Opt`     | ✅       | -       | -     | -          |                                      |

---

##### `getRawValue` (CallSignature)

**Type:** `null \| T`

Get the raw value from the storage.

通过这个方法可以获取到内部原始的值

**Returns:**

The raw value.

#### Parameters

| Name           | Type      | Optional | Default | Since | Deprecated | Description                          |
| -------------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------ |
| `value`        | `unknown` | ❌       | -       | -     | -          | The value to get the raw value from. |
| `defaultValue` | `T`       | ✅       | -       | -     | -          |                                      |
| `options`      | `Opt`     | ✅       | -       | -     | -          |                                      |

---

#### `removeItem` (Method)

**Type:** `(key: Key, options: Opt) => void`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description                      |
| --------- | ----- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `key`     | `Key` | ❌       | -       | -     | -          | The key of the value to remove.  |
| `options` | `Opt` | ✅       | -       | -     | -          | Optional parameters for removal. |

---

##### `removeItem` (CallSignature)

**Type:** `void`

Removes a value by key.

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description                      |
| --------- | ----- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `key`     | `Key` | ❌       | -       | -     | -          | The key of the value to remove.  |
| `options` | `Opt` | ✅       | -       | -     | -          | Optional parameters for removal. |

---

#### `setItem` (Method)

**Type:** `(key: Key, value: T, options: Opt) => unknown`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description                           |
| --------- | ----- | -------- | ------- | ----- | ---------- | ------------------------------------- |
| `key`     | `Key` | ❌       | -       | -     | -          | The key to identify the stored value. |
| `value`   | `T`   | ❌       | -       | -     | -          | The value to store.                   |
| `options` | `Opt` | ✅       | -       | -     | -          | Optional parameters for storage.      |

---

##### `setItem` (CallSignature)

**Type:** `unknown`

Stores a value with the specified key.

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description                           |
| --------- | ----- | -------- | ------- | ----- | ---------- | ------------------------------------- |
| `key`     | `Key` | ❌       | -       | -     | -          | The key to identify the stored value. |
| `value`   | `T`   | ❌       | -       | -     | -          | The value to store.                   |
| `options` | `Opt` | ✅       | -       | -     | -          | Optional parameters for storage.      |

---
