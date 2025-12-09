## `src/core/gateway-auth/interface/UserInfoInterface` (Module)

**Type:** `unknown`

---

### `UserInfoGetter` (Interface)

**Type:** `unknown`

User info getter interface

Provides a convenient method to access current user information without directly accessing the store.
This interface abstracts user data access from store implementation details, enabling easy retrieval
of user information. It is typically implemented by services that manage user information and provides
a simple getter method that accesses the store's result.

- Significance: Provides a convenient method to access current user information
- Core idea: Abstract user data access from store implementation details
- Main function: Return current user data from the store
- Main purpose: Enable easy access to user information without directly accessing the store

This interface is typically implemented by services that manage user information.
It provides a simple getter method that accesses the store's result.

**Example:** Basic usage

```typescript
class UserService implements UserInfoGetter<User> {
  getUser(): User | null {
    return this.store.getResult();
  }
}
```

---

#### `getUser` (Method)

**Type:** `() => null \| User`

---

##### `getUser` (CallSignature)

**Type:** `null \| User`

Get current user

Returns the current user information from the store.
This is a convenience method that typically accesses the store's result.

**Returns:**

The current user information, or
`null`
if not available

**Example:** Get current user

```typescript
const user = userService.getUser();
if (user) {
  console.log('Current user:', user.name);
}
```

**Example:** Check authentication status

```typescript
const user = userService.getUser();
const isAuthenticated = user !== null;
```

---

### `UserInfoInterface` (Interface)

**Type:** `unknown`

**Since:** `1.8.0`

User info interface

Defines the contract for user information operations, providing a standardized way to retrieve
and refresh user data across different implementations. This interface abstracts user data access
logic from implementation details, supporting both cached and fresh data retrieval. It ensures
consistent user information access patterns and enables flexible user type handling through generic types.

- Significance: Defines the contract for user information operations
- Core idea: Abstract user data retrieval and refresh logic from implementation details
- Main function: Handle fetching and refreshing user information
- Main purpose: Ensure consistent user information access across different implementations

Core features:

- Get user info: Retrieve current user information (may use cached data)
- Refresh user info: Force refresh user information from server
- Flexible parameters: Supports generic parameter types for different user info requirements

Design decisions:

- Generic user type: Allows different user structures to be returned
- Generic parameters: Allows different ways to fetch user info (by token, by ID, etc.)
- Returns null on failure: Provides clear indication when user info cannot be retrieved
- Separate refresh method: Allows explicit refresh without affecting get behavior

**Example:** Basic implementation

```typescript
class UserService implements UserInfoInterface<User> {
  async getUserInfo(): Promise<User | null> {
    // Implementation - may return cached data
  }

  async refreshUserInfo(): Promise<User | null> {
    // Implementation - always fetches fresh data
  }
}
```

---

#### `getUserInfo` (Method)

**Type:** `(params: unknown) => Promise<null \| User>`

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                |
| -------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `params` | `unknown` | ✅       | -       | -     | -          | Optional parameters for fetching user info |

Common parameters include:

- Login data (token, credential) for authentication
- User ID for direct lookup
- Additional fields as required by the implementation |

---

##### `getUserInfo` (CallSignature)

**Type:** `Promise<null \| User>`

Get current user information

Retrieves the current user's information. This method may return cached data
if available, or fetch from the server if no cache exists.

Behavior:

- Returns cached user info if available and valid
- Fetches from server if no cache exists
- Returns
  `null`
  if user is not authenticated or info cannot be retrieved

**Returns:**

Promise resolving to user information, or
`null`
if not available

**Example:** Get user info

```typescript
const user = await userService.getUserInfo();
if (user) {
  console.log('User:', user.name);
}
```

**Example:** Get user info with parameters

```typescript
const user = await userAuthService.getUserInfo({ token: 'abc123' });
```

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                |
| -------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `params` | `unknown` | ✅       | -       | -     | -          | Optional parameters for fetching user info |

Common parameters include:

- Login data (token, credential) for authentication
- User ID for direct lookup
- Additional fields as required by the implementation |

---

#### `refreshUserInfo` (Method)

**Type:** `(params: Params) => Promise<null \| User>`

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                                  |
| -------- | -------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `params` | `Params` | ✅       | -       | -     | -          | Optional parameters for refreshing user info |

Common parameters include:

- Login data (token, credential) for authentication
- Force refresh flag
- Additional fields as required by the implementation |

---

##### `refreshUserInfo` (CallSignature)

**Type:** `Promise<null \| User>`

Refresh user information

Forces a refresh of user information from the server, bypassing any cache.
This is useful when user data may have changed on the server.

Behavior:

- Always fetches fresh data from server
- Updates cache with new data
- Returns
  `null`
  if refresh fails or user is not authenticated

**Returns:**

Promise resolving to refreshed user information, or
`null`
if refresh fails

**Example:** Refresh user info

```typescript
const user = await userAuthService.refreshUserInfo();
if (user) {
  console.log('Refreshed user:', user);
}
```

**Example:** Refresh with parameters

```typescript
const user = await userAuthService.refreshUserInfo({ force: true });
```

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                                  |
| -------- | -------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `params` | `Params` | ✅       | -       | -     | -          | Optional parameters for refreshing user info |

Common parameters include:

- Login data (token, credential) for authentication
- Force refresh flag
- Additional fields as required by the implementation |

---

### `UserInfoServiceInterface` (Interface)

**Type:** `unknown`

User info service interface

