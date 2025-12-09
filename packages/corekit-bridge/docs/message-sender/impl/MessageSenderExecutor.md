## `src/core/message-sender/impl/MessageSenderExecutor` (Module)

**Type:** `module src/core/message-sender/impl/MessageSenderExecutor`

---

### `MessageSenderExecutor` (Class)

**Type:** `class MessageSenderExecutor<MessageType>`

Message sender executor for managing plugin execution

Extends AsyncExecutor to provide specialized execution flow for message
sending operations, including support for streaming chunks and connection
events. Manages plugin lifecycle and hook execution for message operations.

Core features:

- Standard plugin execution for message sending
- Streaming chunk processing with all plugins
- Connection event broadcasting to plugins
- Stream timing tracking and management

**Example:** Basic usage

```typescript
const executor = new MessageSenderExecutor();
executor.use(plugin1);
executor.use(plugin2);

const context = createContext();
await executor.execute(context);
```

**Example:** With streaming

```typescript
const executor = new MessageSenderExecutor();
const context = createContext();

// Notify connection
await executor.runConnected(context);

// Process chunks
for await (const chunk of stream) {
  await executor.runStream(chunk, context);
}

// Reset for next operation
executor.resetRuntimesStreamTimes(context);
```

---

#### `new MessageSenderExecutor` (Constructor)

**Type:** `(config: ExecutorConfigInterface) => MessageSenderExecutor<MessageType>`

#### Parameters

| Name     | Type                      | Optional | Default | Since | Deprecated | Description                                                  |
| -------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------ |
| `config` | `ExecutorConfigInterface` | ✅       | -       | -     | -          | Optional configuration object to customize executor behavior |

---

#### `config` (Property)

**Type:** `ExecutorConfigInterface`

---

#### `contextHandler` (Property)

**Type:** `ContextHandler`

---

#### `plugins` (Property)

**Type:** `ExecutorPlugin<unknown>[]`

Array of active plugins for this executor

Core concept:
Maintains an ordered collection of plugins that participate in the execution pipeline

Main features:

- Plugin storage: Stores all registered plugins in execution order
- Lifecycle management: Manages plugin initialization and cleanup
- Execution coordination: Ensures plugins execute in the correct sequence
- Deduplication support: Prevents duplicate plugins when configured

Plugin execution order:

1. Plugins are executed in the order they were added
2. Each plugin can modify data or control execution flow
3. Plugin hooks are called based on executor configuration

**Example:**

```typescript
protected plugins = [
  new LoggerPlugin(),
  new RetryPlugin({ maxAttempts: 3 }),
  new CachePlugin({ ttl: 300 })
];
```

---

#### `exec` (Method)

**Type:** `(dataOrTask: Params \| PromiseTask<Result, Params>, task: PromiseTask<Result, Params>) => Promise<Result>`

#### Parameters

| Name         | Type                                    | Optional | Default | Since | Deprecated | Description                                            |
| ------------ | --------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `dataOrTask` | `Params \| PromiseTask<Result, Params>` | ❌       | -       | -     | -          | Task data or task function                             |
| `task`       | `PromiseTask<Result, Params>`           | ✅       | -       | -     | -          | Task function (optional when dataOrTask is a function) |

---

##### `exec` (CallSignature)

**Type:** `Promise<Result>`

Execute asynchronous task with full plugin pipeline

Core concept:
Complete execution pipeline with plugin lifecycle management

Execution flow:

1. Validate and prepare task
2. Execute beforeHooks (configured or default 'onBefore')
3. Execute core task logic with execHook support
4. Execute afterHooks (configured or default 'onSuccess')
5. Handle errors with onError hooks if needed

Performance considerations:

- Async overhead for Promise handling
- Sequential execution path
- Plugin chain optimization

**Throws:**

When task is not an async function

**Throws:**

When task execution fails

**Returns:**

Promise resolving to task execution result

**Example:** Basic task execution

```typescript
const result = await executor.exec(async (data) => {
  const response = await fetch('https://api.example.com/data');
  return response.json();
});
```

**Example:** With input data

```typescript
const data = { userId: 123 };
const result = await executor.exec(data, async (input) => {
  return await fetchUserData(input.userId);
});
```

**Example:** With validation

