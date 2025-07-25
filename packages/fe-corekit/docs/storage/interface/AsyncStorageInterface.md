## `src/storage/interface/AsyncStorageInterface` (Module)

**Type:** `unknown`

---

### `AsyncStorageInterface` (Interface)

**Type:** `unknown`

Interface representing an asynchronous storage mechanism.

**Example:**

```typescript
const storage: AsyncStorage<string, number> = ...;
await storage.setItem('key', 123);
const value = await storage.getItem('key', 0);
```

---

#### `length` (Property)

**Type:** `number`

The number of items stored.

---

#### `clear` (Method)

**Type:** `() => Promise<void>`

---

##### `clear` (CallSignature)

**Type:** `Promise<void>`

Asynchronously clears all stored values.

**Returns:**

A promise that resolves when all values are cleared.

---

#### `getItem` (Method)

**Type:** `(key: Key, defaultValue: T, options: unknown) => Promise<null \| T>`

#### Parameters

| Name           | Type      | Optional | Default | Since | Deprecated | Description                                          |
| -------------- | --------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `key`          | `Key`     | ❌       | -       | -     | -          | The key of the value to retrieve.                    |
| `defaultValue` | `T`       | ✅       | -       | -     | -          | The default value to return if the key is not found. |
| `options`      | `unknown` | ✅       | -       | -     | -          | Optional parameters for retrieval.                   |

---

##### `getItem` (CallSignature)

**Type:** `Promise<null \| T>`

Asynchronously retrieves a value by key.

**Returns:**

A promise that resolves to the value associated with the key, or the default value if not found.

#### Parameters

| Name           | Type      | Optional | Default | Since | Deprecated | Description                                          |
| -------------- | --------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `key`          | `Key`     | ❌       | -       | -     | -          | The key of the value to retrieve.                    |
| `defaultValue` | `T`       | ✅       | -       | -     | -          | The default value to return if the key is not found. |
| `options`      | `unknown` | ✅       | -       | -     | -          | Optional parameters for retrieval.                   |

---

#### `removeItem` (Method)

**Type:** `(key: Key, options: unknown) => Promise<void>`

#### Parameters

| Name      | Type      | Optional | Default | Since | Deprecated | Description                      |
| --------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `key`     | `Key`     | ❌       | -       | -     | -          | The key of the value to remove.  |
| `options` | `unknown` | ✅       | -       | -     | -          | Optional parameters for removal. |

---

##### `removeItem` (CallSignature)

**Type:** `Promise<void>`

Asynchronously removes a value by key.

**Returns:**

A promise that resolves when the value is removed.

#### Parameters

| Name      | Type      | Optional | Default | Since | Deprecated | Description                      |
| --------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `key`     | `Key`     | ❌       | -       | -     | -          | The key of the value to remove.  |
| `options` | `unknown` | ✅       | -       | -     | -          | Optional parameters for removal. |

---

#### `setItem` (Method)

**Type:** `(key: Key, value: T, options: unknown) => Promise<void>`

#### Parameters

| Name      | Type      | Optional | Default | Since | Deprecated | Description                           |
| --------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------- |
| `key`     | `Key`     | ❌       | -       | -     | -          | The key to identify the stored value. |
| `value`   | `T`       | ❌       | -       | -     | -          | The value to store.                   |
| `options` | `unknown` | ✅       | -       | -     | -          | Optional parameters for storage.      |

---

##### `setItem` (CallSignature)

**Type:** `Promise<void>`

Asynchronously stores a value with the specified key.

**Returns:**

A promise that resolves when the value is stored.

#### Parameters

| Name      | Type      | Optional | Default | Since | Deprecated | Description                           |
| --------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------- |
| `key`     | `Key`     | ❌       | -       | -     | -          | The key to identify the stored value. |
| `value`   | `T`       | ❌       | -       | -     | -          | The value to store.                   |
| `options` | `unknown` | ✅       | -       | -     | -          | Optional parameters for storage.      |

---
