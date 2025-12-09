## `src/executor/impl/ContextHandler` (Module)

**Type:** `module src/executor/impl/ContextHandler`

---

### `ContextHandler` (Class)

**Type:** `class ContextHandler`

Manages execution context state and plugin runtime tracking

Core concept:
Centralized context management for executor plugin lifecycle tracking

Main features:

- Context state management: Reset and initialize context state
- Plugin runtime tracking: Monitor plugin execution times and metadata
- Chain control: Manage execution chain breaking conditions
- Error handling: Context error state management
- Hook validation: Check plugin hook availability and enablement

Key responsibilities:

- Maintain execution context consistency
- Track plugin execution metadata
- Control execution flow through chain breaking
- Manage error state propagation

**Example:** Basic usage

```typescript
const handler = new ContextHandler();
const context = createContext(data);

// Reset context for new execution
handler.reset(context);

// Check if plugin should be skipped
const shouldSkip = handler.shouldSkipPluginHook(plugin, 'onBefore', context);
```

---

#### `new ContextHandler` (Constructor)

**Type:** `() => ContextHandler`

---

#### `reset` (Method)

**Type:** `(context: ExecutorContext<Params>) => void`

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                    |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------ |
| `context` | `ExecutorContext<Params>` | ❌       | -       | -     | -          | The execution context to reset |

---

##### `reset` (CallSignature)

**Type:** `void`

Reset entire context to initial state

Core concept:
Complete context cleanup for new execution cycle

Reset operations:

- Resets hooks runtime state
- Clears return value
- Clears error state

**Example:**

```typescript
const handler = new ContextHandler();
handler.reset(context);
```

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                    |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------ |
| `context` | `ExecutorContext<Params>` | ❌       | -       | -     | -          | The execution context to reset |

---

#### `resetHooksRuntimes` (Method)

**Type:** `(hooksRuntimes: HookRuntimes) => void`

#### Parameters

| Name            | Type           | Optional | Default | Since | Deprecated | Description                       |
| --------------- | -------------- | -------- | ------- | ----- | ---------- | --------------------------------- |
| `hooksRuntimes` | `HookRuntimes` | ❌       | -       | -     | -          | The hooks runtime object to reset |

---

##### `resetHooksRuntimes` (CallSignature)

**Type:** `void`

Reset hooks runtime state to initial values

Core concept:
Clears all runtime tracking information for fresh execution

Reset operations:

- Clears plugin name and hook name
- Resets return value and chain breaking flags
- Resets execution counter and index

**Example:**

```typescript
const handler = new ContextHandler();
handler.resetHooksRuntimes(context.hooksRuntimes);
```

#### Parameters

| Name            | Type           | Optional | Default | Since | Deprecated | Description                       |
| --------------- | -------------- | -------- | ------- | ----- | ---------- | --------------------------------- |
| `hooksRuntimes` | `HookRuntimes` | ❌       | -       | -     | -          | The hooks runtime object to reset |

---

#### `runtimeReturnValue` (Method)

**Type:** `(context: ExecutorContext<Params>, returnValue: unknown) => void`

#### Parameters

| Name          | Type                      | Optional | Default | Since | Deprecated | Description                      |
| ------------- | ------------------------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `context`     | `ExecutorContext<Params>` | ❌       | -       | -     | -          | The execution context            |
| `returnValue` | `unknown`                 | ❌       | -       | -     | -          | The value to set as return value |

---

##### `runtimeReturnValue` (CallSignature)

**Type:** `void`

Set return value in context runtime tracking

Core concept:
Store plugin hook return value for chain control and debugging

Usage scenarios:

- Track plugin hook return values
- Enable chain breaking based on return values
- Debug plugin execution flow

**Example:**

```typescript
const result = plugin.onBefore(context);
handler.runtimeReturnValue(context, result);
```

#### Parameters

