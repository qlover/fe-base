## `src/core/user-auth/interface/UserAuthInterface` (Module)

**Type:** `module src/core/user-auth/interface/UserAuthInterface`

---

### `AuthServiceInterface` (Interface)

**Type:** `interface AuthServiceInterface<State>`

User authentication service interface

Significance: Provides standardized authentication operations
Core idea: Abstract authentication logic from implementation details
Main function: Handle user authentication lifecycle
Main purpose: Ensure consistent authentication behavior across different implementations

**Example:**

```ts
const userAuth = new UserAuthService({
  api: new UserApi()
});

// Login user
await userAuth.login({
  email: 'test@test.com',
  password: 'test'
});

// Get user info
const user = await userAuth.userInfo();

// Check authentication status
if (userAuth.isAuthenticated()) {
  console.log('User is authenticated');
}

// Logout
await userAuth.logout();
```

---

#### `api` (Accessor)

**Type:** `accessor api`

---

#### `store` (Accessor)

**Type:** `accessor store`

---

#### `isAuthenticated` (Method)

**Type:** `() => boolean`

---

##### `isAuthenticated` (CallSignature)

**Type:** `boolean`

Check if user is currently authenticated

**Returns:**

True if user is authenticated, false otherwise

---

#### `login` (Method)

**Type:** `(params: unknown) => Promise<LoginResponseData>`

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                    |
| -------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------ |
| `params` | `unknown` | ❌       | -       | -     | -          | Login parameters (credentials) |

---

##### `login` (CallSignature)

**Type:** `Promise<LoginResponseData>`

Authenticate user with credentials

**Returns:**

Promise resolving to login response data

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                    |
| -------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------ |
| `params` | `unknown` | ❌       | -       | -     | -          | Login parameters (credentials) |

---

#### `logout` (Method)

**Type:** `() => Promise<void>`

---

##### `logout` (CallSignature)

**Type:** `Promise<void>`

Logout current user

**Returns:**

Promise that resolves when logout is complete

---

#### `register` (Method)

**Type:** `(params: unknown) => Promise<LoginResponseData>`

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description             |
| -------- | --------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `params` | `unknown` | ❌       | -       | -     | -          | Registration parameters |

---

##### `register` (CallSignature)

**Type:** `Promise<LoginResponseData>`

Register a new user

**Returns:**

Promise resolving to registration response data

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description             |
| -------- | --------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `params` | `unknown` | ❌       | -       | -     | -          | Registration parameters |

---

#### `userInfo` (Method)

**Type:** `(loginData: LoginResponseData) => Promise<PickUser<State>>`

#### Parameters

| Name        | Type                | Optional | Default | Since | Deprecated | Description                                       |
| ----------- | ------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `loginData` | `LoginResponseData` | ✅       | -       | -     | -          | Optional login data to use for fetching user info |

---

##### `userInfo` (CallSignature)

**Type:** `Promise<PickUser<State>>`

Get current user information

**Returns:**

Promise resolving to user information

#### Parameters

| Name        | Type                | Optional | Default | Since | Deprecated | Description                                       |
| ----------- | ------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `loginData` | `LoginResponseData` | ✅       | -       | -     | -          | Optional login data to use for fetching user info |

---
