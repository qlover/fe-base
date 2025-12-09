## `src/core/gateway-auth/interface/UserServiceInterface` (Module)

**Type:** `unknown`

---

### `UserServiceExecutorOptions` (Interface)

**Type:** `unknown`

User service executor options

- Significance: Configuration options for executing user service actions
- Core idea: Extend gateway executor options with user-specific store configuration
- Main function: Provide execution context for user service operations
- Main purpose: Enable plugins to access user store and modify execution behavior

Core features:

- User store: Provides access to unified user store for authentication state
- Action execution: Inherits gateway executor options for action execution
- Plugin context: Provides context for plugins to access user state

Design decisions:

- Extends GatewayExecutorOptions: Inherits action execution infrastructure
- User store: Uses unified UserStoreInterface for authentication state
- Type safety: Full type safety for user and credential types

**Example:** Plugin usage

```typescript
executor.use({
  onBefore: (context) => {
    const store = context.parameters.store;
    const user = store.getState().userInfo;
    console.log('Current user:', user);
  }
});
```

---

#### `actionName` (Property)

**Type:** `string`

---

#### `gateway` (Property)

**Type:** `UserServiceGateway<User, Credential>`

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

#### `params` (Property)

**Type:** `unknown`

Parameters for executing gateway method

The parameters to pass to the gateway method.
This is the only mutable property, allowing plugins to modify parameters before execution.

**Example:** Modify params in plugin

```typescript
executor.use({
  onBefore: (context) => {
    // Modify params before execution
    context.parameters.params = {
      ...context.parameters.params,
      additionalField: 'value'
    };
  }
});
```

---

#### `serviceName` (Property)

**Type:** `string \| symbol`

Service name identifier

Used for logging, debugging, and service identification.
Should be set during construction and remain constant.

---

#### `store` (Property)

**Type:** `UserStoreInterface<User, Credential>`

The user store instance

Returns the user store instance.
This store tracks login status, credentials, user info, and authentication errors.

**Returns:**

The user store instance

**Example:** Access user store

```typescript
const user = userService.getUser();
if (user) {
  console.log('User:', user.name);
}
```

---

### `UserServiceGateway` (Interface)

**Type:** `unknown`

**Since:** `1.8.0`

User service gateway interface

- Significance: Defines the combined gateway contract for user-related operations
- Core idea: Combine login, registration, and user info operations into a single gateway
- Main function: Provide unified gateway interface for all user operations
- Main purpose: Enable single gateway to handle complete user lifecycle

This interface combines three separate interfaces:

- `LoginInterface`
  : Handles user authentication (login/logout)
- `RegisterInterface`
  : Handles user registration
- `UserInfoInterface`
  : Handles user information retrieval

**Example:** Gateway implementation

