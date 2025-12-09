## `src/core/gateway-auth/utils/createUserStore` (Module)

**Type:** `unknown`

---

### `createUserStore` (Function)

**Type:** `(storeOptions: UserStoreInterface<User, Credential> \| UserStoreOptions<UserStateInterface<User, Credential>, Key, Opt>) => UserStore<User, Credential, Key, Opt>`

#### Parameters

| Name           | Type                                                                                                       | Optional | Default | Since | Deprecated | Description                                 |
| -------------- | ---------------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `storeOptions` | `UserStoreInterface<User, Credential> \| UserStoreOptions<UserStateInterface<User, Credential>, Key, Opt>` | ✅       | -       | -     | -          | UserStore instance or configuration options |

---

#### `createUserStore` (CallSignature)

**Type:** `UserStore<User, Credential, Key, Opt>`

Create or use provided UserStore instance

Checks if the provided storeOptions is a UserStoreInterface instance.
If it is, returns it directly. Otherwise, creates a new UserStore with the options.

**Returns:**

UserStore instance (implements UserStoreInterface)

#### Parameters

| Name           | Type                                                                                                       | Optional | Default | Since | Deprecated | Description                                 |
| -------------- | ---------------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `storeOptions` | `UserStoreInterface<User, Credential> \| UserStoreOptions<UserStateInterface<User, Credential>, Key, Opt>` | ✅       | -       | -     | -          | UserStore instance or configuration options |

---
