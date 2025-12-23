## `src/core/message-sender/impl/SenderStrategyPlugin` (Module)

**Type:** `module src/core/message-sender/impl/SenderStrategyPlugin`

---

### `SenderStrategyPlugin` (Class)

**Type:** `class SenderStrategyPlugin<T>`

Message sender strategy plugin for managing message lifecycle

Implements lifecycle hooks to control message addition, updates, and failure
handling based on the configured strategy. Manages message state transitions
during normal and streaming send operations.

**Message Loading State Rules:**

1. Non-streaming mode (normal gateway):
   - Before result:
     `loading=true`
     ,
     `status=sending`

   - After success:
     `loading=false`
     ,
     `status=sent`

2. Streaming mode:
   - Before chunks:
     `loading=true`
     ,
     `status=sending`
     ,
     `streaming=true`

   - After completion:
     `loading=false`
     ,
     `status=sent`
     ,
     `streaming=false`

Core features:

- Configurable failure handling strategies
- Automatic state management for messages
- Streaming connection and chunk handling
- Abort/stop operation support
- Cleanup and error recovery

**Example:** With KEEP_FAILED strategy

```typescript
const plugin = new SenderStrategyPlugin(
  SendFailureStrategy.KEEP_FAILED,
  logger
);

// Messages remain in store even on failure
// Users can see errors and retry
```

**Example:** With DELETE_FAILED strategy

```typescript
const plugin = new SenderStrategyPlugin(SendFailureStrategy.DELETE_FAILED);

// Failed messages are automatically removed
// Clean message list with only successful sends
```

**Example:** With ADD_ON_SUCCESS strategy

```typescript
const plugin = new SenderStrategyPlugin(
  SendFailureStrategy.ADD_ON_SUCCESS,
  logger
);

// Messages only added to store after successful send
// No loading state visible to users
```

---

#### `new SenderStrategyPlugin` (Constructor)

**Type:** `(failureStrategy: SendFailureStrategyType, logger: LoggerInterface<unknown>) => SenderStrategyPlugin<T>`

#### Parameters

| Name              | Type                       | Optional | Default | Since | Deprecated | Description                                           |
| ----------------- | -------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------- |
| `failureStrategy` | `SendFailureStrategyType`  | ❌       | -       | -     | -          | Strategy for handling failed message sends            |
| `logger`          | `LoggerInterface<unknown>` | ✅       | -       | -     | -          | Optional logger instance for debugging and monitoring |

---

#### `failureStrategy` (Property)

**Type:** `SendFailureStrategyType`

Strategy for handling failed message sends

---

#### `logger` (Property)

**Type:** `LoggerInterface<unknown>`

Optional logger instance for debugging and monitoring

---

#### `loggerTpl` (Property)

**Type:** `Object`

**Default:** `{}`

Logger message templates

Predefined templates for consistent logging throughout
the plugin's lifecycle.

---

##### `endStreaming` (Property)

**Type:** `"[${pluginName}] endStreaming"`

**Default:** `'[${pluginName}] endStreaming'`

---

##### `startStreaming` (Property)

**Type:** `"[${pluginName}] startStreaming"`

**Default:** `'[${pluginName}] startStreaming'`

---

##### `stream` (Property)

**Type:** `"[${pluginName}] onStream #${times} - chunk:"`

**Default:** `'[${pluginName}] onStream #${times} - chunk:'`

---

#### `pluginName` (Property)

**Type:** `"SenderStrategyPlugin"`

**Default:** `'SenderStrategyPlugin'`

Plugin identifier

---

#### `asyncReturnValue` (Method)

**Type:** `(context: ExecutorContext<MessageSenderContextOptions<T>>, returnValue: unknown) => unknown`

#### Parameters

| Name          | Type                                              | Optional | Default | Since | Deprecated | Description                                           |
| ------------- | ------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------- |
| `context`     | `ExecutorContext<MessageSenderContextOptions<T>>` | ❌       | -       | -     | -          | Executor context containing message sender parameters |
| `returnValue` | `unknown`                                         | ❌       | -       | -     | -          | Value to set as the context's return value            |

---

##### `asyncReturnValue` (CallSignature)

**Type:** `unknown`

Set the async return value for the execution context

Updates the context's return value and returns it. This is useful
for plugins that need to modify or wrap the execution result while
ensuring the context is properly updated.

**Returns:**

The same return value that was set

