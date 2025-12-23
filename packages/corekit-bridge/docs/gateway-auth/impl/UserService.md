## `src/core/gateway-auth/impl/UserService` (Module)

**Type:** `module src/core/gateway-auth/impl/UserService`

---

### `UserService` (Class)

**Type:** `class UserService<User, Credential, Key>`

User service implementation

Unified service that combines login, registration, and user info functionality into a single cohesive
service. This service uses a unified UserStore to manage authentication state and directly implements
all business logic without delegating to sub-services.

- Significance: Unified service for complete user management (login, registration, user info)
- Core idea: Direct implementation with unified UserStore for authentication state
- Main function: Provide single entry point for all user-related operations
- Main purpose: Simplify user management with unified state and direct implementation

**Persistence Behavior (inherited from UserStore):**

- **Default**: Only
  `credential`
  is persisted to storage,
  `user info`
  is stored in memory only
  - When
    `store`
    configuration includes
    `storage`
    and
    `storageKey`
    , **credential will be persisted using
    `storageKey`
    **
  - **Note:**
    `storageKey`
    stores credential (not user info), which is different from AsyncStore
  - User info will NOT be persisted and will be cleared on page reload
  - This ensures credential survives page reloads while user info is fetched fresh each time

- **Dual persistence** (optional): Configure
  `persistUserInfo: true`
  and
  `credentialStorageKey`
  in store options
  - Credential will be persisted to
    `credentialStorageKey`

  - User info will be persisted to
    `storageKey`

  - Both will be restored from storage on service initialization

**Important: Authentication Status After Restore**

- When credential is restored from storage, the store status is **NOT automatically set to
  `SUCCESS`
  **
- You must manually decide when to set status to
  `SUCCESS`
  based on your application's authentication logic
- See
  `isAuthenticated()`
  method documentation for examples of custom authentication logic
- See examples below for how to handle credential restoration

Core features:

- User operations: Login, logout, register, getUserInfo, refreshUserInfo
- Unified store: Uses UserStore to manage both credential and user info in single store
- Direct implementation: All business logic implemented directly without sub-services
- Authentication check: Verifies user is authenticated by checking unified store
- Plugin support: Supports plugins for all user service actions
- Credential-first persistence: Only credential is persisted by default (user info in memory only)

Design decisions:

- Extends GatewayService: Inherits gateway execution infrastructure
- Uses UserStore: Single unified store for authentication state
- Direct implementation: No delegation to sub-services, all logic in UserService
- Authentication logic: Checks unified store for authentication status
- Gateway type: Uses combined UserServiceGateway interface
- Credential-first persistence: Inherits UserStore's default behavior of persisting only credential

**Example:** Basic usage (persist only credential)

```typescript
const userService = new UserService<User, TokenCredential>({
  gateway: new UserGateway(),
  logger: new Logger(),
  store: {
    storage: localStorage,
    storageKey: 'auth_token' // This key stores credential, not user info
    // Only credential is persisted to 'auth_token', user info is in memory only
  }
});

// Use unified service
await userService.login({ email, password });
const user = await userService.getUserInfo();
const isAuth = userService.isAuthenticated();
```

**Example:** Persist both user info and credential

```typescript
const userService = new UserService<User, TokenCredential>({
  gateway: new UserGateway(),
  store: {
    storage: localStorage,
    storageKey: 'user-info',
    credentialStorageKey: 'auth_token',
    persistUserInfo: true
    // Both user info and credential are persisted separately
  }
});
```

**Example:** With plugins

```typescript
userService.use({
  onLoginBefore: async (context) => {
    console.log('Before login');
  },
  onRegisterSuccess: async (context) => {
    console.log('Registration successful');
  }
});
```

**Example:** Handle credential restoration with validation

