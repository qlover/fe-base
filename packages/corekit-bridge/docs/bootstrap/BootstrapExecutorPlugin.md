## `src/core/bootstrap/BootstrapExecutorPlugin` (Module)

**Type:** `module src/core/bootstrap/BootstrapExecutorPlugin`

---

### `BootstrapExecutorPlugin` (Interface)

**Type:** `interface BootstrapExecutorPlugin`

---

#### `onBefore` (Property)

**Type:** `Object`

Hook executed before task execution (synchronous only)

Purpose:
Allows plugins to pre-process input data, validate parameters, or perform
setup operations before the main task executes. Must be synchronous.

Return Value Behavior:

- If returns a value: Context parameters are updated with the returned value
- If returns undefined: Context parameters remain unchanged
- Cannot return Promise

Execution Order:

- Executed in plugin registration order
- All onBefore hooks execute before the task
- Each hook can see parameter changes from previous hooks

**Returns:**

New parameters to update context, or undefined to keep current parameters

**Example:** Parameter validation

```typescript
onBefore: (ctx) => {
  if (!ctx.parameters.userId) {
    throw new Error('userId is required');
  }
};
```

**Example:** Parameter transformation

```typescript
onBefore: (ctx) => {
  return {
    ...ctx.parameters,
    timestamp: Date.now(),
    normalized: true
  };
};
```

---

#### `onError` (Property)

**Type:** `Object`

Hook executed when an error occurs (synchronous only)

Purpose:
Allows plugins to handle errors, transform error messages, or perform
error recovery. Must be synchronous.

Return Value Behavior:

- If returns ExecutorError: Replaces the current error
- If returns undefined: Keeps the current error

**Returns:**

ExecutorError to replace current error, or undefined

**Example:** Error logging

```typescript
onError: (ctx) => {
  console.error('Error occurred:', ctx.error);
};
```

**Example:** Error transformation

```typescript
onError: (ctx) => {
  return new ExecutorError('CUSTOM_ERROR', ctx.error as Error, {
    customData: 'value'
  });
};
```

---

#### `onExec` (Property)

**Type:** `Object`

Hook for modifying or wrapping the task (synchronous only)

Purpose:
Allows plugins to modify the task execution behavior, wrap the task,
or completely replace it. Must be synchronous.

Execution Rules:

- Only the first plugin's onExec is executed
- If onExec returns a value, the original task is not run
- If onExec returns void/undefined, the original task runs normally
- Use context.hooksRuntimes.times to check if onExec was called

Return Value Behavior:

- If returns a value: Original task is skipped, returned value is used as result
- If returns void/undefined: Original task runs normally
- Can return the task result directly or a new task function

**Returns:**

Result of task execution, or void/undefined to let original task run

**Example:** Task wrapping

```typescript
onExec: (ctx, task) => {
  console.log('Before task');
  const result = task(ctx);
  console.log('After task');
  return result;
};
```

**Example:** Task replacement

```typescript
onExec: (ctx, task) => {
  // Completely replace task logic
  return customLogic(ctx.parameters);
};
```

**Example:** Intercept without modifying (let original task run)

```typescript
onExec: (ctx, task) => {
  // Just log, don't return anything - original task will run
  console.log('Task will execute:', ctx.parameters);
};
```

---

#### `onFinally` (Property)

**Type:** `Object`

Hook executed in finally block after task execution (synchronous only)

Purpose:
Allows plugins to perform cleanup operations that must run regardless
of whether the task succeeded or failed. Must be synchronous.

Execution Guarantees:

- Always executed after task completion (success or error)
- Executed in finally block, ensuring cleanup even if errors occur
- Runs after onSuccess or onError hooks
- Cannot prevent error propagation

Use Cases:

- Resource cleanup
- Logging completion status
- Resetting state
- Closing connections
- Finalizing transactions

**Example:** Resource cleanup

```typescript
onFinally: (ctx) => {
  if (ctx.parameters.connection) {
    ctx.parameters.connection.close();
  }
};
```

**Example:** Logging completion

```typescript
onFinally: (ctx) => {
  const status = ctx.error ? 'failed' : 'succeeded';
  console.log(`Task ${status}`);
};
```

---

#### `onSuccess` (Property)

**Type:** `Object`

Hook executed after successful task execution (synchronous only)

Purpose:
Allows plugins to process results, perform cleanup, or trigger side effects
after successful task completion. Must be synchronous.

Use Cases:

- Logging results
- Caching results
- Triggering notifications
- Cleanup operations

**Example:** Result logging

```typescript
onSuccess: (ctx) => {
  console.log('Task completed:', ctx.returnValue);
};
```

**Example:** Result caching

```typescript
onSuccess: (ctx) => {
  cache.set(ctx.parameters.key, ctx.returnValue);
};
```

---

#### `onlyOne` (Property)

**Type:** `boolean`

If true, ensures only one instance of this plugin type

---

#### `pluginName` (Property)

**Type:** `string`

Optional plugin name for identification

---

#### `enabled` (Method)

**Type:** `(name: string, context: BootstrapContext) => boolean`

#### Parameters

| Name      | Type               | Optional | Default | Since | Deprecated | Description                |
| --------- | ------------------ | -------- | ------- | ----- | ---------- | -------------------------- |
| `name`    | `string`           | ❌       | -       | -     | -          | Hook name to check         |
| `context` | `BootstrapContext` | ✅       | -       | -     | -          | Optional execution context |

---

##### `enabled` (CallSignature)

**Type:** `boolean`

Check if plugin should be enabled for a given hook

**Returns:**

true if plugin should execute, false otherwise

#### Parameters

| Name      | Type               | Optional | Default | Since | Deprecated | Description                |
| --------- | ------------------ | -------- | ------- | ----- | ---------- | -------------------------- |
| `name`    | `string`           | ❌       | -       | -     | -          | Hook name to check         |
| `context` | `BootstrapContext` | ✅       | -       | -     | -          | Optional execution context |

---

### `BootstrapContext` (TypeAlias)

**Type:** `ExecutorContextInterface<BootstrapPluginOptions>`

---

### `BootstrapPluginOptions` (TypeAlias)

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