**Example:**

```typescript
async execute(context, next) {
  const result = await next();

  // Transform result and update context
  const transformed = transformResult(result);
  return this.asyncReturnValue(context, transformed);
}
```

#### Parameters

| Name          | Type                                              | Optional | Default | Since | Deprecated | Description                                           |
| ------------- | ------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------- |
| `context`     | `ExecutorContext<MessageSenderContextOptions<T>>` | ❌       | -       | -     | -          | Executor context containing message sender parameters |
| `returnValue` | `unknown`                                         | ❌       | -       | -     | -          | Value to set as the context's return value            |

---

#### `cleanup` (Method)

**Type:** `(context: MessageSenderPluginContext<T>) => void`

#### Parameters

| Name      | Type                            | Optional | Default | Since | Deprecated | Description                                            |
| --------- | ------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `context` | `MessageSenderPluginContext<T>` | ❌       | -       | -     | -          | Execution context containing message sender parameters |

---

##### `cleanup` (CallSignature)

**Type:** `void`

Clean up after message sending operation

Stops streaming state and logs cleanup completion.
Called after success, error, or abort operations.

#### Parameters

| Name      | Type                            | Optional | Default | Since | Deprecated | Description                                            |
| --------- | ------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `context` | `MessageSenderPluginContext<T>` | ❌       | -       | -     | -          | Execution context containing message sender parameters |

---

#### `closeAddedToStore` (Method)

**Type:** `(context: ExecutorContext<MessageSenderContextOptions<T>>) => void`

#### Parameters

| Name      | Type                                              | Optional | Default | Since | Deprecated | Description                                           |
| --------- | ------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------- |
| `context` | `ExecutorContext<MessageSenderContextOptions<T>>` | ❌       | -       | -     | -          | Executor context containing message sender parameters |

---

##### `closeAddedToStore` (CallSignature)

**Type:** `void`

Mark message as not in store

Sets the
`addedToStore`
flag to
`false`
in the context parameters,
indicating that the message is not currently in the store. This can
be used for cleanup or to track message removal.

**Example:**

```typescript
async execute(context, next) {
  try {
    return await next();
  } catch (error) {
    // Remove failed message from store
    store.deleteMessage(context.parameters.currentMessage.id);
    this.closeAddedToStore(context);
    throw error;
  }
}
```

#### Parameters

| Name      | Type                                              | Optional | Default | Since | Deprecated | Description                                           |
| --------- | ------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------- |
| `context` | `ExecutorContext<MessageSenderContextOptions<T>>` | ❌       | -       | -     | -          | Executor context containing message sender parameters |

---

#### `handleBefore_KEEP_FAILED` (Method)

**Type:** `(parameters: MessageSenderContextOptions<MessageStoreMsg<unknown, unknown>>) => MessageStoreMsg<unknown, unknown>`

#### Parameters

| Name         | Type                                                             | Optional | Default | Since | Deprecated | Description                       |
| ------------ | ---------------------------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------- |
| `parameters` | `MessageSenderContextOptions<MessageStoreMsg<unknown, unknown>>` | ❌       | -       | -     | -          | Message sender context parameters |

---

##### `handleBefore_KEEP_FAILED` (CallSignature)

**Type:** `MessageStoreMsg<unknown, unknown>`

Handle message addition for KEEP_FAILED strategy before sending

Adds the message to the store immediately before sending begins.
This allows users to see the message in loading state.

**Returns:**

Added message from the store

#### Parameters

| Name         | Type                                                             | Optional | Default | Since | Deprecated | Description                       |
| ------------ | ---------------------------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------- |
| `parameters` | `MessageSenderContextOptions<MessageStoreMsg<unknown, unknown>>` | ❌       | -       | -     | -          | Message sender context parameters |

---

#### `handleConnectionEstablished` (Method)

**Type:** `(parameters: MessageSenderContextOptions<MessageStoreMsg<unknown, unknown>>) => void`

#### Parameters

| Name         | Type                                                             | Optional | Default | Since | Deprecated | Description                       |
| ------------ | ---------------------------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------- |
| `parameters` | `MessageSenderContextOptions<MessageStoreMsg<unknown, unknown>>` | ❌       | -       | -     | -          | Message sender context parameters |

---

##### `handleConnectionEstablished` (CallSignature)

**Type:** `void`

Handle connection establishment common logic

Performs setup when streaming connection is established:

