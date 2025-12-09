## `src/core/user-auth/interface/UserAuthStoreInterface` (Module)

**Type:** `module src/core/user-auth/interface/UserAuthStoreInterface`

---

### `LOGIN_STATUS` (Enum)

**Type:** `enum LOGIN_STATUS`

Login status enumeration

Represents different states of the authentication process

---

#### `FAILED` (EnumMember)

**Type:** `"failed"`

Authentication failed

---

#### `LOADING` (EnumMember)

**Type:** `"loading"`

Authentication is in progress

---

#### `SUCCESS` (EnumMember)

**Type:** `"success"`

Authentication succeeded

---

### `UserAuthStoreInterface` (Interface)

**Type:** `interface UserAuthStoreInterface<User>`

User authentication store interface

Significance: Manages authentication state and user data persistence
Core idea: Centralized state management for authentication
Main function: Store and retrieve authentication state and user information
Main purpose: Provide consistent state management across authentication operations

**Example:**

```ts
class UserAuthStore implements UserAuthStoreInterface<User> {
  setUserInfo(user: User): void {
    // Store user information
  }

  isAuthenticated(): boolean {
    return this.getLoginStatus() === LOGIN_STATUS.SUCCESS;
  }
}
```

---

#### `authFailed` (Method)

**Type:** `(error: unknown) => void`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description                |
| ------- | --------- | -------- | ------- | ----- | ---------- | -------------------------- |
| `error` | `unknown` | ✅       | -       | -     | -          | Optional error information |

---

##### `authFailed` (CallSignature)

**Type:** `void`

Mark authentication as failed

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description                |
| ------- | --------- | -------- | ------- | ----- | ---------- | -------------------------- |
| `error` | `unknown` | ✅       | -       | -     | -          | Optional error information |

---

#### `authSuccess` (Method)

**Type:** `(userInfo: User, credential: string \| LoginResponseData) => void`

#### Parameters

| Name         | Type                          | Optional | Default | Since | Deprecated | Description                        |
| ------------ | ----------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------- |
| `userInfo`   | `User`                        | ✅       | -       | -     | -          | Optional user information to store |
| `credential` | `string \| LoginResponseData` | ✅       | -       | -     | -          | Optional credential to store       |

---

##### `authSuccess` (CallSignature)

**Type:** `void`

Mark authentication as successful

#### Parameters

| Name         | Type                          | Optional | Default | Since | Deprecated | Description                        |
| ------------ | ----------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------- |
| `userInfo`   | `User`                        | ✅       | -       | -     | -          | Optional user information to store |
| `credential` | `string \| LoginResponseData` | ✅       | -       | -     | -          | Optional credential to store       |

---

#### `getCredential` (Method)

**Type:** `() => null \| string`

---

##### `getCredential` (CallSignature)

**Type:** `null \| string`

Get stored credential

**Returns:**

The stored credential or null if not available

---

#### `getCredentialStorage` (Method)

**Type:** `() => null \| KeyStorageInterface<string, string, unknown>`

---

##### `getCredentialStorage` (CallSignature)

**Type:** `null \| KeyStorageInterface<string, string, unknown>`

Get the current credential storage implementation

**Returns:**

The credential storage instance or null if not set

---

#### `getLoginStatus` (Method)

**Type:** `() => null \| LOGIN_STATUS`

---

##### `getLoginStatus` (CallSignature)

**Type:** `null \| LOGIN_STATUS`

Get the current login status

**Returns:**

The current authentication status or null if not set

---

#### `getUserInfo` (Method)

**Type:** `() => null \| User`

---

##### `getUserInfo` (CallSignature)

**Type:** `null \| User`

Get stored user information

**Returns:**

The stored user information or null if not available

---

#### `getUserStorage` (Method)

**Type:** `() => null \| KeyStorageInterface<string, User, unknown>`

---

##### `getUserStorage` (CallSignature)

**Type:** `null \| KeyStorageInterface<string, User, unknown>`