```typescript
class CustomUserService extends UserService<User, TokenCredential> {
  constructor(options: UserServiceConfig<User, TokenCredential>) {
    super(options);

    // After store initialization, check if credential was restored
    const credential = this.getStore().getCredential();
    if (credential) {
      // Validate credential (e.g., check expiration)
      if (this.isCredentialValid(credential)) {
        // Credential is valid, set status to SUCCESS
        this.getStore().updateState({
          status: AsyncStoreStatus.SUCCESS,
          loading: false,
          error: null,
          endTime: Date.now()
        });
      } else {
        // Credential invalid, clear it
        this.getStore().setCredential(null);
      }
    }
  }

  private isCredentialValid(credential: TokenCredential): boolean {
    // Example: Check expiration
    return credential.expiresAt ? Date.now() < credential.expiresAt : true;
  }
}
```

**Example:** Handle credential restoration with async validation

```typescript
class CustomUserService extends UserService<User, Credential> {
  constructor(options: UserServiceConfig<User, Credential>) {
    super(options);

    // After store initialization, validate restored credential
    this.validateRestoredCredential();
  }

  private async validateRestoredCredential(): Promise<void> {
    const credential = this.getStore().getCredential();
    if (!credential) return;

    try {
      // Validate with server
      const isValid = await this.getGateway()?.validateCredential?.(credential);
      if (isValid) {
        this.getStore().updateState({
          status: AsyncStoreStatus.SUCCESS,
          loading: false,
          error: null,
          endTime: Date.now()
        });
      } else {
        // Invalid credential, clear it
        this.getStore().setCredential(null);
      }
    } catch (error) {
      // Validation failed, keep status as DRAFT
      this.getStore().updateState({ error });
    }
  }
}
```

**Example:** Treat restored credential as valid immediately

```typescript
class CustomUserService extends UserService<User, Credential> {
  constructor(options: UserServiceConfig<User, Credential>) {
    super(options);

    // If credential exists after restore, treat as authenticated
    const credential = this.getStore().getCredential();
    if (credential) {
      this.getStore().updateState({
        status: AsyncStoreStatus.SUCCESS,
        loading: false,
        error: null,
        endTime: Date.now()
      });
    }
  }
}
```

---

#### `new UserService` (Constructor)

**Type:** `(options: UserServiceConfig<User, Credential>) => UserService<User, Credential, Key>`

#### Parameters

| Name      | Type                                  | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `options` | `UserServiceConfig<User, Credential>` | ✅       | `{}`    | -     | -          |             |

---

#### `executor` (Property)

**Type:** `GatewayExecutor<User, UserServiceGateway<User, Credential>>`

---

#### `gateway` (Property)

**Type:** `UserServiceGateway<User, Credential>`

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

**Type:** `string \| symbol`

Service name identifier

Used for logging, debugging, and service identification.
Set during construction and remains constant throughout the service lifecycle.

---

#### `store` (Property)

**Type:** `UserStore<User, Credential, Key, unknown>`

Store instance for state management

The async store that manages service state (loading, success, error).
Always initialized - created from provided instance or options, or defaults to new store.
Protected to allow subclasses to access while preventing external modification.

---

#### `createDefaultFn` (Method)

**Type:** `(action: parameter action) => ExecuteFn<unknown, unknown, UserServiceGateway<User, Credential>>`

#### Parameters

| Name     | Type               | Optional | Default | Since | Deprecated | Description                                                       |
| -------- | ------------------ | -------- | ------- | ----- | ---------- | ----------------------------------------------------------------- |
| `action` | `parameter action` | ❌       | -       | -     | -          | The gateway action name (must match a method name on the gateway) |

---

##### `createDefaultFn` (CallSignature)

**Type:** `ExecuteFn<unknown, unknown, UserServiceGateway<User, Credential>>`

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

**Type:** `(action: parameter action, params: Params) => GatewayExecutorOptions<User, UserServiceGateway<User, Credential>, Params>`

#### Parameters