- Starts global streaming state in the store
- Marks user message as sent (loading=false)

This indicates the request was successfully sent and streaming
is about to begin. The message transitions from "sending" preparation
to "sent and waiting for response".

#### Parameters

| Name         | Type                                                             | Optional | Default | Since | Deprecated | Description                       |
| ------------ | ---------------------------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------- |
| `parameters` | `MessageSenderContextOptions<MessageStoreMsg<unknown, unknown>>` | ❌       | -       | -     | -          | Message sender context parameters |

---

#### `handleStream_UpdateExisting` (Method)

**Type:** `(parameters: MessageSenderContextOptions<MessageStoreMsg<unknown, unknown>>, chunkMessage: unknown) => unknown`

#### Parameters

| Name           | Type                                                             | Optional | Default | Since | Deprecated | Description                           |
| -------------- | ---------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------- |
| `parameters`   | `MessageSenderContextOptions<MessageStoreMsg<unknown, unknown>>` | ❌       | -       | -     | -          | Message sender context parameters     |
| `chunkMessage` | `unknown`                                                        | ❌       | -       | -     | -          | Chunk data containing message updates |

---

##### `handleStream_UpdateExisting` (CallSignature)

**Type:** `unknown`

Handle stream chunk for existing messages

Processes stream chunks by updating existing messages in the store
or adding new messages if they don't exist yet. This enables
real-time message updates during streaming operations.

**Returns:**

Updated or added message, or original chunk if not a message

#### Parameters

| Name           | Type                                                             | Optional | Default | Since | Deprecated | Description                           |
| -------------- | ---------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------- |
| `parameters`   | `MessageSenderContextOptions<MessageStoreMsg<unknown, unknown>>` | ❌       | -       | -     | -          | Message sender context parameters     |
| `chunkMessage` | `unknown`                                                        | ❌       | -       | -     | -          | Chunk data containing message updates |

---

#### `handleSuccess_ADD_ON_SUCCESS` (Method)

**Type:** `(parameters: MessageSenderContextOptions<MessageStoreMsg<unknown, unknown>>, successData: MessageStoreMsg<unknown, unknown>) => MessageStoreMsg<unknown, unknown>`

#### Parameters

| Name          | Type                                                             | Optional | Default | Since | Deprecated | Description                                 |
| ------------- | ---------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `parameters`  | `MessageSenderContextOptions<MessageStoreMsg<unknown, unknown>>` | ❌       | -       | -     | -          | Message sender context parameters           |
| `successData` | `MessageStoreMsg<unknown, unknown>`                              | ❌       | -       | -     | -          | Success response data to merge into message |

---

##### `handleSuccess_ADD_ON_SUCCESS` (CallSignature)

**Type:** `MessageStoreMsg<unknown, unknown>`

Handle successful send for ADD_ON_SUCCESS strategy

Adds the message to the store only after successful send.
Combines the current message with success data before adding.

**Returns:**

Newly added message from store

#### Parameters

| Name          | Type                                                             | Optional | Default | Since | Deprecated | Description                                 |
| ------------- | ---------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `parameters`  | `MessageSenderContextOptions<MessageStoreMsg<unknown, unknown>>` | ❌       | -       | -     | -          | Message sender context parameters           |
| `successData` | `MessageStoreMsg<unknown, unknown>`                              | ❌       | -       | -     | -          | Success response data to merge into message |

---

#### `handleSuccess_KEEP_FAILED` (Method)

**Type:** `(parameters: MessageSenderContextOptions<MessageStoreMsg<unknown, unknown>>, successData: MessageStoreMsg<unknown, unknown>) => undefined \| MessageStoreMsg<unknown, unknown>`

#### Parameters

| Name          | Type                                                             | Optional | Default | Since | Deprecated | Description                                 |
| ------------- | ---------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `parameters`  | `MessageSenderContextOptions<MessageStoreMsg<unknown, unknown>>` | ❌       | -       | -     | -          | Message sender context parameters           |
| `successData` | `MessageStoreMsg<unknown, unknown>`                              | ❌       | -       | -     | -          | Success response data to merge into message |

---

##### `handleSuccess_KEEP_FAILED` (CallSignature)

**Type:** `undefined \| MessageStoreMsg<unknown, unknown>`

Handle successful send for KEEP_FAILED strategy

Updates the existing message in the store with success data.
Used when the message was added to store before sending.

**Returns:**

