## `src/core/gateway-auth/interface/base/ExecutorServiceInterface` (Module)

**Type:** `unknown`

---

### `ExecutorServiceInterface` (Interface)

**Type:** `unknown`

**Since:** `1.8.0`

Executor service interface

Defines the contract for services that execute gateway actions with plugin support and state management.
This interface extends
`BaseServiceInterface`
to add execution capabilities, allowing services to execute
gateway methods through a plugin-based executor system. It provides a unified way to handle gateway action
execution with hooks, error handling, and state management.

- Significance: Defines standard contract for executor-based gateway services
- Core idea: Provide plugin-based execution system for gateway actions
- Main function: Execute gateway actions with plugin hooks and state management
- Main purpose: Enable consistent execution pattern across different gateway services

Core features:

- Plugin registration: Register plugins to extend execution behavior
- Gateway execution: Execute gateway methods with multiple calling patterns
- Execution options: Create executor options for gateway actions
- Plugin hooks: Support for lifecycle hooks (before, success, error) and action-specific hooks
- State management: Integrate with async store for state tracking

Design decisions:

- Extends BaseServiceInterface: Inherits store, gateway, and logger access
- Plugin pattern: Uses executor plugins for extensible execution logic
- Multiple execute overloads: Supports different calling patterns for flexibility
- Internal createExecOptions: Encapsulates executor option creation

Execution flow:

1. Service calls
   `execute(action, params)`

2. `createExecOptions`
   creates executor options with action context
3. Executor runs
   `onBefore`
   hooks (including action-specific hooks)
4. Gateway method is executed (or custom function if provided)
5. Executor runs
   `onSuccess`
   hooks (including action-specific hooks)
6. Result is returned

**Example:** Basic service implementation

```typescript
class MyService implements ExecutorServiceInterface<MyStore, MyGateway> {
  use<Plugin extends ExecutorPlugin<ExecutorServiceOptions<any, MyGateway>>>(
    plugin: Plugin
  ): void {
    // Register plugin
  }

  async execute(action: keyof MyGateway, params?: unknown): Promise<unknown> {
    // Execute gateway action
  }
}
```

**Example:** Register plugin

```typescript
service.use({
  onBefore: (context) => {
    console.log('Before execution:', context.parameters.actionName);
  },
  onLoginBefore: (context) => {
    console.log('Before login action');
  }
});
```

**Example:** Execute gateway action

```typescript
// Execute without parameters
await service.execute('logout');

// Execute with single parameter
await service.execute('login', { username: 'user', password: 'pass' });

// Execute with multiple parameters
await service.execute('update', { id: 1 }, { name: 'John' });

// Execute with custom function
await service.execute('custom', async (gateway) => {
  return await gateway?.customMethod();
});
```

---

#### `serviceName` (Property)

**Type:** `string \| symbol`

Service name identifier

Used for logging, debugging, and service identification.
Should be set during construction and remain constant.

---

#### `createExecOptions` (Method)

**Type:** `(action: Action) => ExecutorServiceOptions<any, Gateway>`

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                        |
| -------- | -------- | -------- | ------- | ----- | ---------- | ---------------------------------- |
| `action` | `Action` | ❌       | -       | -     | -          | The gateway action name to execute |

---

##### `createExecOptions` (CallSignature)

**Type:** `ExecutorServiceOptions<any, Gateway>`

Create executor options for a service action

Creates the options object passed to the executor for executing a gateway action.
This method assembles all necessary context for execution, including action name,
service name, store, gateway, and logger instances.

The returned options object is used by the executor to:

- Identify which action is being executed
- Access service infrastructure (store, gateway, logger)
- Pass context to plugins via hooks

The
`actionName`
in the returned options is read-only to ensure execution stability.

**Returns:**

Executor options object with all necessary context for execution

This method is used internally by
`execute`
and typically doesn't need to be called directly

**Example:** Internal usage

```typescript
// This is called internally by execute method
const options = this.createExecOptions('login');
// options contains: { serviceName, gateway, logger, store, actionName: 'login' }
```

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                        |
| -------- | -------- | -------- | ------- | ----- | ---------- | ---------------------------------- |
| `action` | `Action` | ❌       | -       | -     | -          | The gateway action name to execute |

---

#### `execute` (Method)

**Type:** `(action: Action, fn: Object) => Promise<Result>`

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description |
| -------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `action` | `Action` | ❌       | -       | -     | -          |             |
| `fn`     | `Object` | ❌       | -       | -     | -          |             |

---

##### `execute` (CallSignature)

**Type:** `Promise<Result>`

Execute a gateway action

Executes a gateway method through the executor system with plugin support.
This method supports multiple calling patterns to accommodate different use cases.

Execution flow:

1. Creates executor options via
   `createExecOptions`

2. Executor runs
   `onBefore`
   hooks (including action-specific hooks)
3. Gateway method is executed (or custom function if provided)
4. Executor runs
   `onSuccess`
   hooks (including action-specific hooks)
5. Returns the result

If an error occurs during execution:

- Executor runs
  `onError`
  hooks
- Error is re-thrown unless handled by plugins

