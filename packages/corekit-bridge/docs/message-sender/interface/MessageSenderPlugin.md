## `src/core/message-sender/interface/MessageSenderPlugin` (Module)

**Type:** `module src/core/message-sender/interface/MessageSenderPlugin`

---

### `MessageSenderHookRuntimes` (Interface)

**Type:** `interface MessageSenderHookRuntimes`

Extended HookRuntimes for MessageSender with stream tracking support

Extends the base HookRuntimes interface to include stream-specific
runtime tracking properties.

**Example:**

```typescript
const runtimes: MessageSenderHookRuntimes = {
  ...baseRuntimes,
  streamTimes: 5 // Number of stream chunks processed
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

#### `streamTimes` (Property)

**Type:** `number`

**Default:** `0`

Number of stream chunks processed

Tracks the count of stream chunks that have been processed
through the plugin pipeline. Incremented automatically by

`runStream`
method.

**Example:**

```ts
`5`; // 5 chunks processed
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

### `MessageSenderOptions` (Interface)

**Type:** `interface MessageSenderOptions<MessageType>`

Message sender execution context

Provides the complete execution context for message sender operations,
including configuration, store access, and message state tracking.
This context is passed through the plugin execution chain.

**Example:**

```typescript
const context: MessageSenderContext<ChatMessage> = {
  store: messageStore,
  currentMessage: message,
  addedToStore: false
  // ... other config properties
};
```

---

#### `addedToStore` (Property)

**Type:** `boolean`

**Default:** `false`

Whether message has been added to store

Tracks if the current message has been persisted to the store.
Used by plugins to avoid duplicate additions and manage
message lifecycle properly.

---

#### `currentMessage` (Property)

**Type:** `MessageType`

Current message in the execution flow

The message being processed in the current execution cycle.
This message may be updated by plugins as it flows through
the execution pipeline.

---

#### `gateway` (Property)

**Type:** `MessageGetwayInterface`

Message gateway instance

Gateway responsible for actually sending messages to external
services (APIs, WebSocket servers, etc.).

---

#### `gatewayOptions` (Property)

**Type:** `GatewayOptions<unknown, Record<string, unknown>>`

Gateway options for message operations

Configuration for gateway behavior including:

- Stream event handlers (
  `onChunk`
  ,
  `onComplete`
  ,
  `onError`
  ,
  `onProgress`
  )
- Abort signal for cancellation control
- Custom request parameters

**Example:**

```typescript
const config = {
  gatewayOptions: {
    stream: true,
    onChunk: (chunk) => console.log(chunk),
    timeout: 30000
  }
};
```

---

#### `logger` (Property)

**Type:** `LoggerInterface<unknown>`

Logger instance for debugging and monitoring

Optional logger for tracking message send operations,
errors, and performance metrics.

---

#### `senderName` (Property)

**Type:** `string`

**Default:** `'MessageSender'`

Sender instance name

Used for logging and identification purposes. Helpful when
multiple sender instances exist in the application.

**Example:**

```typescript
const config = {
  senderName: 'ChatSender'
};
```

---

#### `signal` (Property)

**Type:** `AbortSignal`

Abort signal for request cancellation

---

#### `store` (Property)

**Type:** `MessagesStoreInterface<MessageType, MessagesStateInterface<MessageType>>`

Message store instance

Provides access to the message store for persistence and
state management operations during message sending.

---

#### `throwIfError` (Property)

**Type:** `boolean`

**Default:** `false`

Whether to throw errors on send failure

When
`true`
, failed send operations throw errors instead of
returning error messages. Useful for error boundary handling.

**Example:**

```typescript
const config = {
  throwIfError: true // Throw on failures
};
```

---

### `MessageSenderPlugin` (Interface)

**Type:** `interface MessageSenderPlugin<T>`

Message sender plugin interface

Defines the contract for message sender plugins with support for
streaming operations. Plugins can hook into the send lifecycle
to modify messages, handle streaming chunks, and respond to
connection events.

**Example:** Basic plugin

```typescript
const plugin: MessageSenderPlugin<ChatMessage> = {
  pluginName: 'logger',
  onBefore: (ctx) => {
    console.log('Sending:', ctx.parameters.currentMessage);
  }
};
```

**Example:** Plugin with streaming support

```typescript
const streamPlugin: MessageSenderPlugin<ChatMessage> = {
  pluginName: 'stream-handler',
  onConnected: (ctx) => {
    console.log('Stream connected');
  },
  onStream: (ctx, chunk) => {
    console.log('Received chunk:', chunk);
    return chunk;
  }
};
```