Updated message from store, or
`undefined`
if update failed

#### Parameters

| Name          | Type                                                             | Optional | Default | Since | Deprecated | Description                                 |
| ------------- | ---------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `parameters`  | `MessageSenderContextOptions<MessageStoreMsg<unknown, unknown>>` | ❌       | -       | -     | -          | Message sender context parameters           |
| `successData` | `MessageStoreMsg<unknown, unknown>`                              | ❌       | -       | -     | -          | Success response data to merge into message |

---

#### `isAbortError` (Method)

**Type:** `(error: unknown) => boolean`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description           |
| ------- | --------- | -------- | ------- | ----- | ---------- | --------------------- |
| `error` | `unknown` | ❌       | -       | -     | -          | Error object to check |

---

##### `isAbortError` (CallSignature)

**Type:** `boolean`

Check if an error is an abort error

Determines whether the given error is from an abort/cancel operation.
Abort errors are handled differently from regular errors.

**Returns:**

`true`
if error is an abort error,
`false`
otherwise

**Example:**

```typescript
try {
  await sendMessage();
} catch (error) {
  if (this.isAbortError(error)) {
    console.log('Operation was cancelled');
  }
}
```

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description           |
| ------- | --------- | -------- | ------- | ----- | ---------- | --------------------- |
| `error` | `unknown` | ❌       | -       | -     | -          | Error object to check |

---

#### `mergeRuntimeMessage` (Method)

**Type:** `(context: ExecutorContext<MessageSenderContextOptions<T>>, message: Partial<T>) => MessageStoreMsg<unknown, unknown>`

#### Parameters

| Name      | Type                                              | Optional | Default | Since | Deprecated | Description                                           |
| --------- | ------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------- |
| `context` | `ExecutorContext<MessageSenderContextOptions<T>>` | ❌       | -       | -     | -          | Executor context containing message sender parameters |
| `message` | `Partial<T>`                                      | ❌       | -       | -     | -          | Partial message updates to merge into current message |

---

##### `mergeRuntimeMessage` (CallSignature)

**Type:** `MessageStoreMsg<unknown, unknown>`

Merge message updates into the runtime message

Updates the current message in the context by merging the provided
message updates. This ensures the context always has the latest
message state and allows plugins to modify the message during execution.

**Returns:**

Merged message with all updates applied

**Example:**

```typescript
// In a plugin's execute method
const updated = this.mergeRuntimeMessage(context, {
  loading: true,
  startTime: Date.now(),
  metadata: { plugin: this.pluginName }
});
```

#### Parameters

| Name      | Type                                              | Optional | Default | Since | Deprecated | Description                                           |
| --------- | ------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------- |
| `context` | `ExecutorContext<MessageSenderContextOptions<T>>` | ❌       | -       | -     | -          | Executor context containing message sender parameters |
| `message` | `Partial<T>`                                      | ❌       | -       | -     | -          | Partial message updates to merge into current message |

---

#### `onBefore` (Method)

**Type:** `(context: ExecutorContext<MessageSenderContextOptions<T>>) => void`

#### Parameters

| Name      | Type                                              | Optional | Default | Since | Deprecated | Description                                            |
| --------- | ------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `context` | `ExecutorContext<MessageSenderContextOptions<T>>` | ❌       | -       | -     | -          | Execution context containing message sender parameters |

---

##### `onBefore` (CallSignature)

**Type:** `void`

Before execution hook

Handles message initialization based on the configured failure strategy.
Determines whether to add the message to the store before or after sending.

Strategy behavior:

- `ADD_ON_SUCCESS`
  : Message not added yet, wait for success
- `KEEP_FAILED`
  /
  `DELETE_FAILED`
  : Add message immediately for loading state

#### Parameters

| Name      | Type                                              | Optional | Default | Since | Deprecated | Description                                            |
| --------- | ------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `context` | `ExecutorContext<MessageSenderContextOptions<T>>` | ❌       | -       | -     | -          | Execution context containing message sender parameters |

---

#### `onConnected` (Method)

**Type:** `(context: ExecutorContext<MessageSenderContextOptions<T>>) => void`

#### Parameters

| Name      | Type                                              | Optional | Default | Since | Deprecated | Description                                            |
| --------- | ------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `context` | `ExecutorContext<MessageSenderContextOptions<T>>` | ❌       | -       | -     | -          | Execution context containing message sender parameters |

