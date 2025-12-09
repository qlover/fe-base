## `src/core/gateway-auth/utils/createExecutorService` (Module)

**Type:** `unknown`

---

### `createExecutorService` (Function)

**Type:** `(input: undefined \| ServiceInterface \| Config, ServiceClass: Object) => ServiceInterface`

#### Parameters

| Name           | Type                                      | Optional | Default | Since | Deprecated | Description                                                     |
| -------------- | ----------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------------- |
| `input`        | `undefined \| ServiceInterface \| Config` | ❌       | -       | -     | -          | Either an existing service instance or configuration options    |
| `ServiceClass` | `Object`                                  | ❌       | -       | -     | -          | The service class constructor to use if input is config options |

---

#### `createExecutorService` (CallSignature)

**Type:** `ServiceInterface`

Create or reuse an executor service instance

- Significance: Utility function to create service instances or reuse existing ones
- Core idea: Check if input is already a service instance, otherwise create new instance
- Main function: Simplify service initialization logic
- Main purpose: Reduce code duplication when initializing services

Design decisions:

- Type guard check: Uses
  `isExecutorServiceInterface`
  to check if input is already a service
- Type assertion: Returns input as-is if it's already a service instance
- Service creation: Creates new service instance using ServiceClass if input is config options
- Generic types: Supports different service types with proper type inference

**Returns:**

The service instance (either reused or newly created)

**Example:** Basic usage

```typescript
const loginService = createExecutorService(loginServiceConfig, LoginService);
```

**Example:** With existing service instance

```typescript
const existingService = new LoginService(config);
const loginService = createExecutorService(existingService, LoginService);
// Returns existingService without creating a new instance
```

#### Parameters

| Name           | Type                                      | Optional | Default | Since | Deprecated | Description                                                     |
| -------------- | ----------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------------- |
| `input`        | `undefined \| ServiceInterface \| Config` | ❌       | -       | -     | -          | Either an existing service instance or configuration options    |
| `ServiceClass` | `Object`                                  | ❌       | -       | -     | -          | The service class constructor to use if input is config options |

---
