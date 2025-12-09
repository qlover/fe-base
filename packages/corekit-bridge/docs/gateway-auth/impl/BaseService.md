## `src/core/gateway-auth/impl/BaseService` (Module)

**Type:** `module src/core/gateway-auth/impl/BaseService`

---

### `BaseService` (Class)

**Type:** `class BaseService<T, Store, Gateway>`

**Since:** `1.8.0`

Base service implementation

Concrete implementation of
`BaseServiceInterface`
that provides the foundational infrastructure
for all gateway services. This class handles the initialization and management of core service
components: store, gateway, and logger. It serves as the base class for more specialized service
implementations like
`GatewayService`
.

**Core Implementation Principles:**

1. **Unified Initialization**: The constructor accepts
   `BaseServiceOptions`
   which combines
   executor service options and store options, providing a single point of configuration.

2. **Flexible Store Creation**: Uses
   `createAsyncStore`
   factory function to handle store creation:
   - If a store instance is provided, it uses it directly (allows dependency injection)
   - If store options are provided, it creates a new store instance
   - If nothing is provided, it creates a default store instance
     This flexibility enables both dependency injection and configuration-based initialization.

3. **Protected Access**: All internal properties are
   `protected readonly`
   , allowing:
   - Subclasses to access and extend functionality
   - Prevention of external modification after construction
   - Clear encapsulation boundaries

4. **Interface Compliance**: Implements
   `BaseServiceInterface`
   to ensure consistent service
   structure across all service implementations.

- Significance: Foundation implementation for all gateway services
- Core idea: Provide unified infrastructure initialization and management
- Main function: Initialize and manage store, gateway, and logger instances
- Main purpose: Enable consistent service structure with flexible configuration

Core features:

- Service initialization: Unified constructor for all service infrastructure
- Store management: Flexible store creation (instance or configuration)
- Gateway access: Optional gateway instance for API operations
- Logger access: Optional logger instance for logging
- Property accessors: Public methods to access protected properties

Design decisions:

- Concrete class: Provides default implementation that can be extended
- Generic types: Supports different data types, store types, and gateway types
- Protected properties: Allows subclasses to access while preventing external modification
- Factory pattern: Uses
  `createAsyncStore`
  for flexible store creation
- Readonly properties: Prevents accidental modification after construction

Initialization flow:

1. Constructor receives
   `BaseServiceOptions`

2. Service name is assigned (required, readonly)
3. Gateway is assigned (optional, readonly)
4. Logger is assigned (optional, readonly)
5. Store is created via
   `createAsyncStore`
   factory:
   - If store instance provided → use directly
   - If store options provided → create new store
   - If nothing provided → create default store

**Example:** Basic usage - extending BaseService

```typescript
class MyService extends BaseService<User, UserStore, UserGateway> {
  constructor(options: BaseServiceOptions<User, UserGateway>) {
    super(options);
  }

  // Add custom service methods
  async getUser(id: string): Promise<User | null> {
    const store = this.getStore();
    const gateway = this.getGateway();
    // Use store and gateway for business logic
  }
}
```

**Example:** With store instance (dependency injection)

```typescript
const store = new UserStore();
const service = new MyService({
  serviceName: 'MyService',
  gateway: new UserGateway(),
  logger: new Logger(),
  store: store // Use existing store instance
});
```

**Example:** With store options (configuration-based)

```typescript
const service = new MyService({
  serviceName: 'MyService',
  gateway: new UserGateway(),
  logger: new Logger(),
  storage: {
    key: 'user_data',
    storage: localStorage,
    expires: 'day'
  }
  // Store will be created from options
});
```

**Example:** Accessing service infrastructure

```typescript
const service = new MyService(options);

// Access store
const store = service.getStore();
const state = store.getState();

// Access gateway
const gateway = service.getGateway();
if (gateway) {
  await gateway.someMethod();
}

// Access logger
const logger = service.getLogger();
if (logger) {
  logger.info('Service initialized');
}
```

---

#### `new BaseService` (Constructor)

**Type:** `(options: BaseServiceOptions<T, Gateway, string>) => BaseService<T, Store, Gateway>`

#### Parameters

