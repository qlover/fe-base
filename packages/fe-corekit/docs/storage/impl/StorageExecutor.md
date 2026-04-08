## `src/storage/impl/StorageExecutor` (Module)

**Type:** `module src/storage/impl/StorageExecutor`

---

### `StorageExecutor` (Class)

**Type:** `class StorageExecutor<K, V, Opt>`

Executes a pipeline of storage plugins, implementing `StorageInterface`.

Core concept: values flow through plugins in order on `set` (e.g. serialize → encrypt → storage),
and in reverse order on `get` (storage → decrypt → deserialize). Each plugin receives the value
from the previous step and may return a transformed value for the next.

Main features:

- **setItem**: Iterates plugins forward; each `set` may return a new value (e.g. serialized/encrypted) for the next
- **getItem**: Iterates plugins backward. **When there are multiple storage plugins, only the value from the
  last storage (the one at the end of the plugin array) is used for reading; all other storage plugins are
  skipped and their values are ignored.** Pipe plugins (serializer, encryptor, etc.) still transform the
  value as usual.
- **removeItem** / **clear**: Delegated to all plugins that implement `remove` / `clear`

**Example:** Single storage backend

```typescript
const executor = new StorageExecutor(localStorage);
executor.setItem('key', { a: 1 });
executor.getItem('key');
```

**Example:** Pipeline: serializer + encryptor + storage

```typescript
const executor = new StorageExecutor([
  jsonSerializer,
  aesEncryptor,
  localStorage
]);
executor.setItem('key', obj); // obj → serialize → encrypt → persist
executor.getItem('key'); // read → decrypt → deserialize → obj
```

**Example:** Multiple storages: getItem uses only the last storage

```typescript
const executor = new StorageExecutor([sessionStorage, localStorage]);
executor.setItem('key', 'v'); // writes to both
executor.getItem('key'); // reads only from localStorage (last); sessionStorage is ignored
```

---

#### `new StorageExecutor` (Constructor)

**Type:** `(plugins: StorageInterface<K, V, Opt> \| unknown) => StorageExecutor<K, V, Opt>`

#### Parameters

| Name      | Type                                     | Optional | Default | Since | Deprecated | Description                                                        |
| --------- | ---------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------ |
| `plugins` | `StorageInterface<K, V, Opt> \| unknown` | ❌       | -       | -     | -          | Single storage instance or tuple of `[ ...transformers, storage ]` |

---

#### `plugins` (Property)

**Type:** `StorageExecutorPlugin<K, V, Opt>[]`

**Default:** `[]`

---

#### `clear` (Method)

**Type:** `() => void`

---

##### `clear` (CallSignature)

**Type:** `void`

Clears data in all plugins that implement `clear`.

---

#### `getItem` (Method)

**Type:** `(key: K, options: Opt) => null \| V`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description |
| --------- | ----- | -------- | ------- | ----- | ---------- | ----------- |
| `key`     | `K`   | ❌       | -       | -     | -          |             |
| `options` | `Opt` | ✅       | -       | -     | -          |             |

---

##### `getItem` (CallSignature)

**Type:** `null \| V`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description |
| --------- | ----- | -------- | ------- | ----- | ---------- | ----------- |
| `key`     | `K`   | ❌       | -       | -     | -          |             |
| `options` | `Opt` | ✅       | -       | -     | -          |             |

---

##### `getItem` (CallSignature)

**Type:** `V`

#### Parameters

| Name           | Type  | Optional | Default | Since | Deprecated | Description |
| -------------- | ----- | -------- | ------- | ----- | ---------- | ----------- |
| `key`          | `K`   | ❌       | -       | -     | -          |             |
| `defaultValue` | `V`   | ❌       | -       | -     | -          |             |
| `options`      | `Opt` | ✅       | -       | -     | -          |             |

---

#### `removeItem` (Method)

**Type:** `(key: K, options: Opt) => void`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description |
| --------- | ----- | -------- | ------- | ----- | ---------- | ----------- |
| `key`     | `K`   | ❌       | -       | -     | -          |             |
| `options` | `Opt` | ✅       | -       | -     | -          |             |

---

##### `removeItem` (CallSignature)

**Type:** `void`

Removes item for the given key from all plugins that implement `remove`.

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description |
| --------- | ----- | -------- | ------- | ----- | ---------- | ----------- |
| `key`     | `K`   | ❌       | -       | -     | -          |             |
| `options` | `Opt` | ✅       | -       | -     | -          |             |

---

#### `setItem` (Method)

**Type:** `(key: K, value: V, options: Opt) => void`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description |
| --------- | ----- | -------- | ------- | ----- | ---------- | ----------- |
| `key`     | `K`   | ❌       | -       | -     | -          |             |
| `value`   | `V`   | ❌       | -       | -     | -          |             |
| `options` | `Opt` | ✅       | -       | -     | -          |             |

---

