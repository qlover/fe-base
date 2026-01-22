## `src/executor/impl/ExecutorContextImpl` (Module)

**Type:** `module src/executor/impl/ExecutorContextImpl`

---

### `ExecutorContextImpl` (Class)

**Type:** `class ExecutorContextImpl<T, R, RuntimesType>`

**Since:** `3.0.0`

Base implementation of ExecutorContextInterface that integrates ContextHandler functionality

## Core Concept

Provides a complete implementation of the executor context interface, integrating
all context management functionality that was previously handled by ContextHandler.
This eliminates the need for a separate ContextHandler class and centralizes
all context-related operations in a single class.

Key Differences from Original Implementation:

No Separate ContextHandler:

- Integrated Functionality: All ContextHandler methods integrated into context
  - Original: Separate ContextHandler class managed context state
  - New: All functionality in ExecutorContextImpl
  - Benefits: Simpler API, fewer dependencies, clearer ownership

- Direct Method Access: All methods available directly on context
  - No need to pass context to handler methods
  - More intuitive API
  - Better encapsulation

Parameter Handling (Reference-Based):

- **No Cloning**: Parameters are stored by reference, not cloned
  - Original: Parameters were cloned automatically
  - New: Parameters are used directly (zero overhead)
  - Benefits: Better performance, user control, predictable behavior

- **User Responsibility**: Users must clone parameters if isolation is needed
  - If you need isolation:
    `new ExecutorContextImpl({ ...params })`

  - If you don't need isolation:
    `new ExecutorContextImpl(params)`

  - Trade-off: More control vs. more responsibility

- **Performance**: Zero cloning overhead
  - No Object.assign or spread operations
  - No memory allocation for parameter copies
  - Ideal for high-performance scenarios

Enhanced Runtime Tracking:

- Integrated Tracking: All runtime tracking in context
  - Plugin execution metadata
  - Hook execution tracking
  - Chain breaking state
  - Return value tracking

- Better Debugging: Comprehensive runtime information
  - Track which plugins executed
  - Track execution order
  - Track return values
  - Track chain breaking conditions

Improved API Design:

- Consistent Naming: All methods follow consistent naming conventions
- Type Safety: Strong typing throughout
- Clear Responsibilities: Each method has a single, clear purpose
- Better Documentation: Comprehensive JSDoc comments

Main Features:

- Context state management: Manages parameters, error, and return value
- Plugin runtime tracking: Tracks plugin execution metadata
- Chain control: Manages execution chain breaking conditions
- Error handling: Context error state management
- Hook validation: Checks plugin hook availability and enablement
- Reference-based parameters: No automatic cloning (user control)
- High performance: Zero overhead parameter handling

Parameter Handling (Important):

**No Automatic Cloning**:

- Parameters are stored by reference
- Modifications affect the original object
- Users must clone parameters themselves if isolation is needed

**Usage Examples**:

```typescript
// Without isolation (parameters will be modified)
const params = { userId: 123, data: 'test' };
const context = new ExecutorContextImpl(params);
context.setParameters({ userId: 456 });
console.log(params.userId); // 456 - original modified

// With isolation (clone parameters first)
const params = { userId: 123, data: 'test' };
const context = new ExecutorContextImpl({ ...params }); // shallow clone
context.setParameters({ userId: 456 });
console.log(params.userId); // 123 - original unchanged
```

**Performance**:

- Constructor: Zero overhead (no cloning)
- Getter: Direct return (zero overhead)
- setParameters: Zero overhead (no cloning)

Design Considerations:

- Integrates ContextHandler functionality directly into the context
- Provides all methods needed for executor plugin lifecycle management
- Maintains backward compatibility with existing ExecutorContext interface
- Eliminates the need for separate ContextHandler instance
- Delegates parameter isolation responsibility to users
- Optimized for maximum performance with zero-overhead parameter handling

**Example:** Basic usage

```typescript
const context = new ExecutorContextImpl({ userId: 123, data: 'test' });

// Use context methods directly
context.setReturnValue('result');
context.runtimes(plugin, 'onBefore', 0);
if (context.shouldBreakChain()) {
  // Handle chain breaking
}
```

**Example:** Parameter isolation

```typescript
const originalParams = { value: 'original' };
const context = new ExecutorContextImpl(originalParams);

// Parameters are cloned - modifications don't affect original
const params = context.parameters;
params.value = 'modified';
expect(originalParams.value).toBe('original'); // Original unchanged
```

**Example:** With error handling

```typescript
const context = new ExecutorContextImpl(data);

try {
  // Execute some operation
} catch (error) {
  context.setError(new ExecutorError('ERROR_CODE', error));
}

if (context.error) {
  // Handle error
}
```

**See:**

- ExecutorContextInterface - Interface that this class implements

- LifecycleExecutor - Executor that uses this context implementation

---

#### `new ExecutorContextImpl` (Constructor)

**Type:** `(parameters: T) => ExecutorContextImpl<T, R, RuntimesType>`

#### Parameters

| Name         | Type | Optional | Default | Since | Deprecated | Description                            |
| ------------ | ---- | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `parameters` | `T`  | ❌       | -       | -     | -          | The initial parameters for the context |

---

#### `error` (Accessor)

**Type:** `accessor error`

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

#### `hooksRuntimes` (Accessor)

**Type:** `accessor hooksRuntimes`

---

#### `parameters` (Accessor)

**Type:** `accessor parameters`

Read-only access to execution parameters

Provides immutable access to the current parameters. To modify parameters,
use
`setParameters()`
method which ensures safe cloning.

**Example:**

```typescript
console.log(ctx.parameters.userId);
console.log(ctx.parameters.action);
```

