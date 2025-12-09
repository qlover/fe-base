## `src/storage/interface/KeyStorageInterface` (Module)

**Type:** `module src/storage/interface/KeyStorageInterface`

---

### `KeyStorageInterface` (Interface)

**Type:** `interface KeyStorageInterface<Key, Value, Opt>`

Key-value storage interface for managing a single value with persistence support

Core concept:
Provides a unified interface for storing and retrieving a single value associated
with a specific key. Supports both in-memory and persistent storage backends,
enabling flexible storage strategies for different use cases.

**v2.3.0 before this was an abstract class, now it is an interface**

Main features:

- Single value storage: Store one value per key instance
- Key management: Retrieve the storage key associated with this instance
- Value retrieval: Get stored value from memory or persistent storage
- Value persistence: Save value to underlying storage backend
- Value removal: Clear value from both memory and persistent storage
- Options support: Flexible options parameter for storage-specific configurations

Typical usage scenarios:

- Token storage: Store authentication tokens with persistence
- User info storage: Persist user information across sessions
- Configuration storage: Store application settings (theme, language, etc.)
- Session data: Manage temporary session-specific data

Design decisions:

- Returns
  `null`
  when value is not found (explicit null handling)
- Options parameter is optional to support simple use cases
- Generic types allow type-safe storage of any value type
- Supports both synchronous and asynchronous storage backends through options

**Example:** Basic usage with localStorage

```typescript
const tokenStorage: KeyStorageInterface<string, string> = new KeyStorage(
  'token',
  {
    storage: localStorage
  }
);

// Store token
tokenStorage.set('abc123token');

// Retrieve token
const token = tokenStorage.get(); // Returns 'abc123token'

// Get storage key
const key = tokenStorage.getKey(); // Returns 'token'

// Remove token
tokenStorage.remove();
```

**Example:** User information storage

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

const userStorage: KeyStorageInterface<string, User> = new KeyStorage('user', {
  storage: localStorage
});

const user: User = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com'
};

userStorage.set(user);
const storedUser = userStorage.get(); // Returns User object
```

**Example:** With custom options

```typescript
interface StorageOptions {
  encrypt?: boolean;
  expires?: number;
}

const secureStorage: KeyStorageInterface<string, string, StorageOptions> =
  new KeyStorage('secret', {
    storage: localStorage,
    encrypt: true
  });

secureStorage.set('sensitive-data', { encrypt: true, expires: 3600 });
```

---

#### `get` (Method)

**Type:** `(options: Opt) => null \| Value`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description                              |
| --------- | ----- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `options` | `Opt` | ✅       | -       | -     | -          | Optional storage operation configuration |

---

##### `get` (CallSignature)

**Type:** `null \| Value`

Retrieve value from storage with optional configuration

Retrieval strategy:

1. First checks in-memory value (fast path)
2. If memory value is null and persistent storage is available,
   loads from persistent storage and updates memory cache
3. Returns null if value doesn't exist in either location

The
`options`
parameter allows passing storage-specific configuration
that may override default behavior (e.g., encryption settings, expiration checks).

**Returns:**

The stored value, or
`null`
if not found

**Example:** Basic retrieval

```typescript
const storage = new KeyStorage('token', { storage: localStorage });
storage.set('abc123');
const token = storage.get(); // Returns 'abc123'
```

**Example:** With options

```typescript
interface Options {
  decrypt?: boolean;
}

const storage = new KeyStorage<string, string, Options>('secret', {
  storage: localStorage
});

// Retrieve with decryption
const value = storage.get({ decrypt: true });
```

**Example:** Handling null values

```typescript
const storage = new KeyStorage('data', { storage: localStorage });
const value = storage.get();