| Name      | Type                                     | Optional | Default | Since | Deprecated | Description                           |
| --------- | ---------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------- |
| `options` | `BaseServiceOptions<T, Gateway, string>` | ❌       | -       | -     | -          | Configuration options for the service |

---

#### `gateway` (Property)

**Type:** `Gateway`

Gateway instance for API operations

The gateway object that provides methods for executing API calls.
Optional - services can work without gateway (e.g., mock services).
Protected to allow subclasses to access while preventing external modification.

---

#### `logger` (Property)

**Type:** `LoggerInterface`

Logger instance for logging execution events

Used for logging execution flow, errors, and debugging information.
Optional - services can work without logger.
Protected to allow subclasses to access while preventing external modification.

---

#### `serviceName` (Property)

**Type:** `string \| symbol`

Service name identifier

Used for logging, debugging, and service identification.
Set during construction and remains constant throughout the service lifecycle.

---

#### `store` (Property)

**Type:** `Store`

Store instance for state management

The async store that manages service state (loading, success, error).
Always initialized - created from provided instance or options, or defaults to new store.
Protected to allow subclasses to access while preventing external modification.

---

#### `getGateway` (Method)

**Type:** `() => undefined \| Gateway`

---

##### `getGateway` (CallSignature)

**Type:** `undefined \| Gateway`

Get the gateway instance

Returns the gateway instance used by this service for API operations.
Returns
`undefined`
if no gateway was configured.

**Returns:**

The gateway instance, or
`undefined`
if not configured

**Example:** Access gateway methods

```typescript
const gateway = service.getGateway();
if (gateway) {
  await gateway.login(params);
}
```

**Example:** Check if gateway is available

```typescript
const gateway = service.getGateway();
if (!gateway) {
  console.warn('Gateway not configured');
}
```

---

#### `getLogger` (Method)

**Type:** `() => undefined \| LoggerInterface`

---

##### `getLogger` (CallSignature)

**Type:** `undefined \| LoggerInterface`

Get the logger instance

Returns the logger instance used by this service for logging.
Returns
`undefined`
if no logger was configured.

**Returns:**

The logger instance, or
`undefined`
if not configured

**Example:** Use logger for logging

```typescript
const logger = service.getLogger();
if (logger) {
  logger.info('Service operation started');
  logger.error('Service operation failed', error);
}
```

---

#### `getStore` (Method)

**Type:** `() => Store`

---

##### `getStore` (CallSignature)

**Type:** `Store`

Get the async store instance

Returns the store instance used by this service for state management.
The store provides reactive state access and subscription capabilities.

**Returns:**

The store instance for state management

**Example:** Access store state

```typescript
const store = service.getStore();
const state = store.getState();
console.log('Current state:', state);
```

**Example:** Subscribe to state changes

```typescript
const store = service.getStore();
store.observe((state) => {
  console.log('State changed:', state);
});
```

---

### `BaseServiceOptions` (Interface)

**Type:** `interface BaseServiceOptions<T, Gateway, Key>`

**Since:** `1.8.0`

Base service options

Configuration options for creating a base service instance.
Combines executor service options and async store options to provide complete service configuration.
This interface merges the configuration needed for both service infrastructure (gateway, logger, service name)
and state management (store configuration).

- Significance: Provides unified configuration for base services
- Core idea: Combine executor and store configuration into a single options object
- Main function: Configure service infrastructure and state management
- Main purpose: Simplify service initialization with all necessary options

Core features:

- Service identification: Includes service name for logging and debugging
- Gateway configuration: Optional gateway instance for API operations
- Logger configuration: Optional logger instance for logging
- Store configuration: Store instance or options for state management

Design decisions:

- Extends ExecutorServiceOptions: Inherits service infrastructure configuration
- Extends AsyncStoreOptions: Inherits store configuration options
- Flexible store configuration: Can accept store instance or store options

**Example:** Basic usage with store instance

```typescript
const store = new AsyncStore<User>();
const options: BaseServiceOptions<User, UserGateway> = {
  serviceName: 'UserService',
  gateway: new UserGateway(),
  logger: new Logger(),
  store: store
};
```

**Example:** Basic usage with store options

