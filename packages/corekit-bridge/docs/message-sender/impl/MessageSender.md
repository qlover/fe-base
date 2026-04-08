## `src/core/message-sender/impl/MessageSender` (Module)

**Type:** `module src/core/message-sender/impl/MessageSender`

---

### `MessageSender` (Class)

**Type:** `class MessageSender<MessageType>`

Message sender implementation

Core class responsible for orchestrating message sending operations,
including gateway communication, plugin execution, error handling,
abort control, and streaming support.

Core features:

- Message sending with plugin pipeline
- Gateway integration and abstraction
- Streaming and normal mode support
- Abort/cancel operations
- Comprehensive error handling
- Performance logging

**Example:** Basic usage

```typescript
const store = new MessagesStore();
const sender = new MessageSender(store, {
  gateway: myGateway,
  logger: myLogger
});

// Send message
const result = await sender.send({ content: 'Hello' });
```

**Example:** With plugins

```typescript
sender.use(validationPlugin).use(loggingPlugin).use(transformPlugin);

await sender.send({ content: 'Hello' });
```

**Example:** With streaming

```typescript
await sender.send(
  { content: 'Hello' },
  {
    onConnected: () => console.log('Connected'),
    onChunk: (chunk) => updateUI(chunk),
    onComplete: (msg) => console.log('Complete')
  }
);
```

---

#### `new MessageSender` (Constructor)

**Type:** `(messages: MessagesStore<MessageType, MessagesStateInterface<MessageType>>, config: MessageSenderConfig<MessageType>) => MessageSender<MessageType>`

#### Parameters

| Name       | Type                                                              | Optional | Default | Since | Deprecated | Description |
| ---------- | ----------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `messages` | `MessagesStore<MessageType, MessagesStateInterface<MessageType>>` | ❌       | -       | -     | -          |             |
| `config`   | `MessageSenderConfig<MessageType>`                                | ✅       | -       | -     | -          |             |

---

#### `config` (Property)

**Type:** `MessageSenderConfig<MessageType>`

---

#### `loggerTpl` (Property)

**Type:** `Object`

---

##### `failed` (Property)

**Type:** `string`

---

##### `success` (Property)

**Type:** `string`

---

#### `messages` (Property)

**Type:** `MessagesStore<MessageType, MessagesStateInterface<MessageType>>`

---

#### `senderGateway` (Property)

**Type:** `SenderGatewayInterface<MessageType>`

---

#### `senderName` (Property)

**Type:** `string`

---

#### `aborter` (Accessor)

**Type:** `accessor aborter`

---

#### `executor` (Accessor)

**Type:** `accessor executor`

---

#### `logger` (Accessor)

**Type:** `accessor logger`

---

#### `createSendOptions` (Method)

**Type:** `(sendingMessage: MessageType, gatewayOptions: GatewayOptions<MessageType, Record<string, unknown>>) => MessageSenderOptions<MessageType>`

#### Parameters

| Name             | Type                                                   | Optional | Default | Since | Deprecated | Description                    |
| ---------------- | ------------------------------------------------------ | -------- | ------- | ----- | ---------- | ------------------------------ |
| `sendingMessage` | `MessageType`                                          | ❌       | -       | -     | -          | Message being sent             |
| `gatewayOptions` | `GatewayOptions<MessageType, Record<string, unknown>>` | ✅       | -       | -     | -          | Optional gateway configuration |

---

##### `createSendOptions` (CallSignature)

**Type:** `MessageSenderOptions<MessageType>`

Create execution context for sending

Constructs the complete context object needed for message send execution,
merging configuration and options, and using message ID for abort control.

**Returns:**

Complete execution context for message sending

#### Parameters

| Name             | Type                                                   | Optional | Default | Since | Deprecated | Description                    |
| ---------------- | ------------------------------------------------------ | -------- | ------- | ----- | ---------- | ------------------------------ |
| `sendingMessage` | `MessageType`                                          | ❌       | -       | -     | -          | Message being sent             |
| `gatewayOptions` | `GatewayOptions<MessageType, Record<string, unknown>>` | ✅       | -       | -     | -          | Optional gateway configuration |

