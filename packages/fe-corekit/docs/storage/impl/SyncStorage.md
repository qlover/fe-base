## `src/storage/impl/SyncStorage` (Module)

**Type:** `module src/storage/impl/SyncStorage`

---

### `SyncStorage` (Class)

**Type:** `class SyncStorage<Key, Opt>`

Synchronous storage implementation with pipeline support

Core concept:
Provides a flexible storage abstraction with a pipeline architecture that
allows chaining multiple transformations (serialization, encryption, intermediate
storage) before data reaches the final storage backend.

Main features:

- Pipeline architecture: Chain multiple data transformations
  - Serialization: Convert objects to strings (JSON, Base64, etc.)
  - Encryption: Secure data before storage
  - Intermediate storage: Multi-layer storage support
  - Custom transformations: Extensible pipe system

- Automatic pipe detection: Identifies pipe types by interface
  - Serializer: Has
    `serialize()`
    and
    `deserialize()`
    methods
  - Encryptor: Has
    `encrypt()`
    and
    `decrypt()`
    methods
  - Storage: Has
    `setItem()`
    ,
    `getItem()`
    ,
    `removeItem()`
    ,
    `clear()`
    methods
  - No manual type specification needed

- Bidirectional processing: Handles both storage and retrieval
  - setItem: Forward pipeline (value → serialize → encrypt → store)
  - getItem: Reverse pipeline (retrieve → decrypt → deserialize → value)
  - Maintains data integrity through the pipeline

- Multi-layer storage: Support for intermediate storage layers
  - Primary storage: Final storage backend
  - Intermediate storage: Additional storage layers in pipeline
  - Fallback mechanism: Try intermediate storage if primary fails

Pipeline execution order:

**setItem (forward):**

1. Original value
2. Serialize (if serializer in pipeline)
3. Encrypt (if encryptor in pipeline)
4. Store in intermediate storage (if storage in pipeline)
5. Store in primary storage

**getItem (reverse):**

1. Retrieve from primary storage
2. If not found, try intermediate storage layers (reversed order)
3. Decrypt (if encryptor in pipeline)
4. Deserialize (if serializer in pipeline)
5. Return final value

**Example:** Basic usage with JSON serialization

```typescript
import { SyncStorage, JSONSerializer } from '@qlover/fe-corekit';

const storage = new SyncStorage(localStorage, new JSONSerializer());

// Store object (automatically serialized to JSON)
storage.setItem('user', { id: 1, name: 'John' });

// Retrieve object (automatically deserialized from JSON)
const user = storage.getItem('user');
console.log(user); // { id: 1, name: 'John' }
```

**Example:** With encryption

```typescript
import { SyncStorage, JSONSerializer, AESEncryptor } from '@qlover/fe-corekit';

const storage = new SyncStorage(localStorage, [
  new JSONSerializer(), // First: serialize to JSON
  new AESEncryptor('key') // Then: encrypt JSON string
]);

// Data is serialized then encrypted before storage
storage.setItem('sensitive', { password: 'secret' });

// Data is decrypted then deserialized on retrieval
const data = storage.getItem('sensitive');
```

**Example:** Multi-layer storage

```typescript
import { SyncStorage, JSONSerializer } from '@qlover/fe-corekit';

// Create intermediate storage layer
const memoryCache = new Map();
const cacheStorage = {
  setItem: (k, v) => memoryCache.set(k, v),
  getItem: (k) => memoryCache.get(k) ?? null,
  removeItem: (k) => memoryCache.delete(k),
  clear: () => memoryCache.clear(),
  length: memoryCache.size
};

const storage = new SyncStorage(localStorage, [
  new JSONSerializer(),
  cacheStorage // Intermediate cache layer
]);

// Data stored in both cache and localStorage
storage.setItem('data', { value: 123 });

// Retrieval tries cache first, then localStorage
const data = storage.getItem('data');
```

**Example:** Custom pipe order

```typescript
// Order matters! Pipes are applied in sequence
const storage = new SyncStorage(localStorage, [
  new JSONSerializer(), // 1. Serialize to JSON string
  new Base64Serializer(), // 2. Encode to Base64
  new AESEncryptor('key') // 3. Encrypt the Base64 string
]);

// setItem: value → JSON → Base64 → Encrypt → store
// getItem: retrieve → Decrypt → Base64 decode → JSON parse → value
```

**See:**

- SyncStorageInterface
  for the storage interface

- PipeType
  for pipe type definitions

- SerializerInterface
  for serializer interface

- EncryptorInterface
  for encryptor interface

---

#### `new SyncStorage` (Constructor)

**Type:** `(storage: SyncStorageInterface<Key, Opt>, pipes: PipeArg<Key> \| PipeArg<Key>[]) => SyncStorage<Key, Opt>`

#### Parameters