---

##### `onConnected` (CallSignature)

**Type:** `void`

Connection established hook

Called when streaming connection is successfully established.
Delegates to the common connection handling logic.

#### Parameters

| Name      | Type                                              | Optional | Default | Since | Deprecated | Description                                            |
| --------- | ------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `context` | `ExecutorContext<MessageSenderContextOptions<T>>` | ❌       | -       | -     | -          | Execution context containing message sender parameters |

---

#### `onError` (Method)

**Type:** `(context: ExecutorContext<MessageSenderContextOptions<T>>) => void \| ExecutorError`

#### Parameters

| Name      | Type                                              | Optional | Default | Since | Deprecated | Description                                            |
| --------- | ------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `context` | `ExecutorContext<MessageSenderContextOptions<T>>` | ❌       | -       | -     | -          | Execution context containing message sender parameters |

---

##### `onError` (CallSignature)

**Type:** `void \| ExecutorError`

Error execution hook

Handles errors during message send operation based on error type
and configured failure strategy. Abort errors are handled separately
to provide better user experience for cancelled operations.

Strategy behavior:

- `KEEP_FAILED`
  : Update message with error state, keep in store
- `DELETE_FAILED`
  : Remove message from store completely
- `ADD_ON_SUCCESS`
  : Keep message data but don't add to store

**Throws:**

When message update fails for KEEP_FAILED strategy

#### Parameters

| Name      | Type                                              | Optional | Default | Since | Deprecated | Description                                            |
| --------- | ------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `context` | `ExecutorContext<MessageSenderContextOptions<T>>` | ❌       | -       | -     | -          | Execution context containing message sender parameters |

---

#### `onStopError` (Method)

**Type:** `(context: ExecutorContext<MessageSenderContextOptions<T>>) => void \| ExecutorError`

#### Parameters

| Name      | Type                                              | Optional | Default | Since | Deprecated | Description                                            |
| --------- | ------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `context` | `ExecutorContext<MessageSenderContextOptions<T>>` | ❌       | -       | -     | -          | Execution context containing message sender parameters |

---

##### `onStopError` (CallSignature)

**Type:** `void \| ExecutorError`

Handle abort/stop errors

Special handling when a send operation is cancelled or stopped.
This prevents abort errors from propagating and ensures proper cleanup.

Process:

1. Set message status to
   `STOPPED`

2. Call
   `onAborted`
   callback if provided
3. Prevent error propagation to other plugins

**Returns:**

`undefined`
to prevent error propagation

**Example:**

```typescript
// When user cancels a message send
controller.abort();
// onStopError will handle the abort error
// Message status set to STOPPED
// onAborted callback invoked with final message state
```

#### Parameters

| Name      | Type                                              | Optional | Default | Since | Deprecated | Description                                            |
| --------- | ------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `context` | `ExecutorContext<MessageSenderContextOptions<T>>` | ❌       | -       | -     | -          | Execution context containing message sender parameters |

---

#### `onStream` (Method)

**Type:** `(context: MessageSenderPluginContext<MessageStoreMsg<unknown, unknown>>, chunk: unknown) => unknown`

#### Parameters

| Name      | Type                                                            | Optional | Default | Since | Deprecated | Description                                      |
| --------- | --------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `context` | `MessageSenderPluginContext<MessageStoreMsg<unknown, unknown>>` | ❌       | -       | -     | -          | Execution context with message sender parameters |
| `chunk`   | `unknown`                                                       | ❌       | -       | -     | -          | Data chunk received from the stream              |

---

##### `onStream` (CallSignature)

**Type:** `unknown`

Stream chunk processing hook

Processes incoming stream chunks based on the configured failure strategy.
Handles message updates and state management during streaming operations.

**Strategy behavior:**

- `KEEP_FAILED`
  /
  `DELETE_FAILED`
  : Update messages in store in real-time
- `ADD_ON_SUCCESS`
  : Don't update store, wait for completion

**Fallback handling:**
If
`onConnected`
wasn't called but first chunk arrives with message still
in loading state, automatically triggers connection establishment logic.
This ensures proper state management even if connection hook is missed.

**Returns:**

Processed chunk or updated message

**Example:**

```typescript
// During streaming, chunks are processed
onStream: (context, chunk) => {
  // For KEEP_FAILED: Updates message in store
  // For ADD_ON_SUCCESS: Returns chunk unchanged
};
```

