## `src/request/interface/RequestExecutorInterface` (Module)

**Type:** `module src/request/interface/RequestExecutorInterface`

---

### `RequestExecutorInterface` (Interface)

**Type:** `interface RequestExecutorInterface<Config>`

**Since:** `3.0.0`

Request executor interface

This interface defines the contract for classes that provide request execution functionality.
It allows you to execute requests with a given configuration.

**Example:**

```typescript
const executor = new RequestExecutor(adapter);
```

---

#### `request` (Method)

**Type:** `(config: Config) => Promise<unknown>`

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                       |
| -------- | -------- | -------- | ------- | ----- | ---------- | --------------------------------- |
| `config` | `Config` | ❌       | -       | -     | -          | The configuration for the request |

---

##### `request` (CallSignature)

**Type:** `Promise<unknown>`

Execute a request with the given configuration

**Returns:**

A promise that resolves to the response of the request

**Example:**

```typescript
const response = await executor.request({ url: '/users', method: 'GET' });
```

#### Parameters

| Name     | Type     | Optional | Default | Since | Deprecated | Description                       |
| -------- | -------- | -------- | ------- | ----- | ---------- | --------------------------------- |
| `config` | `Config` | ❌       | -       | -     | -          | The configuration for the request |

---
