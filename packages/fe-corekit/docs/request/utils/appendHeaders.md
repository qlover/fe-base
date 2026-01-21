## `src/request/utils/appendHeaders` (Module)

**Type:** `module src/request/utils/appendHeaders`

---

### `appendHeaders` (Function)

**Type:** `(headers: undefined \| null \| T, key: string, value: string \| number \| boolean) => T`

#### Parameters

| Name      | Type                          | Optional | Default | Since | Deprecated | Description                                                            |
| --------- | ----------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------------- |
| `headers` | `undefined \| null \| T`      | ❌       | -       | -     | -          | The headers object (plain object, Headers instance, or null/undefined) |
| `key`     | `string`                      | ❌       | -       | -     | -          | The header key to set                                                  |
| `value`   | `string \| number \| boolean` | ❌       | -       | -     | -          | The header value (will be converted to string)                         |

---

#### `appendHeaders` (CallSignature)

**Type:** `T`

**Since:** `3.0.0`

Append or set a header value to headers object

This function supports both plain objects and Web API Headers objects.
For plain objects, it returns a new object (immutable).
For Headers objects, it modifies the original object.
If headers is null or undefined, it creates a new object.

**Returns:**

The headers object (new object for plain objects/null/undefined, same reference for Headers)

**Example:**

```typescript
// Plain object (returns new object)
const headers = { Accept: 'application/json' };
const newHeaders = appendHeaders(headers, 'Content-Type', 'application/json');
// headers !== newHeaders (new object)

// Null/undefined (creates new object)
const newHeaders2 = appendHeaders(null, 'Content-Type', 'application/json');
// newHeaders2 = { 'Content-Type': 'application/json' }

// Headers object (modifies original)
const headersObj = new Headers();
appendHeaders(headersObj, 'Content-Type', 'application/json');
// headersObj is modified
```

#### Parameters

| Name      | Type                          | Optional | Default | Since | Deprecated | Description                                                            |
| --------- | ----------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------------- |
| `headers` | `undefined \| null \| T`      | ❌       | -       | -     | -          | The headers object (plain object, Headers instance, or null/undefined) |
| `key`     | `string`                      | ❌       | -       | -     | -          | The header key to set                                                  |
| `value`   | `string \| number \| boolean` | ❌       | -       | -     | -          | The header value (will be converted to string)                         |

---
