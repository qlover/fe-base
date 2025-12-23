## `src/storage/impl/KeyStorage` (Module)

**Type:** `module src/storage/impl/KeyStorage`

---

### `KeyStorage` (Class)

**Type:** `class KeyStorage<Key, Value, Opt>`

**Since:** `1.5.0`

KeyStorage is a storage that can be used to store a single value.

Typical usage scenario: need to store a value and need to persist it:

- token storage
- user info storage
- page theme, language
- ...

And support for data encryption, there are times when reporting errors in the local data can easily be tampered with, this time you can use encryption to protect the data!

**Example:** basic usage

use localStorage as storage, persist the value

```typescript
const tokenStorage = new KeyStorage('token', localStorage);

tokenStorage.get(); // get from localStorage
tokenStorage.set('token-123123123'); // set to localStorage
tokenStorage.remove(); // remove from localStorage
```

**Example:** with encrypt

```typescript
const tokenStorage = new KeyStorage('token', localStorage, {
  encrypt: new Encryptor(new AESCipher('1234567890'))
});

tokenStorage.get(); // get from localStorage
tokenStorage.set('token-123123123'); // set to localStorage
tokenStorage.remove(); // remove from localStorage
```

---

#### `new KeyStorage` (Constructor)

**Type:** `(key: Key, options: Opt) => KeyStorage<Key, Value, Opt>`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description |
| --------- | ----- | -------- | ------- | ----- | ---------- | ----------- |
| `key`     | `Key` | ❌       | -       | -     | -          |             |
| `options` | `Opt` | ✅       | `{}`    | -     | -          |             |

---

#### `key` (Property)

**Type:** `Key`

---

#### `options` (Property)

**Type:** `Opt`

**Default:** `{}`

---

#### `value` (Property)

**Type:** `null \| Value`

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

#### `mergeOptions` (Method)

**Type:** `(options: Opt) => Opt`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description |
| --------- | ----- | -------- | ------- | ----- | ---------- | ----------- |
| `options` | `Opt` | ✅       | -       | -     | -          |             |

---

##### `mergeOptions` (CallSignature)

**Type:** `Opt`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description |
| --------- | ----- | -------- | ------- | ----- | ---------- | ----------- |
| `options` | `Opt` | ✅       | -       | -     | -          |             |

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

**Type:** `(token: Value, options: Opt) => void`

#### Parameters

| Name      | Type    | Optional | Default | Since | Deprecated | Description |
| --------- | ------- | -------- | ------- | ----- | ---------- | ----------- |
| `token`   | `Value` | ❌       | -       | -     | -          |             |
| `options` | `Opt`   | ✅       | -       | -     | -          |             |

---

##### `set` (CallSignature)

**Type:** `void`

#### Parameters

| Name      | Type    | Optional | Default | Since | Deprecated | Description |
| --------- | ------- | -------- | ------- | ----- | ---------- | ----------- |
| `token`   | `Value` | ❌       | -       | -     | -          |             |
| `options` | `Opt`   | ✅       | -       | -     | -          |             |

---

### `KeyStorageOptions` (Interface)

**Type:** `interface KeyStorageOptions<Key, Sopt>`

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
