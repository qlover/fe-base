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

| Name      | Type  | Optional | Default | Since | Deprecated | Description                                      |
| --------- | ----- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `options` | `Opt` | ✅       | `{}`    | -     | -          | Configuration options for serialization behavior |

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

| Name           | Type     | Optional | Default | Since | Deprecated | Description                             |
| -------------- | -------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `data`         | `string` | ❌       | -       | -     | -          | JSON string to deserialize              |
| `defaultValue` | `T`      | ✅       | -       | -     | -          | Optional default value if parsing fails |

---

##### `deserialize` (CallSignature)

**Type:** `T`

**Since:** `1.0.10`

Implements Serializer.deserialize with enhanced error handling

Safely parses JSON string with automatic error handling. Returns
default value if parsing fails instead of throwing an error.

Benefits:

1. Safe parsing with default value fallback
2. No try-catch needed in calling code
3. Predictable error handling

**Returns:**

Parsed value or default value

**Example:** Safe parsing

```typescript
const serializer = new JSONSerializer();
const obj = serializer.deserialize('invalid json', { name: 'Default' });
// Result: { name: 'Default' }
```

#### Parameters

| Name           | Type     | Optional | Default | Since | Deprecated | Description                             |
| -------------- | -------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `data`         | `string` | ❌       | -       | -     | -          | JSON string to deserialize              |
| `defaultValue` | `T`      | ✅       | -       | -     | -          | Optional default value if parsing fails |

---

#### `parse` (Method)

**Type:** `(text: string, reviver: Object) => unknown`

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description                                  |
| --------- | -------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `text`    | `string` | ❌       | -       | -     | -          | JSON string to parse                         |
| `reviver` | `Object` | ✅       | -       | -     | -          | Optional function to transform parsed values |

---

##### `parse` (CallSignature)

**Type:** `unknown`

**Since:** `1.0.10`

Standard JSON.parse implementation

Parses a JSON string and returns the corresponding JavaScript value.
Error handling is done in the
`deserialize`
method.

**Returns:**

Parsed JavaScript value

**Example:**

```typescript
const serializer = new JSONSerializer();
const obj = serializer.parse('{"name":"John"}');
// Result: { name: 'John' }
```

#### Parameters

| Name      | Type     | Optional | Default | Since | Deprecated | Description                                  |
| --------- | -------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `text`    | `string` | ❌       | -       | -     | -          | JSON string to parse                         |
| `reviver` | `Object` | ✅       | -       | -     | -          | Optional function to transform parsed values |

---

#### `serialize` (Method)

**Type:** `(data: unknown) => string`

#### Parameters

| Name   | Type      | Optional | Default | Since | Deprecated | Description       |
| ------ | --------- | -------- | ------- | ----- | ---------- | ----------------- |
| `data` | `unknown` | ❌       | -       | -     | -          | Data to serialize |

---

##### `serialize` (CallSignature)

**Type:** `string`

**Since:** `1.0.10`

Implements Serializer.serialize

Provides a simplified interface with configured options.
Uses the instance's configuration for pretty printing and replacer.

Benefits:

1. Uses configured pretty printing
2. Applies custom replacer if specified
3. Maintains consistent line endings

**Returns:**

Serialized JSON string

**Example:**

```typescript
const serializer = new JSONSerializer({ pretty: true });
const json = serializer.serialize({ name: 'John' });
```

#### Parameters

| Name   | Type      | Optional | Default | Since | Deprecated | Description       |
| ------ | --------- | -------- | ------- | ----- | ---------- | ----------------- |
| `data` | `unknown` | ❌       | -       | -     | -          | Data to serialize |

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

Provides faster serialization for arrays containing only primitives
by avoiding object property enumeration and using direct array mapping.

Performance benefits:

- Faster than standard
  `JSON.stringify`
  for primitive arrays
- Avoids object property enumeration overhead
- Direct string concatenation

**Returns:**

JSON array string

**Example:**