```typescript
const result = await executor.exec(async (data) => {
  if (typeof data !== 'string') {
    throw new Error('Data must be string');
  }
  return await processData(data);
});
```

#### Parameters

| Name         | Type                                    | Optional | Default | Since | Deprecated | Description                                            |
| ------------ | --------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `dataOrTask` | `Params \| PromiseTask<Result, Params>` | ❌       | -       | -     | -          | Task data or task function                             |
| `task`       | `PromiseTask<Result, Params>`           | ✅       | -       | -     | -          | Task function (optional when dataOrTask is a function) |

---

#### `execNoError` (Method)

**Type:** `(dataOrTask: Params \| PromiseTask<Result, Params>, task: PromiseTask<Result, Params>) => Promise<ExecutorError \| Result>`

#### Parameters

| Name         | Type                                    | Optional | Default | Since | Deprecated | Description                                            |
| ------------ | --------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `dataOrTask` | `Params \| PromiseTask<Result, Params>` | ❌       | -       | -     | -          | Task data or task function                             |
| `task`       | `PromiseTask<Result, Params>`           | ✅       | -       | -     | -          | Task function (optional when dataOrTask is a function) |

---

##### `execNoError` (CallSignature)

**Type:** `Promise<ExecutorError \| Result>`

Execute task without throwing errors

Core concept:
Error-safe execution pipeline that returns errors instead of throwing

Advantages over try-catch:

- Standardized error handling
- No exception propagation
- Consistent error types
- Plugin error handling support

**Returns:**

Promise resolving to task result or ExecutorError if execution fails

**Throws:**

Never throws - all errors are wrapped in ExecutorError

**Example:** Basic usage

```typescript
const result = await executor.execNoError(async () => {
  const response = await riskyOperation();
  return response.data;
});

if (result instanceof ExecutorError) {
  console.error('Operation failed:', result);
}
```

**Example:** With input data

```typescript
const result = await executor.execNoError(
  { userId: 123 },
  async (data) => await fetchUserData(data.userId)
);
```

#### Parameters

| Name         | Type                                    | Optional | Default | Since | Deprecated | Description                                            |
| ------------ | --------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `dataOrTask` | `Params \| PromiseTask<Result, Params>` | ❌       | -       | -     | -          | Task data or task function                             |
| `task`       | `PromiseTask<Result, Params>`           | ✅       | -       | -     | -          | Task function (optional when dataOrTask is a function) |

---

#### `resetRuntimesStreamTimes` (Method)

**Type:** `(context: ExecutorContext<MessageSenderContextOptions<MessageType>>) => void`

#### Parameters

| Name      | Type                                                        | Optional | Default | Since | Deprecated | Description                                |
| --------- | ----------------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `context` | `ExecutorContext<MessageSenderContextOptions<MessageType>>` | ❌       | -       | -     | -          | Execution context containing hook runtimes |

---

##### `resetRuntimesStreamTimes` (CallSignature)

**Type:** `void`

Reset stream timing counter

Resets the
`streamTimes`
counter in the context's hook runtimes to zero.
This should be called at the start of a new streaming operation to ensure
accurate timing tracking.

**Example:**

```typescript
// Before starting a new stream
executor.resetRuntimesStreamTimes(context);
await startNewStream();
```

#### Parameters

| Name      | Type                                                        | Optional | Default | Since | Deprecated | Description                                |
| --------- | ----------------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `context` | `ExecutorContext<MessageSenderContextOptions<MessageType>>` | ❌       | -       | -     | -          | Execution context containing hook runtimes |

---

#### `run` (Method)

**Type:** `(data: Params, actualTask: PromiseTask<Result, Params>) => Promise<Result>`

#### Parameters

| Name         | Type                          | Optional | Default | Since | Deprecated | Description                     |
| ------------ | ----------------------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `data`       | `Params`                      | ❌       | -       | -     | -          | Data to pass to the task        |
| `actualTask` | `PromiseTask<Result, Params>` | ❌       | -       | -     | -          | Actual task function to execute |

---

##### `run` (CallSignature)

**Type:** `Promise<Result>`

Core task execution method with plugin hooks

Core concept:
Complete execution pipeline with configurable hook lifecycle

Pipeline stages:

1. beforeHooks - Pre-process input data (configurable, default: 'onBefore')
2. Task execution - Run the actual task with execHook support
3. afterHooks - Post-process results (configurable, default: 'onSuccess')
4. onError hooks - Handle any errors

Error handling strategy:

- Catches all errors
- Passes errors through plugin chain
- Wraps unhandled errors in ExecutorError
- Supports plugin error handling

**Throws:**

When task execution fails

**Returns:**

Promise resolving to task execution result

**Example:** Internal implementation

```typescript
protected async run(data, task) {
  try {
    // Execute beforeHooks (configurable)
    await this.runHooks(this.plugins, beforeHooks, context);

    // Execute core logic with execHook support
    await this.runExec(context, actualTask);

    // Execute afterHooks (configurable)
    await this.runHooks(this.plugins, afterHooks, context);

    return context.returnValue;
  } catch (error) {
    // Handle errors with onError hooks
    await this.runHook(this.plugins, 'onError', context);
  }
}
```

#### Parameters

| Name         | Type                          | Optional | Default | Since | Deprecated | Description                     |
| ------------ | ----------------------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `data`       | `Params`                      | ❌       | -       | -     | -          | Data to pass to the task        |
| `actualTask` | `PromiseTask<Result, Params>` | ❌       | -       | -     | -          | Actual task function to execute |

---

#### `runConnected` (Method)

**Type:** `(context: ExecutorContext<MessageSenderContextOptions<MessageType>>) => Promise<void>`

#### Parameters

| Name      | Type                                                        | Optional | Default | Since | Deprecated | Description                                      |
| --------- | ----------------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `context` | `ExecutorContext<MessageSenderContextOptions<MessageType>>` | ❌       | -       | -     | -          | Execution context with message sender parameters |

---

##### `runConnected` (CallSignature)

**Type:** `Promise<void>`

Execute connection established event through all plugins

Runs the
`onConnected`
hook for all registered plugins when a streaming
connection is successfully established. This allows plugins to initialize
state or perform setup before chunks start arriving.

**Returns:**

Promise that resolves when all plugins have handled the event

**Example:** Notify connection

```typescript
const context = createContext();

try {
  await establishConnection();
  await executor.runConnected(context);
  console.log('All plugins notified of connection');
} catch (error) {
  console.error('Connection failed:', error);
}
```

#### Parameters

| Name      | Type                                                        | Optional | Default | Since | Deprecated | Description                                      |
| --------- | ----------------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `context` | `ExecutorContext<MessageSenderContextOptions<MessageType>>` | ❌       | -       | -     | -          | Execution context with message sender parameters |

---

#### `runExec` (Method)

**Type:** `(context: ExecutorContext<Params>, actualTask: PromiseTask<Result, Params>) => Promise<void>`

#### Parameters

| Name         | Type                          | Optional | Default | Since | Deprecated | Description              |
| ------------ | ----------------------------- | -------- | ------- | ----- | ---------- | ------------------------ |
| `context`    | `ExecutorContext<Params>`     | ❌       | -       | -     | -          | Execution context        |
| `actualTask` | `PromiseTask<Result, Params>` | ❌       | -       | -     | -          | Task function to execute |

---

##### `runExec` (CallSignature)

**Type:** `Promise<void>`

Execute core task logic with execHook support

Core concept:
Handles the execution phase with optional plugin intervention

Execution logic:

1. Execute configured execHook (default: 'onExec')
2. If no execHook was executed, run the actual task
3. Otherwise, use the return value from execHook

#### Parameters

| Name         | Type                          | Optional | Default | Since | Deprecated | Description              |
| ------------ | ----------------------------- | -------- | ------- | ----- | ---------- | ------------------------ |
| `context`    | `ExecutorContext<Params>`     | ❌       | -       | -     | -          | Execution context        |
| `actualTask` | `PromiseTask<Result, Params>` | ❌       | -       | -     | -          | Task function to execute |

---

#### `runHook` (Method)

**Type:** `(plugins: ExecutorPlugin<unknown>[], hookName: string, context: ExecutorContext<Params>, args: unknown[]) => Promise<Params>`

#### Parameters