Combines user info operations with service infrastructure, extending
`UserInfoInterface`
with store
and gateway access to provide a complete user info service contract. This interface enables reactive
user info services with persistent state management and API gateway integration. It provides both
user information retrieval operations and convenient access to current user data through the integrated store.

- Significance: Combines user info operations with service infrastructure (store and gateway)
- Core idea: Extend
  `UserInfoInterface`
  with store and gateway access for complete user info service
- Main function: Provide user info operations with state management and gateway integration
- Main purpose: Enable reactive user info services with persistent state and API gateway support

Core features:

- User info operations: Inherit getUserInfo and refreshUserInfo methods from
  `UserInfoInterface`

- Store access: Provides access to async store for state management
- Gateway access: Provides access to user info gateway for API operations
- User access: Provides convenient method to get current user information

Design decisions:

- Extends
  `UserInfoInterface`
  : Inherits user info contract
- Extends
  `BaseServiceInterface`
  : Provides store and gateway infrastructure
- Extends
  `UserInfoGetter`
  : Provides convenient user access method
- Store type matches user: Store manages user state
- Gateway type matches
  `UserInfoInterface`
  : Gateway provides user info operations

**Example:** Basic usage

```typescript
class UserInfoService implements UserInfoServiceInterface<User, UserStore> {
  readonly serviceName = 'UserInfoService';

  getStore(): UserStore {
    return this.store;
  }

  getGateway(): UserInfoInterface<User> | null {
    return this.gateway;
  }

  async getUserInfo(): Promise<User | null> {
    // Implementation
  }

  async refreshUserInfo(): Promise<User | null> {
    // Implementation
  }

  getUser(): User | null {
    return this.store.getResult();
  }
}
```

---

#### `serviceName` (Property)

**Type:** `string \| symbol`

Service name identifier

Used for logging, debugging, and service identification.
Should be set during construction and remain constant.

---

#### `createExecOptions` (Method)

**Type:** `(action: Action) => ExecutorServiceOptions<any, UserInfoInterface<User>>`

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                        |
| -------- | -------- | -------- | ------- | ----- | ---------- | ---------------------------------- |
| `action` | `Action` | ❌       | -       | -     | -          | The gateway action name to execute |

---

##### `createExecOptions` (CallSignature)

**Type:** `ExecutorServiceOptions<any, UserInfoInterface<User>>`

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

**Type:** `() => undefined \| UserInfoInterface<User>`

---

##### `getGateway` (CallSignature)

**Type:** `undefined \| UserInfoInterface<User>`

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

#### `getUser` (Method)

**Type:** `() => null \| User`

---

##### `getUser` (CallSignature)

**Type:** `null \| User`

Get current user

Returns the current user information from the store.
This is a convenience method that typically accesses the store's result.

**Returns:**

The current user information, or
`null`
if not available

**Example:** Get current user

```typescript
const user = userService.getUser();
if (user) {
  console.log('Current user:', user.name);
}
```

**Example:** Check authentication status

```typescript
const user = userService.getUser();
const isAuthenticated = user !== null;
```

---

#### `getUserInfo` (Method)

**Type:** `(params: unknown) => Promise<null \| User>`

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                |
| -------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `params` | `unknown` | ✅       | -       | -     | -          | Optional parameters for fetching user info |

Common parameters include:

- Login data (token, credential) for authentication
- User ID for direct lookup
- Additional fields as required by the implementation |

---

##### `getUserInfo` (CallSignature)

**Type:** `Promise<null \| User>`

Get current user information

Retrieves the current user's information. This method may return cached data
if available, or fetch from the server if no cache exists.

Behavior:

- Returns cached user info if available and valid
- Fetches from server if no cache exists
- Returns
  `null`
  if user is not authenticated or info cannot be retrieved

**Returns:**

Promise resolving to user information, or
`null`
if not available

**Example:** Get user info

```typescript
const user = await userService.getUserInfo();
if (user) {
  console.log('User:', user.name);
}
```

**Example:** Get user info with parameters

```typescript
const user = await userAuthService.getUserInfo({ token: 'abc123' });
```

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                |
| -------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `params` | `unknown` | ✅       | -       | -     | -          | Optional parameters for fetching user info |

Common parameters include:

- Login data (token, credential) for authentication
- User ID for direct lookup
- Additional fields as required by the implementation |

---

#### `refreshUserInfo` (Method)

**Type:** `(params: Params) => Promise<null \| User>`

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                                  |
| -------- | -------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `params` | `Params` | ✅       | -       | -     | -          | Optional parameters for refreshing user info |

Common parameters include:

- Login data (token, credential) for authentication
- Force refresh flag
- Additional fields as required by the implementation |

---

##### `refreshUserInfo` (CallSignature)

**Type:** `Promise<null \| User>`

Refresh user information

Forces a refresh of user information from the server, bypassing any cache.
This is useful when user data may have changed on the server.

Behavior:

- Always fetches fresh data from server
- Updates cache with new data
- Returns
  `null`
  if refresh fails or user is not authenticated

**Returns:**

Promise resolving to refreshed user information, or
`null`
if refresh fails

**Example:** Refresh user info

```typescript
const user = await userAuthService.refreshUserInfo();
if (user) {
  console.log('Refreshed user:', user);
}
```

**Example:** Refresh with parameters

```typescript
const user = await userAuthService.refreshUserInfo({ force: true });
```

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                                  |
| -------- | -------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `params` | `Params` | ✅       | -       | -     | -          | Optional parameters for refreshing user info |

Common parameters include:

- Login data (token, credential) for authentication
- Force refresh flag
- Additional fields as required by the implementation |

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
