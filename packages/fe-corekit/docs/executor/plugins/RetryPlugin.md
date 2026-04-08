## `src/executor/plugins/RetryPlugin` (Module)

**Type:** `module src/executor/plugins/RetryPlugin`

---

### `RetryPlugin` (Class)

**Type:** `class RetryPlugin`

Plugin that implements retry logic for failed task executions

This class provides a mechanism to retry failed tasks with configurable
options such as maximum retries, delay strategies, and custom retry conditions.

- Core Idea: Enhance task execution reliability through retries.
- Main Function: Retry failed tasks based on specified conditions and strategies.
- Main Purpose: Improve success rates of task executions by handling transient errors.

**Executor Compatibility:**

- ✅ **Supported:** `LifecycleExecutor` - This plugin is designed for use with `LifecycleExecutor`.
  The `onExec` method returns a new task function that wraps the original task with retry logic.
  `LifecycleExecutor` will detect that the return value is a function and execute it.
- ❌ **Not Supported:** `AsyncExecutor` - This plugin no longer supports `AsyncExecutor`.
  If you need retry functionality with `AsyncExecutor`, consider migrating to `LifecycleExecutor`.

**v3.0.0 Refactored to use Retryer for retry logic. All retry logic is now delegated to Retryer. **

**Implements:**

**Example:** Usage with LifecycleExecutor

```typescript
import { LifecycleExecutor } from '@qlover/fe-corekit';

const executor = new LifecycleExecutor();
const retryer = new Retryer({
  maxRetries: 5,
  retryDelay: 2000,
  useExponentialBackoff: true,
  shouldRetry: (error) => error.message !== 'Invalid credentials'
});
executor.use(new RetryPlugin(retryer));

const result = await executor.exec(async (ctx) => {
  // Task that may fail and will be retried
  return await fetchData();
});
```

---

#### `new RetryPlugin` (Constructor)

**Type:** `(retryer: RetryInterface<RetryOptions>, pluginName: string) => RetryPlugin`

#### Parameters

| Name         | Type                           | Optional | Default | Since | Deprecated | Description                                      |
| ------------ | ------------------------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `retryer`    | `RetryInterface<RetryOptions>` | ❌       | -       | -     | -          | The Retryer instance to use for retry operations |
| `pluginName` | `string`                       | ✅       | -       | -     | -          | Optional custom name for the plugin              |

---

#### `onlyOne` (Property)

**Type:** `true`

**Default:** `true`

Ensures only one instance of RetryPlugin is used per executor

---

#### `pluginName` (Property)

**Type:** `string`

The pluginName of the plugin

---

#### `retryer` (Property)

**Type:** `RetryInterface<RetryOptions>`

The Retryer instance used for retry operations

---

#### `onExec` (Method)

**Type:** `(_context: ExecutorContextInterface<P, R, HookRuntimes>, task: ExecutorTask<R, P>) => ExecutorTask<R, P>`

Custom execution logic hook

Purpose:
Allows plugins to intercept, wrap, or replace the task execution.
Plugins can return a value directly, return a new task function, or execute
the task within the hook.

Return value behavior:

- If returns a function (ExecutorTask): The function will be executed as the new task
- If returns any other value: The value will be used as the task result (skips task execution)
- Supports both sync and async return values

Type inference:

- The return type `R` is automatically inferred from the task parameter
- Return values are type-safe and match the task's return type
- TypeScript can infer types from return statements without explicit annotations

Use cases:

- Return a wrapped task function to add middleware behavior
- Return a direct value to bypass task execution
- Execute the task with custom logic and return the result

**Returns:**

Task result (type R), modified task function, or Promise of either

**Example:** Return a direct value (bypass task) - type automatically inferred

```typescript
onExec: async () => {
  return 'intercepted-result'; // Type inferred as Promise<string>
};
```

**Example:** Return a wrapped task function

```typescript
onExec: (ctx, task) => {
  // Return a new task function that wraps the original
  return async (wrappedCtx) => {
    console.log('Before task execution');
    const result = await task(wrappedCtx);
    console.log('After task execution');
    return result;
  };
};
```