| Name          | Type                      | Optional | Default | Since | Deprecated | Description                      |
| ------------- | ------------------------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `context`     | `ExecutorContext<Params>` | ❌       | -       | -     | -          | The execution context            |
| `returnValue` | `unknown`                 | ❌       | -       | -     | -          | The value to set as return value |

---

#### `runtimes` (Method)

**Type:** `(context: ExecutorContext<Params>, plugin: ExecutorPlugin<unknown>, hookName: string, index: number) => void`

#### Parameters

| Name       | Type                      | Optional | Default | Since | Deprecated | Description                                    |
| ---------- | ------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------- |
| `context`  | `ExecutorContext<Params>` | ❌       | -       | -     | -          | The execution context                          |
| `plugin`   | `ExecutorPlugin<unknown>` | ❌       | -       | -     | -          | The plugin being executed                      |
| `hookName` | `string`                  | ❌       | -       | -     | -          | The hook name being executed                   |
| `index`    | `number`                  | ❌       | -       | -     | -          | The index of the plugin in the execution chain |

---

##### `runtimes` (CallSignature)

**Type:** `void`

Update runtime tracking information for plugin execution

Core concept:
Track plugin execution metadata for debugging and flow control

Tracking information:

- Current plugin name
- Current hook name
- Execution counter (times)
- Plugin index in execution chain

**Example:**

```typescript
handler.runtimes(context, plugin, 'onBefore', 0);
```

#### Parameters

| Name       | Type                      | Optional | Default | Since | Deprecated | Description                                    |
| ---------- | ------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------- |
| `context`  | `ExecutorContext<Params>` | ❌       | -       | -     | -          | The execution context                          |
| `plugin`   | `ExecutorPlugin<unknown>` | ❌       | -       | -     | -          | The plugin being executed                      |
| `hookName` | `string`                  | ❌       | -       | -     | -          | The hook name being executed                   |
| `index`    | `number`                  | ❌       | -       | -     | -          | The index of the plugin in the execution chain |

---

#### `setError` (Method)

**Type:** `(context: ExecutorContext<Params>, error: Error) => void`

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                 |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `context` | `ExecutorContext<Params>` | ❌       | -       | -     | -          | The execution context       |
| `error`   | `Error`                   | ❌       | -       | -     | -          | The error to set in context |

---

##### `setError` (CallSignature)

**Type:** `void`

Set error in context

Core concept:
Error state management for execution context

Error handling:

- Store error for plugin error hooks
- Enable error-based flow control
- Support error propagation through plugin chain

**Example:**

```typescript
try {
  // Execute some operation
} catch (error) {
  handler.setError(context, error as Error);
}
```

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                 |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `context` | `ExecutorContext<Params>` | ❌       | -       | -     | -          | The execution context       |
| `error`   | `Error`                   | ❌       | -       | -     | -          | The error to set in context |

---

#### `shouldBreakChain` (Method)

**Type:** `(context: ExecutorContext<Params>) => boolean`

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description           |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | --------------------- |
| `context` | `ExecutorContext<Params>` | ❌       | -       | -     | -          | The execution context |

---

##### `shouldBreakChain` (CallSignature)

**Type:** `boolean`

Check if the execution chain should be broken

Core concept:
Chain breaking control for plugin execution flow

Chain breaking scenarios:

- Plugin explicitly sets breakChain flag
- Error conditions requiring immediate termination
- Business logic requiring early exit

**Returns:**

True if the chain should be broken, false otherwise

**Example:**

```typescript
if (handler.shouldBreakChain(context)) {
  break; // Stop plugin execution
}
```

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description           |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | --------------------- |
| `context` | `ExecutorContext<Params>` | ❌       | -       | -     | -          | The execution context |

---

#### `shouldBreakChainOnReturn` (Method)

**Type:** `(context: ExecutorContext<Params>) => boolean`

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description           |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | --------------------- |
| `context` | `ExecutorContext<Params>` | ❌       | -       | -     | -          | The execution context |

