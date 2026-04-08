## `src/request/utils/isAbsoluteUrl` (Module)

**Type:** `module src/request/utils/isAbsoluteUrl`

---

### `isAbsoluteUrl` (Function)

**Type:** `(url: string) => boolean`

#### Parameters

| Name  | Type     | Optional | Default | Since | Deprecated | Description         |
| ----- | -------- | -------- | ------- | ----- | ---------- | ------------------- |
| `url` | `string` | ❌       | -       | -     | -          | URL string to check |

---

#### `isAbsoluteUrl` (CallSignature)

**Type:** `boolean`

**Since:** `3.0.0`

Checks if URL is absolute (starts with `http://` or `https://`)

This utility function determines whether a URL string represents an absolute URL
that includes a protocol scheme. Absolute URLs can be used directly without
requiring a base URL for resolution.

**Returns:**

`true` if URL is absolute, `false` otherwise

**Example:**

```typescript
isAbsoluteUrl('https://api.example.com/users'); // true
isAbsoluteUrl('http://localhost:3000'); // true
isAbsoluteUrl('/users'); // false
isAbsoluteUrl('users'); // false
isAbsoluteUrl('//cdn.example.com/file.js'); // false
```

#### Parameters

| Name  | Type     | Optional | Default | Since | Deprecated | Description         |
| ----- | -------- | -------- | ------- | ----- | ---------- | ------------------- |
| `url` | `string` | ❌       | -       | -     | -          | URL string to check |

---