```typescript
class UserGateway implements UserServiceGateway<User, TokenCredential> {
  async login(params: LoginParams): Promise<TokenCredential | null> {
    // Implementation
  }

  async logout(): Promise<void> {
    // Implementation
  }

  async register(params: RegisterParams): Promise<User | null> {
    // Implementation
  }

  async getUserInfo(): Promise<User | null> {
    // Implementation
  }

  async refreshUserInfo(): Promise<User | null> {
    // Implementation
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

### `UserServiceInterface` (Interface)

**Type:** `unknown`

User service interface

- Significance: Defines the complete contract for user service operations
- Core idea: Combine gateway operations with service infrastructure and authentication checking
- Main function: Provide unified user service with login, registration, and user info capabilities
- Main purpose: Enable complete user management in a single service

Core features:

- User operations: Login, logout, register, getUserInfo, refreshUserInfo
- Store access: Access to credential store
- Authentication check: Verify if user is currently authenticated

Design decisions:

- Extends
  `UserServiceGateway`
  : Inherits all gateway operations
- Unified store: Single store manages both credential and user info
- Authentication check: Verifies unified store for authentication status

**Example:** Basic usage

```typescript
class MyUserService implements UserServiceInterface<User, TokenCredential> {
  // Implementation
}
```

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

---

#### `getStore` (Method)

**Type:** `() => UserStoreInterface<User, Credential>`

---

##### `getStore` (CallSignature)

**Type:** `UserStoreInterface<User, Credential>`

Get the credential store instance

Returns the store instance that manages credential state (from login service).
This store tracks login status, credentials, and authentication errors.

**Returns:**

The async store instance for credential state

**Example:** Access credential store

```typescript
const store = userService.getStore();
const credential = store.getResult();
const isLoading = store.getLoading();
```

---

#### `getUser` (Method)

**Type:** `() => null \| User`

---

##### `getUser` (CallSignature)

**Type:** `null \| User`

Get the current user information

Returns the current user information if available. This is a convenience method
that accesses the state's userInfo property directly.

**Returns:**

The current user information, or
`null`
if not available

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

#### `isAuthenticated` (Method)

**Type:** `() => boolean`

---

##### `isAuthenticated` (CallSignature)

**Type:** `boolean`

Check if user is authenticated

Verifies that both credential and user info stores have successful results,
indicating that the user is fully authenticated.

**Returns:**

`true`
if user is authenticated (both stores have valid results),
`false`
otherwise

**Example:** Check authentication status

```typescript
if (userService.isAuthenticated()) {
  console.log('User is authenticated');
} else {
  console.log('User is not authenticated');
}
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

**Type:** `(plugin: UserServicePluginType<User, Credential, unknown> \| UserServicePluginInterface<User, Credential>) => void \| UserServiceInterface<User, Credential>`

#### Parameters

| Name     | Type                                                                                               | Optional | Default | Since | Deprecated | Description                                                                               |
| -------- | -------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------------------------------------- |
| `plugin` | `UserServicePluginType<User, Credential, unknown> \| UserServicePluginInterface<User, Credential>` | ❌       | -       | -     | -          | The plugin to register. Can be either UserServicePluginType or UserServicePluginInterface |

---

##### `use` (CallSignature)

**Type:** `void \| UserServiceInterface<User, Credential>`

Register a plugin for user service

Registers a plugin that can hook into user service actions. Supports two types of plugins:

Plugin types:

- `UserServicePluginType<User, Credential>`
  : Dynamic type that generates hooks based on Actions array
  - Extend by: Pass custom Actions array as third generic parameter
  - Example:
    `UserServicePluginType<User, Credential, ['login', 'logout', 'customAction']>`

  - Use case: When you need custom actions or want type-safe dynamic hook generation

- `UserServicePluginInterface<User, Credential>`
  : Declarative interface with fixed hook definitions
  - Extend by: Extend the interface or implement it with additional properties
  - Example:
    `interface MyPlugin extends UserServicePluginInterface<User, Credential> { ... }`

  - Use case: When you need explicit hook definitions and better IDE autocomplete

**Returns:**

The service instance for method chaining, or void

**Example:** Using UserServicePluginType with default actions

```typescript
userService.use({
  pluginName: 'MyPlugin',
  onLoginBefore: async (context) => {
    console.log('Before login');
  }
});
```

**Example:** Using UserServicePluginType with custom actions

```typescript
type CustomActions = ['login', 'logout', 'customAction'] as const;
const plugin: UserServicePluginType<User, Credential, CustomActions> = {
  pluginName: 'CustomPlugin',
  onCustomActionBefore: async (context) => { /* ... */ }
};
userService.use(plugin);
```

**Example:** Using UserServicePluginInterface

```typescript
const plugin: UserServicePluginInterface<User, Credential> = {
  pluginName: 'MyPlugin',
  onLoginBefore: async (context) => {
    console.log('Before login');
  },
  onLoginSuccess: async (context) => {
    console.log('Login successful');
  }
};
userService.use(plugin);
```

**Example:** Extending UserServicePluginInterface

