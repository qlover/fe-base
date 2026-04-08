## `src/executor/interface/ExecutorContextInterface` (Module)

**Type:** `module src/executor/interface/ExecutorContextInterface`

---

### `ExecutorContextInterface` (Interface)

**Type:** `interface ExecutorContextInterface<T, R, RuntimesType>`

**Since:** `3.0.0`

Executor context interface with generic runtime support

Core concept:
Provides a shared context for task execution, allowing plugins to access
and modify parameters, track execution state, and share data across the
execution lifecycle. The context acts as a communication bridge between
the executor, plugins, and the task being executed.

Main features:

- Parameter management: Read and update execution parameters
  - Type-safe parameter access through generic type `T`
  - Immutable read access via `parameters` property
  - Safe updates via `setParameters()` with internal cloning
  - Prevents accidental parameter mutation

- Error tracking: Store and retrieve error state
  - Captures errors from task execution
  - Accessible to error handling plugins
  - Supports any error type (Error, string, object, etc.)
  - Automatically converts to ExecutorError

- Return value handling: Access task return values
  - Type-safe return value through generic type `R`
  - Available to afterHooks for result transformation
  - Undefined until task completes successfully

- Runtime metadata: Track execution timing and state
  - Extensible runtime information via `RuntimesType`
  - Hook execution tracking
  - Performance monitoring support
  - Custom metadata storage

Design considerations:

- Immutable core properties: `parameters`, `error`, `returnValue` are read-only
- Safe mutation methods: `setParameters()`, `setError()`, `setReturnValue()`
- Generic type safety: Full type inference for parameters and return values
- Extensible runtimes: Custom runtime metadata via `RuntimesType` generic

**Example:** Basic usage

```typescript
interface UserParams {
  userId: number;
  action: string;
}

interface UserResult {
  success: boolean;
  data: User;
}

const context: ExecutorContextInterface<UserParams, UserResult> =
  new ExecutorContextImpl({ userId: 123, action: 'fetch' });

console.log(context.parameters.userId); // 123
```

**Example:** In plugin hooks

```typescript
const plugin: LifecyclePluginInterface<
  ExecutorContextInterface<UserParams, UserResult>
> = {
  pluginName: 'logger',

  onBefore: async (ctx) => {
    console.log('Starting with:', ctx.parameters);
    // Add timestamp to parameters
    ctx.setParameters({
      ...ctx.parameters,
      timestamp: Date.now()
    });
  },

  onAfter: async (ctx, result) => {
    console.log('Completed with:', ctx.returnValue);
    return result;
  },

  onError: async (ctx, error) => {
    console.error('Failed with:', ctx.error);
    throw error;
  }
};
```

**Example:** Parameter transformation

```typescript
const executor = new LifecycleExecutor();

executor.use({
  pluginName: 'validator',
  onBefore: async (ctx) => {
    // Validate and transform parameters
    const validated = validateParams(ctx.parameters);
    ctx.setParameters(validated);
  }
});

const result = await executor.exec(
  { userId: '123' }, // String input
  async (ctx) => {
    // ctx.parameters.userId is now validated and transformed
    return await fetchUser(ctx.parameters.userId);
  }
);
```

**Example:** Error handling

```typescript
executor.use({
  pluginName: 'errorHandler',
  onError: async (ctx, error) => {
    // Access error from context
    console.error('Task failed:', ctx.error);

    // Transform error
    if (ctx.error instanceof NetworkError) {
      throw new UserFriendlyError('Network connection failed');
    }
    throw error;
  }
});
```

**Example:** With unknown return type

```typescript
// When return type is not known in advance
const context: ExecutorContextInterface<UserParams, unknown> =
  new ExecutorContextImpl(params);
```

**Example:** Extended runtimes

```typescript
interface CustomRuntimes extends HookRuntimes {
  executionTime: number;
  memoryUsage: number;
  cacheHits: number;
}

const context: ExecutorContextInterface<
  UserParams,
  UserResult,
  CustomRuntimes
> = new ExecutorContextImpl(params);

// Access custom runtime metadata
console.log(context.runtimes.executionTime);
```

**See:**

- <a href="./ExecutorHookRuntimesInterface.md#executorhookruntimesinterface-interface" class="tsd-kind-interface">ExecutorHookRuntimesInterface</a> for runtime metadata interface
- ExecutorContextImpl for default implementation

---

#### `error` (Property)

**Type:** `unknown`

Current error state, if any

Contains the error that occurred during task execution. Only populated
when an error is thrown. Accessible in error handling hooks.

**Example:**

```typescript
onError: (ctx, error) => {
  if (ctx.error instanceof NetworkError) {
    console.log('Network error occurred');
  }
};
```

