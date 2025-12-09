## `src/core/gateway-auth/impl/GatewayService` (Module)

**Type:** `module src/core/gateway-auth/impl/GatewayService`

---

### `GatewayService` (Class)

**Type:** `class GatewayService<T, Gateway, Store>`

**Since:** `1.8.0`

Gateway service base class

Abstract base class that provides unified infrastructure for executing gateway actions with state
management and plugin support. This class serves as the foundation for all gateway services, handling
the common concerns of gateway execution, state tracking, and plugin integration. It enables consistent
service implementation patterns while allowing subclasses to focus on their specific business logic.

- Significance: Abstract base class for all gateway services
- Core idea: Provide unified infrastructure for executing gateway actions with state management
- Main function: Execute gateway actions through executor with plugin support and state tracking
- Main purpose: Enable consistent service implementation pattern across different gateway services

Core features:

- Gateway execution: Execute gateway methods through executor with plugin hooks
- State management: Manage async state via store (loading, success, error)
- Plugin support: Register plugins for custom execution logic
- Automatic state updates: Integrates with
  `GatewayBasePlugin`
  for automatic state management
- Default gateway method resolution: Automatically resolves gateway methods by action name

Design decisions:

- Abstract class: Must be extended by concrete service implementations
- Generic types: Supports different data types, gateway types, and store types
- Protected execute method: Subclasses use
  `execute`
  to run gateway actions
- Executor pattern: Uses
  `GatewayExecutor`
  for plugin and hook management
- Store creation: Creates store from options if not provided

Execution flow:

1. Service calls
   `execute(action, params)`

2. Executor runs
   `onBefore`
   hooks (including action-specific hooks like
   `onLoginBefore`
   )
3. Gateway method is executed (or custom function if provided)
4. Executor runs
   `onSuccess`
   hooks (including action-specific hooks like
   `onLoginSuccess`
   )
5. Store state is updated (via
   `GatewayBasePlugin`
   )
6. Result is returned

**Example:** Basic service implementation

```typescript
class MyService extends GatewayService<User, UserGateway, UserStore> {
  constructor(
    serviceName: string,
    options?: GatewayServiceOptions<User, UserGateway>
  ) {
    super(serviceName, options);
  }

  async getUser(id: string): Promise<User | null> {
    return this.execute('getUser', { id });
  }
}
```

**Example:** With custom execution function

```typescript
class MyService extends GatewayService<User, UserGateway, UserStore> {
  async getUser(id: string): Promise<User | null> {
    return this.execute('getUser', { id }, async (params, gateway) => {
      // Custom execution logic
      return await gateway?.customGetUser(params);
    });
  }
}
```

**Example:** With plugins

```typescript
const service = new MyService('MyService', { gateway: new UserGateway() });

service.use({
  onBefore: async (context) => {
    console.log('Before action:', context.parameters.actionName);
  },
  onGetUserBefore: async (context) => {
    console.log('Before getUser action');
  }
});
```

---

#### `new GatewayService` (Constructor)

**Type:** `(options: GatewayServiceOptions<T, Gateway, string>) => GatewayService<T, Gateway, Store>`

#### Parameters

| Name      | Type                                        | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `options` | `GatewayServiceOptions<T, Gateway, string>` | ❌       | -       | -     | -          |             |

---

#### `executor` (Property)

**Type:** `GatewayExecutor<T, Gateway>`

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

#### `createDefaultFn` (Method)

**Type:** `(action: parameter action) => ExecuteFn<unknown, unknown, Gateway>`

#### Parameters

| Name     | Type               | Optional | Default | Since | Deprecated | Description                                                       |
| -------- | ------------------ | -------- | ------- | ----- | ---------- | ----------------------------------------------------------------- |
| `action` | `parameter action` | ❌       | -       | -     | -          | The gateway action name (must match a method name on the gateway) |

---

##### `createDefaultFn` (CallSignature)

**Type:** `ExecuteFn<unknown, unknown, Gateway>`

Create default execution function for a gateway action

