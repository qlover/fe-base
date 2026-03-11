## `src/storage/utils/createStoragePlugin` (Module)

**Type:** `module src/storage/utils/createStoragePlugin`

---

### `createStoragePlugin` (Function)

**Type:** `(plugins: StorageInterface<K, V, Opt> \| unknown) => StorageExecutorPlugin<K, V, Opt>[]`

#### Parameters

| Name      | Type                                     | Optional | Default | Since | Deprecated | Description                                            |
| --------- | ---------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `plugins` | `StorageInterface<K, V, Opt> \| unknown` | ❌       | -       | -     | -          | Single storage or tuple `[ ...transformers, storage ]` |

---

#### `createStoragePlugin` (CallSignature)

**Type:** `StorageExecutorPlugin<K, V, Opt>[]`

Normalizes plugin input into an array of
`StorageExecutorPlugin`
.

- If a single
  `StorageInterface`
  is passed, returns one plugin that wraps it.
- If an array is passed, maps each element: serializers and encryptors are adapted so that
  only the pipeline value is passed to
  `serialize`
  /
  `deserialize`
  /
  `encrypt`
  /
  `decrypt`
  ; storage
  instances are wrapped; other values are treated as already-implemented plugins. Array order
  is preserved (first plugin = first in set chain, last = storage in typical usage).

**Returns:**

Array of plugins in pipeline order

**Example:**

```typescript
createStoragePlugin(localStorage);
// => [ wrap(localStorage) ]

createStoragePlugin([jsonSerializer, encryptor, localStorage]);
// => [ adapter(serialize/deserialize), adapter(encrypt/decrypt), wrap(localStorage) ]
```

#### Parameters

| Name      | Type                                     | Optional | Default | Since | Deprecated | Description                                            |
| --------- | ---------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `plugins` | `StorageInterface<K, V, Opt> \| unknown` | ❌       | -       | -     | -          | Single storage or tuple `[ ...transformers, storage ]` |

---

### `createStoragePluginWithStorage` (Function)

**Type:** `(storage: StorageInterface<K, V, Opt>) => StorageExecutorPlugin<K, V, Opt>`

#### Parameters

| Name      | Type                          | Optional | Default | Since | Deprecated | Description                        |
| --------- | ----------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------- |
| `storage` | `StorageInterface<K, V, Opt>` | ❌       | -       | -     | -          | The backing storage implementation |

---

#### `createStoragePluginWithStorage` (CallSignature)

**Type:** `StorageExecutorPlugin<K, V, Opt>`

Wraps a
`StorageInterface`
as a
`StorageExecutorPlugin`
so it can participate in the pipeline.
Forwards
`get`
/
`set`
/
`remove`
/
`clear`
to the underlying storage.

**Returns:**

A plugin that delegates to
`storage`

#### Parameters

| Name      | Type                          | Optional | Default | Since | Deprecated | Description                        |
| --------- | ----------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------- |
| `storage` | `StorageInterface<K, V, Opt>` | ❌       | -       | -     | -          | The backing storage implementation |

---

### `isEncryptor` (Function)

**Type:** `(plugin: unknown) => callsignature isEncryptor<V, E>`

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description    |
| -------- | --------- | -------- | ------- | ----- | ---------- | -------------- |
| `plugin` | `unknown` | ❌       | -       | -     | -          | Value to check |

---

#### `isEncryptor` (CallSignature)

**Type:** `callsignature isEncryptor<V, E>`

Type guard: checks if the value is an encryptor (has
`encrypt`
and
`decrypt`
methods).

**Returns:**

`true`
if
`plugin`
implements
`EncryptorInterface<V, E>`

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description    |
| -------- | --------- | -------- | ------- | ----- | ---------- | -------------- |
| `plugin` | `unknown` | ❌       | -       | -     | -          | Value to check |

---

### `isSerializer` (Function)

**Type:** `(plugin: unknown) => callsignature isSerializer<V>`

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description    |
| -------- | --------- | -------- | ------- | ----- | ---------- | -------------- |
| `plugin` | `unknown` | ❌       | -       | -     | -          | Value to check |

---

#### `isSerializer` (CallSignature)

**Type:** `callsignature isSerializer<V>`

Type guard: checks if the value is a serializer (has
`serialize`
and
`deserialize`
methods).

**Returns:**

`true`
if
`plugin`
implements
`SerializerIneterface<V>`

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description    |
| -------- | --------- | -------- | ------- | ----- | ---------- | -------------- |
| `plugin` | `unknown` | ❌       | -       | -     | -          | Value to check |

---