---

#### `parameters` (Property)

**Type:** `T`

Read-only access to execution parameters

Provides immutable access to the current parameters. To modify parameters,
use `setParameters()` method which ensures safe cloning.

**Example:**

```typescript
console.log(ctx.parameters.userId);
console.log(ctx.parameters.action);
```

---

#### `returnValue` (Property)

**Type:** `undefined \| R`

Task return value

Contains the value returned by the task after successful execution.
Undefined until the task completes. Accessible in afterHooks for
result transformation.

**Example:**

```typescript
onAfter: (ctx, result) => {
  console.log('Task returned:', ctx.returnValue);
  // Transform result
  return { ...result, timestamp: Date.now() };
};
```

---

#### `hooksRuntimes` (Accessor)

**Type:** `accessor hooksRuntimes`

---

#### `reset` (Method)

**Type:** `() => void`

---

##### `reset` (CallSignature)

**Type:** `void`

Reset entire context to initial state

---

#### `resetHooksRuntimes` (Method)

**Type:** `(hookName: string) => void`

#### Parameters

| Name       | Type     | Optional | Default | Since | Deprecated | Description |
| ---------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `hookName` | `string` | ✅       | -       | -     | -          |             |

---

##### `resetHooksRuntimes` (CallSignature)

**Type:** `void`

Reset hooks runtime state to initial values

If hookName is provided, only reset the runtime state for that hook.

Core concept:
Clears all runtime tracking information for fresh execution

#### Parameters

| Name       | Type     | Optional | Default | Since | Deprecated | Description |
| ---------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `hookName` | `string` | ✅       | -       | -     | -          |             |

---

#### `runtimeReturnValue` (Method)

**Type:** `(returnValue: unknown) => void`

#### Parameters

| Name          | Type      | Optional | Default | Since | Deprecated | Description                      |
| ------------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `returnValue` | `unknown` | ❌       | -       | -     | -          | The value to set as return value |

---

##### `runtimeReturnValue` (CallSignature)

**Type:** `void`

Set return value in context runtime tracking

#### Parameters

| Name          | Type      | Optional | Default | Since | Deprecated | Description                      |
| ------------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `returnValue` | `unknown` | ❌       | -       | -     | -          | The value to set as return value |

---

#### `runtimes` (Method)

**Type:** `(runtimes: Partial<RuntimesType>) => void`

#### Parameters

| Name       | Type                    | Optional | Default | Since | Deprecated | Description                                                      |
| ---------- | ----------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------- |
| `runtimes` | `Partial<RuntimesType>` | ❌       | -       | -     | -          | Partial runtime updates to apply (can include custom properties) |

---

##### `runtimes` (CallSignature)

**Type:** `void`

Update runtime tracking information for plugin execution

Core concept:
Controlled way to update runtime state through partial updates.
This is the only safe way to modify runtime state.

Generic support:

- Can update custom properties in extended HookRuntimes
- Type-safe updates with partial type checking
- Maintains immutability through object replacement

**Example:** Update standard properties

```typescript
context.runtimes({
  pluginName: 'ValidationPlugin',
  hookName: 'onBefore',
  pluginIndex: 0,
  times: 1
});
```

**Example:** Update custom properties (with extended type)

```typescript
interface CustomRuntimes extends HookRuntimes {
  executionTime: number;
}
const context: ExecutorHookRuntimesInterface<CustomRuntimes>;
context.runtimes({
  executionTime: 150,
  customMetric: 'performance'
});
```

#### Parameters

| Name       | Type                    | Optional | Default | Since | Deprecated | Description                                                      |
| ---------- | ----------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------- |
| `runtimes` | `Partial<RuntimesType>` | ❌       | -       | -     | -          | Partial runtime updates to apply (can include custom properties) |

---

#### `setError` (Method)

**Type:** `(error: unknown) => void`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description                                                 |
| ------- | --------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------- |
| `error` | `unknown` | ❌       | -       | -     | -          | Error to set (can be any type: Error, string, object, etc.) |

---

##### `setError` (CallSignature)

**Type:** `void`

Set the error state

Stores an error in the context for access by error handling plugins.
Accepts any type of error value and converts it to `ExecutorError`.
This matches the behavior of JavaScript's catch clause which can catch any type.

**Example:**

```typescript
try {
  await riskyOperation();
} catch (error) {
  ctx.setError(error);
}
```

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description                                                 |
| ------- | --------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------------- |
| `error` | `unknown` | ❌       | -       | -     | -          | Error to set (can be any type: Error, string, object, etc.) |

---

#### `setParameters` (Method)

**Type:** `(params: T) => void`

#### Parameters