| Name     | Type               | Optional | Default | Since | Deprecated | Description                                  |
| -------- | ------------------ | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `action` | `parameter action` | ❌       | -       | -     | -          | The gateway action name                      |
| `params` | `Params`           | ✅       | -       | -     | -          | The parameters to pass to the gateway method |

---

##### `createExecOptions` (CallSignature)

**Type:** `GatewayExecutorOptions<User, UserServiceGateway<User, Credential>, Params>`

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

#### `getCredential` (Method)

**Type:** `() => null \| Credential`

---

##### `getCredential` (CallSignature)

**Type:** `null \| Credential`

Get the current credential

Returns the current credential data if available.
This is a convenience method that accesses the state's credential property directly.

**Returns:**

The current credential data, or
`null`
if not available

**Example:** Get current credential

```typescript
const credential = userService.getCredential();
if (credential) {
  console.log('Current credential:', credential.token);
}
```

---

#### `getExecutor` (Method)

**Type:** `() => undefined \| GatewayExecutor<User, UserServiceGateway<User, Credential>>`

---

##### `getExecutor` (CallSignature)

**Type:** `undefined \| GatewayExecutor<User, UserServiceGateway<User, Credential>>`

---

#### `getGateway` (Method)

**Type:** `() => undefined \| UserServiceGateway<User, Credential>`

---

##### `getGateway` (CallSignature)

**Type:** `undefined \| UserServiceGateway<User, Credential>`

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

**Type:** `() => undefined \| LoggerInterface<unknown>`

---

##### `getLogger` (CallSignature)

**Type:** `undefined \| LoggerInterface<unknown>`

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

**Type:** `() => UserStore<User, Credential, Key, unknown>`

---

##### `getStore` (CallSignature)

**Type:** `UserStore<User, Credential, Key, unknown>`

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

Get current user from the unified store

Returns the current user information from the UserStore.
This is a convenience method that accesses the store's user info directly.

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

---

#### `getUserInfo` (Method)

**Type:** `(params: Params) => Promise<null \| User>`

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                                |
| -------- | -------- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `params` | `Params` | ✅       | -       | -     | -          | Optional parameters for fetching user info |

---

##### `getUserInfo` (CallSignature)

**Type:** `Promise<null \| User>`

Get current user information

Retrieves the current user's information (may use cached data if available).
Uses unified userStore for user info operations.

**Returns:**

Promise resolving to user information, or
`null`
if not available

**Example:** Get user info

```typescript
const user = await userService.getUserInfo();
```

**Example:** Get user info with parameters

```typescript
const user = await userService.getUserInfo({ token: 'abc123' });
```

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                                |
| -------- | -------- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `params` | `Params` | ✅       | -       | -     | -          | Optional parameters for fetching user info |

---

#### `isAuthenticated` (Method)

**Type:** `() => boolean`

---

##### `isAuthenticated` (CallSignature)

**Type:** `boolean`

Check if user is authenticated

Provides a **basic authentication check** that verifies:

- Store status is
  `SUCCESS`

- Credential exists

**Important:** This is a basic implementation that may not suit all application scenarios.
Different applications may have different authentication requirements:

- Some may need to check credential expiration
- Some may need to verify user info exists
- Some may require additional permission checks
- Some may need to validate credential with server periodically

**Override this method** to implement custom authentication logic based on your application's
specific requirements. The base implementation only checks if status is SUCCESS and credential exists.

**Note:** When credential is restored from storage via
`restore()`
, the status is NOT automatically
set to SUCCESS. You need to manually set the status based on your validation logic (see examples below).

**Returns:**

`true`
if user is authenticated (has SUCCESS status and credential),
`false`
otherwise

**Example:** Basic usage

```typescript
if (userService.isAuthenticated()) {
  console.log('User is authenticated');
  const user = userService.getUser();
  const credential = userService.getCredential();
} else {
  console.log('User is not authenticated');
}
```