---

#### `onExec` (Property)

**Type:** `Object`

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

- The return type
  `R`
  is automatically inferred from the task parameter
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

**Type:** `(name: string, context: ExecutorContextInterface<MessageSenderOptions<T>, T, MessageSenderHookRuntimes>) => boolean`

#### Parameters

| Name      | Type                                                                              | Optional | Default | Since | Deprecated | Description                |
| --------- | --------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------- |
| `name`    | `string`                                                                          | ❌       | -       | -     | -          | Hook name to check         |
| `context` | `ExecutorContextInterface<MessageSenderOptions<T>, T, MessageSenderHookRuntimes>` | ✅       | -       | -     | -          | Optional execution context |

---

##### `enabled` (CallSignature)

**Type:** `boolean`

Check if plugin should be enabled for a given hook

**Returns:**

true if plugin should execute, false otherwise

#### Parameters

| Name      | Type                                                                              | Optional | Default | Since | Deprecated | Description                |
| --------- | --------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------- |
| `name`    | `string`                                                                          | ❌       | -       | -     | -          | Hook name to check         |
| `context` | `ExecutorContextInterface<MessageSenderOptions<T>, T, MessageSenderHookRuntimes>` | ✅       | -       | -     | -          | Optional execution context |

---

#### `onBefore` (Method)

**Type:** `(ctx: ExecutorContextInterface<MessageSenderOptions<T>, T, MessageSenderHookRuntimes>) => void \| Promise<void> \| MessageSenderOptions<T> \| Promise<MessageSenderOptions<T>>`

#### Parameters

| Name  | Type                                                                              | Optional | Default | Since | Deprecated | Description       |
| ----- | --------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------------- |
| `ctx` | `ExecutorContextInterface<MessageSenderOptions<T>, T, MessageSenderHookRuntimes>` | ❌       | -       | -     | -          | Execution context |

---

##### `onBefore` (CallSignature)

**Type:** `void \| Promise<void> \| MessageSenderOptions<T> \| Promise<MessageSenderOptions<T>>`

Hook executed before the main task
Can modify the input data before it reaches the task

Return value behavior:

- If returns a value (non-void), it will be used to update context parameters
- If returns void or undefined, parameters remain unchanged
- Supports both sync and async return values

**Returns:**

Modified parameters (will update context parameters), void, or Promise of either

#### Parameters

| Name  | Type                                                                              | Optional | Default | Since | Deprecated | Description       |
| ----- | --------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------------- |
| `ctx` | `ExecutorContextInterface<MessageSenderOptions<T>, T, MessageSenderHookRuntimes>` | ❌       | -       | -     | -          | Execution context |

---

#### `onConnected` (Method)

**Type:** `(context: MessageSenderContext<T>) => void`

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                                      |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `context` | `MessageSenderContext<T>` | ❌       | -       | -     | -          | Execution context with message sender parameters |

---

##### `onConnected` (CallSignature)

**Type:** `void`

Stream connection established hook

Called when a streaming connection is successfully established,
before any chunks are received. Use this to initialize streaming
state or prepare for incoming data.

**Returns:**

Promise that resolves when connection handling is complete

**Example:** Initialize streaming state

```typescript
onConnected: (context) => {
  const { currentMessage, store } = context.parameters;
  store.updateMessage(currentMessage.id, {
    loading: true,
    status: 'streaming'
  });
  console.log('Stream connected, ready to receive');
};
```

**Example:** Setup progress tracking

```typescript
onConnected: async (context) => {
  await analytics.trackEvent('stream_started', {
    messageId: context.parameters.currentMessage.id
  });
};
```

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                                      |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `context` | `MessageSenderContext<T>` | ❌       | -       | -     | -          | Execution context with message sender parameters |

---

#### `onError` (Method)

**Type:** `(ctx: ExecutorContextInterface<MessageSenderOptions<T>, T, MessageSenderHookRuntimes>) => LifecycleErrorResult \| Promise<LifecycleErrorResult>`

#### Parameters

| Name  | Type                                                                              | Optional | Default | Since | Deprecated | Description                                    |
| ----- | --------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------- |
| `ctx` | `ExecutorContextInterface<MessageSenderOptions<T>, T, MessageSenderHookRuntimes>` | ❌       | -       | -     | -          | Execution context containing error information |

---

##### `onError` (CallSignature)

**Type:** `LifecycleErrorResult \| Promise<LifecycleErrorResult>`

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

ExecutorError, Error, void, or Promise of either

#### Parameters

