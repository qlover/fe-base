## `src/storage/impl/ObjectStorage` (Module)

**Type:** `module src/storage/impl/ObjectStorage`

---

### `ObjectStorage` (Class)

**Type:** `class ObjectStorage<Key, ValueType, Opt>`

**Since:** `1.5.0`

Object-based storage implementation with memory caching and optional persistence

Significance: Provides a high-performance storage solution with dual-layer architecture
Core idea: Combine in-memory caching with optional persistent storage for optimal performance
Main function: Store and retrieve data with expiration support and automatic cache management
Main purpose: Enable fast data access with persistence and expiration capabilities

Features:

- In-memory caching for fast access
- Optional persistent storage backend
- Automatic expiration handling
- Type-safe operations with generics
- Serialization support for complex data types

**Example:**

```typescript
import { ObjectStorage } from './ObjectStorage';
import { JsonSerializer } from '../serializer';

// Create storage with JSON serializer
const storage = new ObjectStorage(
  new JsonSerializer(),
  localStorage // optional persistent storage
);

// Store data with expiration
storage.setItem('user-session', { userId: 123 }, Date.now() + 3600000);

// Retrieve data
const session = storage.getItem('user-session');
```

---

#### `new ObjectStorage` (Constructor)

**Type:** `(serializer: SerializerIneterface<unknown, ValueType>) => ObjectStorage<Key, ValueType, Opt>`

#### Parameters

| Name         | Type                                       | Optional | Default | Since | Deprecated | Description                                                        |
| ------------ | ------------------------------------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------ |
| `serializer` | `SerializerIneterface<unknown, ValueType>` | ✅       | -       | -     | -          | Serializer for converting between storage values and stored format |

---

#### `serializer` (Property)

**Type:** `SerializerIneterface<unknown, ValueType>`

Serializer for data transformation

Significance: Enables storage of complex data types
Core idea: Convert between runtime objects and storage format
Main function: Serialize/deserialize storage values
Main purpose: Support type-safe storage operations

---

#### `store` (Property)

**Type:** `Map<Key, ValueType>`

**Default:** `{}`

In-memory storage map for fast data access

Significance: Primary storage layer for performance optimization
Core idea: Keep frequently accessed data in memory
Main function: Provide instant data access without I/O operations
Main purpose: Minimize latency for storage operations

---

#### `length` (Accessor)

**Type:** `accessor length`

The number of items stored.

---

#### `clear` (Method)

**Type:** `() => void`

---

##### `clear` (CallSignature)

**Type:** `void`

Clears all stored items from both memory and persistent storage

Significance: Bulk cleanup method for complete storage reset
Core idea: Synchronize clearing across all storage layers
Main function: Remove all data from memory and persistent storage
Main purpose: Provide complete storage reset capability

**Example:**

```typescript
storage.clear(); // Removes all stored data
```

---

#### `getItem` (Method)

**Type:** `(key: Key, defaultValue: T) => null \| T`

#### Parameters

| Name           | Type  | Optional | Default | Since | Deprecated | Description                                          |
| -------------- | ----- | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `key`          | `Key` | ❌       | -       | -     | -          | The key of the item to retrieve                      |
| `defaultValue` | `T`   | ✅       | -       | -     | -          | Default value to return if item not found or expired |

---

##### `getItem` (CallSignature)

**Type:** `null \| T`

Retrieves a stored value by key with fallback strategy

Significance: Primary method for data retrieval operations
Core idea: Multi-layer retrieval with expiration checking
Main function: Get data from memory first, then persistent storage
Main purpose: Provide fast, reliable data access with automatic cleanup

Retrieval strategy:

1. Check memory cache first
2. Fallback to persistent storage if not in memory
3. Validate expiration and cleanup if expired
4. Return default value if not found or expired

**Returns:**

The stored value or default value if not found/expired

**Example:**

```typescript
// Get value with default
const username = storage.getItem('username', 'anonymous');

// Get complex object
const config = storage.getItem<AppConfig>('app-config');
```

#### Parameters

| Name           | Type  | Optional | Default | Since | Deprecated | Description                                          |
| -------------- | ----- | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `key`          | `Key` | ❌       | -       | -     | -          | The key of the item to retrieve                      |
| `defaultValue` | `T`   | ✅       | -       | -     | -          | Default value to return if item not found or expired |

---

#### `getRawValue` (Method)

**Type:** `(value: unknown, defaultValue: T) => null \| T`

#### Parameters

| Name           | Type      | Optional | Default | Since | Deprecated | Description                          |
| -------------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------ |
| `value`        | `unknown` | ❌       | -       | -     | -          | The value to get the raw value from. |
| `defaultValue` | `T`       | ✅       | -       | -     | -          |                                      |

---

##### `getRawValue` (CallSignature)

**Type:** `null \| T`

Get the raw value from the storage.

通过这个方法可以获取到内部原始的值

**Returns:**

The raw value.

#### Parameters

| Name           | Type      | Optional | Default | Since | Deprecated | Description                          |
| -------------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------ |
| `value`        | `unknown` | ❌       | -       | -     | -          | The value to get the raw value from. |
| `defaultValue` | `T`       | ✅       | -       | -     | -          |                                      |

---

#### `getSerializer` (Method)

**Type:** `() => undefined \| SerializerIneterface<unknown, ValueType>`

---

##### `getSerializer` (CallSignature)

**Type:** `undefined \| SerializerIneterface<unknown, ValueType>`

Gets the serializer instance

Significance: Provides access to the serialization logic
Core idea: Expose serializer for advanced use cases
Main function: Return the serializer instance
Main purpose: Enable direct access to serialization when needed

**Returns:**

The serializer instance

**Example:**

```typescript
const serializer = storage.getSerializer();
if (serializer) {
  // Direct access to serializer
}
```