---

##### `shouldBreakChainOnReturn` (CallSignature)

**Type:** `boolean`

Check if the execution chain should be broken due to return value

Core concept:
Return value-based chain breaking control

Usage scenarios:

- Plugin returns a value that should terminate execution
- Error handling hooks return error objects
- Business logic requires return value-based flow control

**Returns:**

True if the chain should be broken due to return value, false otherwise

**Example:**

```typescript
if (handler.shouldBreakChainOnReturn(context)) {
  return context.hooksRuntimes.returnValue;
}
```

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description           |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | --------------------- |
| `context` | `ExecutorContext<Params>` | ❌       | -       | -     | -          | The execution context |

---

#### `shouldSkipPluginHook` (Method)

**Type:** `(plugin: ExecutorPlugin<unknown>, hookName: string, context: ExecutorContext<Params>) => boolean`

#### Parameters

| Name       | Type                      | Optional | Default | Since | Deprecated | Description                      |
| ---------- | ------------------------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `plugin`   | `ExecutorPlugin<unknown>` | ❌       | -       | -     | -          | The plugin to check              |
| `hookName` | `string`                  | ❌       | -       | -     | -          | The name of the hook to validate |
| `context`  | `ExecutorContext<Params>` | ❌       | -       | -     | -          | The execution context            |

---

##### `shouldSkipPluginHook` (CallSignature)

**Type:** `boolean`

Check if a plugin hook should be skipped
Returns true if the hook should be skipped (invalid or disabled)

Core concept:
Plugin hook validation and enablement checking

Validation criteria:

- Hook method exists and is callable
- Plugin is enabled for the specific hook
- Plugin enablement function returns true

**Returns:**

True if the hook should be skipped, false otherwise

**Example:**

```typescript
const shouldSkip = handler.shouldSkipPluginHook(
  validationPlugin,
  'onBefore',
  context
);

if (!shouldSkip) {
  // Execute the hook
}
```

#### Parameters

| Name       | Type                      | Optional | Default | Since | Deprecated | Description                      |
| ---------- | ------------------------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `plugin`   | `ExecutorPlugin<unknown>` | ❌       | -       | -     | -          | The plugin to check              |
| `hookName` | `string`                  | ❌       | -       | -     | -          | The name of the hook to validate |
| `context`  | `ExecutorContext<Params>` | ❌       | -       | -     | -          | The execution context            |

---

### `createContext` (Function)

**Type:** `(parameters: Params) => ExecutorContext<Params>`

#### Parameters

| Name         | Type     | Optional | Default | Since | Deprecated | Description                    |
| ------------ | -------- | -------- | ------- | ----- | ---------- | ------------------------------ |
| `parameters` | `Params` | ❌       | -       | -     | -          | The parameters for the context |

---

#### `createContext` (CallSignature)

**Type:** `ExecutorContext<Params>`

**Since:** `2.1.0`

Create a reusable context with shared hooksRuntimes object
This reduces memory allocation by reusing the same hooksRuntimes object

Core concept:
Context factory function that creates execution contexts with pre-initialized runtime tracking

Performance benefits:

- Reduces memory allocation overhead
- Reuses hooksRuntimes object across executions
- Optimizes garbage collection

**Returns:**

A new context with shared hooksRuntimes

**Example:** Basic usage

```typescript
const context = createContext({ userId: 123, data: 'test' });
```

**Example:** With custom parameters

```typescript
interface UserData {
  name: string;
  email: string;
}

const context = createContext<UserData>({
  name: 'John',
  email: 'john@example.com'
});
```

#### Parameters

| Name         | Type     | Optional | Default | Since | Deprecated | Description                    |
| ------------ | -------- | -------- | ------- | ----- | ---------- | ------------------------------ |
| `parameters` | `Params` | ❌       | -       | -     | -          | The parameters for the context |

---