##### `setItem` (CallSignature)

**Type:** `void`

Writes value through the plugin chain (forward). Each plugin may return a transformed value for the next.

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description |
| --------- | ----- | -------- | ------- | ----- | ---------- | ----------- |
| `key`     | `K`   | ❌       | -       | -     | -          |             |
| `value`   | `V`   | ❌       | -       | -     | -          |             |
| `options` | `Opt` | ✅       | -       | -     | -          |             |

---

### `StorageExecutorPlugin` (Interface)

**Type:** `interface StorageExecutorPlugin<K, V, Opt>`

Plugin contract for the storage pipeline.

Each plugin participates in a chain: on `set`, value flows forward (e.g. serialize → encrypt → persist);
on `get`, value flows backward (e.g. read → decrypt → deserialize). The second argument to `get` is
the value produced by the previous plugin in the chain so each step can transform it.

---

#### `type` (Property)

**Type:** `string`

When `'storage'`, this plugin reads from a backing store. On `getItem`, once the first
storage (from tail) returns a value, no further storage plugins are used for get; only
`'pipe'` plugins keep transforming the value. When `'pipe'` or omitted, the plugin only
transforms (e.g. serialize, encrypt).

**Example:** type=storage use first storage

```typescript
const executor = new StorageExecutor([
  jsonSerializer,
  aesEncryptor,
  sessionStorage,
  localStorage
]);
executor.setItem('key', { a: 1 }); // { a: 1 } → serialize → encrypt → sessionStorage → localStorage
executor.getItem('key'); // localStorage → decrypt → deserialize → { a: 1 }
```

---

#### `clear` (Method)

**Type:** `() => void`

---

##### `clear` (CallSignature)

**Type:** `void`

Optional: clear all data. Only storage plugins typically implement this.

---

#### `get` (Method)

**Type:** `(key: K, valueFromPrevious: unknown, options: Opt) => undefined \| null \| V`

#### Parameters

| Name                | Type      | Optional | Default | Since | Deprecated | Description                                                                       |
| ------------------- | --------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------------------------------- |
| `key`               | `K`       | ❌       | -       | -     | -          | Storage key                                                                       |
| `valueFromPrevious` | `unknown` | ❌       | -       | -     | -          | Value from the previous step in the reverse chain; first call gets `defaultValue` |
| `options`           | `Opt`     | ✅       | -       | -     | -          | Optional options forwarded to the chain                                           |

---

##### `get` (CallSignature)

**Type:** `undefined \| null \| V`

Transform or read value in the get pipeline. Receives `valueFromPrevious` from the next plugin
in the chain (e.g. raw string from storage, then decrypted, then deserialized).

**Returns:**

Transformed value, or `undefined` to keep current pipeline value

#### Parameters

| Name                | Type      | Optional | Default | Since | Deprecated | Description                                                                       |
| ------------------- | --------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------------------------------- |
| `key`               | `K`       | ❌       | -       | -     | -          | Storage key                                                                       |
| `valueFromPrevious` | `unknown` | ❌       | -       | -     | -          | Value from the previous step in the reverse chain; first call gets `defaultValue` |
| `options`           | `Opt`     | ✅       | -       | -     | -          | Optional options forwarded to the chain                                           |

---

#### `remove` (Method)

**Type:** `(key: K, options: Opt) => void`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description |
| --------- | ----- | -------- | ------- | ----- | ---------- | ----------- |
| `key`     | `K`   | ✅       | -       | -     | -          |             |
| `options` | `Opt` | ✅       | -       | -     | -          |             |

---

##### `remove` (CallSignature)

**Type:** `void`

Optional: remove item for this key. Only storage plugins typically implement this.

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description |
| --------- | ----- | -------- | ------- | ----- | ---------- | ----------- |
| `key`     | `K`   | ✅       | -       | -     | -          |             |
| `options` | `Opt` | ✅       | -       | -     | -          |             |

---

#### `set` (Method)

**Type:** `(key: K, value: V, options: Opt) => unknown`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description                                     |
| --------- | ----- | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `key`     | `K`   | ❌       | -       | -     | -          | Storage key                                     |
| `value`   | `V`   | ❌       | -       | -     | -          | Value from the previous step (or initial value) |
| `options` | `Opt` | ✅       | -       | -     | -          | Optional options forwarded to the chain         |

---

##### `set` (CallSignature)

**Type:** `unknown`

Transform or persist value in the set pipeline. May return the transformed value for the next plugin.

**Returns:**

Transformed value for the next plugin, or `undefined` if this step does not change the value

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description                                     |
| --------- | ----- | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `key`     | `K`   | ❌       | -       | -     | -          | Storage key                                     |
| `value`   | `V`   | ❌       | -       | -     | -          | Value from the previous step (or initial value) |
| `options` | `Opt` | ✅       | -       | -     | -          | Optional options forwarded to the chain         |

---
