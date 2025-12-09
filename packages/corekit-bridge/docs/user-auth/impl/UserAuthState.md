## `src/core/user-auth/impl/UserAuthState` (Module)

**Type:** `module src/core/user-auth/impl/UserAuthState`

---

### `UserAuthState` (Class)

**Type:** `class UserAuthState<User>`

User authentication store state container

Significance: Encapsulates all authentication-related state in a single object
Core idea: Immutable state container for user authentication data
Main function: Hold user information, credentials, login status, and error state
Main purpose: Provide type-safe state management for authentication operations

**Example:**

```ts
const state = new UserAuthState<User>(
  { id: '123', name: 'John' },
  'auth-token-123'
);
console.log(state.userInfo); // { id: '123', name: 'John' }
console.log(state.credential); // 'auth-token-123'
```

---

#### `new UserAuthState` (Constructor)

**Type:** `(userInfo: null \| User, credential: null \| string) => UserAuthState<User>`

#### Parameters

| Name         | Type             | Optional | Default | Since | Deprecated | Description                                                                                                |
| ------------ | ---------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------------------------------------------------- |
| `userInfo`   | `null \| User`   | ✅       | `null`  | -     | -          | User information object containing profile dataThe user profile data or null if not authenticated          |
| `credential` | `null \| string` | ✅       | `null`  | -     | -          | Authentication credential (typically a token)The authentication credential string or null if not available |

---

#### `credential` (Property)

**Type:** `null \| string`

**Default:** `null`

Authentication credential (typically a token)

**Param:** credential

The authentication credential string or null if not available

---

#### `error` (Property)

**Type:** `unknown`

**Default:** `null`

Authentication error information

Stores error details when authentication operations fail,
such as login failures, network errors, or user info fetch errors

---

#### `loginStatus` (Property)

**Type:** `null \| LOGIN_STATUS`

**Default:** `null`

Current authentication status
Tracks the state of authentication operations (loading, success, failed)

---

#### `userInfo` (Property)

**Type:** `null \| User`

**Default:** `null`

User information object containing profile data

**Param:** userInfo

The user profile data or null if not authenticated

---

### `PickUser` (TypeAlias)

**Type:** `type PickUser<T>`

---
