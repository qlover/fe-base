## `src/storage/impl/KeyStorage` (Module)

**Type:** `module src/storage/impl/KeyStorage`

---

### `KeyStorage` (Class)

**Type:** `class KeyStorage<K, V, Opt>`

Storage interface bound to a single fixed key.

Core concept:
A storage abstraction that only ever reads/writes one key, exposed as
`key`
. Callers use

`get`
/
`set`
/
`remove`
without passing a key; useful for token storage, single preference,
or any "one value per instance" scenario.

Main features:

- Fixed key:
  `readonly key`
  identifies the sole key this instance operates on
- Simple API:
  `get()`
  /
  `set(value)`
  /
  `remove()`
  with no key argument
- Optional parameters: generic
  `Opt`
  allows implementations to support expiry, scope, etc.

When to use: Prefer this over a generic key-value interface when the semantic is "one
named slot" (e.g. auth token, theme, locale) and you want to avoid key typos and keep
API minimal.

**Example:** Basic usage (token)

```typescript
const tokenStorage: KeyStorageInterface<'token', string> = ...;
tokenStorage.set('jwt-abc');
const token = tokenStorage.get();
tokenStorage.remove();
```

**Example:** With options

```typescript
tokenStorage.set('jwt-abc', { maxAge: 3600 });
const token = tokenStorage.get({ scope: 'session' });
```

---

#### `new KeyStorage` (Constructor)

**Type:** `(key: K, storage: StorageInterface<K, V, Opt>) => KeyStorage<K, V, Opt>`

#### Parameters

| Name      | Type                          | Optional | Default | Since | Deprecated | Description |
| --------- | ----------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `key`     | `K`                           | ❌       | -       | -     | -          |             |
| `storage` | `StorageInterface<K, V, Opt>` | ✅       | -       | -     | -          |             |

---

#### `key` (Property)

**Type:** `K`

The single key this storage instance is bound to.

All
`get`
/
`set`
/
`remove`
operations act on this key. Read-only so that the binding
cannot change after creation.

---

#### `storage` (Property)

**Type:** `StorageInterface<K, V, Opt>`

---

#### `value` (Property)

**Type:** `undefined \| null \| V`

---

#### `get` (Method)

**Type:** `(options: Opt) => null \| V`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description |
| --------- | ----- | -------- | ------- | ----- | ---------- | ----------- |
| `options` | `Opt` | ✅       | -       | -     | -          |             |

---

##### `get` (CallSignature)

**Type:** `null \| V`

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

**Type:** `(value: V, options: Opt) => void`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description |
| --------- | ----- | -------- | ------- | ----- | ---------- | ----------- |
| `value`   | `V`   | ❌       | -       | -     | -          |             |
| `options` | `Opt` | ✅       | -       | -     | -          |             |

---

##### `set` (CallSignature)

**Type:** `void`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description |
| --------- | ----- | -------- | ------- | ----- | ---------- | ----------- |
| `value`   | `V`   | ❌       | -       | -     | -          |             |
| `options` | `Opt` | ✅       | -       | -     | -          |             |

---
