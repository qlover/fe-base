## `src/core/storage/impl/TokenStorage` (Module)

**Type:** `module src/core/storage/impl/TokenStorage`

---

### `TokenStorage` (Class)

**Type:** `class TokenStorage<Key, ValueType>`

相对于是一个 ObjectStorage 别名

默认使用 ObjectStore, 但是 persistent

---

#### `new TokenStorage` (Constructor)

**Type:** `(storageKey: Key, options: TokenStorageOptions<Key>) => TokenStorage<Key, ValueType>`

#### Parameters

| Name         | Type                       | Optional | Default | Since | Deprecated | Description |
| ------------ | -------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `storageKey` | `Key`                      | ❌       | -       | -     | -          |             |
| `options`    | `TokenStorageOptions<Key>` | ✅       | -       | -     | -          |             |

---

#### `key` (Property)

**Type:** `Key`

---

#### `options` (Property)

**Type:** `TokenStorageOptions<Key>`

---

#### `quickerTime` (Property)

**Type:** `QuickerTime`

---

#### `value` (Property)

**Type:** `null \| ValueType`

---

#### `get` (Method)

**Type:** `(options: TokenStorageOptions<Key>) => null \| ValueType`

#### Parameters

| Name      | Type                       | Optional | Default | Since | Deprecated | Description |
| --------- | -------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `options` | `TokenStorageOptions<Key>` | ✅       | -       | -     | -          |             |

---

##### `get` (CallSignature)

**Type:** `null \| ValueType`

#### Parameters

| Name      | Type                       | Optional | Default | Since | Deprecated | Description |
| --------- | -------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `options` | `TokenStorageOptions<Key>` | ✅       | -       | -     | -          |             |

---

#### `getKey` (Method)

**Type:** `() => Key`

---

##### `getKey` (CallSignature)

**Type:** `Key`

---

#### `getTokenExpireTime` (Method)

**Type:** `(expiresIn: ExpiresInType, targetTime: number, quickerTime: QuickerTime) => number`

#### Parameters

| Name          | Type            | Optional | Default | Since | Deprecated | Description |
| ------------- | --------------- | -------- | ------- | ----- | ---------- | ----------- |
| `expiresIn`   | `ExpiresInType` | ❌       | -       | -     | -          |             |
| `targetTime`  | `number`        | ❌       | -       | -     | -          |             |
| `quickerTime` | `QuickerTime`   | ❌       | -       | -     | -          |             |

---

##### `getTokenExpireTime` (CallSignature)

**Type:** `number`

#### Parameters

| Name          | Type            | Optional | Default | Since | Deprecated | Description |
| ------------- | --------------- | -------- | ------- | ----- | ---------- | ----------- |
| `expiresIn`   | `ExpiresInType` | ❌       | -       | -     | -          |             |
| `targetTime`  | `number`        | ❌       | -       | -     | -          |             |
| `quickerTime` | `QuickerTime`   | ❌       | -       | -     | -          |             |

---

#### `getValue` (Method)

**Type:** `() => null \| ValueType`

---

##### `getValue` (CallSignature)

**Type:** `null \| ValueType`

---

#### `mergeOptions` (Method)

**Type:** `(options: TokenStorageOptions<Key>) => TokenStorageOptions<Key>`

#### Parameters

| Name      | Type                       | Optional | Default | Since | Deprecated | Description |
| --------- | -------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `options` | `TokenStorageOptions<Key>` | ✅       | -       | -     | -          |             |

---

##### `mergeOptions` (CallSignature)

**Type:** `TokenStorageOptions<Key>`

#### Parameters

| Name      | Type                       | Optional | Default | Since | Deprecated | Description |
| --------- | -------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `options` | `TokenStorageOptions<Key>` | ✅       | -       | -     | -          |             |

---

#### `remove` (Method)

**Type:** `(options: TokenStorageOptions<Key>) => void`

#### Parameters

| Name      | Type                       | Optional | Default | Since | Deprecated | Description |
| --------- | -------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `options` | `TokenStorageOptions<Key>` | ✅       | -       | -     | -          |             |

---

##### `remove` (CallSignature)

**Type:** `void`

#### Parameters

| Name      | Type                       | Optional | Default | Since | Deprecated | Description |
| --------- | -------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `options` | `TokenStorageOptions<Key>` | ✅       | -       | -     | -          |             |

---

#### `set` (Method)

**Type:** `(token: ValueType, options: TokenStorageOptions<Key>) => void`

#### Parameters

| Name      | Type                       | Optional | Default | Since | Deprecated | Description |
| --------- | -------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `token`   | `ValueType`                | ❌       | -       | -     | -          |             |
| `options` | `TokenStorageOptions<Key>` | ✅       | -       | -     | -          |             |

---

##### `set` (CallSignature)

**Type:** `void`

#### Parameters

| Name      | Type                       | Optional | Default | Since | Deprecated | Description |
| --------- | -------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `token`   | `ValueType`                | ❌       | -       | -     | -          |             |
| `options` | `TokenStorageOptions<Key>` | ✅       | -       | -     | -          |             |

---

### `TokenStorageOptions` (Interface)

**Type:** `interface TokenStorageOptions<Key>`

---

#### `expires` (Property)

**Type:** `ExpiresInType`

Expiration time

---

#### `quickerTime` (Property)

**Type:** `QuickerTime`

QuickerTime

---

#### `storage` (Property)

**Type:** `SyncStorageInterface<Key, unknown>`

Persistent storage

---