| Name       | Type                        | Optional | Default | Since | Deprecated | Description                                               |
| ---------- | --------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------- |
| `plugins`  | `ExecutorPlugin<unknown>[]` | ❌       | -       | -     | -          | Array of plugins to execute                               |
| `hookName` | `string`                    | ❌       | -       | -     | -          | Name of the hook function to execute                      |
| `context`  | `ExecutorContext<Params>`   | ✅       | -       | -     | -          | Execution context containing data and runtime information |
| `args`     | `unknown[]`                 | ❌       | -       | -     | -          | Additional arguments to pass to the hook function         |

---

##### `runHook` (CallSignature)

**Type:** `Promise<Params>`

**Since:** `2.1.0`

Execute a single plugin hook function asynchronously

Core concept:
Sequential async plugin execution with chain breaking and return value handling

Execution flow:

1. Check if plugin is enabled for the hook
2. Execute plugin hook if available
3. Handle plugin results and chain breaking conditions
4. Continue to next plugin or break chain

Key features:

- Plugin enablement checking
- Chain breaking support
- Return value management
- Runtime tracking
- Async execution with await

**Returns:**

Promise resolving to the result of the hook function execution

**Example:** Internal usage

```typescript
const result = await this.runHook(this.plugins, 'onBefore', context, data);
```

#### Parameters

| Name       | Type                        | Optional | Default | Since | Deprecated | Description                                               |
| ---------- | --------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------------- |
| `plugins`  | `ExecutorPlugin<unknown>[]` | ❌       | -       | -     | -          | Array of plugins to execute                               |
| `hookName` | `string`                    | ❌       | -       | -     | -          | Name of the hook function to execute                      |
| `context`  | `ExecutorContext<Params>`   | ✅       | -       | -     | -          | Execution context containing data and runtime information |
| `args`     | `unknown[]`                 | ❌       | -       | -     | -          | Additional arguments to pass to the hook function         |

---

#### `runHooks` (Method)

**Type:** `(plugins: ExecutorPlugin<unknown>[], hookNames: string \| string[], context: ExecutorContext<Params>, args: unknown[]) => Promise<Params>`

#### Parameters

| Name        | Type                        | Optional | Default | Since | Deprecated | Description                                                    |
| ----------- | --------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `plugins`   | `ExecutorPlugin<unknown>[]` | ❌       | -       | -     | -          | Array of plugins to execute                                    |
| `hookNames` | `string \| string[]`        | ❌       | -       | -     | -          | Single hook name or array of hook names to execute in sequence |
| `context`   | `ExecutorContext<Params>`   | ✅       | -       | -     | -          | Execution context containing data and runtime information      |
| `args`      | `unknown[]`                 | ❌       | -       | -     | -          | Additional arguments to pass to the hook functions             |

---

##### `runHooks` (CallSignature)

**Type:** `Promise<Params>`

Execute multiple plugin hook functions asynchronously
Supports executing multiple hook names in sequence

Core concept:
Sequential execution of multiple hooks with chain breaking support

Execution flow:

1. For each hook name, check if plugin is enabled
2. Execute plugin hook if available
3. Handle plugin results and chain breaking conditions
4. Continue to next hook name if chain is not broken

Key features:

- Supports multiple hook names in sequence
- Chain breaking support for each hook
- Return value management across hooks
- Backward compatibility with single hook execution
- Async execution with await

**Returns:**

Promise resolving to the result of the last executed hook function

**Example:** Execute multiple hooks in sequence

```typescript
const result = await this.runHooks(
  this.plugins,
  ['onBefore', 'onValidate', 'onProcess'],
  context,
  data
);
```

**Example:** Execute single hook (backward compatibility)

```typescript
const result = await this.runHooks(this.plugins, 'onBefore', context, data);
```

#### Parameters

| Name        | Type                        | Optional | Default | Since | Deprecated | Description                                                    |
| ----------- | --------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `plugins`   | `ExecutorPlugin<unknown>[]` | ❌       | -       | -     | -          | Array of plugins to execute                                    |
| `hookNames` | `string \| string[]`        | ❌       | -       | -     | -          | Single hook name or array of hook names to execute in sequence |
| `context`   | `ExecutorContext<Params>`   | ✅       | -       | -     | -          | Execution context containing data and runtime information      |
| `args`      | `unknown[]`                 | ❌       | -       | -     | -          | Additional arguments to pass to the hook functions             |

---

#### `runStream` (Method)