| Name  | Type                                                                              | Optional | Default | Since | Deprecated | Description                                    |
| ----- | --------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------- |
| `ctx` | `ExecutorContextInterface<MessageSenderOptions<T>, T, MessageSenderHookRuntimes>` | ❌       | -       | -     | -          | Execution context containing error information |

---

#### `onFinally` (Method)

**Type:** `(ctx: ExecutorContextInterface<MessageSenderOptions<T>, T, MessageSenderHookRuntimes>) => void \| Promise<void>`

#### Parameters

| Name  | Type                                                                              | Optional | Default | Since | Deprecated | Description                                          |
| ----- | --------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `ctx` | `ExecutorContextInterface<MessageSenderOptions<T>, T, MessageSenderHookRuntimes>` | ❌       | -       | -     | -          | Execution context (may contain error if task failed) |

---

##### `onFinally` (CallSignature)

**Type:** `void \| Promise<void>`

Hook executed in finally block after task execution

Purpose:
Allows plugins to perform cleanup operations that must run regardless
of whether the task succeeded or failed. Supports both sync and async execution.

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

**Returns:**

void or Promise<void>

**Example:** Resource cleanup

```typescript
onFinally: async (ctx) => {
  if (ctx.parameters.connection) {
    await ctx.parameters.connection.close();
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

#### Parameters

| Name  | Type                                                                              | Optional | Default | Since | Deprecated | Description                                          |
| ----- | --------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `ctx` | `ExecutorContextInterface<MessageSenderOptions<T>, T, MessageSenderHookRuntimes>` | ❌       | -       | -     | -          | Execution context (may contain error if task failed) |

---

#### `onStream` (Method)

**Type:** `(context: MessageSenderContext<T>, chunk: unknown) => unknown`

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                                      |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `context` | `MessageSenderContext<T>` | ❌       | -       | -     | -          | Execution context with message sender parameters |
| `chunk`   | `unknown`                 | ❌       | -       | -     | -          | Data chunk received from the stream              |

---

##### `onStream` (CallSignature)

**Type:** `unknown`

Stream chunk received hook

Called each time a chunk is received when sending in streaming mode.
This hook can process, transform, or log chunk data as it arrives.

Behavior:

- Can return a message object to be used as the final return value
- Can return nothing (void) to pass through the chunk unchanged
- Can transform the chunk before passing to the next plugin

**Returns:**

Optional transformed chunk or message object

**Example:** Log chunks

```typescript
onStream: (context, chunk) => {
  console.log('Chunk received:', chunk);
};
```

**Example:** Transform chunks

```typescript
onStream: (context, chunk) => {
  return {
    ...chunk,
    timestamp: Date.now()
  };
};
```

**Example:** Update message state

```typescript
onStream: async (context, chunk) => {
  const { currentMessage, store } = context.parameters;
  store.updateMessage(currentMessage.id, {
    content: chunk.content,
    loading: true
  });
};
```

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                                      |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `context` | `MessageSenderContext<T>` | ❌       | -       | -     | -          | Execution context with message sender parameters |
| `chunk`   | `unknown`                 | ❌       | -       | -     | -          | Data chunk received from the stream              |

---

#### `onSuccess` (Method)

**Type:** `(ctx: ExecutorContextInterface<MessageSenderOptions<T>, T, MessageSenderHookRuntimes>) => void \| Promise<void>`

#### Parameters

| Name  | Type                                                                              | Optional | Default | Since | Deprecated | Description       |
| ----- | --------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------------- |
| `ctx` | `ExecutorContextInterface<MessageSenderOptions<T>, T, MessageSenderHookRuntimes>` | ❌       | -       | -     | -          | Execution context |

---

##### `onSuccess` (CallSignature)

**Type:** `void \| Promise<void>`

Hook executed after successful task completion
Can transform the task result

**Returns:**

void or Promise<void>

#### Parameters

| Name  | Type                                                                              | Optional | Default | Since | Deprecated | Description       |
| ----- | --------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------------- |
| `ctx` | `ExecutorContextInterface<MessageSenderOptions<T>, T, MessageSenderHookRuntimes>` | ❌       | -       | -     | -          | Execution context |

---

### `MessageSenderContext` (TypeAlias)

**Type:** `ExecutorContextInterface<MessageSenderOptions<T>, T, MessageSenderHookRuntimes>`

Type alias for message sender plugin context

Wraps the message sender context in an executor context for use
in plugin implementations. Uses extended HookRuntimes with stream tracking.

This is the actual context instance type used at runtime.

---