**Example:** Override with credential expiration check

```typescript
class CustomUserService extends UserService<User, TokenCredential> {
  override isAuthenticated(): boolean {
    const credential = this.getCredential();
    if (!credential) return false;

    // Check if credential has expired
    if (credential.expiresAt && Date.now() >= credential.expiresAt) {
      // Credential expired, clear it
      this.getStore().setCredential(null);
      return false;
    }

    // Use base implementation
    return super.isAuthenticated();
  }
}
```

**Example:** Override to require both credential and user info

```typescript
class CustomUserService extends UserService<User, Credential> {
  override isAuthenticated(): boolean {
    const state = this.getStore().getState();
    // Require both credential and user info
    return (
      state.status === AsyncStoreStatus.SUCCESS &&
      !!this.getCredential() &&
      !!this.getUser()
    );
  }
}
```

**Example:** Override with server validation

```typescript
class CustomUserService extends UserService<User, Credential> {
  private isValidated = false;

  override isAuthenticated(): boolean {
    if (!super.isAuthenticated()) return false;

    // If not validated yet, trigger async validation
    if (!this.isValidated) {
      this.validateCredential();
      return false; // Return false until validated
    }

    return true;
  }

  private async validateCredential(): Promise<void> {
    const credential = this.getCredential();
    if (!credential) return;

    try {
      const isValid = await this.getGateway()?.validateCredential?.(credential);
      this.isValidated = isValid ?? false;
    } catch {
      this.isValidated = false;
    }
  }
}
```

---

#### `login` (Method)

**Type:** `(params: Params) => Promise<null \| Credential>`

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                                                |
| -------- | -------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------- |
| `params` | `Params` | ❌       | -       | -     | -          | Login parameters (email/phone + password, or phone + code) |

---

##### `login` (CallSignature)

**Type:** `Promise<null \| Credential>`

Login user with credentials

Performs user authentication using provided credentials through the configured gateway.
After successful login, automatically fetches user information.

**Returns:**

Promise resolving to credential data

**Example:** Email and password login

```typescript
const credential = await userService.login({
  email: 'user@example.com',
  password: 'password123'
});
```

**Example:** Phone code login

```typescript
const credential = await userService.login({
  phone: '13800138000',
  code: '123456'
});
```

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                                                |
| -------- | -------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------- |
| `params` | `Params` | ❌       | -       | -     | -          | Login parameters (email/phone + password, or phone + code) |

---

#### `logout` (Method)

**Type:** `(params: LogoutParams) => Promise<LogoutResult>`

#### Parameters

| Name     | Type           | Optional | Default | Since | Deprecated | Description                                                           |
| -------- | -------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------------------- |
| `params` | `LogoutParams` | ✅       | -       | -     | -          | Optional logout parameters (e.g., revokeAll, redirectUrl, clearCache) |

---

##### `logout` (CallSignature)

**Type:** `Promise<LogoutResult>`

Logout current user

Clears authentication credential state and calls the logout gateway if configured.
Resets user info store after logout.

**Returns:**

Promise resolving to logout result (e.g., success status, redirect URL)

**Example:** Basic logout

```typescript
await userService.logout();
```

**Example:** Logout with parameters

```typescript
await userService.logout<{ revokeAll: boolean }, void>({ revokeAll: true });
```

#### Parameters

| Name     | Type           | Optional | Default | Since | Deprecated | Description                                                           |
| -------- | -------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------------------- |
| `params` | `LogoutParams` | ✅       | -       | -     | -          | Optional logout parameters (e.g., revokeAll, redirectUrl, clearCache) |

---

#### `refreshUserInfo` (Method)

**Type:** `(params: Params) => Promise<null \| User>`

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                                  |
| -------- | -------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `params` | `Params` | ✅       | -       | -     | -          | Optional parameters for refreshing user info |

---

##### `refreshUserInfo` (CallSignature)