if (value === null) {
  console.log('No value stored');
} else {
  console.log('Value:', value);
}
```

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description                              |
| --------- | ----- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `options` | `Opt` | ✅       | -       | -     | -          | Optional storage operation configuration |

---

#### `getKey` (Method)

**Type:** `() => Key`

---

##### `getKey` (CallSignature)

**Type:** `Key`

Get the storage key associated with this instance

Returns the key that was used to initialize this storage instance.
This key is used to identify the storage location in the underlying
storage backend.

**Returns:**

The storage key of type
`Key`

**Example:**

```typescript
const storage = new KeyStorage('my-key', { storage: localStorage });
const key = storage.getKey(); // Returns 'my-key'
```

---

#### `getValue` (Method)

**Type:** `() => null \| Value`

---

##### `getValue` (CallSignature)

**Type:** `null \| Value`

Get the current in-memory value without accessing persistent storage

Returns the value currently stored in memory. This method does not
attempt to load from persistent storage. Use
`get()`
if you want
to retrieve from persistent storage when memory value is null.

Returns
`null`
if:

- No value has been set yet
- Value was removed via
  `remove()`

- Value was never loaded from storage

**Returns:**

The current in-memory value, or
`null`
if not available

**Example:**

```typescript
const storage = new KeyStorage('token', { storage: localStorage });

// Initially null (not loaded from storage yet)
const memValue = storage.getValue(); // Returns null

// After setting
storage.set('abc123');
const memValue2 = storage.getValue(); // Returns 'abc123'

// After removal
storage.remove();
const memValue3 = storage.getValue(); // Returns null
```

---

#### `remove` (Method)

**Type:** `(options: Opt) => void`

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description                              |
| --------- | ----- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `options` | `Opt` | ✅       | -       | -     | -          | Optional storage operation configuration |

---

##### `remove` (CallSignature)

**Type:** `void`

Remove the stored value from both memory and persistent storage

Removal behavior:

- Clears in-memory value (sets to
  `null`
  )
- Removes value from persistent storage backend if available
- Applies any options-specific removal behavior

After calling
`remove()`
, subsequent calls to
`get()`
will return
`null`

until a new value is set via
`set()`
.

**Example:** Basic removal

```typescript
const storage = new KeyStorage('token', { storage: localStorage });
storage.set('abc123');
storage.remove(); // Removes from both memory and localStorage
const token = storage.get(); // Returns null
```

**Example:** With options

```typescript
interface Options {
  softDelete?: boolean;
}

const storage = new KeyStorage<string, string, Options>('data', {
  storage: localStorage
});

// Remove with soft delete option
storage.remove({ softDelete: true });
```

**Example:** Clearing user session

```typescript
const userStorage = new KeyStorage('user', { storage: localStorage });

// User logs out
userStorage.remove();
```

#### Parameters

| Name      | Type  | Optional | Default | Since | Deprecated | Description                              |
| --------- | ----- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `options` | `Opt` | ✅       | -       | -     | -          | Optional storage operation configuration |

---

#### `set` (Method)

**Type:** `(value: Value, options: Opt) => void`

#### Parameters

| Name      | Type    | Optional | Default | Since | Deprecated | Description                                           |
| --------- | ------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------- |
| `value`   | `Value` | ❌       | -       | -     | -          | The value to store (can be any type matching `Value`) |
| `options` | `Opt`   | ✅       | -       | -     | -          | Optional storage operation configuration              |

---

##### `set` (CallSignature)

**Type:** `void`

Store a value with optional configuration

Storage behavior:

- Updates in-memory value immediately
- Persists to underlying storage backend if available
- Merges provided options with default options
- Overwrites any existing value for this key

The
`options`
parameter can be used to pass storage-specific settings
such as encryption, expiration, or other backend-specific configurations.

**Example:** Basic storage

```typescript
const storage = new KeyStorage('token', { storage: localStorage });
storage.set('abc123token');
```

**Example:** Storing complex objects

```typescript
interface User {
  id: string;
  name: string;
}

const storage = new KeyStorage<string, User>('user', {
  storage: localStorage
});

storage.set({
  id: '123',
  name: 'John Doe'
});
```

**Example:** With encryption options

```typescript
interface Options {
  encrypt?: boolean;
  expires?: number;
}

const storage = new KeyStorage<string, string, Options>('secret', {
  storage: localStorage
});

storage.set('sensitive-data', {
  encrypt: true,
  expires: Date.now() + 3600000 // 1 hour
});
```

#### Parameters

| Name      | Type    | Optional | Default | Since | Deprecated | Description                                           |
| --------- | ------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------- |
| `value`   | `Value` | ❌       | -       | -     | -          | The value to store (can be any type matching `Value`) |
| `options` | `Opt`   | ✅       | -       | -     | -          | Optional storage operation configuration              |

---
