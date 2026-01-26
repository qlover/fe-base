## `src/core/gateway-service/utils/typeGuards` (Module)

**Type:** `module src/core/gateway-service/utils/typeGuards`

---

### `isBaseServiceInterface` (Function)

**Type:** `(obj: unknown) => callsignature isBaseServiceInterface<Store, Gateway>`

#### Parameters

| Name  | Type      | Optional | Default | Since | Deprecated | Description         |
| ----- | --------- | -------- | ------- | ----- | ---------- | ------------------- |
| `obj` | `unknown` | ❌       | -       | -     | -          | The object to check |

---

#### `isBaseServiceInterface` (CallSignature)

**Type:** `callsignature isBaseServiceInterface<Store, Gateway>`

Type guard to check if an object implements BaseServiceInterface

Checks for the presence of key methods and properties required by BaseServiceInterface:

- serviceName (readonly property)
- getStore() method
- getGateway() method
- getLogger() method

**Returns:**

True if obj implements BaseServiceInterface, false otherwise

**Example:**

```typescript
const service = new MyService();
if (isBaseServiceInterface(service)) {
  const store = service.getStore();
  const gateway = service.getGateway();
}
```

#### Parameters

| Name  | Type      | Optional | Default | Since | Deprecated | Description         |
| ----- | --------- | -------- | ------- | ----- | ---------- | ------------------- |
| `obj` | `unknown` | ❌       | -       | -     | -          | The object to check |

---

### `isServiceName` (Function)

**Type:** `(value: unknown) => callsignature isServiceName`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description |
| ------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `value` | `unknown` | ❌       | -       | -     | -          |             |

---

#### `isServiceName` (CallSignature)

**Type:** `callsignature isServiceName`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description |
| ------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `value` | `unknown` | ❌       | -       | -     | -          |             |

---

### `isUserStoreInterface` (Function)

**Type:** `(value: unknown) => callsignature isUserStoreInterface<User, Credential>`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description        |
| ------- | --------- | -------- | ------- | ----- | ---------- | ------------------ |
| `value` | `unknown` | ❌       | -       | -     | -          | The value to check |

---

#### `isUserStoreInterface` (CallSignature)

**Type:** `callsignature isUserStoreInterface<User, Credential>`

Check if the value is a UserStoreInterface instance

Determines if the provided value implements the UserStoreInterface
by checking for required methods: getStore and getCredential.

**Returns:**

`true`
if value is a UserStoreInterface instance,
`false`
otherwise

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description        |
| ------- | --------- | -------- | ------- | ----- | ---------- | ------------------ |
| `value` | `unknown` | ❌       | -       | -     | -          | The value to check |

---
