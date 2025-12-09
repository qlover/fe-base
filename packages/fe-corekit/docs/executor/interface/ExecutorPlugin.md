## `src/executor/interface/ExecutorPlugin` (Module)

**Type:** `module src/executor/interface/ExecutorPlugin`

---

### `ExecutorPlugin` (Interface)

**Type:** `interface ExecutorPlugin<T>`

Base plugin class for extending executor functionality.

Plugins provide a way to intercept and modify the execution flow at different stages:

- Before execution (onBefore)
- After successful execution (onSuccess)
- On error (onError)
- Custom execution logic (onExec)

LifeCycle:

**onBefore**

- onBefore can modify the input data before it reaches the task, before exec is called.
- The parameter of the first plugin's onBefore is the input data of exec.
- The parameter of other plugins' onBefore is the return value of previous plugin's onBefore.
- Also, not return value, will use first plugin's onBefore return value or exec's input data.
- The parameter of the first plugin's onBefore is the input data of exec.
- If any plugin's onBefore throws an error, it immediately stops the onBefore chain and enters the onError chain.

**onExec**

- onExec can modify the task before it is executed.
- Use first plugin's onExec return value or exec's task.
- The exec execution is only allowed to be modified once, so only the first onExec lifecycle method registered in the plugins list will be used.

**onSuccess**

- When call exec, onSuccess will be executed after onExec.
- onSuccess accept the result of previous plugin's onSuccess, and can return a new result to the next plugin's onSuccess.
- That means, if any plugin's onSuccess returns a new value, the next plugin's onSuccess will accept the value of previous plugin's onSuccess as parameter,
- and can continue to return a new value, until the last plugin's onSuccess. The entire chain will not stop.
- The parameter of the first plugin's onSuccess is the result of exec.
- If any plugin's onSuccess throws an error, it immediately stops the onSuccess chain and enters the onError chain.

**onError**

- When an error occurs during call exec, all plugins' onError will be ordered executed.
- After exec, all errors will be wrapped with ExecutorError.
- If onError of any of the plugins returns an error, the error is thrown and the entire chain is stopped, but execNoError only return the error.
- If any plugin's onError throws an error, it immediately stops the entire chain and throws the error, since errors in the error chain cannot be caught. Whether exec or execNoError.
- If all plugins' onError neither return nor throw an error, wrapping raw Errors with ExecutorError and throw.
- If execNoError is called, the first error encountered is returned, and the entire lifecycle is terminated.

**execNoError returns all errors as they are.**

**Template:** R

Type of result after processing

**Example:**

```typescript
class LoggerPlugin extends ExecutorPlugin {
  onBefore(data: unknown) {
    console.log('Before execution:', data);
    return data;
  }

  onSuccess(result: unknown) {
    console.log('Execution succeeded:', result);
    return result;
  }

  onError(error: Error) {
    console.error('Execution failed:', error);
    throw error;
  }
}
```

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

**Type:** `(name: parameter name, context: ExecutorContext<T>) => boolean`

#### Parameters

| Name      | Type                 | Optional | Default | Since | Deprecated | Description                     |
| --------- | -------------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `name`    | `parameter name`     | ❌       | -       | -     | -          | Name of the hook being executed |
| `context` | `ExecutorContext<T>` | ✅       | -       | -     | -          |                                 |

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

| Name      | Type                 | Optional | Default | Since | Deprecated | Description                     |
| --------- | -------------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `name`    | `parameter name`     | ❌       | -       | -     | -          | Name of the hook being executed |
| `context` | `ExecutorContext<T>` | ✅       | -       | -     | -          |                                 |

---

#### `onBefore` (Method)

**Type:** `(context: ExecutorContext<T>) => void \| Promise<void>`

#### Parameters

| Name      | Type                 | Optional | Default | Since | Deprecated | Description |
| --------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<T>` | ❌       | -       | -     | -          |             |

---

##### `onBefore` (CallSignature)

**Type:** `void \| Promise<void>`

Hook executed before the main task
Can modify the input data before it reaches the task

**Returns:**

Modified data or Promise of modified data

#### Parameters

| Name      | Type                 | Optional | Default | Since | Deprecated | Description |
| --------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<T>` | ❌       | -       | -     | -          |             |

---

#### `onError` (Method)

**Type:** `(context: ExecutorContext<T>) => void \| ExecutorError \| Error \| Promise<void \| ExecutorError \| Error>`

#### Parameters

| Name      | Type                 | Optional | Default | Since | Deprecated | Description |
| --------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<T>` | ❌       | -       | -     | -          |             |

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

| Name      | Type                 | Optional | Default | Since | Deprecated | Description |
| --------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<T>` | ❌       | -       | -     | -          |             |

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

**Type:** `(context: ExecutorContext<T>) => void \| Promise<void>`

#### Parameters

| Name      | Type                 | Optional | Default | Since | Deprecated | Description |
| --------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<T>` | ❌       | -       | -     | -          |             |

---

##### `onSuccess` (CallSignature)

**Type:** `void \| Promise<void>`

Hook executed after successful task completion
Can transform the task result

**Returns:**

Modified result or Promise of modified result

#### Parameters

| Name      | Type                 | Optional | Default | Since | Deprecated | Description |
| --------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<T>` | ❌       | -       | -     | -          |             |

---

### `PromiseTask` (TypeAlias)

**Type:** `Object`

Type definition for promise-based task

**Example:**

```typescript
const promiseTask: PromiseTask<string, number> = async (data: number) => {
  return `Result: ${data}`;
};
```

---

### `SyncTask` (TypeAlias)

**Type:** `Object`

Type definition for synchronous task

**Example:**

```typescript
const syncTask: SyncTask<string, number> = (data: number) => {
  return `Result: ${data}`;
};
```

---

### `Task` (TypeAlias)

**Type:** `PromiseTask<Result, Params> \| SyncTask<Result, Params>`

Union type for both promise and sync tasks

**Template:** T

Return type of the task

**Template:** D

Input data type for the task

---