**Type:** `(chunk: unknown, context: ExecutorContext<MessageSenderContextOptions<MessageType>>) => Promise<unknown>`

#### Parameters

| Name      | Type                                                        | Optional | Default | Since | Deprecated | Description                                      |
| --------- | ----------------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `chunk`   | `unknown`                                                   | ❌       | -       | -     | -          | Data chunk received from the stream              |
| `context` | `ExecutorContext<MessageSenderContextOptions<MessageType>>` | ❌       | -       | -     | -          | Execution context with message sender parameters |

---

##### `runStream` (CallSignature)

**Type:** `Promise<unknown>`

Execute stream chunk processing through all plugins

Runs the
`onStream`
hook for all registered plugins, passing the chunk
through the plugin chain. Automatically tracks and increments the stream
chunk counter for monitoring purposes.

**Returns:**

Result after processing through all plugin hooks

**Example:** Process streaming chunks

```typescript
const context = createContext();

for await (const chunk of streamReader) {
  const processed = await executor.runStream(chunk, context);
  updateUI(processed);
}
```

**Example:** With chunk counting

```typescript
await executor.runStream(chunk, context);
const chunkCount = context.hooksRuntimes.streamTimes;
console.log(`Processed ${chunkCount} chunks`);
```

#### Parameters

| Name      | Type                                                        | Optional | Default | Since | Deprecated | Description                                      |
| --------- | ----------------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `chunk`   | `unknown`                                                   | ❌       | -       | -     | -          | Data chunk received from the stream              |
| `context` | `ExecutorContext<MessageSenderContextOptions<MessageType>>` | ❌       | -       | -     | -          | Execution context with message sender parameters |

---

#### `use` (Method)

**Type:** `(plugin: ExecutorPlugin<unknown>) => void`

#### Parameters

| Name     | Type                      | Optional | Default | Since | Deprecated | Description                                      |
| -------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `plugin` | `ExecutorPlugin<unknown>` | ❌       | -       | -     | -          | Plugin instance to add to the execution pipeline |

---

##### `use` (CallSignature)

**Type:** `void`

Add a plugin to the executor's execution pipeline

Core concept:
Registers a plugin to participate in the executor's execution pipeline,
extending the executor's functionality with additional capabilities

Main features:

- Plugin registration: Adds plugins to the execution pipeline
- Deduplication: Prevents duplicate plugins when
  `onlyOne`
  is true
- Order preservation: Maintains plugin execution order
- Validation: Ensures plugin is a valid object

Deduplication logic:

- Checks for exact plugin instance match
- Checks for plugin name match
- Checks for constructor match
- Only prevents duplicates when
  `plugin.onlyOne`
  is true

**Throws:**

When plugin is not a valid object

**Example:** Add a class-based plugin

```typescript
executor.use(new LoggerPlugin());
executor.use(new RetryPlugin({ maxAttempts: 3 }));
```

**Example:** Add a plain object plugin

```typescript
executor.use({
  pluginName: 'CustomPlugin',
  onBefore: (data) => ({ ...data, modified: true }),
  onAfter: (result) => console.log('Result:', result)
});
```

**Example:** Plugin with deduplication

```typescript
const plugin = new LoggerPlugin();
plugin.onlyOne = true;

executor.use(plugin); // First addition - succeeds
executor.use(plugin); // Second addition - skipped with warning
```

#### Parameters

| Name     | Type                      | Optional | Default | Since | Deprecated | Description                                      |
| -------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `plugin` | `ExecutorPlugin<unknown>` | ❌       | -       | -     | -          | Plugin instance to add to the execution pipeline |

---

### `MessageSenderContextOptions` (Interface)

**Type:** `interface MessageSenderContextOptions<MessageType>`

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

**Type:** `LoggerInterface`

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
  name: 'logger',
  execute: async (context, next) => {
    console.log('Sending:', context.parameters.currentMessage);
    return next();
  }
};
```

**Example:** Plugin with streaming support

```typescript
const streamPlugin: MessageSenderPlugin<ChatMessage> = {
  name: 'stream-handler',
  execute: async (context, next) => next(),
  onConnected: (context) => {
    console.log('Stream connected');
  },
  onStream: (context, chunk) => {
    console.log('Received chunk:', chunk);
    return chunk;
  }
};
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

