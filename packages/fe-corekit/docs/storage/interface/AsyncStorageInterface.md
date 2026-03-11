## `src/storage/interface/AsyncStorageInterface` (Module)

**Type:** `module src/storage/interface/AsyncStorageInterface`

---

### `AsyncStorageInterface` (Interface)

**Type:** `interface AsyncStorageInterface<Key, ValueType, Opt>`

Asynchronous key-value storage interface.

Core concept:
Contract for a storage that performs I/O asynchronously. All methods return
`Promise`
s;
use this when the backend is async (e.g. IndexedDB, remote storage, encrypted async APIs).

Main features:

- Key-value access:
  `setItem`
  /
  `getItem`
  /
  `removeItem`
  by key, all async
- Optional default on read: overload with
  `defaultValue`
  returns a fallback when key is missing
- Bulk clear:
  `clear()`
  removes all entries and resolves when done
- Optional parameters: generic
  `Opt`
  allows implementations to support expiry, scope, etc.

When to use: Prefer this over sync
`StorageInterface`
when the underlying store is async
or when you want to avoid blocking the main thread.

**Example:** Basic usage

```typescript
const storage: AsyncStorageInterface<string, number, void> = ...;
await storage.setItem('key', 123);
const value = await storage.getItem('key', 0);
await storage.removeItem('key');
await storage.clear();
```

**Example:** Without default (returns null when missing)

```typescript
const value = await storage.getItem('key');
if (value !== null) { ... }
```

---

#### `clear` (Method)

**Type:** `() => Promise<void>`

---

##### `clear` (CallSignature)

**Type:** `Promise<void>`

Removes all entries in this storage asynchronously.

Scope of "all" is implementation-defined. Resolves when the clear has completed.

**Returns:**

Promise that resolves when all values are cleared.

---

#### `getItem` (Method)

**Type:** `(key: Key, options: Opt) => Promise<null \| ValueType>`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description                                       |
| --------- | ----- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `key`     | `Key` | ❌       | -       | -     | -          | Key of the value to retrieve.                     |
| `options` | `Opt` | ✅       | -       | -     | -          | Optional parameters for retrieval. Type is `Opt`. |

---

##### `getItem` (CallSignature)

**Type:** `Promise<null \| ValueType>`

Retrieves the value for the given key asynchronously.

Use this overload when the caller handles missing keys explicitly (e.g. with
`null`
check).

**Returns:**

Promise resolving to the stored value, or
`null`
if the key does not exist.

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description                                       |
| --------- | ----- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `key`     | `Key` | ❌       | -       | -     | -          | Key of the value to retrieve.                     |
| `options` | `Opt` | ✅       | -       | -     | -          | Optional parameters for retrieval. Type is `Opt`. |

---

##### `getItem` (CallSignature)

**Type:** `Promise<ValueType>`

Retrieves the value for the given key, or the default when missing.

Use this overload when a fallback is required; the promise resolves to
`ValueType`
(never
`null`
).

**Returns:**

Promise resolving to the stored value if present, otherwise
`defaultValue`
.

#### Parameters

| Name           | Type        | Optional | Default | Since | Deprecated | Description                                       |
| -------------- | ----------- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `key`          | `Key`       | ❌       | -       | -     | -          | Key of the value to retrieve.                     |
| `defaultValue` | `ValueType` | ❌       | -       | -     | -          | Value to return when the key is not found.        |
| `options`      | `Opt`       | ✅       | -       | -     | -          | Optional parameters for retrieval. Type is `Opt`. |

---

#### `removeItem` (Method)

**Type:** `(key: Key, options: Opt) => Promise<void>`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description                                     |
| --------- | ----- | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `key`     | `Key` | ❌       | -       | -     | -          | Key of the value to remove.                     |
| `options` | `Opt` | ✅       | -       | -     | -          | Optional parameters for removal. Type is `Opt`. |

---

##### `removeItem` (CallSignature)

**Type:** `Promise<void>`

Removes the entry for the given key asynchronously.

No-op if the key does not exist. Resolves when the removal has completed.

**Returns:**

Promise that resolves when the value is removed (or when no-op completes).

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description                                     |
| --------- | ----- | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `key`     | `Key` | ❌       | -       | -     | -          | Key of the value to remove.                     |
| `options` | `Opt` | ✅       | -       | -     | -          | Optional parameters for removal. Type is `Opt`. |

---

#### `setItem` (Method)

**Type:** `(key: Key, value: ValueType, options: Opt) => Promise<void>`

#### Parameters

| Name      | Type        | Optional | Default | Since | Deprecated | Description                                                                 |
| --------- | ----------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------------------------- |
| `key`     | `Key`       | ❌       | -       | -     | -          | Key to identify the stored value.                                           |
| `value`   | `ValueType` | ❌       | -       | -     | -          | Value to store. Serialization is implementation-defined.                    |
| `options` | `Opt`       | ✅       | -       | -     | -          | Optional parameters for this write (e.g. `maxAge`, `scope`). Type is `Opt`. |

---

##### `setItem` (CallSignature)

**Type:** `Promise<void>`

Stores a value under the given key asynchronously.

Overwrites any existing value for
`key`
. Resolves when the write has completed;
rejections are implementation-defined (e.g. quota, I/O errors).

**Returns:**

Promise that resolves when the value is stored, or rejects on failure.

#### Parameters

| Name      | Type        | Optional | Default | Since | Deprecated | Description                                                                 |
| --------- | ----------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------------------------- |
| `key`     | `Key`       | ❌       | -       | -     | -          | Key to identify the stored value.                                           |
| `value`   | `ValueType` | ❌       | -       | -     | -          | Value to store. Serialization is implementation-defined.                    |
| `options` | `Opt`       | ✅       | -       | -     | -          | Optional parameters for this write (e.g. `maxAge`, `scope`). Type is `Opt`. |

---
