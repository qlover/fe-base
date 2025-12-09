## `src/core/gateway-auth/interface/LoginInterface` (Module)

**Type:** `module src/core/gateway-auth/interface/LoginInterface`

---

### `LoginInterface` (Interface)

**Type:** `interface LoginInterface<CredentialType>`

**Since:** `1.8.0`

Login interface

Defines the contract for user authentication operations, providing a standardized way to handle
login and logout functionality across different implementations. This interface abstracts authentication
logic from implementation details, supporting various authentication methods including email/phone
with password or verification code. It ensures consistent authentication behavior and enables flexible
credential handling through generic types.

- Significance: Defines the contract for user authentication operations
- Core idea: Abstract login and logout operations from implementation details
- Main function: Handle user authentication lifecycle (login and logout)
- Main purpose: Ensure consistent authentication behavior across different implementations

Core features:

- Login: Authenticate users with various credential types (email/phone + password/code)
- Logout: Clear authentication state and user data
- Flexible parameters: Supports generic parameter types for different authentication methods
- Flexible results: Supports generic result types for different credential structures

Design decisions:

- Generic credential type: Allows different credential structures (tokens, sessions, etc.)
- Generic logout parameters: Allows different logout requirements (revokeAll, redirects)
- Generic logout result: Allows different logout responses (e.g., success status, redirect URLs)

**Example:** Basic implementation

```typescript
class AuthService implements LoginInterface<TokenCredential> {
  async login(params: LoginParams): Promise<TokenCredential | null> {
    // Implementation
  }

  async logout(): Promise<void> {
    // Implementation
  }
}
```

---

#### `login` (Method)

**Type:** `(params: LoginParams) => Promise<null \| CredentialType>`

#### Parameters

| Name     | Type          | Optional | Default | Since | Deprecated | Description                                                |
| -------- | ------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------- |
| `params` | `LoginParams` | ❌       | -       | -     | -          | Login parameters (email/phone + password, or phone + code) |

---

##### `login` (CallSignature)

**Type:** `Promise<null \| CredentialType>`

Authenticate user with credentials

Performs user authentication using provided credentials (email/phone + password, or phone + code).
Updates both user and credential stores with the authentication result.

**Returns:**

Promise resolving to credential data

**Throws:**

Error if authentication fails

**Example:**

```typescript
// Password login
await authService.login({
  email: 'user@example.com',
  password: 'password123'
});

// Phone code login
await authService.login({
  phone: '13800138000',
  code: '123456'
});
```

#### Parameters

| Name     | Type          | Optional | Default | Since | Deprecated | Description                                                |
| -------- | ------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------- |
| `params` | `LoginParams` | ❌       | -       | -     | -          | Login parameters (email/phone + password, or phone + code) |

---

#### `logout` (Method)

**Type:** `(params: Parmas) => Promise<Result>`

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                                                           |
| -------- | -------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------------------- |
| `params` | `Parmas` | ✅       | -       | -     | -          | Optional logout parameters (e.g., revokeAll, redirectUrl, clearCache) |

---

##### `logout` (CallSignature)

**Type:** `Promise<Result>`

Logout current user

Clears authentication state, user data, and credentials.
Resets both user and credential stores to initial state.

**Returns:**

Promise resolving to logout result (e.g., success status, redirect URL)

**Example:**

```typescript
// Basic logout (no params, no return value)
await authService.logout();

// Logout with parameters
await authService.logout<{ revokeAll: boolean }, void>({ revokeAll: true });

// Logout with parameters and return value
const result = await authService.logout<
  { revokeAll: boolean },
  { success: boolean; message: string }
>({ revokeAll: true });
```

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                                                           |
| -------- | -------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------------------- |
| `params` | `Parmas` | ✅       | -       | -     | -          | Optional logout parameters (e.g., revokeAll, redirectUrl, clearCache) |

---

### `LoginParams` (Interface)

**Type:** `interface LoginParams`

Login parameters

Parameters for user authentication. Supports multiple authentication methods:

- Email + password authentication
- Phone + password authentication
- Phone + verification code authentication

**Example:** Email and password login

```typescript
const params: LoginParams = {
  email: 'user@example.com',
  password: 'password123'
};
```

**Example:** Phone and code login

```typescript
const params: LoginParams = {
  phone: '13800138000',
  code: '123456'
};
```

---

#### `code` (Property)

**Type:** `string`

Verification code

Used for phone + code authentication.
Required when using code-based login.

---

#### `email` (Property)

**Type:** `string`

User email address

Used for email + password authentication.
Required when using email-based login.

---

#### `password` (Property)

**Type:** `string`

User password

Used for email/phone + password authentication.
Required when using password-based login.

---

#### `phone` (Property)

**Type:** `string`

User phone number

Used for phone + password or phone + code authentication.
Required when using phone-based login.

---

### `LoginServiceInterface` (Interface)

**Type:** `interface LoginServiceInterface<Credential, Store>`

Login service interface