```typescript
interface MyCustomPlugin<User, Credential>
  extends UserServicePluginInterface<User, Credential> {
  onCustomActionBefore?: (context: UserPluginContext<User, Credential>) => void;
  onCustomActionAfter?: (context: UserPluginContext<User, Credential>) => void;
}

const plugin: MyCustomPlugin<User, Credential> = {
  pluginName: 'CustomPlugin',
  onLoginBefore: async (context) => {
    /* ... */
  },
  onCustomActionBefore: async (context) => {
    /* ... */
  },
  onCustomActionAfter: async (context) => {
    /* ... */
  }
};
userService.use(plugin);
```

#### Parameters

| Name     | Type                                                                                               | Optional | Default | Since | Deprecated | Description                                                                               |
| -------- | -------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------------------------------------- |
| `plugin` | `UserServicePluginType<User, Credential, unknown> \| UserServicePluginInterface<User, Credential>` | ❌       | -       | -     | -          | The plugin to register. Can be either UserServicePluginType or UserServicePluginInterface |

---

### `UserServicePluginInterface` (Interface)

**Type:** `unknown`

User service plugin interface

- Significance: Defines the contract for user service plugins with action-specific hooks
- Core idea: Provide action-specific hooks for user service operations
- Main function: Enable plugins to hook into specific user service actions
- Main purpose: Allow custom logic execution at specific points in user service lifecycle

Core features:

- Action-specific hooks: Provides hooks for each user service action
- Standard executor hooks: Inherits onBefore, onSuccess, onError from ExecutorPlugin
- Type-safe context: Full type safety for user and credential types
- Optional hooks: All hooks are optional, allowing flexible plugin implementation
- Declarative interface: Explicit hook definitions for better IDE autocomplete

Supported action hooks:

- Login:
  `onLoginBefore`
  ,
  `onLoginSuccess`

- Logout:
  `onLogoutBefore`
  ,
  `onLogoutSuccess`

- Register:
  `onRegisterBefore`
  ,
  `onRegisterSuccess`

- User Info:
  `onUserInfoBefore`
  ,
  `onUserInfoSuccess`

- Refresh User Info:
  `onRefreshUserInfoBefore`
  ,
  `onRefreshUserInfoSuccess`

Plugin type comparison:

- `UserServicePluginType`
  : Dynamic type that generates hooks based on Actions array
  - Extend by: Pass custom Actions array as third generic parameter
  - Use case: When you need custom actions or want type-safe dynamic hook generation
- `UserServicePluginInterface`
  : Declarative interface with fixed hook definitions
  - Extend by: Extend the interface or implement it with additional properties
  - Use case: When you need explicit hook definitions and better IDE autocomplete

Design decisions:

- Extends ExecutorPlugin: Inherits standard executor hooks
- Action-specific hooks: Provides convenience hooks for each action
- Optional hooks: All hooks are optional for flexibility
- Async support: All hooks support both sync and async execution
- Declarative approach: Fixed hook definitions provide better IDE support

**Example:** Basic plugin implementation

```typescript
const plugin: UserServicePluginInterface<User, Credential> = {
  pluginName: 'MyUserPlugin',
  onLoginBefore: async (context) => {
    console.log('Before login');
    // Access user store
    const store = context.parameters.store;
    const currentUser = store.getState().userInfo;
  },
  onLoginSuccess: async (context) => {
    console.log('Login successful');
    // Access result
    const credential = context.result;
  },
  onLogoutBefore: async (context) => {
    console.log('Before logout');
  }
};

userService.use(plugin);
```

**Example:** Extend interface for custom hooks

```typescript
interface MyCustomPlugin<User, Credential>
  extends UserServicePluginInterface<User, Credential> {
  onCustomActionBefore?: (context: UserPluginContext<User, Credential>) => void;
  onCustomActionAfter?: (context: UserPluginContext<User, Credential>) => void;
}

const plugin: MyCustomPlugin<User, Credential> = {
  pluginName: 'CustomPlugin',
  onLoginBefore: async (context) => {
    /* ... */
  },
  onCustomActionBefore: async (context) => {
    /* ... */
  },
  onCustomActionAfter: async (context) => {
    /* ... */
  }
};
```