---

#### `generateSendingMessage` (Method)

**Type:** `(message: Partial<MessageType>) => MessageType`

#### Parameters

| Name      | Type                   | Optional | Default | Since | Deprecated | Description                   |
| --------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------------------------- |
| `message` | `Partial<MessageType>` | ❌       | -       | -     | -          | Partial message specification |

---

##### `generateSendingMessage` (CallSignature)

**Type:** `MessageType`

Generate a sending message from partial data

Creates a complete message object ready for sending with proper
status, loading state, and timestamps.

**Returns:**

Complete message ready for sending

#### Parameters

| Name      | Type                   | Optional | Default | Since | Deprecated | Description                   |
| --------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------------------------- |
| `message` | `Partial<MessageType>` | ❌       | -       | -     | -          | Partial message specification |

---

#### `getDuration` (Method)

**Type:** `(message: MessageType) => number`

#### Parameters

| Name      | Type          | Optional | Default | Since | Deprecated | Description                       |
| --------- | ------------- | -------- | ------- | ----- | ---------- | --------------------------------- |
| `message` | `MessageType` | ❌       | -       | -     | -          | Message to calculate duration for |

---

##### `getDuration` (CallSignature)

**Type:** `number`

Get message send duration

Calculates the time taken to send a message in milliseconds.
Returns 0 if message has no end time (still in progress).

**Returns:**

Duration in milliseconds

**Example:**

```typescript
const message = await sender.send({ content: 'Hello' });
const duration = sender.getDuration(message);
console.log(`Send took ${duration}ms`);
```

#### Parameters

| Name      | Type          | Optional | Default | Since | Deprecated | Description                       |
| --------- | ------------- | -------- | ------- | ----- | ---------- | --------------------------------- |
| `message` | `MessageType` | ❌       | -       | -     | -          | Message to calculate duration for |

---

#### `getGateway` (Method)

**Type:** `() => undefined \| MessageGetwayInterface`

---

##### `getGateway` (CallSignature)

**Type:** `undefined \| MessageGetwayInterface`

Get the configured gateway instance

**Returns:**

Gateway instance or `undefined` if not configured

---

#### `getMessageStore` (Method)

**Type:** `() => MessagesStore<MessageType, MessagesStateInterface<MessageType>>`

---

##### `getMessageStore` (CallSignature)

**Type:** `MessagesStore<MessageType, MessagesStateInterface<MessageType>>`

Get the message store instance

**Returns:**

Message store managing message state

---

#### `handleError` (Method)

**Type:** `(error: unknown, options: MessageSenderOptions<MessageType>) => Promise<MessageType>`

#### Parameters

| Name      | Type                                | Optional | Default | Since | Deprecated | Description                                                  |
| --------- | ----------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------ |
| `error`   | `unknown`                           | ❌       | -       | -     | -          | Error that occurred during send (any type)                   |
| `options` | `MessageSenderOptions<MessageType>` | ❌       | -       | -     | -          | Message sender options containing current message and config |

---

##### `handleError` (CallSignature)

**Type:** `Promise<MessageType>`

Handle send operation errors

Processes errors that occur during message sending. Merges error information
with the current message state, logs failures, and either throws or returns
an error message based on configuration.

**Error flow:**

1. Check `throwIfError` configuration
2. Retrieve current message state from store
3. Log failure if logger configured
4. Merge error with message state
5. Set status to `FAILED` if still `SENDING`
6. Return error message or throw

**Status handling:**
Plugins can modify the final status before this method is called.
Common plugin-modified statuses:

- `STOPPED`: Set by `SenderStrategyPlugin` for abort errors
- `FAILED`: Default for regular errors (set here if still `SENDING`)

