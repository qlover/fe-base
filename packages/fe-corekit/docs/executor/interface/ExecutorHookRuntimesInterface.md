## `src/executor/interface/ExecutorHookRuntimesInterface` (Module)

**Type:** `module src/executor/interface/ExecutorHookRuntimesInterface`

---

### `ExecutorHookRuntimesInterface` (Interface)

**Type:** `interface ExecutorHookRuntimesInterface<RuntimesType>`

**Since:** `2.6.0`

Interface for runtime tracking of executor hooks

Core concept:
Generic interface that allows extending HookRuntimes with custom properties.
This enables plugins to add their own runtime tracking data.

**Example:** Basic usage (default HookRuntimes)

```typescript
class MyContext implements ExecutorHookRuntimesInterface {
  // Uses default HookRuntimes
}
```

**Example:** Extended runtimes with custom properties

```typescript
interface CustomRuntimes extends HookRuntimes {
  executionTime?: number;
  memoryUsage?: number;
  customMetric?: string;
}

class MyContext implements ExecutorHookRuntimesInterface<CustomRuntimes> {
  get hooksRuntimes(): Readonly<CustomRuntimes> {
    // Return extended runtime data
  }
}
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

### `HookRuntimes` (Interface)

**Type:** `interface HookRuntimes`

**Since:** `3.0.0`

Runtime information interface for hook execution tracking

Core concept:
Provides detailed runtime metadata for individual hook execution,
enabling performance monitoring, flow control, and execution state tracking

Main features:

- Execution tracking: Monitors hook execution state and performance
- Flow control: Provides mechanisms to control execution pipeline flow
- Performance metrics: Tracks execution times and performance data
- State preservation: Maintains execution state throughout the pipeline
- Extensibility: Supports additional custom properties for specific use cases

Flow control mechanisms:

- breakChain: Immediately stops execution pipeline
- returnBreakChain: Stops pipeline when return value is present
- times: Tracks execution frequency for optimization

**Example:** Basic runtime information

```typescript
const runtime: HookRuntimes = {
  hookName: 'onBefore',
  returnValue: { validated: true },
  times: 1,
  breakChain: false,
  returnBreakChain: false
};
```

**Example:** Runtime with custom properties

```typescript
const runtime: HookRuntimes = {
  hookName: 'customHook',
  returnValue: { processed: true },
  times: 3,
  breakChain: false,
  returnBreakChain: true,
  customMetric: 'performance_data',
  executionTime: 150
};
```

---

#### `breakChain` (Property)

**Type:** `boolean`

Flag to immediately break the execution chain

Core concept:
Provides a mechanism to immediately stop the execution pipeline,
enabling early termination when certain conditions are met

Main features:

- Immediate termination: Stops execution pipeline immediately
- Conditional control: Enables conditional execution flow
- Error handling: Allows early termination on critical errors
- Performance optimization: Avoids unnecessary processing

Use cases:

- Error conditions: Stop execution when critical errors occur
- Validation failures: Terminate when validation fails
- Early success: Stop when desired result is achieved early
- Resource constraints: Terminate when resources are exhausted

**Example:**

```ts
`true`; // Break execution chain immediately
```

**Example:**

```ts
`false`; // Continue normal execution
```

---

#### `continueOnError` (Property)

**Type:** `boolean`

Flag to continue execution on error

Core concept:
Provides a mechanism to continue executing subsequent plugins even when
a plugin hook throws an error, enabling resilient execution pipelines

Main features:

- Error resilience: Continues execution despite individual plugin failures
- Fault tolerance: Enables graceful degradation in plugin chains
- Cleanup guarantees: Ensures all cleanup hooks execute even if some fail
- Flexible error handling: Allows selective error suppression

Use cases:

- Finally hooks: Ensure all cleanup operations execute even if one fails
- Logging hooks: Continue logging even if one logger fails
- Monitoring hooks: Collect metrics from all plugins despite failures
- Non-critical operations: Continue execution for non-critical hooks

**Example:**

```ts
`true`; // Continue to next plugin even if current plugin throws error
```

**Example:**

```ts
`false`; // Stop execution and throw error (default behavior)
```

---

#### `hookName` (Property)

**Type:** `string`

Name of the current hook being executed

Core concept:
Identifies the specific hook that is currently being executed,
enabling targeted debugging and monitoring of hook performance

Main features:

- Hook identification: Clearly identifies which hook is executing
- Debugging support: Enables targeted debugging of specific hooks
- Performance monitoring: Allows tracking of individual hook performance
- Pipeline visibility: Provides visibility into execution pipeline state

**Example:**

```ts
`'onBefore'`;
```

**Example:**

```ts
`'onExec'`;
```

**Example:**

```ts
`'onAfter'`;
```

**Example:**

```ts
`'customValidationHook'`;
```

---

#### `pluginIndex` (Property)

**Type:** `number`

Index of the current plugin in the plugins array

Core concept:
Tracks the position of the current plugin in the execution chain,
useful for debugging execution order

**Example:**

```ts
`0`; // First plugin
```

**Example:**

```ts
`2`; // Third plugin
```

---

#### `pluginName` (Property)

**Type:** `string`

Name of the current plugin being executed

Core concept:
Identifies which plugin is currently executing, enabling plugin-specific
debugging and tracking

**Example:**

```ts
`'ValidationPlugin'`;
```

**Example:**

```ts
`'CachePlugin'`;
```

---

#### `returnBreakChain` (Property)

**Type:** `boolean`

Flag to break chain when return value exists

Core concept:
Enables conditional chain breaking based on the presence of a return value,
commonly used in error handling and early termination scenarios

Main features:

- Conditional termination: Breaks chain only when return value exists
- Error handling: Commonly used in
  `onError`
  lifecycle hooks
- Result-based control: Enables flow control based on hook results
- Flexible termination: Provides more nuanced control than
  `breakChain`

Common usage:

- Error handlers: Break chain when error is handled and result is returned
- Validation: Stop processing when validation result is returned
- Caching: Terminate when cached result is found
- Early success: Stop when desired result is achieved

**Example:**

```ts
`true`; // Break chain if returnValue exists
```

**Example:**

```ts
`false`; // Continue regardless of returnValue
```

---

#### `returnValue` (Property)

**Type:** `unknown`

Return value from the current hook execution

Core concept:
Captures the return value from the current hook execution,
enabling result tracking and flow control based on hook output

Main features:

- Result tracking: Monitors what each hook returns
- Flow control: Enables conditional execution based on return values
- Debugging support: Provides visibility into hook output
- Pipeline integration: Results can influence downstream execution

**Example:**

```ts
`{ validated: true, data: 'processed' }`;
```

**Example:**

```ts
`'hook_result'`;
```

**Example:**

```ts
`{ error: 'validation_failed' }`;
```

---

#### `times` (Property)

**Type:** `number`

Number of times the current hook has been executed

Core concept:
Tracks how many plugins have executed the current hook (e.g., onBefore).
This counter increments for each plugin that successfully executes the hook.

Important:

- This is per-hook, not global
- Reset when switching to a different hook
- Represents "which plugin is executing this hook" (1st, 2nd, 3rd, etc.)

Main features:

- Execution counting: Monitors how many plugins executed this hook
- Performance analysis: Identifies frequently executed hooks
- Loop detection: Helps identify potential infinite loops
- Optimization insights: Provides data for performance optimization

Usage scenarios:

- Know if any plugin executed the hook (times > 0)
- Track which plugin number is executing (useful for debugging)
- Detect if hook was skipped by all plugins (times === 0)

**Example:**

```ts
`0`; // No plugin has executed this hook yet
```

**Example:**

```ts
`1`; // First plugin executed this hook
```

**Example:**

```ts
`3`; // Third plugin is executing this hook
```

---