---

#### `onlyOne` (Property)

**Type:** `boolean`

Indicates if only one instance of this plugin should exist in the executor
When true, attempting to add duplicate plugins will result in a warning

---

#### `pluginName` (Property)

**Type:** `string`

The pluginName of the plugin.

Plugins with the same pluginName will be merged.

---

#### `enabled` (Method)

**Type:** `(name: unknown, context: ExecutorContext<UserServiceExecutorOptions<User, Credential>>) => boolean`

#### Parameters

| Name      | Type                                                            | Optional | Default | Since | Deprecated | Description                     |
| --------- | --------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `name`    | `unknown`                                                       | ❌       | -       | -     | -          | Name of the hook being executed |
| `context` | `ExecutorContext<UserServiceExecutorOptions<User, Credential>>` | ✅       | -       | -     | -          |                                 |

---

##### `enabled` (CallSignature)

**Type:** `boolean`

Controls whether the plugin is active for specific hook executions

**Returns:**

Boolean indicating if the plugin should be executed

**Example:**

```typescript
enabled(name: keyof ExecutorPlugin, context: ExecutorContextInterface<T>) {
  // Only enable for error handling
  return name === 'onError';
}
```

#### Parameters

| Name      | Type                                                            | Optional | Default | Since | Deprecated | Description                     |
| --------- | --------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `name`    | `unknown`                                                       | ❌       | -       | -     | -          | Name of the hook being executed |
| `context` | `ExecutorContext<UserServiceExecutorOptions<User, Credential>>` | ✅       | -       | -     | -          |                                 |

---

#### `onBefore` (Method)

**Type:** `(context: ExecutorContext<UserServiceExecutorOptions<User, Credential>>) => void \| Promise<void>`

#### Parameters

| Name      | Type                                                            | Optional | Default | Since | Deprecated | Description |
| --------- | --------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<UserServiceExecutorOptions<User, Credential>>` | ❌       | -       | -     | -          |             |

---

##### `onBefore` (CallSignature)

**Type:** `void \| Promise<void>`

Hook executed before the main task
Can modify the input data before it reaches the task

**Returns:**

Modified data or Promise of modified data

#### Parameters

| Name      | Type                                                            | Optional | Default | Since | Deprecated | Description |
| --------- | --------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<UserServiceExecutorOptions<User, Credential>>` | ❌       | -       | -     | -          |             |

---

#### `onError` (Method)

**Type:** `(context: ExecutorContext<UserServiceExecutorOptions<User, Credential>>) => void \| ExecutorError \| Error \| Promise<void \| ExecutorError \| Error>`

#### Parameters

| Name      | Type                                                            | Optional | Default | Since | Deprecated | Description |
| --------- | --------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<UserServiceExecutorOptions<User, Credential>>` | ❌       | -       | -     | -          |             |

---

##### `onError` (CallSignature)

**Type:** `void \| ExecutorError \| Error \| Promise<void \| ExecutorError \| Error>`

Error handling hook

- For
  `exec`
  : returning a value or throwing will break the chain
- For
  `execNoError`
  : returning a value or throwing will return the error

Because
`onError`
can break the chain, best practice is each plugin only handle plugin related error

**Returns:**

ExecutorError, void, or Promise of either

#### Parameters

| Name      | Type                                                            | Optional | Default | Since | Deprecated | Description |
| --------- | --------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<UserServiceExecutorOptions<User, Credential>>` | ❌       | -       | -     | -          |             |

---

#### `onExec` (Method)

**Type:** `(context: ExecutorContext<unknown>, task: Task<unknown, unknown>) => unknown`

#### Parameters

| Name      | Type                       | Optional | Default | Since | Deprecated | Description         |
| --------- | -------------------------- | -------- | ------- | ----- | ---------- | ------------------- |
| `context` | `ExecutorContext<unknown>` | ❌       | -       | -     | -          |                     |
| `task`    | `Task<unknown, unknown>`   | ❌       | -       | -     | -          | Task to be executed |

---

##### `onExec` (CallSignature)