**Important notes:**

- Always retrieves latest message state from store
- Preserves plugin-modified status (e.g., `STOPPED`)
- Sets `loading=false` and `endTime` if not already set
- Error object attached to message for inspection

**Returns:**

Message with error state merged

**Throws:**

Error when `throwIfError` configuration is `true`

**Example:** Error message structure

```typescript
// Returned error message structure:
{
  id: 'msg-1',
  content: 'Hello',
  status: 'failed', // or 'stopped' if aborted
  error: Error('Network error'),
  loading: false,
  startTime: 1234567890,
  endTime: 1234567900
}
```

#### Parameters

| Name      | Type                                | Optional | Default | Since | Deprecated | Description                                                  |
| --------- | ----------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------ |
| `error`   | `unknown`                           | ❌       | -       | -     | -          | Error that occurred during send (any type)                   |
| `options` | `MessageSenderOptions<MessageType>` | ❌       | -       | -     | -          | Message sender options containing current message and config |

---

#### `send` (Method)

**Type:** `(message: Partial<MessageType>, gatewayOptions: GatewayOptions<MessageType, Record<string, unknown>>) => Promise<MessageType>`

#### Parameters

| Name             | Type                                                   | Optional | Default | Since | Deprecated | Description                                                   |
| ---------------- | ------------------------------------------------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------------------- |
| `message`        | `Partial<MessageType>`                                 | ❌       | -       | -     | -          | Partial message object to send (ID generated if not provided) |
| `gatewayOptions` | `GatewayOptions<MessageType, Record<string, unknown>>` | ✅       | -       | -     | -          | Optional gateway configuration for this specific send         |

---

##### `send` (CallSignature)

**Type:** `Promise<MessageType>`

Send a message through the sender pipeline

Main public API for sending messages. Orchestrates the complete send lifecycle
including message preparation, plugin execution, gateway communication,
error handling, and performance logging.

**Send flow:**

1. Generate sending message with `SENDING` status
2. Create send options with merged configuration
3. Execute through plugin pipeline (if executor configured)
4. Send via gateway with abort signal support
5. Handle success/error and log performance
6. Return final message with result or error

**Error handling:**

- `throwIfError=true`: Throws error, no message returned
- `throwIfError=false` (default): Returns message with error state
- Plugins can intercept and modify error handling

**Abort signal management:**

- No signal provided + `AborterPlugin`: Plugin creates signal automatically (stoppable via `stop()`)
- Custom signal provided: Uses custom signal (must abort manually, `stop()` has no effect)
- No signal + no plugin: Operation not cancellable

**Resource cleanup:**

- Managed automatically by `AborterPlugin` when configured
- Event listeners removed after operation completes
- Abort controllers cleaned up properly

**Returns:**

Promise resolving to sent message with response data or error state

**Throws:**

Error when `throwIfError` is `true` and send fails

**Example:** Basic send

```typescript
const result = await sender.send({
  content: 'Hello, world!'
});
console.log('Sent:', result.id, result.status);
// Output: Sent: msg-123 sent
```

**Example:** With error handling

```typescript
const result = await sender.send({ content: 'Hello' });
if (result.status === 'failed') {
  console.error('Send failed:', result.error);
  // Retry logic here
}
```

**Example:** With streaming

```typescript
await sender.send(
  { content: 'Generate story' },
  {
    stream: true,
    onConnected: () => {
      console.log('Stream connected');
    },
    onChunk: (chunk) => {
      // Update UI with partial content
      updateUI(chunk.content);
    },
    onComplete: (msg) => {
      console.log('Stream complete:', msg.id);
    }
  }
);
```

**Example:** With automatic abort (AborterPlugin)

```typescript
// Setup with AborterPlugin
sender.use(new AborterPlugin({ aborter, getConfig: ... }));

// Send message (plugin creates signal automatically)
const promise = sender.send({ id: 'msg-1', content: 'Hello' });

// Can stop via sender.stop()
setTimeout(() => sender.stop('msg-1'), 1000);

const result = await promise;
console.log('Status:', result.status); // 'stopped'
```

