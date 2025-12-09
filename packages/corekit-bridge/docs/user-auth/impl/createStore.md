## `src/core/user-auth/impl/createStore` (Module)

**Type:** `module src/core/user-auth/impl/createStore`

---

### `TokenStorageValueType` (TypeAlias)

**Type:** `KeyStorageInterface<Key, Value> \| TokenStorageOptions<Key> & Object`

Token storage value type definition

Significance: Provides flexible storage configuration options
Core idea: Union type supporting both direct storage instances and configuration objects
Main function: Enable pluggable storage strategies for authentication tokens
Main purpose: Support different storage backends (localStorage, sessionStorage, memory, etc.)

**Example:**

```ts
// Using direct storage instance
const storage: TokenStorageValueType<string, User> = new TokenStorage(
  'user_key'
);

// Using configuration object
const storageConfig: TokenStorageValueType<string, User> = {
  key: 'user_data',
  expiresIn: 'month',
  storage: localStorage
};
```

---

### `createStore` (Function)

**Type:** `(options: UserAuthOptions<State, string>) => UserAuthStoreInterface<PickUser<State>>`

#### Parameters

| Name      | Type                             | Optional | Default | Since | Deprecated | Description                                  |
| --------- | -------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `options` | `UserAuthOptions<State, string>` | ❌       | -       | -     | -          | Authentication service configuration options |

---

#### `createStore` (CallSignature)

**Type:** `UserAuthStoreInterface<PickUser<State>>`

Create and configure user authentication store

Significance: Factory function for creating properly configured authentication stores
Core idea: Flexible store creation supporting both direct instances and configuration objects
Main function: Initialize store with appropriate storage backends and URL token extraction
Main purpose: Simplify store setup with pluggable storage and configuration options

**Returns:**

Configured user authentication store instance

**Example:**

```ts
// Using existing store instance
const store = createStore({
  store: existingStoreInstance
});

// Using configuration object
const store = createStore({
  store: {
    userStorage: {
      key: 'user_profile',
      storage: localStorage,
      expiresIn: 'week'
    },
    credentialStorage: {
      key: 'auth_token',
      storage: sessionStorage
    }
  },
  href: window.location.href,
  tokenKey: 'access_token'
});
```

#### Parameters

| Name      | Type                             | Optional | Default | Since | Deprecated | Description                                  |
| --------- | -------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `options` | `UserAuthOptions<State, string>` | ❌       | -       | -     | -          | Authentication service configuration options |

---