Supported calling patterns:

1.  `execute(action)`

- Execute action without parameters

2.  `execute(action, params)`

- Execute action with single parameter

3.  `execute(action, ...params)`

- Execute action with multiple parameters

4.  `execute(action, fn)`

- Execute action with custom function that receives gateway

**Example:** Execute without parameters

```typescript
const result = await service.execute('logout');
```

**Example:** Execute with single parameter

```typescript
const user = await service.execute('getUser', { id: '123' });
```

**Example:** Execute with multiple parameters

```typescript
const result = await service.execute('update', { id: 1 }, { name: 'John' });
```

**Example:** Execute with custom function

```typescript
const result = await service.execute('custom', async (gateway) => {
  if (!gateway) {
    throw new Error('Gateway not available');
  }
  return await gateway.customMethod();
});
```

**Example:** With error handling

```typescript
try {
  const result = await service.execute('login', credentials);
  console.log('Login successful:', result);
} catch (error) {
  console.error('Login failed:', error);
}
```

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description |
| -------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `action` | `Action` | ❌       | -       | -     | -          |             |
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

| Name         | Type        | Optional | Default | Since | Deprecated | Description |
| ------------ | ----------- | -------- | ------- | ----- | ---------- | ----------- |
| `action`     | `Action`    | ❌       | -       | -     | -          |             |
| `paramsOrFn` | `unknown`   | ✅       | -       | -     | -          |             |
| `restParams` | `unknown[]` | ❌       | -       | -     | -          |             |

---

#### `getGateway` (Method)

**Type:** `() => undefined \| Gateway`

---

##### `getGateway` (CallSignature)

**Type:** `undefined \| Gateway`

Get the gateway instance

Returns the gateway instance used by this service for API operations.
Returns
`null`
if no gateway was configured.

**Returns:**

The gateway instance, or
`null`
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
`null`
if no logger was configured.

**Returns:**

The logger instance, or
`null`
if not configured

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

**Type:** `(plugin: Plugin) => void`

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                     |
| -------- | -------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `plugin` | `Plugin` | ❌       | -       | -     | -          | The plugin instance to register |

---

##### `use` (CallSignature)

**Type:** `void`

Register a plugin with the service

Registers one or more plugins to extend service functionality.
Plugins can hook into execution lifecycle (before, success, error) and
action-specific hooks (e.g.,
`onLoginBefore`
,
`onLogoutSuccess`
).

Plugins are executed in registration order for each hook type.

Hook types:

- General hooks:
  `onBefore`
  ,
  `onSuccess`
  ,
  `onError`

- Action-specific hooks:
  `on{Action}{Type}`
  (e.g.,
  `onLoginBefore`
  ,
  `onLogoutSuccess`
  )

Hook execution order:

1. General
   `onBefore`
   hooks
2. Action-specific before hooks (e.g.,
   `onLoginBefore`
   )
3. Gateway method execution
4. Action-specific success hooks (e.g.,
   `onLoginSuccess`
   )
5. General
   `onSuccess`
   hooks
6. General
   `onError`
   hooks (if error occurs)

**Example:** Register general hooks

```typescript
service.use({
  onBefore: (context) => {
    console.log('Before execution');
  },
  onSuccess: (context) => {
    console.log('Execution succeeded');
  },
  onError: (context) => {
    console.error('Execution failed:', context.error);
  }
});
```

**Example:** Register action-specific hooks

```typescript
service.use({
  onLoginBefore: (context) => {
    console.log('Before login');
  },
  onLoginSuccess: (context) => {
    console.log('Login succeeded');
  },
  onLogoutBefore: (context) => {
    console.log('Before logout');
  }
});
```

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                     |
| -------- | -------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `plugin` | `Plugin` | ❌       | -       | -     | -          | The plugin instance to register |

---

### `ExecutorServiceOptions` (Interface)

**Type:** `unknown`

**Since:** `1.8.0`

Executor service options

Configuration options for creating executor service instances.
Provides the necessary context for executing gateway actions, including service identification,
gateway instance, logger, and store for state management.

- Significance: Provides configuration context for executor services
- Core idea: Bundle service context needed for gateway action execution
- Main function: Pass service configuration to executor and plugins
- Main purpose: Enable executor services to access service infrastructure

Core features:

- Service identification: Identifies which service is executing actions
- Gateway access: Provides gateway instance for API operations
- Logger access: Provides logger instance for logging execution events
- Store access: Provides store instance for state management

Design decisions:

- Service name is required: All services must have an identifier
- Gateway is optional: Services can work without gateway (e.g., mock services)
- Logger is optional: Services can work without logger
- Store is optional: Services can work without store (though uncommon)

**Example:** Basic usage

```typescript
const options: ExecutorServiceOptions<User, UserGateway> = {
  serviceName: 'UserService',
  gateway: new UserGateway(),
  logger: new Logger(),
  store: new UserStore()
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

#### `store` (Property)

**Type:** `AsyncStoreInterface<AsyncStoreStateInterface<T>>`

Store instance for state management

The async store that manages service state (loading, success, error).
Optional - services can work without store (though uncommon).

---
