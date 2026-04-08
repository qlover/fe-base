## `src/storage/interface/StorageInterface` (Module)

**Type:** `module src/storage/interface/StorageInterface`

---

### `StorageInterface` (Interface)

**Type:** `interface StorageInterface<K, V, Opt>`

Synchronous key-value storage interface.

Core concept:
Contract for a sync storage that maps keys to values. All operations complete immediately;
suitable for in-memory stores, `localStorage`/`sessionStorage` adapters, or any backend
that does not require async I/O.

Main features:

- Key-value access: `setItem` / `getItem` / `removeItem` by key
- Optional default on read: second `getItem` overload returns a default when key is missing
- Bulk clear: `clear()` removes all entries
- Optional parameters: generic `Opt` allows implementations to support expiry, scope, etc.

Design note: `getItem` returns `V | null` when no default is given, to align with the
browser <a href="../index.md#storage-module" class="tsd-kind-module">Storage</a> API (e.g. `localStorage.getItem` returns `string | null`).

**Example:** Basic usage

```typescript
const storage: StorageInterface<string, number> = ...;
storage.setItem('count', 42);
const value = storage.getItem('count', 0) ?? 0;
storage.removeItem('count');
storage.clear();
```

**Example:** With options (e.g. expiry)

```typescript
storage.setItem('token', 'abc', { maxAge: 3600 });
const token = storage.getItem('token', { scope: 'session' });
```

---

#### `clear` (Method)

**Type:** `() => void`

---

##### `clear` (CallSignature)

**Type:** `void`

Removes all entries in this storage.

Scope of "all" is implementation-defined (e.g. may be limited to a prefix or namespace).

---

#### `getItem` (Method)

**Type:** `(key: K, options: Opt) => null \| V`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description                                                    |
| --------- | ----- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `key`     | `K`   | ❌       | -       | -     | -          | Key of the value to retrieve.                                  |
| `options` | `Opt` | ✅       | -       | -     | -          | Optional parameters for retrieval (e.g. scope). Type is `Opt`. |

---

##### `getItem` (CallSignature)

**Type:** `null \| V`

Retrieves the value for the given key.

Returns `null` when the key is not found, so the signature stays compatible with the
browser <a href="../index.md#storage-module" class="tsd-kind-module">Storage</a> API.

**Returns:**

The stored value, or `null` if the key does not exist.

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description                                                    |
| --------- | ----- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `key`     | `K`   | ❌       | -       | -     | -          | Key of the value to retrieve.                                  |
| `options` | `Opt` | ✅       | -       | -     | -          | Optional parameters for retrieval (e.g. scope). Type is `Opt`. |

---

##### `getItem` (CallSignature)

**Type:** `null \| V`

Retrieves the value for the given key, or the default when missing.

Use this overload when a fallback is required so callers avoid explicit `null` checks.

**Returns:**

The stored value if present, otherwise `defaultValue`.

#### Parameters

| Name           | Type  | Optional | Default | Since | Deprecated | Description                                       |
| -------------- | ----- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `key`          | `K`   | ❌       | -       | -     | -          | Key of the value to retrieve.                     |
| `defaultValue` | `V`   | ❌       | -       | -     | -          | Value to return when the key is not found.        |
| `options`      | `Opt` | ✅       | -       | -     | -          | Optional parameters for retrieval. Type is `Opt`. |

---

#### `removeItem` (Method)

**Type:** `(key: K, options: Opt) => void`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description                                     |
| --------- | ----- | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `key`     | `K`   | ❌       | -       | -     | -          | Key of the value to remove.                     |
| `options` | `Opt` | ✅       | -       | -     | -          | Optional parameters for removal. Type is `Opt`. |

---

##### `removeItem` (CallSignature)

**Type:** `void`

Removes the entry for the given key.

No-op if the key does not exist. Implementations may use `options` (e.g. scope) to
target a specific storage area.

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description                                     |
| --------- | ----- | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `key`     | `K`   | ❌       | -       | -     | -          | Key of the value to remove.                     |
| `options` | `Opt` | ✅       | -       | -     | -          | Optional parameters for removal. Type is `Opt`. |

---

#### `setItem` (Method)

**Type:** `(key: K, value: V, options: Opt) => void`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description                                                                       |
| --------- | ----- | -------- | ------- | ----- | ---------- | --------------------------------------------------------------------------------- |
| `key`     | `K`   | ❌       | -       | -     | -          | Key to identify the stored value. Must be valid for the underlying store.         |
| `value`   | `V`   | ❌       | -       | -     | -          | Value to store. Serialization is implementation-defined (e.g. JSON, string-only). |
| `options` | `Opt` | ✅       | -       | -     | -          | Optional parameters for this write (e.g. `maxAge`, `scope`). Type is `Opt`.       |

---

##### `setItem` (CallSignature)

**Type:** `void`

Stores a value under the given key.

Overwrites any existing value for `key`. Implementations may use `options` for
behaviour such as TTL or storage scope.

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description                                                                       |
| --------- | ----- | -------- | ------- | ----- | ---------- | --------------------------------------------------------------------------------- |
| `key`     | `K`   | ❌       | -       | -     | -          | Key to identify the stored value. Must be valid for the underlying store.         |
| `value`   | `V`   | ❌       | -       | -     | -          | Value to store. Serialization is implementation-defined (e.g. JSON, string-only). |
| `options` | `Opt` | ✅       | -       | -     | -          | Optional parameters for this write (e.g. `maxAge`, `scope`). Type is `Opt`.       |

---