**Type:** `(name: parameter name, context: ExecutorContext<MessageSenderContextOptions<T>>) => boolean`

#### Parameters

| Name      | Type                                              | Optional | Default | Since | Deprecated | Description                     |
| --------- | ------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `name`    | `parameter name`                                  | ❌       | -       | -     | -          | Name of the hook being executed |
| `context` | `ExecutorContext<MessageSenderContextOptions<T>>` | ✅       | -       | -     | -          |                                 |

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

| Name      | Type                                              | Optional | Default | Since | Deprecated | Description                     |
| --------- | ------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `name`    | `parameter name`                                  | ❌       | -       | -     | -          | Name of the hook being executed |
| `context` | `ExecutorContext<MessageSenderContextOptions<T>>` | ✅       | -       | -     | -          |                                 |

---

#### `onBefore` (Method)

**Type:** `(context: ExecutorContext<MessageSenderContextOptions<T>>) => void \| Promise<void>`

#### Parameters

| Name      | Type                                              | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<MessageSenderContextOptions<T>>` | ❌       | -       | -     | -          |             |

---

##### `onBefore` (CallSignature)

**Type:** `void \| Promise<void>`

Hook executed before the main task
Can modify the input data before it reaches the task

**Returns:**

Modified data or Promise of modified data

#### Parameters

| Name      | Type                                              | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<MessageSenderContextOptions<T>>` | ❌       | -       | -     | -          |             |

---

#### `onConnected` (Method)

**Type:** `(context: MessageSenderPluginContext<T>) => void \| Promise<void>`

#### Parameters

| Name      | Type                            | Optional | Default | Since | Deprecated | Description                                      |
| --------- | ------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `context` | `MessageSenderPluginContext<T>` | ❌       | -       | -     | -          | Execution context with message sender parameters |

---

##### `onConnected` (CallSignature)

**Type:** `void \| Promise<void>`

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

| Name      | Type                            | Optional | Default | Since | Deprecated | Description                                      |
| --------- | ------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `context` | `MessageSenderPluginContext<T>` | ❌       | -       | -     | -          | Execution context with message sender parameters |

---

#### `onError` (Method)

**Type:** `(context: ExecutorContext<MessageSenderContextOptions<T>>) => void \| ExecutorError \| Error \| Promise<void \| ExecutorError \| Error>`

#### Parameters

| Name      | Type                                              | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<MessageSenderContextOptions<T>>` | ❌       | -       | -     | -          |             |

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

| Name      | Type                                              | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<MessageSenderContextOptions<T>>` | ❌       | -       | -     | -          |             |

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

#### `onStream` (Method)

**Type:** `(context: MessageSenderPluginContext<T>, chunk: unknown) => unknown`

#### Parameters

| Name      | Type                            | Optional | Default | Since | Deprecated | Description                                      |
| --------- | ------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `context` | `MessageSenderPluginContext<T>` | ❌       | -       | -     | -          | Execution context with message sender parameters |
| `chunk`   | `unknown`                       | ❌       | -       | -     | -          | Data chunk received from the stream              |

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

| Name      | Type                            | Optional | Default | Since | Deprecated | Description                                      |
| --------- | ------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `context` | `MessageSenderPluginContext<T>` | ❌       | -       | -     | -          | Execution context with message sender parameters |
| `chunk`   | `unknown`                       | ❌       | -       | -     | -          | Data chunk received from the stream              |

---

#### `onSuccess` (Method)

**Type:** `(context: ExecutorContext<MessageSenderContextOptions<T>>) => void \| Promise<void>`

#### Parameters

| Name      | Type                                              | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<MessageSenderContextOptions<T>>` | ❌       | -       | -     | -          |             |

---

##### `onSuccess` (CallSignature)

**Type:** `void \| Promise<void>`

Hook executed after successful task completion
Can transform the task result

**Returns:**

Modified result or Promise of modified result

#### Parameters

| Name      | Type                                              | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `ExecutorContext<MessageSenderContextOptions<T>>` | ❌       | -       | -     | -          |             |

---

### `MessageSenderPluginContext` (TypeAlias)

**Type:** `ExecutorContext<MessageSenderContextOptions<T>>`

Type alias for message sender plugin context

Wraps the message sender context in an executor context for use
in plugin implementations.

---