| Name     | Type | Optional | Default | Since | Deprecated | Description           |
| -------- | ---- | -------- | ------- | ----- | ---------- | --------------------- |
| `params` | `T`  | ❌       | -       | -     | -          | New parameters to set |

---

##### `setParameters` (CallSignature)

**Type:** `void`

Update parameters (clones internally for safety)

Updates the execution parameters with a new value. The parameters are
cloned internally to prevent accidental mutation. This ensures that
plugins cannot inadvertently affect each other's parameter views.

**Example:**

```typescript
onBefore: (ctx) => {
  // Add authentication token
  ctx.setParameters({
    ...ctx.parameters,
    authToken: getAuthToken()
  });
};
```

**Example:** Parameter validation

```typescript
onBefore: (ctx) => {
  const validated = validateAndTransform(ctx.parameters);
  ctx.setParameters(validated);
};
```

#### Parameters

| Name     | Type | Optional | Default | Since | Deprecated | Description           |
| -------- | ---- | -------- | ------- | ----- | ---------- | --------------------- |
| `params` | `T`  | ❌       | -       | -     | -          | New parameters to set |

---

#### `setReturnValue` (Method)

**Type:** `(value: unknown) => void`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description         |
| ------- | --------- | -------- | ------- | ----- | ---------- | ------------------- |
| `value` | `unknown` | ❌       | -       | -     | -          | Return value to set |

---

##### `setReturnValue` (CallSignature)

**Type:** `void`

Set the return value

Stores the task's return value in the context. Typically called by
the executor after task completion, but can be used by plugins to
override the return value.

**Example:**

```typescript
onAfter: (ctx, result) => {
  // Override return value
  ctx.setReturnValue({ ...result, enhanced: true });
  return ctx.returnValue;
};
```

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description         |
| ------- | --------- | -------- | ------- | ----- | ---------- | ------------------- |
| `value` | `unknown` | ❌       | -       | -     | -          | Return value to set |

---

#### `shouldBreakChain` (Method)

**Type:** `() => boolean`

---

##### `shouldBreakChain` (CallSignature)

**Type:** `boolean`

Check if the execution chain should be broken

**Returns:**

True if the chain should be broken, false otherwise

---

#### `shouldBreakChainOnReturn` (Method)

**Type:** `() => boolean`

---

##### `shouldBreakChainOnReturn` (CallSignature)

**Type:** `boolean`

Check if the execution chain should be broken due to return value

**Returns:**

True if the chain should be broken due to return value, false otherwise

---

#### `shouldContinueOnError` (Method)

**Type:** `() => boolean`

---

##### `shouldContinueOnError` (CallSignature)

**Type:** `boolean`

Check if execution should continue on error

Core concept:
Determines whether to continue executing subsequent plugins when a plugin hook
throws an error, enabling resilient execution pipelines

Main features:

- Error resilience: Allows execution to continue despite individual failures
- Fault tolerance: Enables graceful degradation in plugin chains
- Cleanup guarantees: Ensures all cleanup hooks execute even if some fail

Use cases:

- Finally hooks: Ensure all cleanup operations execute even if one fails
- Logging hooks: Continue logging even if one logger fails
- Monitoring hooks: Collect metrics from all plugins despite failures

**Returns:**

True if execution should continue on error, false otherwise

**Example:**

```typescript
// Enable continue on error for finally hooks
context.runtimes({ continueOnError: true });
await runPluginsHookAsync(plugins, 'onFinally', context);
```

---

#### `shouldSkipPluginHook` (Method)

**Type:** `(plugin: ExecutorPluginInterface<Ctx>, hookName: string) => boolean`

#### Parameters

| Name       | Type                           | Optional | Default | Since | Deprecated | Description                      |
| ---------- | ------------------------------ | -------- | ------- | ----- | ---------- | -------------------------------- |
| `plugin`   | `ExecutorPluginInterface<Ctx>` | ❌       | -       | -     | -          | The plugin to check              |
| `hookName` | `string`                       | ❌       | -       | -     | -          | The name of the hook to validate |

---

##### `shouldSkipPluginHook` (CallSignature)

**Type:** `boolean`

Check if a plugin hook should be skipped

**Returns:**

True if the hook should be skipped, false otherwise

#### Parameters

| Name       | Type                           | Optional | Default | Since | Deprecated | Description                      |
| ---------- | ------------------------------ | -------- | ------- | ----- | ---------- | -------------------------------- |
| `plugin`   | `ExecutorPluginInterface<Ctx>` | ❌       | -       | -     | -          | The plugin to check              |
| `hookName` | `string`                       | ❌       | -       | -     | -          | The name of the hook to validate |

---
