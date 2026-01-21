## `src/serializer/Base64Serializer` (Module)

**Type:** `module src/serializer/Base64Serializer`

---

### `Base64Serializer` (Class)

**Type:** `class Base64Serializer`

**Since:** `1.0.10`

Base64 serialization implementation with cross-platform support

Core concept:
Provides universal Base64 encoding/decoding that works consistently
across browser and Node.js environments, with automatic environment
detection and appropriate API usage.

Main features:

- Cross-platform compatibility: Works in both browser and Node.js
  - Browser: Uses native
    `btoa`
    /
    `atob`
    with TextEncoder/TextDecoder
  - Node.js: Uses Buffer API for optimal performance
  - Automatic environment detection
  - Consistent behavior across platforms

- UTF-8 support: Proper handling of Unicode characters
  - Supports all Unicode characters
  - Handles multi-byte characters correctly
  - Prevents encoding errors

- URL-safe encoding: Optional URL-safe Base64 format
  - Replaces
    `+`
    with
    `-`

  - Replaces
    `/`
    with
    `_`

  - Removes padding
    `=`
    characters
  - Safe for use in URLs and filenames

- Robust error handling: Graceful failure with default values
  - Validates Base64 format before decoding
  - Returns default value on error
  - No exceptions thrown

Use cases:

- Data obfuscation: Hide data in plain sight
- URL encoding: Encode data for URL parameters
- Binary data: Encode binary data as text
- Storage: Store binary data in text-based storage

**Implements:**

**Example:** Basic usage

```typescript
const serializer = new Base64Serializer();

// Encode string to Base64
const encoded = serializer.serialize('Hello World!');
console.log(encoded); // "SGVsbG8gV29ybGQh"

// Decode Base64 back to string
const decoded = serializer.deserialize(encoded);
console.log(decoded); // "Hello World!"
```

**Example:** URL-safe encoding

```typescript
const serializer = new Base64Serializer({ urlSafe: true });

const data = 'data+with/special=chars';
const encoded = serializer.serialize(data);
// URL-safe: no +, /, or = characters
console.log(encoded); // "ZGF0YSt3aXRoL3NwZWNpYWw9Y2hhcnM"
```

**Example:** UTF-8 support

```typescript
const serializer = new Base64Serializer();

// Encode Unicode characters
const encoded = serializer.serialize('你好世界 🌍');
const decoded = serializer.deserialize(encoded);
console.log(decoded); // "你好世界 🌍"
```

**Example:** Error handling

```typescript
const serializer = new Base64Serializer();

// Invalid Base64 returns default value
const result = serializer.deserialize('invalid!!!', 'fallback');
console.log(result); // "fallback"
```

---

#### `new Base64Serializer` (Constructor)

**Type:** `(options: Object) => Base64Serializer`

#### Parameters

| Name              | Type      | Optional | Default | Since    | Deprecated | Description                  |
| ----------------- | --------- | -------- | ------- | -------- | ---------- | ---------------------------- |
| `options`         | `Object`  | ✅       | `{}`    | -        | -          | Configuration options        |
| `options.urlSafe` | `boolean` | ✅       | `false` | `1.0.10` | -          | Use URL-safe Base64 encoding |

When enabled:

- Replaces `+` with `-`
- Replaces `/` with `_`
- Removes padding `=` characters |

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

Deserializes Base64 string back to original using environment-appropriate method

Validates the Base64 format before decoding and returns default value
if validation or decoding fails. Automatically handles URL-safe format
conversion if configured.

**Returns:**

Decoded string (default value on error)

**Example:**

```typescript
const serializer = new Base64Serializer();
const decoded = serializer.deserialize('SGVsbG8gV29ybGQh');
console.log(decoded); // "Hello World!"
```

**Example:** With default value

```typescript
const decoded = serializer.deserialize('invalid', 'fallback');
console.log(decoded); // "fallback"
```

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

Serializes string to Base64 using environment-appropriate method

Automatically detects the environment and uses the optimal encoding method:

- Node.js: Uses Buffer API for better performance
- Browser: Uses btoa with TextEncoder for UTF-8 support

**Returns:**

Base64 encoded string (empty string on error)

**Example:**

```typescript
const serializer = new Base64Serializer();
const encoded = serializer.serialize('Hello World!');
console.log(encoded); // "SGVsbG8gV29ybGQh"
```

#### Parameters

| Name   | Type     | Optional | Default | Since | Deprecated | Description      |
| ------ | -------- | -------- | ------- | ----- | ---------- | ---------------- |
| `data` | `string` | ❌       | -       | -     | -          | String to encode |

---
