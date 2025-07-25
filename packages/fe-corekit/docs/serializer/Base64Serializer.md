## `src/serializer/Base64Serializer` (Module)

**Type:** `unknown`

---

### `Base64Serializer` (Class)

**Type:** `unknown`

**Since:** `1.0.10`

Base64 serialization implementation
Cross-platform string-to-base64 encoding/decoding for both browser and Node.js

Significance: Provides universal Base64 serialization across different JavaScript environments
Core idea: Environment-aware Base64 encoding with consistent API
Main function: Convert strings to/from Base64 with optional URL-safe encoding
Main purpose: Enable cross-platform data serialization with Base64 encoding

Features:

- Cross-platform compatibility (Browser + Node.js)
- Base64 encoding/decoding
- UTF-8 support
- URL-safe encoding option
- Robust error handling

**Implements:**

**Example:**

```typescript
const serializer = new Base64Serializer({ urlSafe: true });

// Encode string to base64
const encoded = serializer.serialize('Hello World!');

// Decode base64 back to string
const decoded = serializer.deserialize(encoded);
```

---

#### `new Base64Serializer` (Constructor)

**Type:** `(options: Object) => Base64Serializer`

#### Parameters

| Name              | Type      | Optional | Default | Since | Deprecated | Description |
| ----------------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `options`         | `Object`  | ✅       | `{}`    | -     | -          |             |
| `options.urlSafe` | `boolean` | ✅       | `ts     |

false
`|`1.0.10` | - | Use URL-safe base64 encoding |

---

#### `deserialize` (Method)

**Type:** `(data: string, defaultValue: string) => string`

#### Parameters

| Name           | Type     | Optional | Default | Since | Deprecated | Description                              |
| -------------- | -------- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `data`         | `string` | ❌       | -       | -     | -          | Base64 string to decode                  |
| `defaultValue` | `string` | ✅       | -       | -     | -          | Optional default value if decoding fails |

---

##### `deserialize` (CallSignature)

**Type:** `string`

**Since:** `1.0.10`

Deserializes base64 string back to original using environment-appropriate method

**Returns:**

Decoded string

#### Parameters

| Name           | Type     | Optional | Default | Since | Deprecated | Description                              |
| -------------- | -------- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `data`         | `string` | ❌       | -       | -     | -          | Base64 string to decode                  |
| `defaultValue` | `string` | ✅       | -       | -     | -          | Optional default value if decoding fails |

---

#### `serialize` (Method)

**Type:** `(data: string) => string`

#### Parameters

| Name   | Type     | Optional | Default | Since | Deprecated | Description      |
| ------ | -------- | -------- | ------- | ----- | ---------- | ---------------- |
| `data` | `string` | ❌       | -       | -     | -          | String to encode |

---

##### `serialize` (CallSignature)

**Type:** `string`

**Since:** `1.0.10`

Serializes string to base64 using environment-appropriate method

**Returns:**

Base64 encoded string

#### Parameters

| Name   | Type     | Optional | Default | Since | Deprecated | Description      |
| ------ | -------- | -------- | ------- | ----- | ---------- | ---------------- |
| `data` | `string` | ❌       | -       | -     | -          | String to encode |

---