**Type:** `unknown`

Custom execution logic hook
Only the first plugin with onExec will be used

**Returns:**

Task result or Promise of result

#### Parameters

| Name      | Type                       | Optional | Default | Since | Deprecated | Description         |
| --------- | -------------------------- | -------- | ------- | ----- | ---------- | ------------------- |
| `context` | `ExecutorContext<unknown>` | ❌       | -       | -     | -          |                     |
| `task`    | `Task<unknown, unknown>`   | ❌       | -       | -     | -          | Task to be executed |

---

#### `onLoginBefore` (Method)

**Type:** `(context: UserPluginContext<User, Credential>) => void \| Promise<void>`

#### Parameters

| Name      | Type                                  | Optional | Default | Since | Deprecated | Description             |
| --------- | ------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `context` | `UserPluginContext<User, Credential>` | ❌       | -       | -     | -          | The user plugin context |

---

##### `onLoginBefore` (CallSignature)

**Type:** `void \| Promise<void>`

Hook called before login action

#### Parameters

| Name      | Type                                  | Optional | Default | Since | Deprecated | Description             |
| --------- | ------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `context` | `UserPluginContext<User, Credential>` | ❌       | -       | -     | -          | The user plugin context |

---

#### `onLoginSuccess` (Method)

**Type:** `(context: UserPluginContext<User, Credential>) => void \| Promise<void>`

#### Parameters

| Name      | Type                                  | Optional | Default | Since | Deprecated | Description             |
| --------- | ------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `context` | `UserPluginContext<User, Credential>` | ❌       | -       | -     | -          | The user plugin context |

---

##### `onLoginSuccess` (CallSignature)

**Type:** `void \| Promise<void>`

Hook called after login action succeeds

#### Parameters

| Name      | Type                                  | Optional | Default | Since | Deprecated | Description             |
| --------- | ------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `context` | `UserPluginContext<User, Credential>` | ❌       | -       | -     | -          | The user plugin context |

---

#### `onLogoutBefore` (Method)

**Type:** `(context: UserPluginContext<User, Credential>) => void \| Promise<void>`

#### Parameters

| Name      | Type                                  | Optional | Default | Since | Deprecated | Description             |
| --------- | ------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `context` | `UserPluginContext<User, Credential>` | ❌       | -       | -     | -          | The user plugin context |

---

##### `onLogoutBefore` (CallSignature)

**Type:** `void \| Promise<void>`

Hook called before logout action

#### Parameters

| Name      | Type                                  | Optional | Default | Since | Deprecated | Description             |
| --------- | ------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `context` | `UserPluginContext<User, Credential>` | ❌       | -       | -     | -          | The user plugin context |

---

#### `onLogoutSuccess` (Method)

**Type:** `(context: UserPluginContext<User, Credential>) => void \| Promise<void>`

#### Parameters

| Name      | Type                                  | Optional | Default | Since | Deprecated | Description             |
| --------- | ------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `context` | `UserPluginContext<User, Credential>` | ❌       | -       | -     | -          | The user plugin context |

---

##### `onLogoutSuccess` (CallSignature)

**Type:** `void \| Promise<void>`

Hook called after logout action succeeds

#### Parameters

| Name      | Type                                  | Optional | Default | Since | Deprecated | Description             |
| --------- | ------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `context` | `UserPluginContext<User, Credential>` | ❌       | -       | -     | -          | The user plugin context |

---

#### `onRefreshUserInfoBefore` (Method)

**Type:** `(context: UserPluginContext<User, Credential>) => void \| Promise<void>`

#### Parameters

| Name      | Type                                  | Optional | Default | Since | Deprecated | Description             |
| --------- | ------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `context` | `UserPluginContext<User, Credential>` | ❌       | -       | -     | -          | The user plugin context |

---

##### `onRefreshUserInfoBefore` (CallSignature)

**Type:** `void \| Promise<void>`

Hook called before refreshUserInfo action

#### Parameters