**Example:** With custom abort control

```typescript
const controller = new AbortController();

const promise = sender.send(
  { content: 'Hello' },
  {
    signal: controller.signal,
    onAborted: (msg) => {
      console.log('Aborted:', msg.id);
    }
  }
);

// Must use controller to abort (sender.stop() won't work)
setTimeout(() => controller.abort(), 5000);

try {
  await promise;
} catch (error) {
  console.log('Send cancelled');
}
```

**Example:** With timeout

```typescript
const result = await sender.send(
  { content: 'Hello' },
  { timeout: 5000 } // 5 second timeout
);
```

#### Parameters

| Name             | Type                                                   | Optional | Default | Since | Deprecated | Description                                                   |
| ---------------- | ------------------------------------------------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------------------- |
| `message`        | `Partial<MessageType>`                                 | ❌       | -       | -     | -          | Partial message object to send (ID generated if not provided) |
| `gatewayOptions` | `GatewayOptions<MessageType, Record<string, unknown>>` | ✅       | -       | -     | -          | Optional gateway configuration for this specific send         |

---

#### `sendMessage` (Method)

**Type:** `(options: MessageSenderOptions<MessageType>, context: MessageSenderContext<MessageType>) => Promise<MessageType>`

#### Parameters

| Name      | Type                                | Optional | Default | Since | Deprecated | Description                              |
| --------- | ----------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `options` | `MessageSenderOptions<MessageType>` | ❌       | -       | -     | -          |                                          |
| `context` | `MessageSenderContext<MessageType>` | ✅       | -       | -     | -          | Execution context with sender parameters |

---

##### `sendMessage` (CallSignature)

**Type:** `Promise<MessageType>`

Send message through gateway

Core method that handles the actual message transmission through the
configured gateway. Manages streaming setup, plugin hook execution,
abort signal handling, and response processing.

**Returns:**

Sent message with response data merged

**Throws:**

When send operation is cancelled

#### Parameters

| Name      | Type                                | Optional | Default | Since | Deprecated | Description                              |
| --------- | ----------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `options` | `MessageSenderOptions<MessageType>` | ❌       | -       | -     | -          |                                          |
| `context` | `MessageSenderContext<MessageType>` | ✅       | -       | -     | -          | Execution context with sender parameters |

---

#### `sendMessageExecutor` (Method)

**Type:** `(options: MessageSenderOptions<MessageType>, executor: MessageSenderExecutor<MessageType>) => Promise<MessageType>`

#### Parameters

| Name       | Type                                 | Optional | Default | Since | Deprecated | Description |
| ---------- | ------------------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `options`  | `MessageSenderOptions<MessageType>`  | ❌       | -       | -     | -          |             |
| `executor` | `MessageSenderExecutor<MessageType>` | ❌       | -       | -     | -          |             |

---

##### `sendMessageExecutor` (CallSignature)

**Type:** `Promise<MessageType>`

#### Parameters

| Name       | Type                                 | Optional | Default | Since | Deprecated | Description |
| ---------- | ------------------------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `options`  | `MessageSenderOptions<MessageType>`  | ❌       | -       | -     | -          |             |
| `executor` | `MessageSenderExecutor<MessageType>` | ❌       | -       | -     | -          |             |

---

#### `stop` (Method)

**Type:** `(messageId: string) => boolean`

#### Parameters

| Name        | Type     | Optional | Default | Since | Deprecated | Description                       |
| ----------- | -------- | -------- | ------- | ----- | ---------- | --------------------------------- |
| `messageId` | `string` | ❌       | -       | -     | -          | ID of the message to stop sending |

---

##### `stop` (CallSignature)

**Type:** `boolean`

Stop sending a specific message

