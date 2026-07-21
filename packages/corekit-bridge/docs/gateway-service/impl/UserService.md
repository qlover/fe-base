## `src/core/gateway-service/impl/UserService` (Module)

**Type:** `module src/core/gateway-service/impl/UserService`

---

### `UserService` (Class)

**Type:** `class UserService<User, Credential, Cfg>`

User service implementation

Unified service that combines login, registration, and user info functionality into a single cohesive
service. This service uses a unified UserStore to manage authentication state and directly implements
all business logic without delegating to sub-services.

- Significance: Unified service for complete user management (login, registration, user info)
- Core idea: Direct implementation with unified UserStore for authentication state
- Main function: Provide single entry point for all user-related operations
- Main purpose: Simplify user management with unified state and direct implementation

**Version 3.3.0+ Change:**
Starting from version 3.3.0, all methods that return `GatewayResult<T>` now use the
`{ error, data }` object structure.

- If `error` is `null`, `data` contains the successful result (e.g., credential, user info).
- If `error` is non-null (a `GatewayResultFailedInterface`), `data` may be `null` or contain
  additional error context.
- **Business errors** (e.g., invalid credentials, user not found) are returned as `error` in the result.
- **System-level errors** (e.g., network failure, unexpected exceptions) are **thrown** and
  should be caught by the caller.

This design ensures clear separation between expected business failures (handled via result type)
and unexpected system failures (handled via exceptions).

**Persistence Behavior (inherited from UserStore):**

- **Default**: Only `credential` is persisted to storage, `user info` is stored in memory only
  - When `store` configuration includes `storage` and `storageKey`, **credential will be persisted using `storageKey`**
  - **Note:** `storageKey` stores credential (not user info), which is different from AsyncStore
  - User info will NOT be persisted and will be cleared on page reload
  - This ensures credential survives page reloads while user info is fetched fresh each time

- **Dual persistence** (optional): Configure `persistUserInfo: true` and `credentialStorageKey` in store options
  - Credential will be persisted to `credentialStorageKey`
  - User info will be persisted to `storageKey`
  - Both will be restored from storage on service initialization

**Important: Authentication Status After Restore**