**Type:** `Promise<null \| User>`

Refresh user information

Forces a refresh of user information from the server, bypassing any cache.
Uses separate userInfoStore for refresh operations (not authentication store).

**Returns:**

Promise resolving to refreshed user information, or
`null`
if refresh fails

**Example:** Refresh user info

```typescript
const user = await userService.refreshUserInfo();
```

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                                  |
| -------- | -------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `params` | `Params` | ✅       | -       | -     | -          | Optional parameters for refreshing user info |

---

#### `register` (Method)

**Type:** `(params: Params) => Promise<null \| User>`

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                                         |
| -------- | -------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `params` | `Params` | ❌       | -       | -     | -          | Registration parameters containing user information |

---

##### `register` (CallSignature)

**Type:** `Promise<null \| User>`

Register a new user

Creates a new user account with the provided registration parameters.
Uses unified userStore for registration state.

**Returns:**

Promise resolving to user information if registration succeeds, or
`null`
if it fails

**Example:** Register user

```typescript
const user = await userService.register({
  email: 'user@example.com',
  password: 'password123',
  code: '123456'
});
```

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                                         |
| -------- | -------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `params` | `Params` | ❌       | -       | -     | -          | Registration parameters containing user information |

---

#### `use` (Method)

**Type:** `(plugin: UserServicePluginType<User, Credential> \| UserServicePluginInterface<User, Credential> \| UserServicePluginType<User, Credential>[] \| UserServicePluginInterface<User, Credential>[]) => this`

#### Parameters

| Name     | Type                                                                                                                                                                                     | Optional | Default | Since | Deprecated | Description                                                     |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------------- |
| `plugin` | `UserServicePluginType<User, Credential> \| UserServicePluginInterface<User, Credential> \| UserServicePluginType<User, Credential>[] \| UserServicePluginInterface<User, Credential>[]` | ❌       | -       | -     | -          | The plugin(s) to register, supporting user service action hooks |

---

##### `use` (CallSignature)

**Type:** `this`

Register a plugin with the user service

Registers one or more plugins that support user service actions.
Plugins can hook into login, logout, register, getUserInfo, and refreshUserInfo actions.

**Returns:**

The UserService instance for method chaining

**Example:** Register plugin with user service hooks

```typescript
userService.use({
  onLoginBefore: async (context) => {
    /* ... */
  },
  onRegisterSuccess: async (context) => {
    /* ... */
  }
});
```

#### Parameters

| Name     | Type                                                                                                                                                                                     | Optional | Default | Since | Deprecated | Description                                                     |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------------- |
| `plugin` | `UserServicePluginType<User, Credential> \| UserServicePluginInterface<User, Credential> \| UserServicePluginType<User, Credential>[] \| UserServicePluginInterface<User, Credential>[]` | ❌       | -       | -     | -          | The plugin(s) to register, supporting user service action hooks |

---

### `UserServiceConfig` (Interface)

**Type:** `interface UserServiceConfig<User, Credential>`

**Since:** `1.8.0`

User service configuration

- Significance: Configuration options for creating a user service instance
- Core idea: Extend gateway service options with unified UserStore configuration
- Main function: Configure user service behavior with unified store
- Main purpose: Simplify user service initialization with single store

**Persistence Behavior (inherited from UserStore):**

- **Default**: Only
  `credential`
  is persisted to storage,
  `user info`
  is stored in memory only
  - When
    `store`
    configuration includes
    `storage`
    and
    `storageKey`
    , **credential will be persisted using
    `storageKey`
    **
  - **Note:**
    `storageKey`
    stores credential (not user info), which is different from AsyncStore
  - User info will NOT be persisted and will be cleared on page reload

- **Dual persistence** (optional): Configure
  `persistUserInfo: true`
  and
  `credentialStorageKey`
  in store options
  - Credential will be persisted to
    `credentialStorageKey`

  - User info will be persisted to
    `storageKey`
    (when
    `credentialStorageKey`
    is different from
    `storageKey`
    )

