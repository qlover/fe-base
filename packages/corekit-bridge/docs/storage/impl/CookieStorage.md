## `src/core/storage/impl/CookieStorage` (Module)

**Type:** `module src/core/storage/impl/CookieStorage`

---

### `CookieStorage` (Class)

**Type:** `class CookieStorage`

CookieStorage

Significance: Provide a
`Storage`
-like synchronous API backed by browser cookies.
Core idea: Wrap the widely-used
`js-cookie`
library with a class that implements
the
`SyncStorage`
interface so that the rest of the codebase can swap
cookie storage in and out just like
`localStorage`
/
`sessionStorage`
.
Main function: get / set / remove / clear cookie values in a strongly-typed, synchronous way.
Main purpose: Persist authentication tokens (or any small piece of data) when
other storage solutions are not applicable, e.g. when third-party
cookies are required or when you need per-domain persistence.

**Example:**

```typescript
import { CookieStorage } from 'packages/corekit-bridge';

const storage = new CookieStorage({ expires: 7 }); // expire in 7 days
storage.setItem('token', 'abc');

const token = storage.getItem<string>('token'); // => 'abc'

storage.removeItem('token');
storage.clear(); // remove every cookie under the current path/domain
```

---

#### `new CookieStorage` (Constructor)

**Type:** `(attrs: CookieAttributes) => CookieStorage`

#### Parameters

| Name    | Type               | Optional | Default | Since | Deprecated | Description |
| ------- | ------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `attrs` | `CookieAttributes` | ✅       | -       | -     | -          |             |

---

#### `length` (Accessor)

**Type:** `accessor length`

---

#### `clear` (Method)

**Type:** `() => void`

---

##### `clear` (CallSignature)

**Type:** `void`

Delete every cookie accessible on the current path and domain.

**Returns:**

void

---

#### `getItem` (Method)

**Type:** `(key: string, defaultValue: T) => null \| T`

#### Parameters

| Name                                                              | Type     | Optional | Default | Since | Deprecated | Description                                     |
| ----------------------------------------------------------------- | -------- | -------- | ------- | ----- | ---------- | ----------------------------------------------- | --------------------------------------------------- |
| `key`                                                             | `string` | ❌       | -       | -     | -          | string – Cookie name to read. Must be URL-safe. |
| `defaultValue`                                                    | `T`      | ✅       | -       | -     | -          | T                                               | undefined – Fallback value returned when the cookie |
| does not exist. No constraint apart from being JSON-serialisable. |

---

##### `getItem` (CallSignature)

**Type:** `null \| T`

Retrieve the value associated with a cookie key.

**Returns:**

T | null – Found value,
`defaultValue`
, or
`null`
when nothing is found.

#### Parameters

| Name                                                              | Type     | Optional | Default | Since | Deprecated | Description                                     |
| ----------------------------------------------------------------- | -------- | -------- | ------- | ----- | ---------- | ----------------------------------------------- | --------------------------------------------------- |
| `key`                                                             | `string` | ❌       | -       | -     | -          | string – Cookie name to read. Must be URL-safe. |
| `defaultValue`                                                    | `T`      | ✅       | -       | -     | -          | T                                               | undefined – Fallback value returned when the cookie |
| does not exist. No constraint apart from being JSON-serialisable. |

---

#### `key` (Method)

**Type:** `(index: number) => null \| string`

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description                                                |
| ------- | -------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------- |
| `index` | `number` | ❌       | -       | -     | -          | number – Zero-based index in the internal cookie key list. |

---

##### `key` (CallSignature)

**Type:** `null \| string`

Obtain the cookie name located at the specified numeric index.

**Returns:**

string | null – Cookie name at the index, or
`null`
when out of bounds.

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description                                                |
| ------- | -------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------- |
| `index` | `number` | ❌       | -       | -     | -          | number – Zero-based index in the internal cookie key list. |

---

#### `removeItem` (Method)

**Type:** `(key: string, options: CookieAttributes) => void`

#### Parameters

| Name                                                         | Type               | Optional | Default | Since | Deprecated | Description                     |
| ------------------------------------------------------------ | ------------------ | -------- | ------- | ----- | ---------- | ------------------------------- | ------------------------------------ |
| `key`                                                        | `string`           | ❌       | -       | -     | -          | string – Cookie name to delete. |
| `options`                                                    | `CookieAttributes` | ✅       | -       | -     | -          | CookieAttributes                | undefined – Optional attributes that |
| must match the cookie being removed (e.g. `path`, `domain`). |

---

##### `removeItem` (CallSignature)

**Type:** `void`

Remove the cookie identified by the supplied key.

**Returns:**

void

#### Parameters

| Name                                                         | Type               | Optional | Default | Since | Deprecated | Description                     |
| ------------------------------------------------------------ | ------------------ | -------- | ------- | ----- | ---------- | ------------------------------- | ------------------------------------ |
| `key`                                                        | `string`           | ❌       | -       | -     | -          | string – Cookie name to delete. |
| `options`                                                    | `CookieAttributes` | ✅       | -       | -     | -          | CookieAttributes                | undefined – Optional attributes that |
| must match the cookie being removed (e.g. `path`, `domain`). |

---

#### `setItem` (Method)

**Type:** `(key: string, value: T, options: CookieAttributes) => void`

#### Parameters

| Name                                    | Type               | Optional | Default | Since | Deprecated | Description                                              |
| --------------------------------------- | ------------------ | -------- | ------- | ----- | ---------- | -------------------------------------------------------- | ----------------------------------- |
| `key`                                   | `string`           | ❌       | -       | -     | -          | string – Cookie name to write. Must be URL-safe.         |
| `value`                                 | `T`                | ❌       | -       | -     | -          | T – Value that will be coerced to string before storage. |
| `options`                               | `CookieAttributes` | ✅       | -       | -     | -          | CookieAttributes                                         | undefined – Extra cookie attributes |
| such as `expires`, `path`, or `domain`. |

---

##### `setItem` (CallSignature)

**Type:** `void`

Persist a value under the given cookie name.

**Returns:**

void

#### Parameters

| Name                                    | Type               | Optional | Default | Since | Deprecated | Description                                              |
| --------------------------------------- | ------------------ | -------- | ------- | ----- | ---------- | -------------------------------------------------------- | ----------------------------------- |
| `key`                                   | `string`           | ❌       | -       | -     | -          | string – Cookie name to write. Must be URL-safe.         |
| `value`                                 | `T`                | ❌       | -       | -     | -          | T – Value that will be coerced to string before storage. |
| `options`                               | `CookieAttributes` | ✅       | -       | -     | -          | CookieAttributes                                         | undefined – Extra cookie attributes |
| such as `expires`, `path`, or `domain`. |

---
