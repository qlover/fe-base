## `src/core/gateway-service/impl/GatewayService` (Module)

**Type:** `module src/core/gateway-service/impl/GatewayService`

---

### `GatewayService` (Class)

**Type:** `class GatewayService<T, Store, Gateway>`

**Since:** `1.8.0`

Gateway service implementation

Concrete implementation of `GatewayServiceInterface` that provides the foundational infrastructure
for all gateway services. This class handles the initialization and management of core service
components: store, gateway, and logger. It serves as the base class for more specialized service
implementations like `UserService`.

**Core Implementation Principles:**

1. **Unified Initialization**: The constructor accepts `GatewayServiceOptions` which combines
   service infrastructure configuration and store options, providing a single point of configuration.

2. **Flexible Store Creation**: Uses `createAsyncStore` factory function to handle store creation:
   - If a store instance is provided, it uses it directly (allows dependency injection)
   - If store options are provided, it creates a new store instance
   - If nothing is provided, it creates a default store instance
     This flexibility enables both dependency injection and configuration-based initialization.

3. **Protected Access**: All internal properties are `protected readonly`, allowing:
   - Subclasses to access and extend functionality
   - Prevention of external modification after construction
   - Clear encapsulation boundaries

4. **Interface Compliance**: Implements `GatewayServiceInterface` to ensure consistent service
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
- Factory pattern: Uses `createAsyncStore` for flexible store creation
- Readonly properties: Prevents accidental modification after construction

Initialization flow:

1. Constructor receives `GatewayServiceOptions`
2. Service name is assigned (required, readonly)
3. Gateway is assigned (optional, readonly)
4. Logger is assigned (optional, readonly)
5. Store is created via `createAsyncStore` factory:
   - If store instance provided → use directly
   - If store options provided → create new store
   - If nothing provided → create default store

**Example:** Basic usage - extending GatewayService

```typescript
class MyService extends GatewayService<User, UserStore, UserGateway> {
  constructor(options: GatewayServiceOptions<User, UserGateway>) {
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

#### `new GatewayService` (Constructor)

**Type:** `(options: GatewayServiceOptions<T, Gateway>) => GatewayService<T, Store, Gateway>`

#### Parameters

| Name      | Type                                | Optional | Default | Since | Deprecated | Description                           |
| --------- | ----------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------- |
| `options` | `GatewayServiceOptions<T, Gateway>` | ❌       | -       | -     | -          | Configuration options for the service |

---

#### `gateway` (Property)

**Type:** `Gateway`

Gateway instance for API operations

The gateway object that provides methods for executing API calls.
Optional - services can work without gateway (e.g., mock services).
Protected to allow subclasses to access while preventing external modification.

---

#### `logger` (Property)

**Type:** `LoggerInterface<unknown>`

Logger instance for logging execution events

Used for logging execution flow, errors, and debugging information.
Optional - services can work without logger.
Protected to allow subclasses to access while preventing external modification.

---

#### `serviceName` (Property)

**Type:** `GatewayServiceName`

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
Returns `undefined` if no gateway was configured.

**Returns:**

The gateway instance, or `undefined` if not configured

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

**Type:** `() => undefined \| LoggerInterface<unknown>`

---

##### `getLogger` (CallSignature)

**Type:** `undefined \| LoggerInterface<unknown>`

Get the logger instance

Returns the logger instance used by this service for logging.
Returns `undefined` if no logger was configured.

**Returns:**

The logger instance, or `undefined` if not configured

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
const asyncStore = service.getStore();
const port = asyncStore.getStore();
port.subscribe((state) => {
  console.log('State changed:', state);
});
```

---

### `GatewayServiceOptions` (Interface)

**Type:** `interface GatewayServiceOptions<T, Gateway>`

**Since:** `1.8.0`

Gateway service options

Configuration options for creating a gateway service instance.
Combines service infrastructure configuration and async store options to provide complete service configuration.
This interface merges the configuration needed for both service infrastructure (gateway, logger, service name)
and state management (store configuration).

- Significance: Provides unified configuration for gateway services
- Core idea: Combine service infrastructure and store configuration into a single options object
- Main function: Configure service infrastructure and state management
- Main purpose: Simplify service initialization with all necessary options

Core features:

- Service identification: Includes service name for logging and debugging
- Gateway configuration: Optional gateway instance for API operations
- Logger configuration: Optional logger instance for logging
- Store configuration: Store instance or options for state management

Design decisions:

- Builds on `AsyncStoreOptions` but **omits** `store` and redeclares it as <a href="../../store-state/interface/AsyncStoreInterface.md#asyncstoreinterface-interface" class="tsd-kind-interface">AsyncStoreInterface</a>
  (gateway services inject an async facade, not a bare StoreInterface)
- Other async options (`storage`, `defaultState`, …) are unchanged

**Template:** Key

The type of key used for store operations (default: string)

**Example:** Basic usage with store instance

```typescript
const store = new AsyncStore<User>();
const options: GatewayServiceOptions<User, UserGateway> = {
  serviceName: 'UserService',
  gateway: new UserGateway(),
  logger: new Logger(),
  store: store
};
```

**Example:** Basic usage with store options

```typescript
const options: GatewayServiceOptions<User, UserGateway> = {
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

#### `logger` (Property)

**Type:** `LoggerInterface<unknown>`

Logger instance for logging execution events

Used for logging execution flow, errors, and debugging information.
Optional - services can work without logger.

---

#### `serviceName` (Property)

**Type:** `GatewayServiceName`

Service name identifier

Used for logging, debugging, and service identification.
Should be set during construction and remain constant.

---

#### `store` (Property)

**Type:** `AsyncStoreInterface<AsyncStoreStateInterface<T>>`

Async store instance for state management

Narrower than AsyncStoreOptions.store (`StoreInterface`): gateway services
accept a full <a href="../../store-state/interface/AsyncStoreInterface.md#asyncstoreinterface-interface" class="tsd-kind-interface">AsyncStoreInterface</a> implementation (e.g. AsyncStore).

---

### `GatewayServiceName` (TypeAlias)

**Type:** `string \| symbol`

---