**Example:** Return a direct value (bypass task)

```typescript
onExec: (ctx, task) => {
  // Return cached result, skip task execution
  if (cache.has(ctx.parameters.id)) {
    return cache.get(ctx.parameters.id);
  }
  // Or execute task and return result
  return task(ctx);
};
```

如果需要手动覆盖返回类型，可以使用提供的 R 泛型手动推断类型，但是这样不够安全，
未来可能会加入接口类型的泛型

**Example:** 使用手动推断类型

```typescript
interface TestResult {
  data: string;
  processed?: boolean;
}

type TestContext = ExecutorContextInterface<TestParams>;

const plugin: LifecyclePluginInterface<TestContext> = {
  pluginName: 'plugin',
  onExec: async <R>(ctx, task) => {
    const result = await task(ctx);
    return `wrapped: ${result}` as R;
  }
};
```

#### Parameters

| Name       | Type                                           | Optional | Default | Since | Deprecated | Description                                                                                       |
| ---------- | ---------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------------------------------------- |
| `_context` | `ExecutorContextInterface<P, R, HookRuntimes>` | ❌       | -       | -     | -          | Executor context containing parameters and metadata (unused, task receives context when executed) |
| `task`     | `ExecutorTask<R, P>`                           | ❌       | -       | -     | -          | Task to be executed with retry support                                                            |

---

##### `onExec` (CallSignature)

**Type:** `ExecutorTask<R, P>`

Custom execution hook that implements retry logic using Retryer

This method intercepts task execution to add retry capability,
using the configured Retryer to handle all retry logic.

**Executor Compatibility:**

- ✅ **LifecycleExecutor:** This method returns a new `ExecutorTask` function that wraps
  the original task with retry logic. `LifecycleExecutor` will detect that the return value
  is a function and execute it, applying retry logic automatically.
- ❌ **AsyncExecutor:** This method is **NOT compatible** with `AsyncExecutor`. `AsyncExecutor`
  expects `onExec` to return a direct value (Promise), not a function. Using this plugin with
  `AsyncExecutor` will not work correctly.

**Implementation Details:**

- Wraps the original task to ensure it always returns a Promise
- Uses `Retryer.makeRetriable()` to create a retriable version of the task
- Returns a function that `LifecycleExecutor` will execute

**Type Compatibility:**

- Accepts any parameter type that extends `RetryOptions`
- This allows the plugin to work with executors that use extended parameter types
- The retry logic only uses `RetryOptions` properties, so extended types are safe

**Returns:**

A new ExecutorTask function that applies retry logic using Retryer

**Example:** Usage with LifecycleExecutor

```typescript
const executor = new LifecycleExecutor();
executor.use(new RetryPlugin(retryer));

// When executor.exec() is called, onExec returns a wrapped function
// LifecycleExecutor detects it's a function and executes it with retry logic
const result = await executor.exec(async (ctx) => {
  return await apiCall();
});
```

**Example:** Usage with extended parameter types

```typescript
interface MyParams extends RetryOptions {
  customField: string;
}

const executor = new LifecycleExecutor<
  ExecutorContextInterface<MyParams, string>
>();
executor.use(new RetryPlugin(retryer)); // Works with extended types
```

#### Parameters

| Name       | Type                                           | Optional | Default | Since | Deprecated | Description                                                                                       |
| ---------- | ---------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------------------------------------------- |
| `_context` | `ExecutorContextInterface<P, R, HookRuntimes>` | ❌       | -       | -     | -          | Executor context containing parameters and metadata (unused, task receives context when executed) |
| `task`     | `ExecutorTask<R, P>`                           | ❌       | -       | -     | -          | Task to be executed with retry support                                                            |

---

### `RETRY_ERROR_ID` (Variable)

**Type:** `"RETRY_ERROR"`

**Default:** `'RETRY_ERROR'`

Error ID for retry errors

---