Design decisions:

- Uses unified UserStore: Single store managing both credential and user info
- Extends GatewayServiceOptions: Inherits gateway, logger, and plugin configuration
- Store configuration: Uses UserServiceStoreOptions for credential storage
- Credential-first persistence: Inherits UserStore's default behavior of persisting only credential

**Example:** Basic usage (persist only credential)

```typescript
const config: UserServiceConfig<User, TokenCredential> = {
  gateway: new UserGateway(),
  logger: new Logger(),
  store: {
    storage: localStorage,
    storageKey: 'auth_token' // This key stores credential, not user info
    // Only credential is persisted to 'auth_token', user info is in memory only
  }
};

const userService = new UserService(config);
```

**Example:** Persist both user info and credential

```typescript
const config: UserServiceConfig<User, TokenCredential> = {
  gateway: new UserGateway(),
  store: {
    storage: localStorage,
    storageKey: 'user-info',
    credentialStorageKey: 'auth_token',
    persistUserInfo: true
    // Both user info and credential are persisted separately
  }
};

const userService = new UserService(config);
```

---

#### `executor` (Property)

**Type:** `GatewayExecutor<User, UserServiceGateway<User, Credential>>`

Gateway executor

Allows user service to support plugin functionality, through which users can access the state of the user service and execute the behavior of the user service.

You can use the basic implementation class GatewayExecutor to create a basic executor.

**Example:** Basic usage

```typescript
const userService = new UserService({
  executor: new GatewayExecutor()
});
```

---

#### `gateway` (Property)

**Type:** `UserServiceGateway<User, Credential>`

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

**Type:** `string \| symbol`

**Default:** `ts
'UserService'
`

Service name

Allows passing a custom service name.
If not provided, the default service name will be used.

**Example:** Basic usage

```typescript
const userService = new UserService({
  serviceName: 'UserService'
});
```

---

#### `store` (Property)

**Type:** `UserStoreInterface<User, Credential> \| UserStoreOptions<UserStateInterface<User, Credential>, string, unknown>`

UserStore instance or configuration options

Allows passing a custom UserStore implementation or configuration options.
If a UserStore instance is provided, it will be used directly.
If options are provided, a default UserStore will be created with those options.
If not provided, a default UserStore will be created.

**Persistence Behavior (inherited from UserStore):**

- **Default**: Only
  `credential`
  is persisted to storage,
  `user info`
  is stored in memory only
  - When
    `storage`
    and
    `storageKey`
    are provided, **credential will be persisted using
    `storageKey`
    **
  - **Note:**
    `storageKey`
    stores credential (not user info), which is different from AsyncStore
  - User info will NOT be persisted and will be cleared on page reload

- **Dual persistence** (optional): Set
  `persistUserInfo: true`
  and provide
  `credentialStorageKey`
  - Credential will be persisted to
    `credentialStorageKey`

  - User info will be persisted to
    `storageKey`
    (when
    `credentialStorageKey`
    is different from
    `storageKey`
    )
  - Both will be restored from storage on initialization

**Example:** Persist only credential (default)

```typescript
const userService = new UserService({
  store: {
    storage: localStorage,
    storageKey: 'auth-token' // This key stores credential, not user info
    // Only credential is persisted to 'auth-token', user info is in memory only
  }
});
```

**Example:** Persist both user info and credential

```typescript
const userService = new UserService({
  store: {
    storage: localStorage,
    storageKey: 'user-info',
    credentialStorageKey: 'auth-token',
    persistUserInfo: true
    // Both user info and credential are persisted separately
  }
});
```

**Example:** Use a custom UserStore instance

```typescript
const userStore = new UserStore({
  storage: localStorage,
  storageKey: 'user-info'
});

const userService = new UserService({
  store: userStore
});


---
```
