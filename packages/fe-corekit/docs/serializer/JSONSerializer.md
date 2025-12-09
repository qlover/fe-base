## `src/serializer/JSONSerializer` (Module)

**Type:** `module src/serializer/JSONSerializer`

---

### `JSONSerializer` (Class)

**Type:** `class JSONSerializer<T, Opt>`

**Since:** `1.0.10`

Enhanced JSON serialization implementation that combines standard JSON API with additional features

Why implement both Serializer and JSON interfaces:

1. Serializer interface provides a consistent API across different serialization formats
2. JSON interface maintains compatibility with native JSON methods
3. Allows seamless integration with both existing JSON code and new serialization patterns

Enhanced capabilities beyond standard JSON:

1. Cross-platform line ending normalization (\r\n -> \n)
2. Built-in pretty printing configuration
3. Default value support for failed deserialization
4. Circular reference detection with clear error messages
5. Type-safe interface with better TypeScript support

Usage scenarios:

1. Direct replacement for JSON global object
2. Part of a pluggable serialization system
3. Configuration file parsing with error handling
4. Cross-platform data exchange

**Implements:**

- Generic serialization interface

**Implements:**

- Standard JSON interface compatibility

**Todo:**

- If circular reference is detected, the error message is not very friendly, can use [flatted](https://www.npmjs.com/package/flatted) to improve it

**Example:**

```typescript
const serializer = new JSONSerializer({ pretty: true });

// Using Serializer interface (with enhanced features)
const serialized = serializer.serialize({ name: 'test' });
const deserialized = serializer.deserialize('invalid json', { fallback: true });

// Using standard JSON API (maintains compatibility)
const json = serializer.stringify({ name: 'test' });
const obj = serializer.parse(json);
```

**Example:**

`JSON.parse`
may encounter errors, so we use
`deserialize`
method to handle them, set default value if needed

```typescript
const serializer = new JSONSerializer();
serializer.deserialize('invalid json', { fallback: true }); // returns { fallback: true }
```

**Example:**

Or, use
`JSONSerializer`
replace native
`JSON`
methods

```typescript
const JSON = new JSONSerializer();

JSON.stringify({ name: 'test' }); // same as JSON.stringify({ name: 'test' })
JSON.parse('{ "name": "test" }'); // same as JSON.parse('{ "name": "test" }')
```

---

#### `new JSONSerializer` (Constructor)

**Type:** `(options: Opt) => JSONSerializer<T, Opt>`

#### Parameters

| Name      | Type  | Optional | Default | Since   | Deprecated | Description                |
| --------- | ----- | -------- | ------- | ------- | ---------- | -------------------------- |
| `options` | `Opt` | ✅       | `{}`    | `1.5.0` | -          | Options for JSONSerializer |

---

#### `[toStringTag]` (Property)

**Type:** `"JSONSerializer"`

**Default:** `'JSONSerializer'`

Implements Symbol.toStringTag to properly identify this class
Required by JSON interface

When this object calls toString, it returns this value

**Example:**

```typescript
const serializer = new JSONSerializer();
serializer.toString(); // returns '[object JSONSerializer]'
```

---

#### `options` (Property)

**Type:** `Opt`

**Since:** `1.5.0`

**Default:** `{}`

Options for JSONSerializer

---

#### `createReplacer` (Method)

**Type:** `(replacer: null \| Object \| string \| number[]) => null \| string \| number[] \| Object`

#### Parameters

| Name       | Type                                   | Optional | Default | Since | Deprecated | Description                                                |
| ---------- | -------------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------- |
| `replacer` | `null \| Object \| string \| number[]` | ✅       | -       | -     | -          | Custom replacer function or array of properties to include |

---

##### `createReplacer` (CallSignature)

**Type:** `null \| string \| number[] \| Object`

**Since:** `1.0.10`

Creates a replacer function that handles line endings normalization

Why normalize line endings:

1. Ensures consistent output across different platforms (Windows, Unix)
2. Prevents issues with source control systems
3. Makes string comparisons reliable

Handles three cases:

1. Array replacer - Used for property filtering
2. Function replacer - Wrapped to handle line endings
3. Null/undefined - Creates default line ending handler

**Returns:**

Replacer function or array of properties to include

#### Parameters

| Name       | Type                                   | Optional | Default | Since | Deprecated | Description                                                |
| ---------- | -------------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------- |
| `replacer` | `null \| Object \| string \| number[]` | ✅       | -       | -     | -          | Custom replacer function or array of properties to include |

---

#### `deserialize` (Method)

**Type:** `(data: string, defaultValue: T) => T`

#### Parameters

| Name           | Type     | Optional | Default | Since | Deprecated | Description |
| -------------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `data`         | `string` | ❌       | -       | -     | -          |             |
| `defaultValue` | `T`      | ✅       | -       | -     | -          |             |

---

##### `deserialize` (CallSignature)

**Type:** `T`

**Since:** `1.0.10`

Implements Serializer.deserialize with enhanced error handling

Benefits:

1. Safe parsing with default value fallback
2. No try-catch needed in calling code
3. Predictable error handling

**Returns:**

Parsed value

#### Parameters

| Name           | Type     | Optional | Default | Since | Deprecated | Description |
| -------------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `data`         | `string` | ❌       | -       | -     | -          |             |
| `defaultValue` | `T`      | ✅       | -       | -     | -          |             |

---

#### `parse` (Method)

**Type:** `(text: string, reviver: Object) => unknown`

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description |
| --------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `text`    | `string` | ❌       | -       | -     | -          |             |
| `reviver` | `Object` | ✅       | -       | -     | -          |             |

---

##### `parse` (CallSignature)

**Type:** `unknown`

**Since:** `1.0.10`

Standard JSON.parse implementation
Note: Error handling is done in deserialize method

**Returns:**

Parsed value

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description |
| --------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `text`    | `string` | ❌       | -       | -     | -          |             |
| `reviver` | `Object` | ✅       | -       | -     | -          |             |

---

#### `serialize` (Method)

**Type:** `(data: unknown) => string`

#### Parameters

| Name   | Type      | Optional | Default | Since | Deprecated | Description |
| ------ | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `data` | `unknown` | ❌       | -       | -     | -          |             |

---

##### `serialize` (CallSignature)

**Type:** `string`

**Since:** `1.0.10`

Implements Serializer.serialize
Provides a simplified interface with configured options

Benefits:

1. Uses configured pretty printing
2. Applies custom replacer if specified
3. Maintains consistent line endings

**Returns:**

Serialized string

#### Parameters

| Name   | Type      | Optional | Default | Since | Deprecated | Description |
| ------ | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `data` | `unknown` | ❌       | -       | -     | -          |             |

---

#### `serializeArray` (Method)

**Type:** `(arr: string \| number \| boolean[]) => string`

#### Parameters

| Name  | Type                            | Optional | Default | Since | Deprecated | Description                            |
| ----- | ------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `arr` | `string \| number \| boolean[]` | ❌       | -       | -     | -          | Array of primitive values to serialize |

---

##### `serializeArray` (CallSignature)

**Type:** `string`

**Since:** `1.0.10`

Optimized serialization for arrays of primitive values
Avoids object property enumeration

**Returns:**

JSON array string

#### Parameters

| Name  | Type                            | Optional | Default | Since | Deprecated | Description                            |
| ----- | ------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `arr` | `string \| number \| boolean[]` | ❌       | -       | -     | -          | Array of primitive values to serialize |

---

#### `stringify` (Method)

**Type:** `(value: unknown, replacer: null \| string \| number[] \| Object, space: string \| number) => string`

#### Parameters

| Name       | Type                                   | Optional | Default | Since | Deprecated | Description |
| ---------- | -------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `value`    | `unknown`                              | ❌       | -       | -     | -          |             |
| `replacer` | `null \| string \| number[] \| Object` | ✅       | -       | -     | -          |             |
| `space`    | `string \| number`                     | ✅       | -       | -     | -          |             |

---

##### `stringify` (CallSignature)

**Type:** `string`

**Since:** `1.0.10`

Enhanced JSON.stringify with additional features

Enhancements:

1. Line ending normalization
2. Configurable pretty printing
3. Better error messages for circular references
4. Type-safe replacer handling

**If circular reference is detected, the error message is not very friendly, can use [flatted](https://www.npmjs.com/package/flatted) to improve it**

**Returns:**

Serialized string

#### Parameters

| Name       | Type                                   | Optional | Default | Since | Deprecated | Description |
| ---------- | -------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `value`    | `unknown`                              | ❌       | -       | -     | -          |             |
| `replacer` | `null \| string \| number[] \| Object` | ✅       | -       | -     | -          |             |
| `space`    | `string \| number`                     | ✅       | -       | -     | -          |             |

---

### `JSONSerializerOptions` (Interface)

**Type:** `interface JSONSerializerOptions`

---

#### `indent` (Property)

**Type:** `number`

**Since:** `1.0.10`

**Default:** `ts
2
`

Number of spaces to use for indentation when pretty printing
Only used when pretty is true

---

#### `pretty` (Property)

**Type:** `boolean`

**Since:** `1.0.10`

**Default:** `ts
false
`

Enable pretty printing of JSON output
Adds automatic indentation and line breaks for better readability

---

#### `replacer` (Property)

**Type:** `Object`

**Since:** `1.0.10`

Custom replacer function for JSON.stringify
Allows custom transformation during serialization
Note: Will be wrapped to handle line endings

---
