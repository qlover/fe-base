## `src/core/gateway-service/interface/UserServiceInterface` (Module)

**Type:** `module src/core/gateway-service/interface/UserServiceInterface`

---

### `LoginInterface` (Interface)

**Type:** `interface LoginInterface<CredentialType, GatewayConfig>`

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

**Type:** `(params: LoginParams) => Promise<CredentialType>`

#### Parameters

| Name     | Type          | Optional | Default | Since | Deprecated | Description                                                |
| -------- | ------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------- |
| `params` | `LoginParams` | ❌       | -       | -     | -          | Login parameters (email/phone + password, or phone + code) |

---

##### `login` (CallSignature)

**Type:** `Promise<CredentialType>`

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

**Example:** with config

```typescript
await authService.login(
  {
    email: 'user@example.com',
    password: 'password123'
  },
  {
    timeout: 5000,
    headers: { 'X-Custom-Header': 'value' }
  }
);
```

#### Parameters

| Name     | Type          | Optional | Default | Since | Deprecated | Description                                                |
| -------- | ------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------- |
| `params` | `LoginParams` | ❌       | -       | -     | -          | Login parameters (email/phone + password, or phone + code) |

---

##### `login` (CallSignature)

**Type:** `Promise<CredentialType>`

#### Parameters

| Name     | Type            | Optional | Default | Since | Deprecated | Description |
| -------- | --------------- | -------- | ------- | ----- | ---------- | ----------- |
| `params` | `LoginParams`   | ❌       | -       | -     | -          |             |
| `config` | `GatewayConfig` | ✅       | -       | -     | -          |             |

---

#### `logout` (Method)

**Type:** `(params: unknown, config: GatewayConfig) => Promise<R>`

#### Parameters

| Name     | Type            | Optional | Default | Since | Deprecated | Description                                                                      |
| -------- | --------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------------- |
| `params` | `unknown`       | ✅       | -       | -     | -          | Optional logout parameters (e.g., revokeAll, redirectUrl, clearCache)            |
| `config` | `GatewayConfig` | ✅       | -       | -     | -          | Optional configuration that can be passed to the gateway for customized behavior |

---

##### `logout` (CallSignature)

**Type:** `Promise<R>`

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

**Example:** with config

```typescript
await authService.logout(null, {
  timeout: 5000,
  headers: { 'X-Custom-Header': 'value' }
});
```

#### Parameters

| Name     | Type            | Optional | Default | Since | Deprecated | Description                                                                      |
| -------- | --------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------------- |
| `params` | `unknown`       | ✅       | -       | -     | -          | Optional logout parameters (e.g., revokeAll, redirectUrl, clearCache)            |
| `config` | `GatewayConfig` | ✅       | -       | -     | -          | Optional configuration that can be passed to the gateway for customized behavior |

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

### `RegisterInterface` (Interface)

**Type:** `interface RegisterInterface<Result, GatewayConfig>`

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

**Type:** `(params: unknown) => Promise<Result>`

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

**Type:** `Promise<Result>`

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

**Example:** Registration with additional config

```typescript
const user = await authService.register(
  {
    email: 'user@example.com',
    password: 'password123',
    code: '123456'
  },
  {
    timeout: 5000,
    headers: { 'X-Custom-Header': 'value' }
  }
);
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

##### `register` (CallSignature)

**Type:** `Promise<Result>`

#### Parameters

| Name     | Type            | Optional | Default | Since | Deprecated | Description |
| -------- | --------------- | -------- | ------- | ----- | ---------- | ----------- |
| `params` | `unknown`       | ❌       | -       | -     | -          |             |
| `config` | `GatewayConfig` | ✅       | -       | -     | -          |             |

---

### `UserInfoGetter` (Interface)

**Type:** `interface UserInfoGetter<User>`

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

**Type:** `interface UserInfoInterface<User, GatewayConfig>`

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

**Type:** `(params: unknown) => Promise<User>`

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

**Type:** `Promise<User>`

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

**Example:** Get user info with config

```typescript
const user = await userAuthService.getUserInfo(
  { token: 'abc123' },
  {
    timeout: 5000,
    headers: { 'X-Custom-Header': 'value' }
  }
);
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

##### `getUserInfo` (CallSignature)

**Type:** `Promise<User>`

#### Parameters

| Name     | Type            | Optional | Default | Since | Deprecated | Description |
| -------- | --------------- | -------- | ------- | ----- | ---------- | ----------- |
| `params` | `unknown`       | ✅       | -       | -     | -          |             |
| `config` | `GatewayConfig` | ✅       | -       | -     | -          |             |