| Name      | Type                             | Optional | Default | Since | Deprecated | Description                                                  |
| --------- | -------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------ |
| `storage` | `SyncStorageInterface<Key, Opt>` | ❌       | -       | -     | -          | Primary storage backend (e.g., localStorage, sessionStorage) |
| `pipes`   | `PipeArg<Key> \| PipeArg<Key>[]` | ✅       | `[]`    | -     | -          | Optional pipe or array of pipes for data transformation      |

---

#### `pipes` (Property)

**Type:** `PipeValue<Key>[]`

Internal pipe value list with pre-determined types

Stores the processed pipeline of transformations that will be
applied to data during storage and retrieval operations.

---

#### `storage` (Property)

**Type:** `SyncStorageInterface<Key, Opt>`

Primary storage backend (e.g., localStorage, sessionStorage)

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

Clear all data, including storage in the pipeline

---

#### `getItem` (Method)

**Type:** `(key: Key, defaultValue: T, options: Opt) => null \| T`

#### Parameters

| Name           | Type  | Optional | Default | Since | Deprecated | Description                    |
| -------------- | ----- | -------- | ------- | ----- | ---------- | ------------------------------ |
| `key`          | `Key` | ❌       | -       | -     | -          | Storage key                    |
| `defaultValue` | `T`   | ✅       | -       | -     | -          | Default value if key not found |
| `options`      | `Opt` | ✅       | -       | -     | -          | Optional retrieval options     |

---

##### `getItem` (CallSignature)

**Type:** `null \| T`

Retrieve a value with pipeline processing

Retrieves the value from storage and processes it through the pipeline
in reverse order (decryption, deserialization) to restore the original value.

Retrieval strategy:

1. Try to retrieve from primary storage
2. If not found, try intermediate storage layers (in reverse order)
3. Apply decryption (if configured)
4. Apply deserialization (if configured)
5. Return processed value or default

**Returns:**

Retrieved value or default,
`null`
if not found and no default

**Example:** Basic retrieval

```typescript
const user = storage.getItem('user');
if (user) {
  console.log(user.name);
}
```

**Example:** With default value

```typescript
const config = storage.getItem('config', { theme: 'light' });
console.log(config.theme); // 'light' if not found
```

#### Parameters

| Name           | Type  | Optional | Default | Since | Deprecated | Description                    |
| -------------- | ----- | -------- | ------- | ----- | ---------- | ------------------------------ |
| `key`          | `Key` | ❌       | -       | -     | -          | Storage key                    |
| `defaultValue` | `T`   | ✅       | -       | -     | -          | Default value if key not found |
| `options`      | `Opt` | ✅       | -       | -     | -          | Optional retrieval options     |

---

#### `removeItem` (Method)

**Type:** `(key: Key, options: Opt) => void`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description    |
| --------- | ----- | -------- | ------- | ----- | ---------- | -------------- |
| `key`     | `Key` | ❌       | -       | -     | -          | Storage key    |
| `options` | `Opt` | ✅       | -       | -     | -          | Delete options |

---

##### `removeItem` (CallSignature)

**Type:** `void`

Delete data items, delete from all storage layers

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description    |
| --------- | ----- | -------- | ------- | ----- | ---------- | -------------- |
| `key`     | `Key` | ❌       | -       | -     | -          | Storage key    |
| `options` | `Opt` | ✅       | -       | -     | -          | Delete options |

---

#### `setItem` (Method)

**Type:** `(key: Key, value: T, options: Opt) => void`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description                                 |
| --------- | ----- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `key`     | `Key` | ❌       | -       | -     | -          | Storage key                                 |
| `value`   | `T`   | ❌       | -       | -     | -          | Value to store                              |
| `options` | `Opt` | ✅       | -       | -     | -          | Optional storage options (e.g., expiration) |

---

##### `setItem` (CallSignature)

**Type:** `void`

Store a value with pipeline processing

Processes the value through the configured pipeline (serialization,
encryption, intermediate storage) before storing in the primary storage.

Pipeline execution:

1. Apply serialization (if configured)
2. Apply encryption (if configured)
3. Store in intermediate storage layers (if configured)
4. Store in primary storage

**Example:** Basic storage

```typescript
storage.setItem('user', { id: 1, name: 'John' });
```

**Example:** With options

```typescript
storage.setItem('session', { token: 'abc' }, { expire: 3600 });
```

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description                                 |
| --------- | ----- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `key`     | `Key` | ❌       | -       | -     | -          | Storage key                                 |
| `value`   | `T`   | ❌       | -       | -     | -          | Value to store                              |
| `options` | `Opt` | ✅       | -       | -     | -          | Optional storage options (e.g., expiration) |

---

### `PipeArg` (TypeAlias)

**Type:** `PipeType<Key> \| PipeValue<Key>`

Pipe argument type for storage initialization

Accepts either a typed pipe or a pipe value wrapper.

---