- When credential is restored from storage, the store status is **NOT automatically set to `SUCCESS`**
- You must manually decide when to set status to `SUCCESS` based on your application's authentication logic
- See `isAuthenticated()` method documentation for examples of custom authentication logic
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

  2.2.0+ Increase verification of data returned by the gateway, and gateway is required

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
const loginResult = await userService.login({ email, password });
if (loginResult.error) {
  console.error('Login failed', loginResult.error);
} else {
  console.log('Credential:', loginResult.data);
}

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
        this.getStore().emit({
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
        this.getStore().emit({
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
      this.getStore().emit({ error });
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
      this.getStore().emit({
        status: AsyncStoreStatus.SUCCESS,
        loading: false,
        error: null,
        endTime: Date.now()
      });
    }
  }
}
```

**Example:** since 2.1.0 add gateway config

```
const service = new UserService();
const abortController = new AbortController();

service.login({ email, password }, {
  timeout: 1000,
  signal: abortController.signal
})
```

---

#### `constructor` (Constructor)

**Type:** `(gateway: UserServiceGateway<User, Credential, Cfg>, options: UserServiceConfig<User, Credential>) => UserService<User, Credential, Cfg>`

#### Parameters

| Name      | Type                                        | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `gateway` | `UserServiceGateway<User, Credential, Cfg>` | ❌       | -       | -     | -          |             |
| `options` | `UserServiceConfig<User, Credential>`       | ✅       | -       | -     | -          |             |

---

#### `gatewayService` (Property)

**Type:** `GatewayService<User, UserStore<User, Credential, string \| symbol, unknown>, UserServiceGateway<User, Credential, Cfg>>`

---

#### `pullUserWithLogin` (Property)

**Type:** `boolean`

---

#### `serviceName` (Property)

**Type:** `string \| symbol`

---

#### `gateway` (Accessor)

**Type:** `accessor gateway`

---

#### `logger` (Accessor)

**Type:** `accessor logger`

---

#### `getCredential` (Method)

**Type:** `() => Credential \| null`

---

##### `getCredential` (CallSignature)

**Type:** `Credential \| null`

Get the current credential

**Returns:**

The current credential data, or `null` if not available

**Example:** Get current credential

```typescript
const credential = userService.getCredential();
if (credential) {
  console.log('Current credential:', credential.token);
}
```

---

#### `getStore` (Method)

**Type:** `() => UserStoreInterface<User, Credential>`

---

##### `getStore` (CallSignature)

**Type:** `UserStoreInterface<User, Credential>`

Get the store instance

**Returns:**

The user store instance containing credential and user state

---

#### `getUser` (Method)

**Type:** `() => User \| null`

---

##### `getUser` (CallSignature)

**Type:** `User \| null`

Get current user from the unified store

**Returns:**

The current user information, or `null` if not available

**Example:** Get current user

```typescript
const user = userService.getUser();
if (user) {
  console.log('Current user:', user.name);
}
```

---

#### `getUserInfo` (Method)

**Type:** `(params: unknown, config: Cfg) => Promise<GatewayResult<User>>`

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                                                   |
| -------- | --------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------------------------- |
| `params` | `unknown` | ✅       | -       | -     | -          | Optional parameters (e.g., credential token). Defaults to current credential. |
| `config` | `Cfg`     | ✅       | -       | -     | -          | Optional configuration passed to the gateway                                  |

---

##### `getUserInfo` (CallSignature)

**Type:** `Promise<GatewayResult<User>>`

Get current user information

Retrieves user information from the gateway.
If no parameters are provided, the current credential from the store is used.

**Error handling:** Business errors (e.g., user not found) are returned as `GatewayResultFailed`;
system errors are thrown.

**Returns:**

Promise resolving to `GatewayResult<User>` containing user data or error

**Example:** Get user info using stored credential

```typescript
const result = await userService.getUserInfo();
if (result.error) {
  console.error('Failed to get user info', result.error);
} else {
  console.log('User:', result.data);
}
```

**Example:** Get user info with explicit token

```typescript
const result = await userService.getUserInfo({ token: 'xyz' });
```

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                                                   |
| -------- | --------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------------------------- |
| `params` | `unknown` | ✅       | -       | -     | -          | Optional parameters (e.g., credential token). Defaults to current credential. |
| `config` | `Cfg`     | ✅       | -       | -     | -          | Optional configuration passed to the gateway                                  |

---

#### `isAuthenticated` (Method)

**Type:** `() => boolean`

---

##### `isAuthenticated` (CallSignature)

**Type:** `boolean`

Check if user is authenticated

Provides a **basic authentication check** that verifies:

- Store status is `SUCCESS`
- Credential exists

**Important:** This is a basic implementation that may not suit all application scenarios.
Override this method to implement custom authentication logic (e.g., expiration checks,
server validation, requiring user info).

**Note:** When credential is restored from storage, the status is NOT automatically set to `SUCCESS`.
You need to manually set the status based on your validation logic.

**Returns:**

`true` if user is authenticated (has SUCCESS status and credential), `false` otherwise

**Example:** Basic usage

```typescript
if (userService.isAuthenticated()) {
  console.log('User is authenticated');
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
    if (credential.expiresAt && Date.now() >= credential.expiresAt) {
      this.getStore().setCredential(null);
      return false;
    }
    return super.isAuthenticated();
  }
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

Check if value is a valid credential

Type guard to validate credential objects.
Override this method if you need specific validation logic.

**Returns:**

`true` if the value is a valid credential, `false` otherwise

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

Check if value is a valid user object

Type guard to validate user objects.
Override this method if you need specific validation logic (e.g., checking required fields).

**Returns:**

`true` if the value is a valid user object, `false` otherwise

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description        |
| ------- | --------- | -------- | ------- | ----- | ---------- | ------------------ |
| `value` | `unknown` | ❌       | -       | -     | -          | The value to check |

---

#### `login` (Method)

**Type:** `(params: LoginParams, config: Cfg) => Promise<GatewayResult<Credential>>`

#### Parameters

| Name     | Type          | Optional | Default | Since | Deprecated | Description                                                |
| -------- | ------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------- |
| `params` | `LoginParams` | ❌       | -       | -     | -          | Login parameters (email/phone + password, or phone + code) |
| `config` | `Cfg`         | ✅       | -       | -     | -          | Optional configuration passed to the gateway               |

---

##### `login` (CallSignature)

**Type:** `Promise<GatewayResult<Credential>>`

Login user with credentials

Performs user authentication using provided credentials through the configured gateway.
After successful login, automatically fetches user information if `pullUserWithLogin` is true.

**Error handling:**

- Business errors (invalid credentials, missing data) are returned as `GatewayResultFailed`
- System-level errors (network failure, unexpected exceptions) are **thrown** and should be caught by the caller

**Returns:**

Promise resolving to `GatewayResult<Credential>` containing either success data or error

**Example:** Email and password login

```typescript
const result = await userService.login({
  email: 'user@example.com',
  password: 'password123'
});
if (result.error) {
  console.error('Login failed', result.error);
} else {
  console.log('Credential:', result.data);
}
```

**Example:** Login with additional config

```typescript
const result = await userService.login(
  {
    email: 'user@example.com',
    password: 'password123'
  },
  { timeout: 5000 }
);
```

#### Parameters

| Name     | Type          | Optional | Default | Since | Deprecated | Description                                                |
| -------- | ------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------- |
| `params` | `LoginParams` | ❌       | -       | -     | -          | Login parameters (email/phone + password, or phone + code) |
| `config` | `Cfg`         | ✅       | -       | -     | -          | Optional configuration passed to the gateway               |

---

#### `logout` (Method)

**Type:** `(params: unknown, config: Cfg) => Promise<R>`

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                               |
| -------- | --------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------- |
| `params` | `unknown` | ✅       | -       | -     | -          | Optional logout parameters (e.g., revokeAll, redirectUrl) |
| `config` | `Cfg`     | ✅       | -       | -     | -          | Optional configuration passed to the gateway              |

---

##### `logout` (CallSignature)

**Type:** `Promise<R>`

Logout current user

Calls the logout gateway if configured, then clears the user store (credential and user info).

**Note:** This method returns the raw result from the gateway (not wrapped in `GatewayResult`).
Errors are thrown directly and should be handled by the caller.

**Returns:**

Promise resolving to the logout result (type `R`, typically `void`)

**Example:** Basic logout

```typescript
await userService.logout();
```

**Example:** Logout with parameters

```typescript
await userService.logout({ revokeAll: true });
```

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                               |
| -------- | --------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------- |
| `params` | `unknown` | ✅       | -       | -     | -          | Optional logout parameters (e.g., revokeAll, redirectUrl) |
| `config` | `Cfg`     | ✅       | -       | -     | -          | Optional configuration passed to the gateway              |

---

#### `refreshUserInfo` (Method)

**Type:** `(params: unknown, config: Cfg) => Promise<GatewayResult<User>>`

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                                                   |
| -------- | --------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------------------------- |
| `params` | `unknown` | ✅       | -       | -     | -          | Optional parameters (e.g., credential token). Defaults to current credential. |
| `config` | `Cfg`     | ✅       | -       | -     | -          | Optional configuration passed to the gateway                                  |

---

##### `refreshUserInfo` (CallSignature)

**Type:** `Promise<GatewayResult<User>>`

Refresh user information

Forces a fresh fetch of user information from the server, bypassing any cache.
The updated user data is stored in the store.

**Error handling:** Business errors are returned as `GatewayResultFailed`;
system errors are thrown.

**Returns:**

Promise resolving to `GatewayResult<User>` containing refreshed user data or error

**Example:** Refresh user info

```typescript
const result = await userService.refreshUserInfo();
if (result.error) {
  console.error('Refresh failed', result.error);
} else {
  console.log('Updated user:', result.data);
}
```

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                                                   |
| -------- | --------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------------------------- |
| `params` | `unknown` | ✅       | -       | -     | -          | Optional parameters (e.g., credential token). Defaults to current credential. |
| `config` | `Cfg`     | ✅       | -       | -     | -          | Optional configuration passed to the gateway                                  |

---

#### `register` (Method)

**Type:** `(params: unknown, config: Cfg) => Promise<GatewayResult<User>>`

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                           |
| -------- | --------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------- |
| `params` | `unknown` | ❌       | -       | -     | -          | Registration parameters (email, password, name, etc.) |
| `config` | `Cfg`     | ✅       | -       | -     | -          | Optional configuration passed to the gateway          |

---

##### `register` (CallSignature)

**Type:** `Promise<GatewayResult<User>>`

Register a new user

Creates a new user account with the provided registration parameters.
If registration succeeds, the user object is stored in the store.

**Error handling:** Business errors are returned as `GatewayResultFailed`;
system errors are thrown.

**Returns:**

Promise resolving to `GatewayResult<User>` containing the created user or error

**Example:** Register user

```typescript
const result = await userService.register({
  email: 'user@example.com',
  password: 'password123',
  first_name: 'John',
  last_name: 'Doe'
});
if (result.error) {
  console.error('Registration failed', result.error);
} else {
  console.log('User created:', result.data);
}
```

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                           |
| -------- | --------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------- |
| `params` | `unknown` | ❌       | -       | -     | -          | Registration parameters (email, password, name, etc.) |
| `config` | `Cfg`     | ✅       | -       | -     | -          | Optional configuration passed to the gateway          |

---

### `UserServiceConfig` (TypeAlias)

**Type:** `Omit<GatewayServiceOptions<User, unknown>, "serviceName" \| "store" \| "gateway" \| "storage" \| "storageKey"> & Object`

**Since:** `1.8.0`

User service configuration

- Significance: Configuration options for creating a user service instance
- Core idea: Extend gateway service options to support user-specific configuration
- Main function: Configure user service behavior with unified store
- Main purpose: Simplify user service initialization with single store

**Persistence Behavior (inherited from UserStore):**

- **Default**: Only `credential` is persisted to storage, `user info` is stored in memory only
  - When `store` configuration includes `storage` and `storageKey`, **credential will be persisted using `storageKey`**
  - **Note:** `storageKey` stores credential (not user info), which is different from AsyncStore
  - User info will NOT be persisted and will be cleared on page reload

- **Dual persistence** (optional): Configure `persistUserInfo: true` and `credentialStorageKey` in store options
  - Credential will be persisted to `credentialStorageKey`
  - User info will be persisted to `storageKey` (when `credentialStorageKey` is different from `storageKey`)

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

### `UserServiceErrorIds` (Variable)

**Type:** `Object`

**Default:** `{}`

---

#### `InValidCredential` (Property)

**Type:** `"USERSERVICE_INVALID_CREDENTIAL"`

**Default:** `'USERSERVICE_INVALID_CREDENTIAL'`

---

#### `InValidUser` (Property)

**Type:** `"USERSERVICE_INVALID_USER"`

**Default:** `'USERSERVICE_INVALID_USER'`

---

#### `UserGatewayError` (Property)

**Type:** `"user_gateway_error"`

**Default:** `'user_gateway_error'`

---