| Name      | Type                                  | Optional | Default | Since | Deprecated | Description             |
| --------- | ------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `context` | `UserPluginContext<User, Credential>` | ❌       | -       | -     | -          | The user plugin context |

---

#### `onRefreshUserInfoSuccess` (Method)

**Type:** `(context: UserPluginContext<User, Credential>) => void \| Promise<void>`

#### Parameters

| Name      | Type                                  | Optional | Default | Since | Deprecated | Description             |
| --------- | ------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `context` | `UserPluginContext<User, Credential>` | ❌       | -       | -     | -          | The user plugin context |

---

##### `onRefreshUserInfoSuccess` (CallSignature)

**Type:** `void \| Promise<void>`

Hook called after refreshUserInfo action succeeds

#### Parameters

| Name      | Type                                  | Optional | Default | Since | Deprecated | Description             |
| --------- | ------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `context` | `UserPluginContext<User, Credential>` | ❌       | -       | -     | -          | The user plugin context |

---

#### `onRegisterBefore` (Method)

**Type:** `(context: UserPluginContext<User, Credential>) => void \| Promise<void>`

#### Parameters

| Name      | Type                                  | Optional | Default | Since | Deprecated | Description             |
| --------- | ------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `context` | `UserPluginContext<User, Credential>` | ❌       | -       | -     | -          | The user plugin context |

---

##### `onRegisterBefore` (CallSignature)

**Type:** `void \| Promise<void>`

Hook called before register action

#### Parameters

| Name      | Type                                  | Optional | Default | Since | Deprecated | Description             |
| --------- | ------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `context` | `UserPluginContext<User, Credential>` | ❌       | -       | -     | -          | The user plugin context |

---

#### `onRegisterSuccess` (Method)

**Type:** `(context: UserPluginContext<User, Credential>) => void \| Promise<void>`

#### Parameters

| Name      | Type                                  | Optional | Default | Since | Deprecated | Description             |
| --------- | ------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `context` | `UserPluginContext<User, Credential>` | ❌       | -       | -     | -          | The user plugin context |

---

##### `onRegisterSuccess` (CallSignature)

**Type:** `void \| Promise<void>`

Hook called after register action succeeds

#### Parameters

| Name      | Type                                  | Optional | Default | Since | Deprecated | Description             |
| --------- | ------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `context` | `UserPluginContext<User, Credential>` | ❌       | -       | -     | -          | The user plugin context |

---

#### `onSuccess` (Method)

**Type:** `(context: ExecutorContext<UserServiceExecutorOptions<User, Credential>>) => void \| Promise<void>`

#### Parameters

| Name      | Type                                                            | Optional | Default | Since | Deprecated | Description |
| --------- | --------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<UserServiceExecutorOptions<User, Credential>>` | ❌       | -       | -     | -          |             |

---

##### `onSuccess` (CallSignature)

**Type:** `void \| Promise<void>`

Hook executed after successful task completion
Can transform the task result

**Returns:**

Modified result or Promise of modified result

#### Parameters

| Name      | Type                                                            | Optional | Default | Since | Deprecated | Description |
| --------- | --------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<UserServiceExecutorOptions<User, Credential>>` | ❌       | -       | -     | -          |             |

---

#### `onUserInfoBefore` (Method)

**Type:** `(context: UserPluginContext<User, Credential>) => void \| Promise<void>`

#### Parameters

| Name      | Type                                  | Optional | Default | Since | Deprecated | Description             |
| --------- | ------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `context` | `UserPluginContext<User, Credential>` | ❌       | -       | -     | -          | The user plugin context |

---

##### `onUserInfoBefore` (CallSignature)

**Type:** `void \| Promise<void>`

Hook called before getUserInfo action

#### Parameters

| Name      | Type                                  | Optional | Default | Since | Deprecated | Description             |
| --------- | ------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `context` | `UserPluginContext<User, Credential>` | ❌       | -       | -     | -          | The user plugin context |

---

#### `onUserInfoSuccess` (Method)

**Type:** `(context: UserPluginContext<User, Credential>) => void \| Promise<void>`

