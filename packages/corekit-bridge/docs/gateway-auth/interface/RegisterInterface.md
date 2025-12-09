## `src/core/gateway-auth/interface/RegisterInterface` (Module)

**Type:** `unknown`

---

### `RegisterInterface` (Interface)

**Type:** `unknown`

**Since:** `1.8.0`

Register interface

Defines the contract for user registration operations, providing a standardized way to create new
user accounts across different implementations. This interface abstracts registration logic from
implementation details, supporting various registration methods and user data structures. It ensures
consistent registration behavior and enables flexible user type handling through generic result types.

- Significance: Defines the contract for user registration operations
- Core idea: Abstract registration logic from implementation details
- Main function: Handle user account creation
- Main purpose: Ensure consistent registration behavior across different implementations

Core features:

- User registration: Create new user accounts with validation
- Flexible parameters: Supports generic parameter types for different registration methods
- Flexible results: Supports generic result types for different user structures

Design decisions:

- Generic result type: Allows different user structures to be returned
- Generic parameters: Allows different registration methods (email, phone, etc.)
- Returns null on failure: Provides clear indication of registration failure

**Example:** Basic implementation

```typescript
class AuthService implements RegisterInterface<User> {
  async register(params: RegisterParams): Promise<User | null> {
    // Implementation
  }
}
```

**Example:** With custom parameters

```typescript
interface CustomRegisterParams {
  email: string;
  password: string;
  code: string;
}

class AuthService implements RegisterInterface<User> {
  async register(params: CustomRegisterParams): Promise<User | null> {
    // Implementation
  }
}
```

---

#### `register` (Method)

**Type:** `(params: unknown) => Promise<null \| Result>`

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                         |
| -------- | --------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `params` | `unknown` | ❌       | -       | -     | -          | Registration parameters containing user information |

Common parameters include:

- `email`: User email address
- `phone`: User phone number
- `password`: User password
- `code`: Verification code (for phone/email verification)
- Additional fields as required by the implementation |

---

##### `register` (CallSignature)

**Type:** `Promise<null \| Result>`

Register a new user

Creates a new user account with the provided registration parameters.
Validates input, creates the account, and returns the registered user information.

Behavior:

- Validates registration parameters (email, phone, password, code, etc.)
- Creates new user account in the system
- Returns user information upon successful registration
- Returns
  `null`
  if registration fails

**Returns:**

Promise resolving to user information if registration succeeds, or
`null`
if it fails

**Example:** Email registration

```typescript
const user = await authService.register({
  email: 'user@example.com',
  password: 'password123',
  code: '123456'
});
```

**Example:** Phone registration

```typescript
const user = await authService.register({
  phone: '13800138000',
  password: 'password123',
  code: '123456'
});
```

**Example:** Handle registration failure

```typescript
const user = await authService.register(params);
if (!user) {
  console.error('Registration failed');
}
```

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                         |
| -------- | --------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `params` | `unknown` | ❌       | -       | -     | -          | Registration parameters containing user information |

Common parameters include:

- `email`: User email address
- `phone`: User phone number
- `password`: User password
- `code`: Verification code (for phone/email verification)
- Additional fields as required by the implementation |

---

### `RegisterServiceInterface` (Interface)

**Type:** `unknown`

Register service interface

Combines registration operations with service infrastructure, extending
`RegisterInterface`
with store
and gateway access to provide a complete registration service contract. This interface enables reactive
registration services with persistent state management and API gateway integration. It provides both
registration operations and convenient access to registered user information through the integrated store.

- Significance: Combines registration operations with service infrastructure (store and gateway)
- Core idea: Extend
  `RegisterInterface`
  with store and gateway access for complete registration service
- Main function: Provide registration operations with state management and gateway integration
- Main purpose: Enable reactive registration services with persistent state and API gateway support

Core features:

- Registration operations: Inherit register method from
  `RegisterInterface`

- Store access: Provides access to async store for state management
- Gateway access: Provides access to registration gateway for API operations
- User access: Provides convenient method to get registered user information

Design decisions:

- Extends
  `RegisterInterface`
  : Inherits registration contract
- Extends
  `BaseServiceInterface`
  : Provides store and gateway infrastructure
- Extends
  `UserInfoGetter`
  : Provides convenient user access method
- Store type matches user: Store manages registered user state
- Gateway type matches
  `RegisterInterface`
  : Gateway provides registration operations

**Example:** Basic usage

```typescript
class RegisterService implements RegisterServiceInterface<User, UserStore> {
  readonly serviceName = 'RegisterService';

  getStore(): UserStore {
    return this.store;
  }

  getGateway(): RegisterInterface<User> | null {
    return this.gateway;
  }

  async register(params: RegisterParams): Promise<User | null> {
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

**Type:** `(action: Action) => ExecutorServiceOptions<any, RegisterInterface<User>>`

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                        |
| -------- | -------- | -------- | ------- | ----- | ---------- | ---------------------------------- |
| `action` | `Action` | ❌       | -       | -     | -          | The gateway action name to execute |

---

##### `createExecOptions` (CallSignature)

**Type:** `ExecutorServiceOptions<any, RegisterInterface<User>>`

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

**Type:** `() => undefined \| RegisterInterface<User>`

---

##### `getGateway` (CallSignature)

**Type:** `undefined \| RegisterInterface<User>`

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

#### `register` (Method)

**Type:** `(params: unknown) => Promise<null \| User>`

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                         |
| -------- | --------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `params` | `unknown` | ❌       | -       | -     | -          | Registration parameters containing user information |

Common parameters include:

- `email`: User email address
- `phone`: User phone number
- `password`: User password
- `code`: Verification code (for phone/email verification)
- Additional fields as required by the implementation |

---

##### `register` (CallSignature)

**Type:** `Promise<null \| User>`

Register a new user

Creates a new user account with the provided registration parameters.
Validates input, creates the account, and returns the registered user information.

Behavior:

- Validates registration parameters (email, phone, password, code, etc.)
- Creates new user account in the system
- Returns user information upon successful registration
- Returns
  `null`
  if registration fails

**Returns:**

Promise resolving to user information if registration succeeds, or
`null`
if it fails

**Example:** Email registration

```typescript
const user = await authService.register({
  email: 'user@example.com',
  password: 'password123',
  code: '123456'
});
```

**Example:** Phone registration

```typescript
const user = await authService.register({
  phone: '13800138000',
  password: 'password123',
  code: '123456'
});
```

**Example:** Handle registration failure

```typescript
const user = await authService.register(params);
if (!user) {
  console.error('Registration failed');
}
```

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                         |
| -------- | --------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `params` | `unknown` | ❌       | -       | -     | -          | Registration parameters containing user information |

Common parameters include:

- `email`: User email address
- `phone`: User phone number
- `password`: User password
- `code`: Verification code (for phone/email verification)
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
