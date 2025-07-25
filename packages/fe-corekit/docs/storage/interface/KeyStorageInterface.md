## `src/storage/interface/KeyStorageInterface` (Module)

**Type:** `unknown`

---

### `KeyStorageInterface` (Class)

**Type:** `unknown`

---

#### `new KeyStorageInterface` (Constructor)

**Type:** `(key: Key, options: Opt) => KeyStorageInterface<Key, Value, Opt>`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description |
| --------- | ----- | -------- | ------- | ----- | ---------- | ----------- |
| `key`     | `Key` | ❌       | -       | -     | -          |             |
| `options` | `Opt` | ✅       | `...`   | -     | -          |             |

---

#### `key` (Property)

**Type:** `Key`

---

#### `options` (Property)

**Type:** `Opt`

**Default:** `...`

---

#### `value` (Property)

**Type:** `null \| Value`

**Default:** `null`

---

#### `get` (Method)

**Type:** `(options: Opt) => null \| Value`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description |
| --------- | ----- | -------- | ------- | ----- | ---------- | ----------- |
| `options` | `Opt` | ✅       | -       | -     | -          |             |

---

##### `get` (CallSignature)

**Type:** `null \| Value`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description |
| --------- | ----- | -------- | ------- | ----- | ---------- | ----------- |
| `options` | `Opt` | ✅       | -       | -     | -          |             |

---

#### `getKey` (Method)

**Type:** `() => Key`

---

##### `getKey` (CallSignature)

**Type:** `Key`

---

#### `getValue` (Method)

**Type:** `() => null \| Value`

---

##### `getValue` (CallSignature)

**Type:** `null \| Value`

---

#### `remove` (Method)

**Type:** `(options: Opt) => void`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description |
| --------- | ----- | -------- | ------- | ----- | ---------- | ----------- |
| `options` | `Opt` | ✅       | -       | -     | -          |             |

---

##### `remove` (CallSignature)

**Type:** `void`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description |
| --------- | ----- | -------- | ------- | ----- | ---------- | ----------- |
| `options` | `Opt` | ✅       | -       | -     | -          |             |

---

#### `set` (Method)

**Type:** `(value: Value, options: Opt) => void`

#### Parameters

| Name      | Type    | Optional | Default | Since | Deprecated | Description |
| --------- | ------- | -------- | ------- | ----- | ---------- | ----------- |
| `value`   | `Value` | ❌       | -       | -     | -          |             |
| `options` | `Opt`   | ✅       | -       | -     | -          |             |

---

##### `set` (CallSignature)

**Type:** `void`

#### Parameters

| Name      | Type    | Optional | Default | Since | Deprecated | Description |
| --------- | ------- | -------- | ------- | ----- | ---------- | ----------- |
| `value`   | `Value` | ❌       | -       | -     | -          |             |
| `options` | `Opt`   | ✅       | -       | -     | -          |             |

---

### `KeyStorageOptions` (Interface)

**Type:** `unknown`

---

#### `expires` (Property)

**Type:** `unknown`

Expire time

maybe is

- number: milliseconds
- string: time string, like '1d', '1h', '1m', '1s'
- object: {}
- ...

Subclass implementation

---

#### `storage` (Property)

**Type:** `SyncStorageInterface<Key, Sopt>`

Persistent storage

---
