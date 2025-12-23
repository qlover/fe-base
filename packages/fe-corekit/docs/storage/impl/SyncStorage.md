## `src/storage/impl/SyncStorage` (Module)

**Type:** `module src/storage/impl/SyncStorage`

---

### `SyncStorage` (Class)

**Type:** `class SyncStorage<Key, Opt>`

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

**Type:** `accessor length`

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

| Name           | Type  | Optional | Default | Since | Deprecated | Description |
| -------------- | ----- | -------- | ------- | ----- | ---------- | ----------- |
| `key`          | `Key` | ❌       | -       | -     | -          |             |
| `defaultValue` | `T`   | ✅       | -       | -     | -          |             |
| `options`      | `Opt` | ✅       | -       | -     | -          |             |

---

##### `getItem` (CallSignature)

**Type:** `null \| T`

#### Parameters

| Name           | Type  | Optional | Default | Since | Deprecated | Description |
| -------------- | ----- | -------- | ------- | ----- | ---------- | ----------- |
| `key`          | `Key` | ❌       | -       | -     | -          |             |
| `defaultValue` | `T`   | ✅       | -       | -     | -          |             |
| `options`      | `Opt` | ✅       | -       | -     | -          |             |

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

| Name      | Type  | Optional | Default | Since | Deprecated | Description |
| --------- | ----- | -------- | ------- | ----- | ---------- | ----------- |
| `key`     | `Key` | ❌       | -       | -     | -          |             |
| `value`   | `T`   | ❌       | -       | -     | -          |             |
| `options` | `Opt` | ✅       | -       | -     | -          |             |

---

##### `setItem` (CallSignature)

**Type:** `void`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description |
| --------- | ----- | -------- | ------- | ----- | ---------- | ----------- |
| `key`     | `Key` | ❌       | -       | -     | -          |             |
| `value`   | `T`   | ❌       | -       | -     | -          |             |
| `options` | `Opt` | ✅       | -       | -     | -          |             |

---

### `PipeArg` (TypeAlias)

**Type:** `PipeType<Key> \| PipeValue<Key>`

---