```typescript
const options: BaseServiceOptions<User, UserGateway> = {
  serviceName: 'UserService',
  gateway: new UserGateway(),
  logger: new Logger(),
  storage: {
    key: 'user_data',
    storage: localStorage,
    expires: 'day'
  }
};
```

---

#### `gateway` (Property)

**Type:** `Gateway`

Gateway instance for API operations

The gateway object that provides methods for executing API calls.
Optional - services can work without gateway (e.g., mock services).

---

#### `initRestore` (Property)

**Type:** `boolean`

Whether to automatically restore state from storage during construction

**⚠️ This is primarily a testing/internal property.**

**Initialization Order Issues:**
When
`initRestore`
is
`true`
,
`restore()`
is called during
`super()`
execution,
which happens BEFORE subclass field initialization. This means:

- Subclass fields (e.g.,
  `private readonly storageKey = 'my-key'`
  ) are NOT yet initialized
- `restore()`
  cannot access these fields, causing runtime errors or incorrect behavior
- This is a fundamental limitation of JavaScript/TypeScript class initialization order

---

#### `logger` (Property)

**Type:** `LoggerInterface`

Logger instance for logging execution events

Used for logging execution flow, errors, and debugging information.
Optional - services can work without logger.

---

#### `serviceName` (Property)

**Type:** `string \| symbol`

Service name identifier

Used for logging, debugging, and service identification.
Should be set during construction and remain constant.

---

#### `storage` (Property)

**Type:** `null \| SyncStorageInterface<Key, unknown>`

Storage implementation for persisting state

If provided, state changes will be automatically persisted to this storage.
If
`null`
or
`undefined`
, the store will work without persistence.

---

#### `storageKey` (Property)

**Type:** `null \| Key`

Storage key for persisting state

The key used to store state in the storage backend.
Required if
`storage`
is provided.

---

#### `store` (Property)

**Type:** `AsyncStoreInterface<AsyncStoreStateInterface<T>>`

Store instance for state management

The async store that manages service state (loading, success, error).
Optional - services can work without store (though uncommon).

---

#### `defaultState` (Method)

**Type:** `(storage: null \| SyncStorageInterface<Key, unknown>, storageKey: null \| Key) => null \| AsyncStoreStateInterface<T>`

#### Parameters

| Name         | Type                                         | Optional | Default | Since | Deprecated | Description                                     |
| ------------ | -------------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `storage`    | `null \| SyncStorageInterface<Key, unknown>` | ✅       | -       | -     | -          | Storage implementation (if provided in options) |
| `storageKey` | `null \| Key`                                | ✅       | -       | -     | -          | Storage key (if provided in options)            |

---

##### `defaultState` (CallSignature)

**Type:** `null \| AsyncStoreStateInterface<T>`

Create a new state instance

Factory function that creates the initial state for the store.
This function is called during store initialization and when state is reset.

Behavior:

- If
  `storage`
  is provided, the function receives storage and storageKey as parameters
- If
  `storage`
  is not provided, the function receives
  `undefined`
  for both parameters
- If the function returns
  `null`
  , a new
  `AsyncStoreState`
  instance will be created
- If the function returns a state object, that object will be used as the initial state

**Returns:**

The initial state instance, or
`null`
to use default state

**Example:** With storage restoration

```typescript
const store = new AsyncStore<User, string>({
  storage: localStorage,
  storageKey: 'user-state',
  defaultState: (storage, storageKey) => {
    const stored = storage?.getItem(storageKey);
    if (stored) {
      return new AsyncStoreState<User>(stored);
    }
    return null; // Use default state
  }
});
```

**Example:** Without storage

```typescript
const store = new AsyncStore<User, string>({
  storage: null,
  defaultState: () => null // Always use default state
});
```

#### Parameters

| Name         | Type                                         | Optional | Default | Since | Deprecated | Description                                     |
| ------------ | -------------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `storage`    | `null \| SyncStorageInterface<Key, unknown>` | ✅       | -       | -     | -          | Storage implementation (if provided in options) |
| `storageKey` | `null \| Key`                                | ✅       | -       | -     | -          | Storage key (if provided in options)            |

---