Creates a function that automatically resolves and calls the gateway method
matching the action name. If the gateway method doesn't exist, returns
`null`
.

This is used as the default execution function when
`execute`
is called without
a custom function parameter.

**Returns:**

Execution function that calls the gateway method, or a function that returns
`null`

**Example:** Automatic gateway method resolution

```typescript
// Gateway has a method named 'login'
class UserGateway {
  async login(params: LoginParams): Promise<Credential> {
    // Implementation
  }
}

// Service automatically resolves 'login' method
await service.execute('login', params);
// Equivalent to: await gateway.login(params);
```

#### Parameters

| Name     | Type               | Optional | Default | Since | Deprecated | Description                                                       |
| -------- | ------------------ | -------- | ------- | ----- | ---------- | ----------------------------------------------------------------- |
| `action` | `parameter action` | ❌       | -       | -     | -          | The gateway action name (must match a method name on the gateway) |

---

#### `createExecOptions` (Method)

**Type:** `(action: parameter action, params: Params) => GatewayExecutorOptions<T, Gateway, Params>`

#### Parameters

| Name     | Type               | Optional | Default | Since | Deprecated | Description                                  |
| -------- | ------------------ | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `action` | `parameter action` | ❌       | -       | -     | -          | The gateway action name                      |
| `params` | `Params`           | ✅       | -       | -     | -          | The parameters to pass to the gateway method |

---

##### `createExecOptions` (CallSignature)

**Type:** `GatewayExecutorOptions<T, Gateway, Params>`

Create executor options for a service action

Creates the options object passed to the executor for executing a gateway action.
This includes action name, service name, store, gateway, logger, and parameters.

The
`actionName`
is read-only to ensure execution stability.

**Returns:**

Executor options object with all necessary context

This method is used internally by
`execute`
and typically doesn't need to be called directly

#### Parameters

| Name     | Type               | Optional | Default | Since | Deprecated | Description                                  |
| -------- | ------------------ | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `action` | `parameter action` | ❌       | -       | -     | -          | The gateway action name                      |
| `params` | `Params`           | ✅       | -       | -     | -          | The parameters to pass to the gateway method |

---

#### `execute` (Method)

**Type:** `(action: Action, fn: Object) => Promise<Result>`

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description             |
| -------- | -------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `action` | `Action` | ❌       | -       | -     | -          | The gateway action name |
| `fn`     | `Object` | ❌       | -       | -     | -          |                         |

---

##### `execute` (CallSignature)

**Type:** `Promise<Result>`

Execute a gateway action

Executes a gateway action through the executor with plugin support and state management.
This is the main method used by subclasses to execute gateway operations.

Supports multiple calling patterns:

1.  `execute(action)`

- Execute action without parameters

2.  `execute(action, params)`

- Execute action with single parameter

3.  `execute(action, ...params)`

- Execute action with multiple parameters

4.  `execute(action, fn)`

- Execute action with custom function that receives gateway

Execution flow:

1. Creates executor options with action context
2. Resolves execution function (custom function or default gateway method)
3. Executes through executor which runs hooks:
   - `onBefore`
     hooks (including action-specific hooks like
     `onLoginBefore`
     )
   - Gateway method execution
   - `onSuccess`
     hooks (including action-specific hooks like
     `onLoginSuccess`
     )
4. Returns the result

If an error occurs, the executor's
`onError`
hooks are called and the error is rethrown.

**Returns:**

Promise resolving to the action result

**Example:** Execute without parameters

```typescript
await this.execute(ServiceAction.LOGOUT);
```

**Example:** Execute with single parameter

```typescript
await this.execute(ServiceAction.LOGIN, { email, password });
```

**Example:** Execute with multiple parameters

```typescript
await this.execute(ServiceAction.LOGIN, params1, params2, params3);
```

**Example:** Execute with custom function

```typescript
await this.execute(ServiceAction.LOGIN, (gateway) => {
  return gateway.login(params1, params2);
});
```

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description             |
| -------- | -------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `action` | `Action` | ❌       | -       | -     | -          | The gateway action name |
| `fn`     | `Object` | ❌       | -       | -     | -          |                         |