#### Parameters

| Name      | Type                                  | Optional | Default | Since | Deprecated | Description             |
| --------- | ------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `context` | `UserPluginContext<User, Credential>` | ❌       | -       | -     | -          | The user plugin context |

---

##### `onUserInfoSuccess` (CallSignature)

**Type:** `void \| Promise<void>`

Hook called after getUserInfo action succeeds

#### Parameters

| Name      | Type                                  | Optional | Default | Since | Deprecated | Description             |
| --------- | ------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `context` | `UserPluginContext<User, Credential>` | ❌       | -       | -     | -          | The user plugin context |

---

### `UserPluginContext` (TypeAlias)

**Type:** `ExecutorContext<UserServiceExecutorOptions<User, Credential>>`

User plugin context type

- Significance: Type alias for user service plugin execution context
- Core idea: Provides type-safe context for user service plugins
- Main function: Enable plugins to access user service execution context
- Main purpose: Simplify plugin context type usage

This type alias provides a convenient way to reference the execution context
used by user service plugins. It includes access to:

- User store: Access to unified user store for authentication state
- Gateway: Access to user service gateway methods
- Action information: Current action name and parameters
- Logger: Access to logging functionality

**Example:** Plugin hook usage

```typescript
const plugin: UserServicePluginInterface<User, Credential> = {
  onLoginBefore: async (context: UserPluginContext<User, Credential>) => {
    const store = context.parameters.store;
    const user = store.getState().userInfo;
    console.log('Before login, current user:', user);
  }
};
```

---

### `UserServicePluginType` (TypeAlias)

**Type:** `ExecutorPlugin<UserServiceExecutorOptions<User, Credential>> & GatewayBasePluginType<Actions, User, UserServiceGateway<User, Credential>>`

User service plugin type

- Significance: Type-safe plugin interface for user service with action-specific hooks
- Core idea: Combine executor plugin with gateway base plugin for user service
- Main function: Provide type-safe plugin interface with action-specific hooks
- Main purpose: Enable plugins to hook into specific user service actions

Core features:

- Executor plugin: Inherits standard executor plugin hooks (onBefore, onSuccess, onError)
- Action-specific hooks: Provides hooks for specific actions (e.g.,
  `onLoginBefore`
  ,
  `onLogoutSuccess`
  )
- Type-safe: Full type safety for context and parameters
- Flexible actions: Supports custom action arrays or uses all predefined actions by default
- Dynamic type generation: Hook types are dynamically generated based on the Actions array

Plugin type comparison:

- `UserServicePluginType`
  : Dynamic type that generates hooks based on Actions array
  - Extend by: Pass custom Actions array as third generic parameter
  - Use case: When you need custom actions or want type-safe dynamic hook generation
- `UserServicePluginInterface`
  : Declarative interface with fixed hook definitions
  - Extend by: Extend the interface or implement it with additional properties
  - Use case: When you need explicit hook definitions and better IDE autocomplete

Design decisions:

- Extends
  `ExecutorPlugin`
  : Provides standard executor hooks
- Intersects with
  `GatewayBasePluginType`
  : Adds action-specific hooks
- Default actions: Uses all
  `ServiceActionType`
  actions if not specified
- Generic types: Supports different credential and user types
- Dynamic generation: Hook types are computed from Actions array for flexibility

**Example:** Basic plugin with all actions

```typescript
const plugin: UserServicePluginType<User, Credential> = {
  pluginName: 'MyPlugin',
  onLoginBefore: async (context) => {
    // Called before login
  },
  onLogoutSuccess: async (context) => {
    // Called after logout succeeds
  }
};
```

**Example:** Plugin with custom actions

```typescript
type CustomActions = ['login', 'logout', 'customAction'] as const;
const plugin: UserServicePluginType<User, Credential, CustomActions> = {
  pluginName: 'CustomPlugin',
  onLoginBefore: async (context) => { /* ... */ },
  onCustomActionBefore: async (context) => { /* ... */ }
};
```

---