---

#### `returnValue` (Accessor)

**Type:** `accessor returnValue`

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

#### `reset` (Method)

**Type:** `() => void`

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

Core concept:
Clears all runtime tracking information for fresh execution

Reset operations:

- Clears plugin name and hook name
- Resets return value and chain breaking flags
- Resets execution counter and index

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

Core concept:
Store plugin hook return value for chain control and debugging.
Creates a new runtime object with updated return value.

Security:

- Creates new object (immutable update)
- Stored in WeakMap (truly private)

Usage scenarios:

- Track plugin hook return values
- Enable chain breaking based on return values
- Debug plugin execution flow

#### Parameters

| Name          | Type      | Optional | Default | Since | Deprecated | Description                      |
| ------------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `returnValue` | `unknown` | ❌       | -       | -     | -          | The value to set as return value |

---

#### `runtimes` (Method)

**Type:** `(updates: Partial<HookRuntimes>) => void`

#### Parameters

| Name      | Type                    | Optional | Default | Since | Deprecated | Description                      |
| --------- | ----------------------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `updates` | `Partial<HookRuntimes>` | ❌       | -       | -     | -          | Partial runtime updates to merge |

---

##### `runtimes` (CallSignature)

**Type:** `void`

Update runtime tracking information for plugin execution

Core concept:
Track plugin execution metadata for debugging and flow control.
Creates a new runtime object with merged updates to ensure immutability.

Security:

- Always creates a new object (immutable updates)
- Stored in WeakMap (truly private)
- Cannot be accessed or modified from outside

Tracking information:

- Current plugin name
- Current hook name
- Execution counter (times)
- Plugin index in execution chain

**Example:**

```typescript
context.runtimes({
  pluginName: 'testPlugin',
  hookName: 'onBefore',
  times: 1,
  pluginIndex: 0
});
```

#### Parameters

| Name      | Type                    | Optional | Default | Since | Deprecated | Description                      |
| --------- | ----------------------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `updates` | `Partial<HookRuntimes>` | ❌       | -       | -     | -          | Partial runtime updates to merge |

---

#### `setError` (Method)

**Type:** `(error: unknown) => void`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description                                                   |
| ------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------- |
| `error` | `unknown` | ❌       | -       | -     | -          | The error to set in context (ExecutorError or standard Error) |

---

##### `setError` (CallSignature)

**Type:** `void`

Set error in context

Automatically converts standard Error objects to ExecutorError for consistency.
If the error is already an ExecutorError, it is stored as-is.
If the error is a standard Error, it is wrapped in an ExecutorError with id 'EXECUTOR_ERROR'.

**Example:** With ExecutorError

```typescript
context.setError(new ExecutorError('VALIDATION_ERROR', 'Invalid input'));
console.log(context.error.id); // 'VALIDATION_ERROR'
```

**Example:** With standard Error (auto-converted)

```typescript
try {
  JSON.parse('invalid');
} catch (error) {
  context.setError(error); // Auto-converted to ExecutorError
  console.log(context.error.id); // 'EXECUTOR_ERROR'
  console.log(context.error.cause); // Original SyntaxError
}
```

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description                                                   |
| ------- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------- |
| `error` | `unknown` | ❌       | -       | -     | -          | The error to set in context (ExecutorError or standard Error) |

---

#### `setParameters` (Method)

**Type:** `(params: T) => void`

#### Parameters

| Name     | Type | Optional | Default | Since | Deprecated | Description                                 |
| -------- | ---- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `params` | `T`  | ❌       | -       | -     | -          | The parameters to set (stored by reference) |

---

##### `setParameters` (CallSignature)

**Type:** `void`

Set parameters in context

**Important**: Parameters are stored by reference, not cloned.
The provided parameters object will be used directly.

**Example:**

```typescript
const newParams = { value: 2 };
context.setParameters(newParams);
// context.parameters === newParams (same reference)
```

#### Parameters

| Name     | Type | Optional | Default | Since | Deprecated | Description                                 |
| -------- | ---- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `params` | `T`  | ❌       | -       | -     | -          | The parameters to set (stored by reference) |

---

#### `setReturnValue` (Method)

**Type:** `(value: R) => void`

#### Parameters

| Name    | Type | Optional | Default | Since | Deprecated | Description                      |
| ------- | ---- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `value` | `R`  | ❌       | -       | -     | -          | The value to set as return value |

---

##### `setReturnValue` (CallSignature)

**Type:** `void`

Set return value in context

#### Parameters

| Name    | Type | Optional | Default | Since | Deprecated | Description                      |
| ------- | ---- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `value` | `R`  | ❌       | -       | -     | -          | The value to set as return value |

---

#### `shouldBreakChain` (Method)

**Type:** `() => boolean`

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

---

#### `shouldBreakChainOnReturn` (Method)

**Type:** `() => boolean`

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

**Returns:**

True if execution should continue on error, false otherwise

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
Returns true if the hook should be skipped (invalid or disabled)

Core concept:
Plugin hook validation and enablement checking

Validation criteria:

- Hook method exists and is callable
- Plugin is enabled for the specific hook
- Plugin enablement function returns true

**Returns:**

True if the hook should be skipped, false otherwise

#### Parameters

| Name       | Type                           | Optional | Default | Since | Deprecated | Description                      |
| ---------- | ------------------------------ | -------- | ------- | ----- | ---------- | -------------------------------- |
| `plugin`   | `ExecutorPluginInterface<Ctx>` | ❌       | -       | -     | -          | The plugin to check              |
| `hookName` | `string`                       | ❌       | -       | -     | -          | The name of the hook to validate |

---