---

#### `isExpired` (Method)

**Type:** `(value: StorageValue<Key, ValueType>) => boolean`

#### Parameters

| Name    | Type                           | Optional | Default | Since | Deprecated | Description                               |
| ------- | ------------------------------ | -------- | ------- | ----- | ---------- | ----------------------------------------- |
| `value` | `StorageValue<Key, ValueType>` | ❌       | -       | -     | -          | The storage value to check for expiration |

---

##### `isExpired` (CallSignature)

**Type:** `boolean`

Checks if a storage value has expired

Significance: Core expiration validation logic
Core idea: Compare expiration timestamp with current time
Main function: Determine if stored data is still valid
Main purpose: Enable automatic cleanup of expired data

**Returns:**

True if the value has expired, false otherwise

**Example:**

```typescript
const isExpired = this.isExpired(storageValue);
if (isExpired) {
  this.removeItem(key);
}
```

#### Parameters

| Name    | Type                           | Optional | Default | Since | Deprecated | Description                               |
| ------- | ------------------------------ | -------- | ------- | ----- | ---------- | ----------------------------------------- |
| `value` | `StorageValue<Key, ValueType>` | ❌       | -       | -     | -          | The storage value to check for expiration |

---

#### `isStorageValue` (Method)

**Type:** `(value: unknown) => callsignature isStorageValue`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description        |
| ------- | --------- | -------- | ------- | ----- | ---------- | ------------------ |
| `value` | `unknown` | ❌       | -       | -     | -          | The value to check |

---

##### `isStorageValue` (CallSignature)

**Type:** `callsignature isStorageValue`

Type guard to check if a value is a valid StorageValue

Significance: Type safety validation for deserialized data
Core idea: Verify object structure matches expected StorageValue format
Main function: Validate deserialized data structure
Main purpose: Ensure type safety and prevent runtime errors

**Returns:**

True if the value is a valid StorageValue, false otherwise

**Example:**

```typescript
if (this.isStorageValue(deserializedValue)) {
  // Safe to access .key, .value, .expire properties
  return deserializedValue.value;
}
```

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description        |
| ------- | --------- | -------- | ------- | ----- | ---------- | ------------------ |
| `value` | `unknown` | ❌       | -       | -     | -          | The value to check |

---

#### `removeItem` (Method)

**Type:** `(key: Key) => void`

#### Parameters

| Name  | Type  | Optional | Default | Since | Deprecated | Description                   |
| ----- | ----- | -------- | ------- | ----- | ---------- | ----------------------------- |
| `key` | `Key` | ❌       | -       | -     | -          | The key of the item to remove |

---

##### `removeItem` (CallSignature)

**Type:** `void`

Removes a stored item by its key from both memory and persistent storage

Significance: Essential cleanup method for storage management
Core idea: Synchronize removal across all storage layers
Main function: Delete data from memory and persistent storage
Main purpose: Maintain data consistency and free up storage space

**Example:**

```typescript
storage.removeItem('expired-session');
```

#### Parameters

| Name  | Type  | Optional | Default | Since | Deprecated | Description                   |
| ----- | ----- | -------- | ------- | ----- | ---------- | ----------------------------- |
| `key` | `Key` | ❌       | -       | -     | -          | The key of the item to remove |

---

#### `setItem` (Method)

**Type:** `(key: Key, value: T, options: ObjectStorageOptions) => unknown`

#### Parameters

| Name      | Type                   | Optional | Default | Since | Deprecated | Description                               |
| --------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------- |
| `key`     | `Key`                  | ❌       | -       | -     | -          | The key under which the value is stored   |
| `value`   | `T`                    | ❌       | -       | -     | -          | The value to store (must be serializable) |
| `options` | `ObjectStorageOptions` | ✅       | -       | -     | -          |                                           |

---

##### `setItem` (CallSignature)

**Type:** `unknown`

Stores a value with optional expiration time

Significance: Primary method for data storage operations
Core idea: Store data with metadata and optional expiration
Main function: Persist data to both memory and persistent storage
Main purpose: Enable reliable data storage with expiration support

**Example:**

```typescript
// Store without expiration
storage.setItem('username', 'john_doe');

// Store with expiration (1 hour)
storage.setItem('session', sessionData, Date.now() + 3600000);
```

#### Parameters

| Name      | Type                   | Optional | Default | Since | Deprecated | Description                               |
| --------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------- |
| `key`     | `Key`                  | ❌       | -       | -     | -          | The key under which the value is stored   |
| `value`   | `T`                    | ❌       | -       | -     | -          | The value to store (must be serializable) |
| `options` | `ObjectStorageOptions` | ✅       | -       | -     | -          |                                           |

---

### `ObjectStorageOptions` (Interface)

**Type:** `interface ObjectStorageOptions`

---

#### `expires` (Property)

**Type:** `unknown`

Expire time

maybe is

- number: milliseconds
- string: time string, like '1d', '1h', '1m', '1s'
- object: {}
- ...

Subclass implementation

---

### `StorageValue` (TypeAlias)

**Type:** `Object`

Storage value wrapper with expiration support

Significance: Provides a standardized structure for stored values with metadata
Core idea: Encapsulate stored data with key, value, and optional expiration time
Main function: Wrap user data with storage metadata
Main purpose: Enable expiration-aware storage operations

**Example:**

```typescript
const storageValue: StorageValue<string, number> = {
  key: 'user-id',
  value: 12345,
  expires: Date.now() + 3600000 // 1 hour from now
};
```

---

#### `expires` (Property)

**Type:** `number`

Optional expiration timestamp in milliseconds

---

#### `key` (Property)

**Type:** `Key`

The storage key

---

#### `value` (Property)

**Type:** `ValueType`

The actual stored value

---