Combines login operations with service infrastructure, extending
`LoginInterface`
with store and gateway
access to provide a complete login service contract. This interface enables reactive login services with
persistent state management and API gateway integration. It provides both authentication operations and
convenient access to credential data through the integrated store.

- Significance: Combines login operations with service infrastructure (store and gateway)
- Core idea: Extend
  `LoginInterface`
  with store and gateway access for complete login service
- Main function: Provide login/logout operations with state management and gateway integration
- Main purpose: Enable reactive login services with persistent state and API gateway support

Core features:

- Login operations: Inherit login and logout methods from
  `LoginInterface`

- Store access: Provides access to async store for state management
- Gateway access: Provides access to login gateway for API operations
- Credential access: Provides convenient method to get current credential

Design decisions:

- Extends
  `LoginInterface`
  : Inherits login/logout contract
- Extends
  `BaseServiceInterface`
  : Provides store and gateway infrastructure
- Store type matches credential: Store manages credential state
- Gateway type matches
  `LoginInterface`
  : Gateway provides login operations

**Example:** Basic usage

```typescript
class LoginService
  implements LoginServiceInterface<TokenCredential, CredentialStore>
{
  readonly serviceName = 'LoginService';

  getStore(): CredentialStore {
    return this.store;
  }

  getGateway(): LoginInterface<TokenCredential> | null {
    return this.gateway;
  }

  async login(params: LoginParams): Promise<TokenCredential | null> {
    // Implementation
  }

  async logout(): Promise<void> {
    // Implementation
  }

  getCredential(): TokenCredential | null {
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

**Type:** `(action: Action) => ExecutorServiceOptions<any, LoginInterface<Credential>>`

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                        |
| -------- | -------- | -------- | ------- | ----- | ---------- | ---------------------------------- |
| `action` | `Action` | ❌       | -       | -     | -          | The gateway action name to execute |

---

##### `createExecOptions` (CallSignature)

**Type:** `ExecutorServiceOptions<any, LoginInterface<Credential>>`

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

#### `getCredential` (Method)

**Type:** `() => null \| Credential`

---

##### `getCredential` (CallSignature)

**Type:** `null \| Credential`

Get current credential

Returns the current credential data if the user is authenticated.
This is a convenience method that typically accesses the store's result.

**Returns:**

The current credential data, or
`null`
if not authenticated

**Example:** Check authentication status

```typescript
const credential = loginService.getCredential();
if (credential) {
  console.log('User is authenticated');
  console.log('Token:', credential.token);
}
```

**Example:** Use credential for API calls

```typescript
const credential = loginService.getCredential();
if (credential) {
  const headers = {
    Authorization: `Bearer ${credential.token}`
  };
  // Make authenticated API call
}
```

---

#### `getGateway` (Method)

**Type:** `() => undefined \| LoginInterface<Credential>`

---

##### `getGateway` (CallSignature)

**Type:** `undefined \| LoginInterface<Credential>`

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

#### `login` (Method)

**Type:** `(params: LoginParams) => Promise<null \| Credential>`

#### Parameters

| Name     | Type          | Optional | Default | Since | Deprecated | Description                                                |
| -------- | ------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------- |
| `params` | `LoginParams` | ❌       | -       | -     | -          | Login parameters (email/phone + password, or phone + code) |

---

##### `login` (CallSignature)

**Type:** `Promise<null \| Credential>`

Authenticate user with credentials

Performs user authentication using provided credentials (email/phone + password, or phone + code).
Updates both user and credential stores with the authentication result.

**Returns:**

Promise resolving to credential data

**Throws:**

Error if authentication fails

**Example:**

```typescript
// Password login
await authService.login({
  email: 'user@example.com',
  password: 'password123'
});

// Phone code login
await authService.login({
  phone: '13800138000',
  code: '123456'
});
```

#### Parameters

| Name     | Type          | Optional | Default | Since | Deprecated | Description                                                |
| -------- | ------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------- |
| `params` | `LoginParams` | ❌       | -       | -     | -          | Login parameters (email/phone + password, or phone + code) |

---

#### `logout` (Method)

**Type:** `(params: Parmas) => Promise<Result>`

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                                                           |
| -------- | -------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------------------- |
| `params` | `Parmas` | ✅       | -       | -     | -          | Optional logout parameters (e.g., revokeAll, redirectUrl, clearCache) |

---

##### `logout` (CallSignature)

**Type:** `Promise<Result>`

Logout current user

Clears authentication state, user data, and credentials.
Resets both user and credential stores to initial state.

**Returns:**

Promise resolving to logout result (e.g., success status, redirect URL)

**Example:**

```typescript
// Basic logout (no params, no return value)
await authService.logout();

// Logout with parameters
await authService.logout<{ revokeAll: boolean }, void>({ revokeAll: true });

// Logout with parameters and return value
const result = await authService.logout<
  { revokeAll: boolean },
  { success: boolean; message: string }
>({ revokeAll: true });
```

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                                                           |
| -------- | -------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------------------- |
| `params` | `Parmas` | ✅       | -       | -     | -          | Optional logout parameters (e.g., revokeAll, redirectUrl, clearCache) |

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