#### Parameters

| Name      | Type                                                            | Optional | Default | Since | Deprecated | Description                                      |
| --------- | --------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `context` | `MessageSenderPluginContext<MessageStoreMsg<unknown, unknown>>` | ❌       | -       | -     | -          | Execution context with message sender parameters |
| `chunk`   | `unknown`                                                       | ❌       | -       | -     | -          | Data chunk received from the stream              |

---

#### `onSuccess` (Method)

**Type:** `(context: ExecutorContext<MessageSenderContextOptions<T>>) => void`

#### Parameters

| Name      | Type                                              | Optional | Default | Since | Deprecated | Description                                            |
| --------- | ------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `context` | `ExecutorContext<MessageSenderContextOptions<T>>` | ❌       | -       | -     | -          | Execution context containing message sender parameters |

---

##### `onSuccess` (CallSignature)

**Type:** `void`

Success execution hook

Handles message updates after successful send operation.
Updates existing messages or adds new ones based on strategy.

**Throws:**

When message update fails for already-added messages

#### Parameters

| Name      | Type                                              | Optional | Default | Since | Deprecated | Description                                            |
| --------- | ------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `context` | `ExecutorContext<MessageSenderContextOptions<T>>` | ❌       | -       | -     | -          | Execution context containing message sender parameters |

---

#### `openAddedToStore` (Method)

**Type:** `(context: ExecutorContext<MessageSenderContextOptions<T>>) => void`

#### Parameters

| Name      | Type                                              | Optional | Default | Since | Deprecated | Description                                           |
| --------- | ------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------- |
| `context` | `ExecutorContext<MessageSenderContextOptions<T>>` | ❌       | -       | -     | -          | Executor context containing message sender parameters |

---

##### `openAddedToStore` (CallSignature)

**Type:** `void`

Mark message as added to store

Sets the
`addedToStore`
flag to
`true`
in the context parameters,
indicating that the message has been added to the store. This flag
can be used by other plugins to track message state.

**Example:**

```typescript
async execute(context, next) {
  // Add message to store
  store.addMessage(context.parameters.currentMessage);

  // Mark as added
  this.openAddedToStore(context);

  return next();
}
```

#### Parameters

| Name      | Type                                              | Optional | Default | Since | Deprecated | Description                                           |
| --------- | ------------------------------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------- |
| `context` | `ExecutorContext<MessageSenderContextOptions<T>>` | ❌       | -       | -     | -          | Executor context containing message sender parameters |

---

#### `startStreaming` (Method)

**Type:** `(store: MessagesStore<MessageStoreMsg<unknown, unknown>, MessagesStateInterface<MessageStoreMsg<unknown, unknown>>>) => void`

#### Parameters

| Name    | Type                                                                                                          | Optional | Default | Since | Deprecated | Description            |
| ------- | ------------------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ---------------------- |
| `store` | `MessagesStore<MessageStoreMsg<unknown, unknown>, MessagesStateInterface<MessageStoreMsg<unknown, unknown>>>` | ❌       | -       | -     | -          | Message store instance |

---

##### `startStreaming` (CallSignature)

**Type:** `void`

Start global streaming state

Activates streaming mode in the store if not already active.
This ensures the store properly tracks streaming operations.

#### Parameters

| Name    | Type                                                                                                          | Optional | Default | Since | Deprecated | Description            |
| ------- | ------------------------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ---------------------- |
| `store` | `MessagesStore<MessageStoreMsg<unknown, unknown>, MessagesStateInterface<MessageStoreMsg<unknown, unknown>>>` | ❌       | -       | -     | -          | Message store instance |

---

### `SendFailureStrategyType` (TypeAlias)

**Type:** `type SendFailureStrategyType`

Type representing valid send failure strategies

---

### `SendFailureStrategy` (Variable)

**Type:** `Readonly<Object>`

**Default:** `{}`

Send failure handling strategies

Defines how failed messages should be handled in the message store,
allowing different behaviors based on application requirements.

**Example:**

```typescript
// Use KEEP_FAILED for chat apps where users should see failures
const strategy = SendFailureStrategy.KEEP_FAILED;

// Use DELETE_FAILED for clean message lists
const strategy = SendFailureStrategy.DELETE_FAILED;

// Use ADD_ON_SUCCESS for optimistic UI without showing progress
const strategy = SendFailureStrategy.ADD_ON_SUCCESS;
```

---
