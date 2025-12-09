## `src/core/bootstrap/BootstrapExecutorPlugin` (Module)

**Type:** `module src/core/bootstrap/BootstrapExecutorPlugin`

---

### `BootstrapExecutorPlugin` (Interface)

**Type:** `interface BootstrapExecutorPlugin`

---

#### `onlyOne` (Property)

**Type:** `boolean`

Indicates if only one instance of this plugin should exist in the executor
When true, attempting to add duplicate plugins will result in a warning

---

#### `pluginName` (Property)

**Type:** `string`

The pluginName of the plugin.

Plugins with the same pluginName will be merged.

---

#### `enabled` (Method)

**Type:** `(name: parameter name, context: ExecutorContext<BootstrapContextValue>) => boolean`

#### Parameters

| Name      | Type                                     | Optional | Default | Since | Deprecated | Description                     |
| --------- | ---------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `name`    | `parameter name`                         | ❌       | -       | -     | -          | Name of the hook being executed |
| `context` | `ExecutorContext<BootstrapContextValue>` | ✅       | -       | -     | -          |                                 |

---

##### `enabled` (CallSignature)

**Type:** `boolean`

Controls whether the plugin is active for specific hook executions

**Returns:**

Boolean indicating if the plugin should be executed

**Example:**

```typescript
enabled(name: keyof ExecutorPlugin, context: ExecutorContextInterface<T>) {
  // Only enable for error handling
  return name === 'onError';
}
```

#### Parameters

| Name      | Type                                     | Optional | Default | Since | Deprecated | Description                     |
| --------- | ---------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `name`    | `parameter name`                         | ❌       | -       | -     | -          | Name of the hook being executed |
| `context` | `ExecutorContext<BootstrapContextValue>` | ✅       | -       | -     | -          |                                 |

---

#### `onBefore` (Method)

**Type:** `(context: ExecutorContext<BootstrapContextValue>) => void \| Promise<void>`

#### Parameters

| Name      | Type                                     | Optional | Default | Since | Deprecated | Description |
| --------- | ---------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<BootstrapContextValue>` | ❌       | -       | -     | -          |             |

---

##### `onBefore` (CallSignature)

**Type:** `void \| Promise<void>`

Hook executed before the main task
Can modify the input data before it reaches the task

**Returns:**

Modified data or Promise of modified data

#### Parameters

| Name      | Type                                     | Optional | Default | Since | Deprecated | Description |
| --------- | ---------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<BootstrapContextValue>` | ❌       | -       | -     | -          |             |

---

#### `onError` (Method)

**Type:** `(context: ExecutorContext<BootstrapContextValue>) => void \| ExecutorError \| Error \| Promise<void \| ExecutorError \| Error>`

#### Parameters

| Name      | Type                                     | Optional | Default | Since | Deprecated | Description |
| --------- | ---------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<BootstrapContextValue>` | ❌       | -       | -     | -          |             |

---

##### `onError` (CallSignature)

**Type:** `void \| ExecutorError \| Error \| Promise<void \| ExecutorError \| Error>`

Error handling hook

- For
  `exec`
  : returning a value or throwing will break the chain
- For
  `execNoError`
  : returning a value or throwing will return the error

Because
`onError`
can break the chain, best practice is each plugin only handle plugin related error

**Returns:**

ExecutorError, void, or Promise of either

#### Parameters

| Name      | Type                                     | Optional | Default | Since | Deprecated | Description |
| --------- | ---------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<BootstrapContextValue>` | ❌       | -       | -     | -          |             |

---

#### `onExec` (Method)

**Type:** `(context: ExecutorContext<unknown>, task: Task<unknown, unknown>) => unknown`

#### Parameters

| Name      | Type                       | Optional | Default | Since | Deprecated | Description         |
| --------- | -------------------------- | -------- | ------- | ----- | ---------- | ------------------- |
| `context` | `ExecutorContext<unknown>` | ❌       | -       | -     | -          |                     |
| `task`    | `Task<unknown, unknown>`   | ❌       | -       | -     | -          | Task to be executed |

---

##### `onExec` (CallSignature)

**Type:** `unknown`

Custom execution logic hook
Only the first plugin with onExec will be used

**Returns:**

Task result or Promise of result

#### Parameters

| Name      | Type                       | Optional | Default | Since | Deprecated | Description         |
| --------- | -------------------------- | -------- | ------- | ----- | ---------- | ------------------- |
| `context` | `ExecutorContext<unknown>` | ❌       | -       | -     | -          |                     |
| `task`    | `Task<unknown, unknown>`   | ❌       | -       | -     | -          | Task to be executed |

---

#### `onSuccess` (Method)

**Type:** `(context: ExecutorContext<BootstrapContextValue>) => void \| Promise<void>`

#### Parameters

| Name      | Type                                     | Optional | Default | Since | Deprecated | Description |
| --------- | ---------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<BootstrapContextValue>` | ❌       | -       | -     | -          |             |

---

##### `onSuccess` (CallSignature)

**Type:** `void \| Promise<void>`

Hook executed after successful task completion
Can transform the task result

**Returns:**

Modified result or Promise of modified result

#### Parameters

| Name      | Type                                     | Optional | Default | Since | Deprecated | Description |
| --------- | ---------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<BootstrapContextValue>` | ❌       | -       | -     | -          |             |

---

### `BootstrapContext` (TypeAlias)

**Type:** `ExecutorContext<BootstrapContextValue>`

---

### `BootstrapContextValue` (TypeAlias)

**Type:** `Object`

---

#### `ioc` (Property)

**Type:** `IOCContainerInterface`

IOC container

---

#### `logger` (Property)

**Type:** `LoggerInterface`

logger

---

#### `root` (Property)

**Type:** `unknown`

starup global object

maybe window or globalThis

---
