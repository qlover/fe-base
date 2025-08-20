## `src/core/user-auth/interface/UserAuthApiInterface` (Module)

**Type:** `unknown`

---

### `LoginResponseData` (Interface)

**Type:** `unknown`

Login response data structure

Contains authentication token and additional data returned from login/register operations

---

#### `token` (Property)

**Type:** `string`

Authentication token

---

### `UserAuthApiInterface` (Interface)

**Type:** `unknown`

User authentication API interface

Significance: Defines contract for authentication API operations
Core idea: Abstract API implementation details from service layer
Main function: Handle HTTP requests for authentication operations
Main purpose: Provide consistent API interface for different backends

**Example:**

```ts
class UserApi implements UserAuthApiInterface<User> {
  async login(params: LoginParams): Promise<LoginResponseData> {
    // Implementation
  }
}
```

---

#### `getStore` (Method)

**Type:** `() => null \| UserAuthStoreInterface<User>`

---

##### `getStore` (CallSignature)

**Type:** `null \| UserAuthStoreInterface<User>`

Get the current store instance

**Returns:**

The user authentication store or null if not set

---

#### `getUserInfo` (Method)

**Type:** `(params: unknown) => Promise<User>`

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                                   |
| -------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------- |
| `params` | `unknown` | ✅       | -       | -     | -          | Optional parameters for fetching user info (e.g., login data) |

---

##### `getUserInfo` (CallSignature)

**Type:** `Promise<User>`

Get user information

**Returns:**

Promise resolving to user information

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                                                   |
| -------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------- |
| `params` | `unknown` | ✅       | -       | -     | -          | Optional parameters for fetching user info (e.g., login data) |

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

Promise resolving to registration response data (same structure as login)

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description             |
| -------- | --------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `params` | `unknown` | ❌       | -       | -     | -          | Registration parameters |

---

#### `setStore` (Method)

**Type:** `(store: UserAuthStoreInterface<User>) => void`

#### Parameters

| Name    | Type                           | Optional | Default | Since | Deprecated | Description                            |
| ------- | ------------------------------ | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `store` | `UserAuthStoreInterface<User>` | ❌       | -       | -     | -          | The user authentication store instance |

---

##### `setStore` (CallSignature)

**Type:** `void`

Set the user authentication store

#### Parameters

| Name    | Type                           | Optional | Default | Since | Deprecated | Description                            |
| ------- | ------------------------------ | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `store` | `UserAuthStoreInterface<User>` | ❌       | -       | -     | -          | The user authentication store instance |

---
