## `src/storage/interface/KeyStorageInterface` (Module)

**Type:** `module src/storage/interface/KeyStorageInterface`

---

### `KeyStorageInterface` (Interface)

**Type:** `interface KeyStorageInterface<Key, Value, Opt>`

Storage interface bound to a single fixed key.

Core concept:
A storage abstraction that only ever reads/writes one key, exposed as `key`. Callers use
`get`/`set`/`remove` without passing a key; useful for token storage, single preference,
or any "one value per instance" scenario.

Main features:

- Fixed key: `readonly key` identifies the sole key this instance operates on
- Simple API: `get()` / `set(value)` / `remove()` with no key argument
- Optional parameters: generic `Opt` allows implementations to support expiry, scope, etc.

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

#### `key` (Property)

**Type:** `Key`

The single key this storage instance is bound to.

All `get`/`set`/`remove` operations act on this key. Read-only so that the binding
cannot change after creation.

---

#### `get` (Method)

**Type:** `(options: Opt) => null \| Value`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description                                                    |
| --------- | ----- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `options` | `Opt` | ✅       | -       | -     | -          | Optional parameters for retrieval (e.g. scope). Type is `Opt`. |

---

##### `get` (CallSignature)

**Type:** `null \| Value`

Reads the value for the bound key.

**Returns:**

The stored value, or `null` if no value has been set or it was removed.

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description                                                    |
| --------- | ----- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `options` | `Opt` | ✅       | -       | -     | -          | Optional parameters for retrieval (e.g. scope). Type is `Opt`. |

---

#### `remove` (Method)

**Type:** `(options: Opt) => void`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description                                     |
| --------- | ----- | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `options` | `Opt` | ✅       | -       | -     | -          | Optional parameters for removal. Type is `Opt`. |

---

##### `remove` (CallSignature)

**Type:** `void`

Removes the value for the bound key.

No-op if the key is already absent. Implementations may use `options` (e.g. scope)
to target a specific storage area.

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description                                     |
| --------- | ----- | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `options` | `Opt` | ✅       | -       | -     | -          | Optional parameters for removal. Type is `Opt`. |

---

#### `set` (Method)

**Type:** `(value: Value, options: Opt) => void`

#### Parameters

| Name      | Type    | Optional | Default | Since | Deprecated | Description                                                                 |
| --------- | ------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------------------------- |
| `value`   | `Value` | ❌       | -       | -     | -          | Value to store. Serialization is implementation-defined.                    |
| `options` | `Opt`   | ✅       | -       | -     | -          | Optional parameters for this write (e.g. `maxAge`, `scope`). Type is `Opt`. |

---

##### `set` (CallSignature)

**Type:** `void`

Writes the value for the bound key.

Overwrites any existing value. Implementations may use `options` for behaviour such
as TTL or storage scope.

#### Parameters

| Name      | Type    | Optional | Default | Since | Deprecated | Description                                                                 |
| --------- | ------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------------------------- |
| `value`   | `Value` | ❌       | -       | -     | -          | Value to store. Serialization is implementation-defined.                    |
| `options` | `Opt`   | ✅       | -       | -     | -          | Optional parameters for this write (e.g. `maxAge`, `scope`). Type is `Opt`. |

---