```typescript
const serializer = new JSONSerializer();
const json = serializer.serializeArray([1, 2, 'test', true]);
// Result: '[1,2,"test",true]'
```

#### Parameters

| Name  | Type                            | Optional | Default | Since | Deprecated | Description                            |
| ----- | ------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `arr` | `string \| number \| boolean[]` | ❌       | -       | -     | -          | Array of primitive values to serialize |

---

#### `stringify` (Method)

**Type:** `(value: unknown, replacer: null \| string \| number[] \| Object, space: string \| number) => string`

#### Parameters

| Name       | Type                                   | Optional | Default | Since | Deprecated | Description                                       |
| ---------- | -------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `value`    | `unknown`                              | ❌       | -       | -     | -          | Value to serialize                                |
| `replacer` | `null \| string \| number[] \| Object` | ✅       | -       | -     | -          | Optional replacer function or property array      |
| `space`    | `string \| number`                     | ✅       | -       | -     | -          | Optional indentation (number of spaces or string) |

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

Serialized JSON string

**Example:** Basic usage

```typescript
const serializer = new JSONSerializer();
const json = serializer.stringify({ name: 'John', age: 30 });
// Result: '{"name":"John","age":30}'
```

**Example:** With pretty printing

```typescript
const json = serializer.stringify({ name: 'John' }, null, 2);
// Result:
// {
//   "name": "John"
// }
```

#### Parameters

| Name       | Type                                   | Optional | Default | Since | Deprecated | Description                                       |
| ---------- | -------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `value`    | `unknown`                              | ❌       | -       | -     | -          | Value to serialize                                |
| `replacer` | `null \| string \| number[] \| Object` | ✅       | -       | -     | -          | Optional replacer function or property array      |
| `space`    | `string \| number`                     | ✅       | -       | -     | -          | Optional indentation (number of spaces or string) |

---

### `JSONSerializerOptions` (Interface)

**Type:** `interface JSONSerializerOptions`

Configuration options for JSONSerializer

Provides customization options for JSON serialization behavior,
including formatting, indentation, and custom transformation logic.

**Example:** Basic configuration

```typescript
const options: JSONSerializerOptions = {
  pretty: true,
  indent: 2
};
```

---

#### `indent` (Property)

**Type:** `number`

**Since:** `1.0.10`

**Default:** `2`

Number of spaces to use for indentation when pretty printing

Only used when
`pretty`
is
`true`
. Controls the indentation level
for nested objects and arrays.

**Example:**

```typescript
const serializer = new JSONSerializer({ pretty: true, indent: 4 });
serializer.serialize({ user: { name: 'John' } });
// Result:
// {
//     "user": {
//         "name": "John"
//     }
// }
```

---

#### `pretty` (Property)

**Type:** `boolean`

**Since:** `1.0.10`

**Default:** `false`

Enable pretty printing of JSON output

When enabled, adds automatic indentation and line breaks for better
readability. Useful for configuration files, debugging, or human-readable output.

**Example:**

```typescript
const serializer = new JSONSerializer({ pretty: true });
serializer.serialize({ name: 'John', age: 30 });
// Result:
// {
//   "name": "John",
//   "age": 30
// }
```

---

#### `replacer` (Property)

**Type:** `Object`

**Since:** `1.0.10`

Custom replacer function for JSON.stringify

Allows custom transformation during serialization. The function is
automatically wrapped to handle line ending normalization.

**Example:** Filter properties

```typescript
const serializer = new JSONSerializer({
  replacer: (key, value) => {
    // Exclude password field
    if (key === 'password') return undefined;
    return value;
  }
});

serializer.serialize({ name: 'John', password: 'secret' });
// Result: '{"name":"John"}'
```

**Example:** Transform values

```typescript
const serializer = new JSONSerializer({
  replacer: (key, value) => {
    // Convert dates to ISO strings
    if (value instanceof Date) return value.toISOString();
    return value;
  }
});
```

---
