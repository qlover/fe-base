## `src/request/managers/RequestManager` (Module)

**Type:** `unknown`

---

### `RequestManager` (Class)

**Type:** `unknown`

**Since:** `1.2.2`

Represents a manager for handling HTTP requests.

This interface defines a manager that contains an adapter and an executor.
It provides methods for adding plugins to the executor and making requests.

Why this is an abstract class?

- Because the Executor can be overridden at runtime, the type cannot be fixed,
  so we need to reasonably flexibly control it.
- So we need to redefine the request type when implementing the current class.

---

#### `new RequestManager` (Constructor)

**Type:** `(adapter: RequestAdapterInterface<Config>, executor: AsyncExecutor<ExecutorConfigInterface>) => RequestManager<Config>`

#### Parameters

| Name       | Type                                     | Optional | Default | Since | Deprecated | Description |
| ---------- | ---------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `adapter`  | `RequestAdapterInterface<Config>`        | ❌       | -       | -     | -          |             |
| `executor` | `AsyncExecutor<ExecutorConfigInterface>` | ✅       | `...`   | -     | -          |             |

---

#### `adapter` (Property)

**Type:** `RequestAdapterInterface<Config>`

---

#### `executor` (Property)

**Type:** `AsyncExecutor<ExecutorConfigInterface>`

**Default:** `...`

---

#### `request` (Method)

**Type:** `(config: unknown) => Promise<unknown>`

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                        |
| -------- | --------- | -------- | ------- | ----- | ---------- | ---------------------------------- |
| `config` | `unknown` | ❌       | -       | -     | -          | The configuration for the request. |

---

##### `request` (CallSignature)

**Type:** `Promise<unknown>`

Executes a request with the given configuration.

This method need to be overridden by the subclass, override type definition of request method.

Of course, you can also override its logic.

**Returns:**

A promise that resolves to the response of the request.

#### Parameters

| Name     | Type      | Optional | Default | Since | Deprecated | Description                        |
| -------- | --------- | -------- | ------- | ----- | ---------- | ---------------------------------- |
| `config` | `unknown` | ❌       | -       | -     | -          | The configuration for the request. |

---

#### `usePlugin` (Method)

**Type:** `(plugin: ExecutorPlugin<unknown> \| ExecutorPlugin<unknown>[]) => this`

#### Parameters

| Name     | Type                                                   | Optional | Default | Since | Deprecated | Description                            |
| -------- | ------------------------------------------------------ | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `plugin` | `ExecutorPlugin<unknown> \| ExecutorPlugin<unknown>[]` | ❌       | -       | -     | -          | The plugin to be used by the executor. |

---

##### `usePlugin` (CallSignature)

**Type:** `this`

**Since:** `1.2.2`

Adds a plugin to the executor.

**Returns:**

The current instance of RequestManagerInterface for chaining.

#### Parameters

| Name     | Type                                                   | Optional | Default | Since | Deprecated | Description                            |
| -------- | ------------------------------------------------------ | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `plugin` | `ExecutorPlugin<unknown> \| ExecutorPlugin<unknown>[]` | ❌       | -       | -     | -          | The plugin to be used by the executor. |

---