---

##### `execute` (CallSignature)

**Type:** `Promise<Result>`

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description |
| -------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `action` | `Action` | ❌       | -       | -     | -          |             |
| `params` | `Params` | ❌       | -       | -     | -          |             |
| `fn`     | `Object` | ❌       | -       | -     | -          |             |

---

##### `execute` (CallSignature)

**Type:** `Promise<Result>`

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description |
| -------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `action` | `Action` | ❌       | -       | -     | -          |             |

---

##### `execute` (CallSignature)

**Type:** `Promise<Result>`

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description |
| -------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `action` | `Action` | ❌       | -       | -     | -          |             |
| `params` | `Params` | ❌       | -       | -     | -          |             |

---

##### `execute` (CallSignature)

**Type:** `Promise<Result>`

#### Parameters

| Name     | Type        | Optional | Default | Since | Deprecated | Description |
| -------- | ----------- | -------- | ------- | ----- | ---------- | ----------- |
| `action` | `Action`    | ❌       | -       | -     | -          |             |
| `params` | `unknown[]` | ❌       | -       | -     | -          |             |

---

#### `getExecutor` (Method)

**Type:** `() => undefined \| GatewayExecutor<T, Gateway>`

---

##### `getExecutor` (CallSignature)

**Type:** `undefined \| GatewayExecutor<T, Gateway>`

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

#### `use` (Method)

**Type:** `(plugin: Plugin \| Plugin[]) => this`

#### Parameters

| Name                                          | Type                 | Optional | Default | Since | Deprecated | Description                                |
| --------------------------------------------- | -------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `plugin`                                      | `Plugin \| Plugin[]` | ❌       | -       | -     | -          | The plugin(s) to register with the service |
| Can be a single plugin or an array of plugins |

---

##### `use` (CallSignature)

**Type:** `this`

Register a plugin with the service

Registers one or more plugins to extend service functionality.
Plugins can hook into execution lifecycle (before, success, error) and
action-specific hooks (e.g.,
`onLoginBefore`
,
`onLogoutSuccess`
).

Plugins are executed in registration order for each hook type.

**Returns:**

The GatewayService instance for method chaining

**Example:** Register single plugin

```typescript
service.use({
  pluginName: 'MyPlugin',
  onBefore: async (context) => {
    console.log('Before action');
  }
});
```

**Example:** Register multiple plugins

```typescript
service.use([
  {
    pluginName: 'Plugin1',
    onBefore: async (context) => {
      /* ... */
    }
  },
  {
    pluginName: 'Plugin2',
    onSuccess: async (context) => {
      /* ... */
    }
  }
]);
```

**Example:** Action-specific hooks

```typescript
service.use({
  onLoginBefore: async (context) => {
    console.log('Before login');
  },
  onLogoutSuccess: async (context) => {
    console.log('After logout');
  }
});
```

#### Parameters

| Name                                          | Type                 | Optional | Default | Since | Deprecated | Description                                |
| --------------------------------------------- | -------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `plugin`                                      | `Plugin \| Plugin[]` | ❌       | -       | -     | -          | The plugin(s) to register with the service |
| Can be a single plugin or an array of plugins |

---

### `GatewayServiceOptions` (Interface)

**Type:** `interface GatewayServiceOptions<T, Gateway, Key>`

Gateway service options

Configuration options for creating a gateway service instance.
Combines executor options and store options to provide complete service configuration.

- Significance: Provides unified configuration for gateway services
- Core idea: Combine executor and store configuration into a single options object
- Main function: Configure service behavior, store, gateway, and plugins
- Main purpose: Simplify service initialization with all necessary options

**Example:** Basic usage

```typescript
const options: GatewayServiceOptions<User, UserGateway> = {
  gateway: new UserGateway(),
  logger: new Logger(),
  storage: new LocalStorage()
};

const service = new UserService('UserService', options);
```

---

#### `executor` (Property)

**Type:** `GatewayExecutor<T, Gateway>`

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