Cancels an ongoing message send operation by message ID. This method
delegates to the configured aborter to trigger the abort signal.

**Prerequisites:**

- Aborter must be configured in constructor
- `AborterPlugin` must be registered for automatic signal management
- Message must be sent without custom signal (plugin creates signal automatically)

**Behavior:**

- With aborter + plugin: Aborts the operation, triggers `AbortError`
- Without aborter: Returns `false`, no effect
- With custom signal: Returns `true` but doesn't affect custom signal

**Result handling:**

- Message status set to `STOPPED` by `SenderStrategyPlugin`
- `gatewayOptions.onAborted` callback invoked if provided
- Resources cleaned up automatically by `AborterPlugin`

**Returns:**

`true` if abort signal was triggered, `false` if aborter not configured

**Example:** Basic usage with AborterPlugin

```typescript
// Setup with AborterPlugin
const aborter = new Aborter();
sender.use(new AborterPlugin({ aborter, getConfig: ... }));

// Send message (plugin creates signal automatically)
const promise = sender.send({ id: 'msg-1', content: 'Hello' });

// Stop the send operation
const stopped = sender.stop('msg-1');
console.log('Stopped:', stopped); // true

// Promise rejects with AbortError
const result = await promise;
console.log('Status:', result.status); // 'stopped'
```

**Example:** With custom signal (stop has no effect)

```typescript
const controller = new AbortController();
sender.send({ id: 'msg-1', content: 'Hello' }, { signal: controller.signal });

// This returns true but doesn't affect the custom signal
sender.stop('msg-1');

// Must use controller to actually abort
controller.abort();
```

**Example:** With abort callback

```typescript
sender.send(
  { id: 'msg-1', content: 'Hello' },
  {
    onAborted: (msg) => {
      console.log('Message aborted:', msg.id);
      // Cleanup UI, show notification, etc.
    }
  }
);

sender.stop('msg-1'); // Triggers onAborted callback
```

#### Parameters

| Name        | Type     | Optional | Default | Since | Deprecated | Description                       |
| ----------- | -------- | -------- | ------- | ----- | ---------- | --------------------------------- |
| `messageId` | `string` | ❌       | -       | -     | -          | ID of the message to stop sending |

---

#### `stopAll` (Method)

**Type:** `() => void`

---

##### `stopAll` (CallSignature)

**Type:** `void`

Stop all ongoing message sends

Cancels all currently active message send operations by triggering
abort signals for all registered operations in the aborter.

**Prerequisites:**

- Aborter must be configured in constructor
- `AborterPlugin` must be registered for automatic signal management

**Behavior:**

- Aborts all operations managed by the aborter
- Each operation receives `AbortError` and status set to `STOPPED`
- `onAborted` callbacks invoked for each aborted operation
- Resources cleaned up automatically by `AborterPlugin`
- Operations with custom signals are not affected

**Example:** Basic usage

```typescript
// Send multiple messages
sender.send({ id: 'msg-1', content: 'Hello' });
sender.send({ id: 'msg-2', content: 'World' });
sender.send({ id: 'msg-3', content: 'Test' });

// Cancel all pending sends
sender.stopAll();
console.log('All sends cancelled');
```

**Example:** With cleanup handling

```typescript
// Setup abort handlers
const sendWithHandler = (content: string) => {
  return sender.send(
    { content },
    {
      onAborted: (msg) => {
        console.log('Aborted:', msg.id);
        // Cleanup for this specific message
      }
    }
  );
};

sendWithHandler('Message 1');
sendWithHandler('Message 2');

// Triggers onAborted for all messages
sender.stopAll();
```

---

#### `use` (Method)

**Type:** `(plugin: MessageSenderPlugin<MessageType> \| LifecyclePluginInterface<ExecutorContextInterface<any, any, HookRuntimes>, any, any>) => this`

#### Parameters

