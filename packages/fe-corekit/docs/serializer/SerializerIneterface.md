## `src/serializer/SerializerIneterface` (Module)

**Type:** `module src/serializer/SerializerIneterface`

---

### `SerializerIneterface` (Interface)

**Type:** `interface SerializerIneterface<T, R>`

**Since:** `1.0.10`

Generic interface for data serialization/deserialization operations

Core concept:
Provides a standard contract for implementing serialization strategies,
enabling conversion between different data formats (objects to strings,
binary data, etc.) with a consistent API.

Main features:

- Format conversion: Transform data between different representations
  - Objects to strings (JSON, XML, YAML)
  - Binary encoding (Base64, hex)
  - Custom formats (Protocol Buffers, MessagePack)

- Error handling: Safe deserialization with default values
  - Graceful handling of invalid data
  - Default value fallback
  - No exceptions thrown on parse errors

- Type safety: Generic type parameters for compile-time safety
  - Input type `T` for data to serialize
  - Output type `R` for serialized format
  - Type inference for better IDE support

Use cases:

- Storage systems: Serialize objects for localStorage
- Network transmission: Convert data for API requests
- Configuration files: Parse and generate config files
- Data persistence: Save application state

**Example:** JSON serialization

```typescript
class JSONSerializer implements SerializerIneterface<unknown, string> {
  serialize(data: unknown): string {
    return JSON.stringify(data);
  }

  deserialize(data: string, defaultValue?: unknown): unknown {
    try {
      return JSON.parse(data);
    } catch {
      return defaultValue;
    }
  }
}

const serializer = new JSONSerializer();
const json = serializer.serialize({ name: 'John' });
const obj = serializer.deserialize(json);
```

**Example:** Base64 serialization

```typescript
class Base64Serializer implements SerializerIneterface<string, string> {
  serialize(data: string): string {
    return btoa(data);
  }

  deserialize(data: string, defaultValue?: string): string {
    try {
      return atob(data);
    } catch {
      return defaultValue ?? '';
    }
  }
}
```

**Example:** Type-safe serialization

```typescript
interface User {
  id: number;
  name: string;
}

class UserSerializer implements SerializerIneterface<User, string> {
  serialize(user: User): string {
    return `${user.id}:${user.name}`;
  }

  deserialize(data: string, defaultValue?: User): User {
    const [id, name] = data.split(':');
    if (!id || !name) {
      return defaultValue ?? { id: 0, name: '' };
    }
    return { id: parseInt(id), name };
  }
}
```

---

#### `deserialize` (Method)

**Type:** `(data: R, defaultValue: T) => T`

#### Parameters

| Name           | Type | Optional | Default | Since | Deprecated | Description                                               |
| -------------- | ---- | -------- | ------- | ----- | ---------- | --------------------------------------------------------- |
| `data`         | `R`  | ❌       | -       | -     | -          | Serialized data to deserialize                            |
| `defaultValue` | `T`  | ✅       | -       | -     | -          | Optional default value to return if deserialization fails |

---

##### `deserialize` (CallSignature)

**Type:** `T`

**Since:** `1.0.10`

Deserializes data from target format back to original form

Converts serialized data back to its original format. If deserialization
fails, returns the provided default value instead of throwing an error.

**Returns:**

Original data structure or default value

**Example:** Basic deserialization

```typescript
const serializer = new JSONSerializer();
const obj = serializer.deserialize('{"id":1,"name":"John"}');
// Result: { id: 1, name: 'John' }
```

**Example:** With default value

```typescript
const serializer = new JSONSerializer();
const obj = serializer.deserialize('invalid json', { id: 0, name: 'Unknown' });
// Result: { id: 0, name: 'Unknown' }
```

#### Parameters

| Name           | Type | Optional | Default | Since | Deprecated | Description                                               |
| -------------- | ---- | -------- | ------- | ----- | ---------- | --------------------------------------------------------- |
| `data`         | `R`  | ❌       | -       | -     | -          | Serialized data to deserialize                            |
| `defaultValue` | `T`  | ✅       | -       | -     | -          | Optional default value to return if deserialization fails |

---

#### `serialize` (Method)

**Type:** `(data: T) => R`

#### Parameters

| Name   | Type | Optional | Default | Since | Deprecated | Description       |
| ------ | ---- | -------- | ------- | ----- | ---------- | ----------------- |
| `data` | `T`  | ❌       | -       | -     | -          | Data to serialize |

---

##### `serialize` (CallSignature)

**Type:** `R`

**Since:** `1.0.10`

Serializes data into a target format

Converts data from its original format to a serialized representation.
The serialization process should be deterministic and reversible.

**Returns:**

Serialized representation

**Example:**

```typescript
const serializer = new JSONSerializer();
const json = serializer.serialize({ id: 1, name: 'John' });
// Result: '{"id":1,"name":"John"}'
```

#### Parameters

| Name   | Type | Optional | Default | Since | Deprecated | Description       |
| ------ | ---- | -------- | ------- | ----- | ---------- | ----------------- |
| `data` | `T`  | ❌       | -       | -     | -          | Data to serialize |

---