---

#### `refreshUserInfo` (Method)

**Type:** `(params: unknown, config: GatewayConfig) => Promise<User>`

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                  |
| -------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `params` | `unknown` | ✅       | -       | -     | -          | Optional parameters for refreshing user info |

Common parameters include:

- Login data (token, credential) for authentication
- Force refresh flag
- Additional fields as required by the implementation |
  | `config` | `GatewayConfig` | ✅ | - | - | - | Optional configuration that can be passed to the gateway for customized behavior |

---

##### `refreshUserInfo` (CallSignature)

**Type:** `Promise<User>`

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

**Example:** Refresh with config

```typescript
const user = await userAuthService.refreshUserInfo(
  { force: true },
  {
    timeout: 5000,
    headers: { 'X-Custom-Header': 'value' }
  }
);
```

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                  |
| -------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `params` | `unknown` | ✅       | -       | -     | -          | Optional parameters for refreshing user info |

Common parameters include:

- Login data (token, credential) for authentication
- Force refresh flag
- Additional fields as required by the implementation |
  | `config` | `GatewayConfig` | ✅ | - | - | - | Optional configuration that can be passed to the gateway for customized behavior |

---

### `UserServiceGateway` (Interface)

**Type:** `interface UserServiceGateway<User, Credential, GatewayConfig>`

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

**Type:** `(params: unknown) => Promise<User>`

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

**Type:** `Promise<User>`

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

**Example:** Get user info with config

```typescript
const user = await userAuthService.getUserInfo(
  { token: 'abc123' },
  {
    timeout: 5000,
    headers: { 'X-Custom-Header': 'value' }
  }
);
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

##### `getUserInfo` (CallSignature)

**Type:** `Promise<User>`

#### Parameters

| Name     | Type            | Optional | Default | Since | Deprecated | Description |
| -------- | --------------- | -------- | ------- | ----- | ---------- | ----------- |
| `params` | `unknown`       | ✅       | -       | -     | -          |             |
| `config` | `GatewayConfig` | ✅       | -       | -     | -          |             |

---

#### `login` (Method)

**Type:** `(params: LoginParams) => Promise<Credential>`

#### Parameters

| Name     | Type          | Optional | Default | Since | Deprecated | Description                                                |
| -------- | ------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------- |
| `params` | `LoginParams` | ❌       | -       | -     | -          | Login parameters (email/phone + password, or phone + code) |

---

##### `login` (CallSignature)

**Type:** `Promise<Credential>`

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

**Example:** with config

```typescript
await authService.login(
  {
    email: 'user@example.com',
    password: 'password123'
  },
  {
    timeout: 5000,
    headers: { 'X-Custom-Header': 'value' }
  }
);
```

#### Parameters

| Name     | Type          | Optional | Default | Since | Deprecated | Description                                                |
| -------- | ------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------- |
| `params` | `LoginParams` | ❌       | -       | -     | -          | Login parameters (email/phone + password, or phone + code) |

---

##### `login` (CallSignature)

**Type:** `Promise<Credential>`

#### Parameters

| Name     | Type            | Optional | Default | Since | Deprecated | Description |
| -------- | --------------- | -------- | ------- | ----- | ---------- | ----------- |
| `params` | `LoginParams`   | ❌       | -       | -     | -          |             |
| `config` | `GatewayConfig` | ✅       | -       | -     | -          |             |

---

#### `logout` (Method)

**Type:** `(params: unknown, config: GatewayConfig) => Promise<R>`

#### Parameters

| Name     | Type            | Optional | Default | Since | Deprecated | Description                                                                      |
| -------- | --------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------------- |
| `params` | `unknown`       | ✅       | -       | -     | -          | Optional logout parameters (e.g., revokeAll, redirectUrl, clearCache)            |
| `config` | `GatewayConfig` | ✅       | -       | -     | -          | Optional configuration that can be passed to the gateway for customized behavior |

---

##### `logout` (CallSignature)

**Type:** `Promise<R>`

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

**Example:** with config

```typescript
await authService.logout(null, {
  timeout: 5000,
  headers: { 'X-Custom-Header': 'value' }
});
```

#### Parameters

| Name     | Type            | Optional | Default | Since | Deprecated | Description                                                                      |
| -------- | --------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------------- |
| `params` | `unknown`       | ✅       | -       | -     | -          | Optional logout parameters (e.g., revokeAll, redirectUrl, clearCache)            |
| `config` | `GatewayConfig` | ✅       | -       | -     | -          | Optional configuration that can be passed to the gateway for customized behavior |

---

#### `refreshUserInfo` (Method)

**Type:** `(params: unknown, config: GatewayConfig) => Promise<User>`

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                  |
| -------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `params` | `unknown` | ✅       | -       | -     | -          | Optional parameters for refreshing user info |

Common parameters include:

- Login data (token, credential) for authentication
- Force refresh flag
- Additional fields as required by the implementation |
  | `config` | `GatewayConfig` | ✅ | - | - | - | Optional configuration that can be passed to the gateway for customized behavior |

---

##### `refreshUserInfo` (CallSignature)

**Type:** `Promise<User>`

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

**Example:** Refresh with config

```typescript
const user = await userAuthService.refreshUserInfo(
  { force: true },
  {
    timeout: 5000,
    headers: { 'X-Custom-Header': 'value' }
  }
);
```

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                  |
| -------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `params` | `unknown` | ✅       | -       | -     | -          | Optional parameters for refreshing user info |

Common parameters include:

- Login data (token, credential) for authentication
- Force refresh flag
- Additional fields as required by the implementation |
  | `config` | `GatewayConfig` | ✅ | - | - | - | Optional configuration that can be passed to the gateway for customized behavior |

---

#### `register` (Method)

**Type:** `(params: unknown) => Promise<User>`

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

**Type:** `Promise<User>`

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

**Example:** Registration with additional config

```typescript
const user = await authService.register(
  {
    email: 'user@example.com',
    password: 'password123',
    code: '123456'
  },
  {
    timeout: 5000,
    headers: { 'X-Custom-Header': 'value' }
  }
);
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