| Name     | Type                                                                                                                       | Optional | Default | Since | Deprecated | Description        |
| -------- | -------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------ |
| `plugin` | `MessageSenderPlugin<MessageType> \| LifecyclePluginInterface<ExecutorContextInterface<any, any, HookRuntimes>, any, any>` | ❌       | -       | -     | -          | Plugin to register |

---

##### `use` (CallSignature)

**Type:** `this`

Register a plugin with the sender

Plugins are executed in registration order during message sending.
Returns `this` for method chaining.

**Returns:**

This sender instance for chaining

**Example:**

```typescript
sender.use(validationPlugin).use(loggingPlugin).use(transformPlugin);
```

#### Parameters

| Name     | Type                                                                                                                       | Optional | Default | Since | Deprecated | Description        |
| -------- | -------------------------------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------ |
| `plugin` | `MessageSenderPlugin<MessageType> \| LifecyclePluginInterface<ExecutorContextInterface<any, any, HookRuntimes>, any, any>` | ❌       | -       | -     | -          | Plugin to register |

---

### `MessageSenderConfig` (Interface)

**Type:** `interface MessageSenderConfig<MessageType>`

Configuration options for message sender

Defines behavior, logging, gateway integration, and error handling
for the message sender instance.

---

#### `aborter` (Property)

**Type:** `AborterInterface<AborterConfig>`

Aborter for managing abort signals and operation cancellation

Provides centralized abort signal management for message send operations.
When configured with `AborterPlugin`, enables automatic signal creation
and cleanup for each send operation.

**Important notes:**

- Required for `stop()` and `stopAll()` methods to work
- Must be used with `AborterPlugin` for automatic signal management
- Without aborter: `stop()` returns `false`, send operations cannot be cancelled
- With aborter but no plugin: Manual signal registration required

**Recommended setup:**

```typescript
const aborter = new Aborter('MessageSenderAborter');
const sender = new MessageSender(store, {
  aborter,
  executor: new MessageSenderExecutor()
});

// Register AborterPlugin for automatic signal management
sender.use(
  new AborterPlugin({
    aborter,
    getConfig: (params) => ({
      abortId: params.currentMessage.id,
      signal: params.gatewayOptions?.signal
    })
  })
);
```

**Example:** Manual abort control

```typescript
// Without plugin, use custom signal
const controller = new AbortController();
sender.send({ content: 'Hello' }, { signal: controller.signal });
controller.abort(); // Manual cancellation
```

---

#### `executor` (Property)

**Type:** `MessageSenderExecutor<MessageType>`

Plugin executor

Executor for managing the plugin pipeline.

If executor is not specified, the send operation will not be executed.
and can't use the `use` method to register plugins.

**Example:**

```typescript
const executor = new MessageSenderExecutor();
executor.use(validationPlugin);
executor.use(loggingPlugin);
executor.use(transformPlugin);
```

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

- Stream event handlers (`onChunk`, `onComplete`, `onError`, `onProgress`)
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

#### `loggerTpl` (Property)

**Type:** `Object`

Logger templates

Templates for logging messages.

**Example:**

````typescript
const loggerTpl = {
  failed: '[${senderName}] ${messageId} failed',
  success: '[${senderName}] ${messageId} success, speed: ${speed}ms'
};


---

##### `failed` (Property)

**Type:** `string`





---

##### `success` (Property)

**Type:** `string`





---

#### `senderGateway` (Property)

**Type:** `SenderGatewayInterface<MessageType>`


**Default:** `new SenderGateway()`




Sender gateway

Sender gateway for managing the message send operation.

**Example:**

```typescript
const senderGateway = new SenderGateway();
senderGateway.createGatewayOptions(gatewayOptions, context);
````

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

#### `throwIfError` (Property)

**Type:** `boolean`

**Default:** `false`

Whether to throw errors on send failure

When `true`, failed send operations throw errors instead of
returning error messages. Useful for error boundary handling.

**Example:**

```typescript
const config = {
  throwIfError: true // Throw on failures
};
```

---
