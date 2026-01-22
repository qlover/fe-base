## `Storage` (Module)

**Type:** `module Storage`

Client-side storage abstractions with expiration and serialization support

This module provides unified abstractions for browser storage APIs (localStorage,
sessionStorage) with additional features like expiration management, automatic
serialization, and type-safe operations. It simplifies working with browser storage
while adding powerful capabilities for data persistence.

Core functionality:

- Unified storage API: Consistent interface for different storage backends
  - localStorage integration for persistent storage
  - sessionStorage integration for session-scoped storage
  - Memory storage for testing and temporary data
  - Custom storage backend support

- Expiration management: Time-based data invalidation
  - Configurable expiration times (seconds)
  - Automatic cleanup of expired data
  - Per-item expiration configuration
  - Expiration time checking

- Serialization integration: Automatic data transformation
  - JSON serialization for complex objects
  - Base64 encoding for binary data
  - Custom serializer support
  - Type-safe deserialization

- Type safety: TypeScript-first design
  - Generic type parameters for stored data
  - Type inference from serializers
  - Compile-time type checking
  - Runtime type validation

### Exported Members

**Implementations:**

- `SyncStorage`
  : Synchronous storage with serialization and expiration
- `KeyStorage`
  : Key-value storage with expiration support
- `ObjectStorage`
  : Object-based storage for complex data structures

**Interfaces:**

- `SyncStorageInterface`
  : Synchronous storage interface
- `AsyncStorageInterface`
  : Asynchronous storage interface
- `KeyStorageInterface`
  : Key-value storage interface
- `ExpireOptions`
  : Expiration configuration options

### Basic Usage

```typescript
import { SyncStorage, JSONSerializer } from '@qlover/fe-corekit';

// Create storage with JSON serialization
const storage = new SyncStorage(localStorage, new JSONSerializer());

// Store data
storage.set('user', { id: 1, name: 'John' });

// Retrieve data
const user = storage.get('user');
console.log(user); // { id: 1, name: 'John' }

// Remove data
storage.remove('user');

// Clear all data
storage.clear();
```

### Expiration Support

```typescript
import { SyncStorage, JSONSerializer } from '@qlover/fe-corekit';

const storage = new SyncStorage(localStorage, new JSONSerializer());

// Store with expiration (3600 seconds = 1 hour)
storage.set('session', { token: 'abc123' }, { expire: 3600 });

// Data expires after 1 hour
setTimeout(() => {
  const session = storage.get('session');
  console.log(session); // null (expired)
}, 3600 * 1000);

// Check if data has expired
const hasExpired = storage.hasExpired('session');
```

### Type-Safe Storage

```typescript
import { SyncStorage, JSONSerializer } from '@qlover/fe-corekit';

interface User {
  id: number;
  name: string;
  email: string;
}

const storage = new SyncStorage<User>(localStorage, new JSONSerializer());

// Type-safe set
storage.set('user', {
  id: 1,
  name: 'John',
  email: 'john@example.com'
});

// Type-safe get
const user: User | null = storage.get('user');
```

### Key Storage

```typescript
import { KeyStorage } from '@qlover/fe-corekit';

const storage = new KeyStorage(localStorage);

// Store primitive values
storage.set('count', '42', { expire: 3600 });
storage.set('name', 'John');

// Retrieve values
const count = storage.get('count'); // '42'
const name = storage.get('name'); // 'John'

// Check existence
const exists = storage.has('count'); // true

// Get all keys
const keys = storage.keys(); // ['count', 'name']
```

### Object Storage

```typescript
import { ObjectStorage, JSONSerializer } from '@qlover/fe-corekit';

const storage = new ObjectStorage(localStorage, new JSONSerializer());

// Store complex objects
storage.set('config', {
  theme: 'dark',
  language: 'en',
  notifications: {
    email: true,
    push: false
  }
});

// Retrieve and modify
const config = storage.get('config');
config.theme = 'light';
storage.set('config', config);
```

### Custom Serializer

```typescript
import { SyncStorage, SerializerInterface } from '@qlover/fe-corekit';

class CustomSerializer implements SerializerInterface<MyType> {
  serialize(data: MyType): string {
    return customEncode(data);
  }

  deserialize(data: string): MyType {
    return customDecode(data);
  }
}

const storage = new SyncStorage(localStorage, new CustomSerializer());
```

### Session Storage

```typescript
import { SyncStorage, JSONSerializer } from '@qlover/fe-corekit';

// Use sessionStorage instead of localStorage
const sessionStore = new SyncStorage(sessionStorage, new JSONSerializer());

// Data persists only for the session
sessionStore.set('tempData', { value: 123 });
```

### Storage with Namespacing

```typescript
import { SyncStorage, JSONSerializer } from '@qlover/fe-corekit';

class NamespacedStorage<T> extends SyncStorage<T> {
  constructor(
    backend: Storage,
    serializer: SerializerInterface<T>,
    private namespace: string
  ) {
    super(backend, serializer);
  }

  private getKey(key: string): string {
    return `${this.namespace}:${key}`;
  }

  set(key: string, value: T, options?: ExpireOptions): void {
    super.set(this.getKey(key), value, options);
  }

  get(key: string): T | null {
    return super.get(this.getKey(key));
  }
}

const userStorage = new NamespacedStorage(
  localStorage,
  new JSONSerializer(),
  'user'
);
```

**See:**

- SyncStorage
  for the main storage implementation

- KeyStorage
  for key-value storage

- ObjectStorage
  for object-based storage

---