Get the current key storage implementation

**Returns:**

The key storage instance or null if not set

---

#### `reset` (Method)

**Type:** `() => void`

---

##### `reset` (CallSignature)

**Type:** `void`

Reset all authentication state
Clears user info, login status, and persistent storage

---

#### `setCredential` (Method)

**Type:** `(credential: string) => void`

#### Parameters

| Name         | Type     | Optional | Default | Since | Deprecated | Description             |
| ------------ | -------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `credential` | `string` | ❌       | -       | -     | -          | The credential to store |

---

##### `setCredential` (CallSignature)

**Type:** `void`

Set credential

#### Parameters

| Name         | Type     | Optional | Default | Since | Deprecated | Description             |
| ------------ | -------- | -------- | ------- | ----- | ---------- | ----------------------- |
| `credential` | `string` | ❌       | -       | -     | -          | The credential to store |

---

#### `setCredentialStorage` (Method)

**Type:** `(credentialStorage: KeyStorageInterface<string, string, unknown>) => void`

#### Parameters

| Name                | Type                                           | Optional | Default | Since | Deprecated | Description                                           |
| ------------------- | ---------------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------- |
| `credentialStorage` | `KeyStorageInterface<string, string, unknown>` | ❌       | -       | -     | -          | The credential storage implementation for persistence |

---

##### `setCredentialStorage` (CallSignature)

**Type:** `void`

Set the credential storage implementation

#### Parameters

| Name                | Type                                           | Optional | Default | Since | Deprecated | Description                                           |
| ------------------- | ---------------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------- |
| `credentialStorage` | `KeyStorageInterface<string, string, unknown>` | ❌       | -       | -     | -          | The credential storage implementation for persistence |

---

#### `setUserInfo` (Method)

**Type:** `(params: null \| User) => void`

#### Parameters

| Name     | Type           | Optional | Default | Since | Deprecated | Description                   |
| -------- | -------------- | -------- | ------- | ----- | ---------- | ----------------------------- |
| `params` | `null \| User` | ❌       | -       | -     | -          | The user information to store |

---

##### `setUserInfo` (CallSignature)

**Type:** `void`

Set user information

#### Parameters

| Name     | Type           | Optional | Default | Since | Deprecated | Description                   |
| -------- | -------------- | -------- | ------- | ----- | ---------- | ----------------------------- |
| `params` | `null \| User` | ❌       | -       | -     | -          | The user information to store |

---

#### `setUserStorage` (Method)

**Type:** `(userStorage: KeyStorageInterface<string, User, unknown>) => void`

#### Parameters

| Name          | Type                                         | Optional | Default | Since | Deprecated | Description                                          |
| ------------- | -------------------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `userStorage` | `KeyStorageInterface<string, User, unknown>` | ❌       | -       | -     | -          | The key-value storage implementation for persistence |

---

##### `setUserStorage` (CallSignature)

**Type:** `void`

Set the key storage implementation

#### Parameters

| Name          | Type                                         | Optional | Default | Since | Deprecated | Description                                          |
| ------------- | -------------------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `userStorage` | `KeyStorageInterface<string, User, unknown>` | ❌       | -       | -     | -          | The key-value storage implementation for persistence |

---

#### `startAuth` (Method)

**Type:** `() => void`

---

##### `startAuth` (CallSignature)

**Type:** `void`

Start authentication process
Sets login status to LOADING and clears any previous errors

---

### `UserAuthStoreOptions` (Interface)

**Type:** `interface UserAuthStoreOptions<State>`

---

#### `credentialStorage` (Property)

**Type:** `null \| KeyStorageInterface<string, string, unknown>`

Credential storage implementation

---

#### `defaultState` (Property)

**Type:** `State \| Object`

Create a new state instance

---

#### `userStorage` (Property)

**Type:** `null \| KeyStorageInterface<string, PickUser<State>, unknown>`

User storage implementation

---
