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

#### `new UserService` (Constructor)

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

**Type:** `() => null \| Credential`

---

##### `getCredential` (CallSignature)

**Type:** `null \| Credential`

Get the current credential

Returns the current credential data if available.
This is a convenience method that accesses the state's credential property directly.

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

**Type:** `(params: unknown, config: Cfg) => Promise<User>`

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                                                      |
| -------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------------- |
| `params` | `unknown` | ✅       | -       | -     | -          | Optional parameters for fetching user info                                       |
| `config` | `Cfg`     | ✅       | -       | -     | -          | Optional configuration that can be passed to the gateway for customized behavior |

---

##### `getUserInfo` (CallSignature)

**Type:** `Promise<User>`

Get current user information

Retrieves the current user's information (may use cached data if available).
Uses unified userStore for user info operations.

**Returns:**

Promise resolving to user information, or `null` if not available

**Throws:**

**Example:** Get user info

```typescript
const user = await userService.getUserInfo();
```

**Example:** Get user info with parameters

```typescript
const user = await userService.getUserInfo({ token: 'abc123' });
```

**Example:** Get user info with additional config

```typescript
const user = await userService.getUserInfo(
  { token: 'abc123' },
  {
    timeout: 5000,
    headers: { 'X-Custom-Header': 'value' }
  }
);
```

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                                                      |
| -------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------------- |
| `params` | `unknown` | ✅       | -       | -     | -          | Optional parameters for fetching user info                                       |
| `config` | `Cfg`     | ✅       | -       | -     | -          | Optional configuration that can be passed to the gateway for customized behavior |

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
Different applications may have different authentication requirements:

- Some may need to check credential expiration
- Some may need to verify user info exists
- Some may require additional permission checks
- Some may need to validate credential with server periodically

**Override this method** to implement custom authentication logic based on your application's
specific requirements. The base implementation only checks if status is SUCCESS and credential exists.

**Note:** When credential is restored from storage via `restore()`, the status is NOT automatically
set to SUCCESS. You need to manually set the status based on your validation logic (see examples below).

**Returns:**

`true` if user is authenticated (has SUCCESS status and credential), `false` otherwise

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

#### `isCredential` (Method)

**Type:** `(value: unknown) => callsignature isCredential`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description |
| ------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `value` | `unknown` | ❌       | -       | -     | -          |             |

---

##### `isCredential` (CallSignature)

**Type:** `callsignature isCredential`

Check if value is credential

runs a type guard to check if a value is a credential.

**Returns:**

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description |
| ------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `value` | `unknown` | ❌       | -       | -     | -          |             |

---

#### `isUser` (Method)

**Type:** `(value: unknown) => callsignature isUser`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description |
| ------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `value` | `unknown` | ❌       | -       | -     | -          |             |

---

##### `isUser` (CallSignature)

**Type:** `callsignature isUser`

Check if value is user

runs a type guard to check if a value is a user.

**Returns:**

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description |
| ------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `value` | `unknown` | ❌       | -       | -     | -          |             |

---

#### `login` (Method)

**Type:** `(params: LoginParams, config: Cfg) => Promise<Credential>`

#### Parameters

| Name     | Type          | Optional | Default | Since | Deprecated | Description                                                                      |
| -------- | ------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------------- |
| `params` | `LoginParams` | ❌       | -       | -     | -          | Login parameters (email/phone + password, or phone + code)                       |
| `config` | `Cfg`         | ✅       | -       | -     | -          | Optional configuration that can be passed to the gateway for customized behavior |

---

##### `login` (CallSignature)

**Type:** `Promise<Credential>`

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

**Example:** Login with additional config

```typescript
const credential = await userService.login(
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

| Name     | Type          | Optional | Default | Since | Deprecated | Description                                                                      |
| -------- | ------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------------- |
| `params` | `LoginParams` | ❌       | -       | -     | -          | Login parameters (email/phone + password, or phone + code)                       |
| `config` | `Cfg`         | ✅       | -       | -     | -          | Optional configuration that can be passed to the gateway for customized behavior |

---

#### `logout` (Method)

**Type:** `(params: unknown, config: Cfg) => Promise<R>`

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                                                      |
| -------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------------- |
| `params` | `unknown` | ✅       | -       | -     | -          | Optional logout parameters (e.g., revokeAll, redirectUrl, clearCache)            |
| `config` | `Cfg`     | ✅       | -       | -     | -          | Optional configuration that can be passed to the gateway for customized behavior |

---

##### `logout` (CallSignature)

**Type:** `Promise<R>`

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

**Example:** Logout with additional config

```typescript
await userService.logout(null, {
  timeout: 5000,
  headers: { 'X-Custom-Header': 'value' }
});
```

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                                                      |
| -------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------------- |
| `params` | `unknown` | ✅       | -       | -     | -          | Optional logout parameters (e.g., revokeAll, redirectUrl, clearCache)            |
| `config` | `Cfg`     | ✅       | -       | -     | -          | Optional configuration that can be passed to the gateway for customized behavior |

---

#### `refreshUserInfo` (Method)

**Type:** `(params: unknown, config: Cfg) => Promise<User>`

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                                                      |
| -------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------------- |
| `params` | `unknown` | ✅       | -       | -     | -          | Optional parameters for refreshing user info                                     |
| `config` | `Cfg`     | ✅       | -       | -     | -          | Optional configuration that can be passed to the gateway for customized behavior |

---

##### `refreshUserInfo` (CallSignature)

**Type:** `Promise<User>`

Refresh user information

Forces a refresh of user information from the server, bypassing any cache.
Uses separate userInfoStore for refresh operations (not authentication store).

**Returns:**

Promise resolving to refreshed user information, or `null` if refresh fails

**Example:** Refresh user info

```typescript
const user = await userService.refreshUserInfo();
```

**Example:** Refresh user info with additional config

```typescript
const user = await userService.refreshUserInfo(
  { token: 'abc123' },
  {
    timeout: 5000,
    headers: { 'X-Custom-Header': 'value' }
  }
);
```

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                                                      |
| -------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------------- |
| `params` | `unknown` | ✅       | -       | -     | -          | Optional parameters for refreshing user info                                     |
| `config` | `Cfg`     | ✅       | -       | -     | -          | Optional configuration that can be passed to the gateway for customized behavior |

---

#### `register` (Method)

**Type:** `(params: unknown, config: Cfg) => Promise<User>`

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                                                      |
| -------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------------- |
| `params` | `unknown` | ❌       | -       | -     | -          | Registration parameters containing user information                              |
| `config` | `Cfg`     | ✅       | -       | -     | -          | Optional configuration that can be passed to the gateway for customized behavior |

---

##### `register` (CallSignature)

**Type:** `Promise<User>`

Register a new user

Creates a new user account with the provided registration parameters.
Uses unified userStore for registration state.

**Returns:**

Promise resolving to user information if registration succeeds, or `null` if it fails

**Example:** Register user

```typescript
const user = await userService.register({
  email: 'user@example.com',
  password: 'password123',
  code: '123456'
});
```

**Example:** Register user with additional config

```typescript
const user = await userService.register(
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

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                                                      |
| -------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------------- |
| `params` | `unknown` | ❌       | -       | -     | -          | Registration parameters containing user information                              |
| `config` | `Cfg`     | ✅       | -       | -     | -          | Optional configuration that can be passed to the gateway for customized behavior |

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