##### `register` (CallSignature)

**Type:** `Promise<User>`

#### Parameters

| Name     | Type            | Optional | Default | Since | Deprecated | Description |
| -------- | --------------- | -------- | ------- | ----- | ---------- | ----------- |
| `params` | `unknown`       | ❌       | -       | -     | -          |             |
| `config` | `GatewayConfig` | ✅       | -       | -     | -          |             |

---

### `UserServiceInterface` (Interface)

**Type:** `interface UserServiceInterface<User, Credential, GatewayConfig>`

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

**Type:** `(params: unknown) => Promise<User>`

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

**Type:** `Promise<User>`

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

**Example:** Get user info with config

```typescript
const user = await userAuthService.getUserInfo(
  { token: 'abc123' },
  {
    timeout: 5000,
    headers: { 'X-Custom-Header': 'value' }
  }
);
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

##### `getUserInfo` (CallSignature)

**Type:** `Promise<User>`

#### Parameters

| Name     | Type            | Optional | Default | Since | Deprecated | Description |
| -------- | --------------- | -------- | ------- | ----- | ---------- | ----------- |
| `params` | `unknown`       | ✅       | -       | -     | -          |             |
| `config` | `GatewayConfig` | ✅       | -       | -     | -          |             |

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

#### `isCredential` (Method)

**Type:** `(value: unknown) => callsignature isCredential`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description        |
| ------- | --------- | -------- | ------- | ----- | ---------- | ------------------ |
| `value` | `unknown` | ❌       | -       | -     | -          | The value to check |

---

##### `isCredential` (CallSignature)

**Type:** `callsignature isCredential`

Check if value is a credential

Checks if a given value is a valid credential object.
This method can be used to validate credential data before using it.

**Returns:**

`true`
if the value is a valid credential,
`false`
otherwise

**Example:** Validate credential

```typescript
const isValid = userService.isCredential(credential);
if (isValid) {
  console.log('Credential is valid');
} else {
  console.log('Credential is invalid');
}
```

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description        |
| ------- | --------- | -------- | ------- | ----- | ---------- | ------------------ |
| `value` | `unknown` | ❌       | -       | -     | -          | The value to check |

---

#### `isUser` (Method)

**Type:** `(value: unknown) => callsignature isUser`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description        |
| ------- | --------- | -------- | ------- | ----- | ---------- | ------------------ |
| `value` | `unknown` | ❌       | -       | -     | -          | The value to check |

---

##### `isUser` (CallSignature)

**Type:** `callsignature isUser`

Check if value is a user

Checks if a given value is a valid user object.
This method can be used to validate user data before using it.

**Returns:**

`true`
if the value is a valid user,
`false`
otherwise

**Example:** Validate user

```typescript
const isValid = userService.isUser(user);
if (isValid) {
  console.log('User is valid');
} else {
  console.log('User is invalid');
}
```

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description        |
| ------- | --------- | -------- | ------- | ----- | ---------- | ------------------ |
| `value` | `unknown` | ❌       | -       | -     | -          | The value to check |

---

#### `login` (Method)

**Type:** `(params: LoginParams) => Promise<Credential>`

#### Parameters

| Name     | Type          | Optional | Default | Since | Deprecated | Description                                                |
| -------- | ------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------- |
| `params` | `LoginParams` | ❌       | -       | -     | -          | Login parameters (email/phone + password, or phone + code) |

---

##### `login` (CallSignature)

**Type:** `Promise<Credential>`

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

**Example:** with config

```typescript
await authService.login(
  {
    email: 'user@example.com',
    password: 'password123'
  },
  {
    timeout: 5000,
    headers: { 'X-Custom-Header': 'value' }
  }
);
```

#### Parameters

| Name     | Type          | Optional | Default | Since | Deprecated | Description                                                |
| -------- | ------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------- |
| `params` | `LoginParams` | ❌       | -       | -     | -          | Login parameters (email/phone + password, or phone + code) |

---

##### `login` (CallSignature)

**Type:** `Promise<Credential>`

#### Parameters

| Name     | Type            | Optional | Default | Since | Deprecated | Description |
| -------- | --------------- | -------- | ------- | ----- | ---------- | ----------- |
| `params` | `LoginParams`   | ❌       | -       | -     | -          |             |
| `config` | `GatewayConfig` | ✅       | -       | -     | -          |             |

---

#### `logout` (Method)

**Type:** `(params: unknown, config: GatewayConfig) => Promise<R>`

#### Parameters

| Name     | Type            | Optional | Default | Since | Deprecated | Description                                                                      |
| -------- | --------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------------- |
| `params` | `unknown`       | ✅       | -       | -     | -          | Optional logout parameters (e.g., revokeAll, redirectUrl, clearCache)            |
| `config` | `GatewayConfig` | ✅       | -       | -     | -          | Optional configuration that can be passed to the gateway for customized behavior |

---

##### `logout` (CallSignature)

**Type:** `Promise<R>`

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

**Example:** with config

```typescript
await authService.logout(null, {
  timeout: 5000,
  headers: { 'X-Custom-Header': 'value' }
});
```

#### Parameters

| Name     | Type            | Optional | Default | Since | Deprecated | Description                                                                      |
| -------- | --------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------------- |
| `params` | `unknown`       | ✅       | -       | -     | -          | Optional logout parameters (e.g., revokeAll, redirectUrl, clearCache)            |
| `config` | `GatewayConfig` | ✅       | -       | -     | -          | Optional configuration that can be passed to the gateway for customized behavior |

---

#### `refreshUserInfo` (Method)

**Type:** `(params: unknown, config: GatewayConfig) => Promise<User>`

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                  |
| -------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `params` | `unknown` | ✅       | -       | -     | -          | Optional parameters for refreshing user info |

Common parameters include:

- Login data (token, credential) for authentication
- Force refresh flag
- Additional fields as required by the implementation |
  | `config` | `GatewayConfig` | ✅ | - | - | - | Optional configuration that can be passed to the gateway for customized behavior |

---

##### `refreshUserInfo` (CallSignature)

**Type:** `Promise<User>`

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

**Example:** Refresh with config

```typescript
const user = await userAuthService.refreshUserInfo(
  { force: true },
  {
    timeout: 5000,
    headers: { 'X-Custom-Header': 'value' }
  }
);
```

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                  |
| -------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `params` | `unknown` | ✅       | -       | -     | -          | Optional parameters for refreshing user info |

Common parameters include:

- Login data (token, credential) for authentication
- Force refresh flag
- Additional fields as required by the implementation |
  | `config` | `GatewayConfig` | ✅ | - | - | - | Optional configuration that can be passed to the gateway for customized behavior |

---

#### `register` (Method)

**Type:** `(params: unknown) => Promise<User>`

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

**Type:** `Promise<User>`

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

**Example:** Registration with additional config

```typescript
const user = await authService.register(
  {
    email: 'user@example.com',
    password: 'password123',
    code: '123456'
  },
  {
    timeout: 5000,
    headers: { 'X-Custom-Header': 'value' }
  }
);
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

##### `register` (CallSignature)

**Type:** `Promise<User>`

#### Parameters

| Name     | Type            | Optional | Default | Since | Deprecated | Description |
| -------- | --------------- | -------- | ------- | ----- | ---------- | ----------- |
| `params` | `unknown`       | ❌       | -       | -     | -          |             |
| `config` | `GatewayConfig` | ✅       | -       | -     | -          |             |

---
