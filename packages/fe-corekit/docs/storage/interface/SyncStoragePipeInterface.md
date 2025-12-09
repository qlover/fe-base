## `src/storage/interface/SyncStoragePipeInterface` (Module)

**Type:** `module src/storage/interface/SyncStoragePipeInterface`

---

### `SyncStoragePipeInterface` (Interface)

**Type:** `interface SyncStoragePipeInterface<Key, ComposeOptions>`

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

#### `pipes` (Property)

**Type:** `PipeValue<Key>[]`

---

#### `clear` (Method)

**Type:** `() => void`

---

##### `clear` (CallSignature)

**Type:** `void`

Clears all stored values.

---

#### `getItem` (Method)

**Type:** `(key: Key, defaultValue: T, options: ComposeOptions) => null \| T`

#### Parameters

| Name           | Type             | Optional | Default | Since | Deprecated | Description                                          |
| -------------- | ---------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `key`          | `Key`            | ❌       | -       | -     | -          | The key of the value to retrieve.                    |
| `defaultValue` | `T`              | ✅       | -       | -     | -          | The default value to return if the key is not found. |
| `options`      | `ComposeOptions` | ✅       | -       | -     | -          | Optional parameters for retrieval.                   |

---

##### `getItem` (CallSignature)

**Type:** `null \| T`

Retrieves a value by key.

**Returns:**

The value associated with the key, or the default value if not found.

#### Parameters

| Name           | Type             | Optional | Default | Since | Deprecated | Description                                          |
| -------------- | ---------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `key`          | `Key`            | ❌       | -       | -     | -          | The key of the value to retrieve.                    |
| `defaultValue` | `T`              | ✅       | -       | -     | -          | The default value to return if the key is not found. |
| `options`      | `ComposeOptions` | ✅       | -       | -     | -          | Optional parameters for retrieval.                   |

---

#### `getRawValue` (Method)

**Type:** `(value: unknown, defaultValue: T, options: ComposeOptions) => null \| T`

#### Parameters

| Name           | Type             | Optional | Default | Since | Deprecated | Description                          |
| -------------- | ---------------- | -------- | ------- | ----- | ---------- | ------------------------------------ |
| `value`        | `unknown`        | ❌       | -       | -     | -          | The value to get the raw value from. |
| `defaultValue` | `T`              | ✅       | -       | -     | -          |                                      |
| `options`      | `ComposeOptions` | ✅       | -       | -     | -          |                                      |

---

##### `getRawValue` (CallSignature)

**Type:** `null \| T`

Get the raw value from the storage.

通过这个方法可以获取到内部原始的值

**Returns:**

The raw value.

#### Parameters

| Name           | Type             | Optional | Default | Since | Deprecated | Description                          |
| -------------- | ---------------- | -------- | ------- | ----- | ---------- | ------------------------------------ |
| `value`        | `unknown`        | ❌       | -       | -     | -          | The value to get the raw value from. |
| `defaultValue` | `T`              | ✅       | -       | -     | -          |                                      |
| `options`      | `ComposeOptions` | ✅       | -       | -     | -          |                                      |

---

#### `removeItem` (Method)

**Type:** `(key: Key, options: ComposeOptions) => void`

#### Parameters

| Name      | Type             | Optional | Default | Since | Deprecated | Description                      |
| --------- | ---------------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `key`     | `Key`            | ❌       | -       | -     | -          | The key of the value to remove.  |
| `options` | `ComposeOptions` | ✅       | -       | -     | -          | Optional parameters for removal. |

---

##### `removeItem` (CallSignature)

**Type:** `void`

Removes a value by key.

#### Parameters

| Name      | Type             | Optional | Default | Since | Deprecated | Description                      |
| --------- | ---------------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `key`     | `Key`            | ❌       | -       | -     | -          | The key of the value to remove.  |
| `options` | `ComposeOptions` | ✅       | -       | -     | -          | Optional parameters for removal. |

---

#### `setItem` (Method)

**Type:** `(key: Key, value: T, options: ComposeOptions) => unknown`

#### Parameters

| Name      | Type             | Optional | Default | Since | Deprecated | Description                           |
| --------- | ---------------- | -------- | ------- | ----- | ---------- | ------------------------------------- |
| `key`     | `Key`            | ❌       | -       | -     | -          | The key to identify the stored value. |
| `value`   | `T`              | ❌       | -       | -     | -          | The value to store.                   |
| `options` | `ComposeOptions` | ✅       | -       | -     | -          | Optional parameters for storage.      |

---

##### `setItem` (CallSignature)

**Type:** `unknown`

Stores a value with the specified key.

#### Parameters

| Name      | Type             | Optional | Default | Since | Deprecated | Description                           |
| --------- | ---------------- | -------- | ------- | ----- | ---------- | ------------------------------------- |
| `key`     | `Key`            | ❌       | -       | -     | -          | The key to identify the stored value. |
| `value`   | `T`              | ❌       | -       | -     | -          | The value to store.                   |
| `options` | `ComposeOptions` | ✅       | -       | -     | -          | Optional parameters for storage.      |

---

### `PipeType` (TypeAlias)

**Type:** `SerializerIneterface<unknown, unknown> \| Encryptor<unknown, unknown> \| SyncStorageInterface<Key, unknown>`

Pipe processor type definition

Significance: Define the type of components that can be used for data processing pipelines
Core idea: Unify the type definition of different processors, supporting data transformation and intermediate storage
Main function: Provide type-safe pipeline components
Main purpose: Support serialization, encryption, intermediate storage, and other data processing operations

---

### `PipeValue` (TypeAlias)

**Type:** `Object \| Object \| Object`

Pipe value definition, containing the pipe processor and its type identifier

Significance: Pre-determine the pipe type to avoid runtime type checks
Core idea: Bind the pipe processor with its type to improve execution efficiency
Main function: Store the pipe processor and its type information
Main purpose: Optimize pipe execution performance, simplify type judgment logic

---
