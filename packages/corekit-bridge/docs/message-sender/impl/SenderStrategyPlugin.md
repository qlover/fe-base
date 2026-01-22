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

#### `cleanup` (Method)

**Type:** `(context: MessageSenderContext<T>) => void`

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                                            |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `context` | `MessageSenderContext<T>` | ❌       | -       | -     | -          | Execution context containing message sender parameters |

---

##### `cleanup` (CallSignature)

**Type:** `void`

Clean up after message sending operation

Stops streaming state and logs cleanup completion.
Called after success, error, or abort operations.

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                                            |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `context` | `MessageSenderContext<T>` | ❌       | -       | -     | -          | Execution context containing message sender parameters |

---

#### `handleBefore_KEEP_FAILED` (Method)

**Type:** `(parameters: MessageSenderOptions<T>) => MessageStoreMsg<unknown, unknown>`

#### Parameters

| Name         | Type                      | Optional | Default | Since | Deprecated | Description                       |
| ------------ | ------------------------- | -------- | ------- | ----- | ---------- | --------------------------------- |
| `parameters` | `MessageSenderOptions<T>` | ❌       | -       | -     | -          | Message sender context parameters |

---

##### `handleBefore_KEEP_FAILED` (CallSignature)

**Type:** `MessageStoreMsg<unknown, unknown>`

Handle message addition for KEEP_FAILED strategy before sending

Adds the message to the store immediately before sending begins.
This allows users to see the message in loading state.

**Returns:**

Added message from the store

#### Parameters

| Name         | Type                      | Optional | Default | Since | Deprecated | Description                       |
| ------------ | ------------------------- | -------- | ------- | ----- | ---------- | --------------------------------- |
| `parameters` | `MessageSenderOptions<T>` | ❌       | -       | -     | -          | Message sender context parameters |

---

#### `handleConnectionEstablished` (Method)

**Type:** `(parameters: MessageSenderOptions<T>) => void`

#### Parameters

| Name         | Type                      | Optional | Default | Since | Deprecated | Description                       |
| ------------ | ------------------------- | -------- | ------- | ----- | ---------- | --------------------------------- |
| `parameters` | `MessageSenderOptions<T>` | ❌       | -       | -     | -          | Message sender context parameters |

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

| Name         | Type                      | Optional | Default | Since | Deprecated | Description                       |
| ------------ | ------------------------- | -------- | ------- | ----- | ---------- | --------------------------------- |
| `parameters` | `MessageSenderOptions<T>` | ❌       | -       | -     | -          | Message sender context parameters |

---

#### `handleStream_UpdateExisting` (Method)

**Type:** `(parameters: MessageSenderOptions<T>, chunkMessage: unknown) => unknown`

#### Parameters

| Name           | Type                      | Optional | Default | Since | Deprecated | Description                           |
| -------------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------- |
| `parameters`   | `MessageSenderOptions<T>` | ❌       | -       | -     | -          | Message sender context parameters     |
| `chunkMessage` | `unknown`                 | ❌       | -       | -     | -          | Chunk data containing message updates |

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

| Name           | Type                      | Optional | Default | Since | Deprecated | Description                           |
| -------------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------- |
| `parameters`   | `MessageSenderOptions<T>` | ❌       | -       | -     | -          | Message sender context parameters     |
| `chunkMessage` | `unknown`                 | ❌       | -       | -     | -          | Chunk data containing message updates |

---

#### `handleSuccess_ADD_ON_SUCCESS` (Method)

**Type:** `(parameters: MessageSenderOptions<T>, successData: T) => T`

#### Parameters

| Name          | Type                      | Optional | Default | Since | Deprecated | Description                                 |
| ------------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `parameters`  | `MessageSenderOptions<T>` | ❌       | -       | -     | -          | Message sender context parameters           |
| `successData` | `T`                       | ❌       | -       | -     | -          | Success response data to merge into message |

---

##### `handleSuccess_ADD_ON_SUCCESS` (CallSignature)

**Type:** `T`

Handle successful send for ADD_ON_SUCCESS strategy

Adds the message to the store only after successful send.
Combines the current message with success data before adding.

**Returns:**

Newly added message from store

#### Parameters

| Name          | Type                      | Optional | Default | Since | Deprecated | Description                                 |
| ------------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `parameters`  | `MessageSenderOptions<T>` | ❌       | -       | -     | -          | Message sender context parameters           |
| `successData` | `T`                       | ❌       | -       | -     | -          | Success response data to merge into message |

---

#### `handleSuccess_KEEP_FAILED` (Method)

**Type:** `(parameters: MessageSenderOptions<T>, successData: T) => undefined \| T`

#### Parameters

| Name          | Type                      | Optional | Default | Since | Deprecated | Description                                 |
| ------------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `parameters`  | `MessageSenderOptions<T>` | ❌       | -       | -     | -          | Message sender context parameters           |
| `successData` | `T`                       | ❌       | -       | -     | -          | Success response data to merge into message |

---

##### `handleSuccess_KEEP_FAILED` (CallSignature)

**Type:** `undefined \| T`

Handle successful send for KEEP_FAILED strategy

Updates the existing message in the store with success data.
Used when the message was added to store before sending.

**Returns:**

Updated message from store, or
`undefined`
if update failed

#### Parameters

| Name          | Type                      | Optional | Default | Since | Deprecated | Description                                 |
| ------------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `parameters`  | `MessageSenderOptions<T>` | ❌       | -       | -     | -          | Message sender context parameters           |
| `successData` | `T`                       | ❌       | -       | -     | -          | Success response data to merge into message |

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

#### `onBefore` (Method)

**Type:** `(context: MessageSenderContext<T>) => void`

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                                            |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `context` | `MessageSenderContext<T>` | ❌       | -       | -     | -          | Execution context containing message sender parameters |

---

##### `onBefore` (CallSignature)

**Type:** `void`

Before execution hook

Initializes message state based on the configured failure strategy.
This hook determines whether to add the message to the store immediately
or wait until after successful send.

**Strategy behavior:**

`ADD_ON_SUCCESS`
:

- Don't add message to store yet
- Set
  `addedToStore=false`
  flag
- Message only added after successful send in
  `onSuccess`

`KEEP_FAILED`
/
`DELETE_FAILED`
:

- Add message to store immediately with
  `SENDING`
  status
- Set
  `addedToStore=true`
  flag
- Update
  `currentMessage`
  with store-added version (includes generated ID)
- Users see loading state in UI

**Important notes:**

- `addedToStore`
  flag tracked in context parameters
- Flag used by other hooks to determine update vs add logic
- Store-added message may have different ID than input message

**Example:** Context after KEEP_FAILED

```typescript
// Before: context.parameters.currentMessage = { content: 'Hello' }
// After:  context.parameters.currentMessage = { id: 'msg-1', content: 'Hello', status: 'sending' }
//         context.parameters.addedToStore = true
```

**Example:** Context after ADD_ON_SUCCESS

```typescript
// Before: context.parameters.currentMessage = { content: 'Hello' }
// After:  context.parameters.currentMessage = { content: 'Hello' } (unchanged)
//         context.parameters.addedToStore = false
```

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                                            |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `context` | `MessageSenderContext<T>` | ❌       | -       | -     | -          | Execution context containing message sender parameters |

---

#### `onConnected` (Method)

**Type:** `(context: MessageSenderContext<T>) => void`

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                                            |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `context` | `MessageSenderContext<T>` | ❌       | -       | -     | -          | Execution context containing message sender parameters |

---

##### `onConnected` (CallSignature)

**Type:** `void`

Connection established hook

Called when streaming connection is successfully established.
Delegates to the common connection handling logic.

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                                            |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `context` | `MessageSenderContext<T>` | ❌       | -       | -     | -          | Execution context containing message sender parameters |

---

#### `onError` (Method)

**Type:** `(context: MessageSenderContext<T>) => void \| ExecutorError`

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                                            |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `context` | `MessageSenderContext<T>` | ❌       | -       | -     | -          | Execution context containing message sender parameters |

---

##### `onError` (CallSignature)

**Type:** `void \| ExecutorError`

Error execution hook

Handles errors during message send operation based on error type
and configured failure strategy. Abort errors are delegated to

`onStopError`
for special handling with
`STOPPED`
status.

**Error type handling:**

- Abort errors: Delegated to
  `onStopError()`
  → status
  `STOPPED`

- Regular errors: Handled here → status
  `FAILED`

**Strategy behavior:**

`KEEP_FAILED`
:

- If
  `addedToStore=true`
  : Update message in store with
  `FAILED`
  status
- If
  `addedToStore=false`
  : Merge error with current message
- Message kept with error information
- Throws if update fails

`DELETE_FAILED`
:

- If
  `addedToStore=true`
  : Delete message from store
- Merge error with current message for return value
- Message not visible in store

`ADD_ON_SUCCESS`
:

- Message never added to store
- Merge error with current message
- Return failed message without adding

**Data flow:**

1. Check if error is abort error → delegate to
   `onStopError`

2. Create failed data with
   `FAILED`
   status and error
3. Update, delete, or merge based on strategy
4. Update context with final failed message
5. Call
   `cleanup()`
   to stop streaming state

**Throws:**

When message update fails for
`KEEP_FAILED`
strategy

**Example:** KEEP_FAILED with addedToStore=true

```typescript
// Message in store: { id: 'msg-1', status: 'sending', loading: true }
// Error occurs: Error('Network error')
// After onError: { id: 'msg-1', status: 'failed', loading: false, error: Error }
// Message updated in store with error
```

**Example:** DELETE_FAILED with addedToStore=true

```typescript
// Message in store: { id: 'msg-1', status: 'sending', loading: true }
// Error occurs: Error('Network error')
// After onError: Message deleted from store
// Returns: { id: 'msg-1', status: 'failed', loading: false, error: Error }
```

**Example:** ADD_ON_SUCCESS with addedToStore=false

```typescript
// Message not in store
// Error occurs: Error('Network error')
// After onError: Message not added to store
// Returns: { id: 'msg-1', status: 'failed', loading: false, error: Error }
```

**Example:** Abort error delegation

```typescript
// Error is AbortError
// Delegated to onStopError()
// Status set to 'stopped' instead of 'failed'
// onAborted callback invoked
```

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                                            |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `context` | `MessageSenderContext<T>` | ❌       | -       | -     | -          | Execution context containing message sender parameters |

---

#### `onStopError` (Method)

**Type:** `(context: MessageSenderContext<T>) => void \| ExecutorError`

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                                            |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `context` | `MessageSenderContext<T>` | ❌       | -       | -     | -          | Execution context containing message sender parameters |

---

##### `onStopError` (CallSignature)

**Type:** `void \| ExecutorError`

Handle abort/stop errors

Special handling for abort errors when a send operation is cancelled.
Sets message status to
`STOPPED`
(different from
`FAILED`
) and invokes
the
`onAborted`
callback if provided. Prevents error propagation to
maintain proper control flow.

**Process flow:**

1. Create stopped data with
   `STOPPED`
   status and error
2. Update or merge message based on
   `addedToStore`
   flag
3. Update context with final stopped message
4. Invoke
   `onAborted`
   callback (error-safe)
5. Call
   `cleanup()`
   to stop streaming state
6. Return
   `undefined`
   to prevent error propagation

**Message handling:**

- If
  `addedToStore=true`
  : Update existing message in store
- If
  `addedToStore=false`
  : Merge with current message (not added to store)
- Fallback to merge if update returns
  `null`

**Important notes:**

- Status set to
  `STOPPED`
  (not
  `FAILED`
  )
- `onAborted`
  callback wrapped in try-catch to prevent callback errors
- Returns
  `undefined`
  to stop error propagation through plugin chain
- Cleanup always called to ensure streaming state is stopped

**Returns:**

`undefined`
to prevent error propagation to other plugins

**Example:** With KEEP_FAILED strategy

```typescript
// Message in store: { id: 'msg-1', status: 'sending', loading: true }
sender.stop('msg-1');
// After onStopError: { id: 'msg-1', status: 'stopped', loading: false, error: AbortError }
// Message kept in store with STOPPED status
```

**Example:** With DELETE_FAILED strategy

```typescript
// Message in store: { id: 'msg-1', status: 'sending', loading: true }
sender.stop('msg-1');
// After onStopError: { id: 'msg-1', status: 'stopped', loading: false, error: AbortError }
// Message kept in store (STOPPED is different from FAILED, not deleted)
```

**Example:** With ADD_ON_SUCCESS strategy

```typescript
// Message not in store yet
sender.stop('msg-1');
// After onStopError: { id: 'msg-1', status: 'stopped', loading: false, error: AbortError }
// Message not added to store (returns stopped message)
```

**Example:** With onAborted callback

```typescript
sender.send(
  { content: 'Hello' },
  {
    onAborted: (msg) => {
      console.log('Aborted:', msg.id, msg.status); // 'stopped'
      // Cleanup UI, show notification, etc.
    }
  }
);
```

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                                            |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `context` | `MessageSenderContext<T>` | ❌       | -       | -     | -          | Execution context containing message sender parameters |

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

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                                      |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `context` | `MessageSenderContext<T>` | ❌       | -       | -     | -          | Execution context with message sender parameters |
| `chunk`   | `unknown`                 | ❌       | -       | -     | -          | Data chunk received from the stream              |

---

#### `onSuccess` (Method)

**Type:** `(context: MessageSenderContext<T>) => void`

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                                            |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `context` | `MessageSenderContext<T>` | ❌       | -       | -     | -          | Execution context containing message sender parameters |

---

##### `onSuccess` (CallSignature)

**Type:** `void`

Success execution hook

Handles message finalization after successful send operation.
Updates existing messages or adds new ones based on the configured
strategy and
`addedToStore`
flag.

**Strategy behavior:**

`KEEP_FAILED`
/
`DELETE_FAILED`
(
`addedToStore=true`
):

- Message already in store from
  `onBefore`

- Update existing message with success data
- Merge gateway response into store message
- Throws error if update fails

`ADD_ON_SUCCESS`
(
`addedToStore=false`
):

- Message not in store yet
- Add message to store with success data
- Combine current message with gateway response
- Return newly added message

**Data flow:**

1. Get success data from
   `context.returnValue`
   (gateway response)
2. Update or add message based on
   `addedToStore`
   flag
3. Update
   `context.parameters.currentMessage`
   with final message
4. Update
   `context.returnValue`
   with final message
5. Call
   `cleanup()`
   to stop streaming state

**Throws:**

When message update fails for
`KEEP_FAILED`
/
`DELETE_FAILED`
strategies

**Example:** KEEP_FAILED flow

```typescript
// onBefore: Added { id: 'msg-1', content: 'Hello', status: 'sending' }
// Gateway returns: { result: 'OK', timestamp: 123 }
// onSuccess: Updates to { id: 'msg-1', content: 'Hello', status: 'sent', result: 'OK', timestamp: 123 }
```

**Example:** ADD_ON_SUCCESS flow

```typescript
// onBefore: Not added to store
// Gateway returns: { result: 'OK', timestamp: 123 }
// onSuccess: Adds { id: 'msg-1', content: 'Hello', status: 'sent', result: 'OK', timestamp: 123 }
```

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                                            |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `context` | `MessageSenderContext<T>` | ❌       | -       | -     | -          | Execution context containing message sender parameters |

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

Defines how messages should be managed in the store throughout their
lifecycle, from sending to success/failure. Each strategy provides
different user experience patterns suitable for various application types.

**Strategy comparison:**

| Strategy | Add Timing | Failed Messages | Stopped Messages | Use Case |
| -------- | ---------- | --------------- | ---------------- | -------- |

|
`KEEP_FAILED`
| Before send | Kept in store | Kept in store | Chat apps with retry |
|
`DELETE_FAILED`
| Before send | Deleted from store | Kept in store | Clean UI, success only |
|
`ADD_ON_SUCCESS`
| After success | Not added | Not added | Optimistic UI, no loading |

**Message lifecycle by strategy:**

`KEEP_FAILED`
:

1. Add message to store with
   `SENDING`
   status
2. On success: Update to
   `SENT`
   status
3. On failure: Update to
   `FAILED`
   status (kept in store)
4. On abort: Update to
   `STOPPED`
   status (kept in store)

`DELETE_FAILED`
:

1. Add message to store with
   `SENDING`
   status
2. On success: Update to
   `SENT`
   status
3. On failure: Delete from store (return message with
   `FAILED`
   )
4. On abort: Update to
   `STOPPED`
   status (kept in store, different from failed)

`ADD_ON_SUCCESS`
:

1. Don't add message to store yet
2. On success: Add message to store with
   `SENT`
   status
3. On failure: Don't add to store (return message with
   `FAILED`
   )
4. On abort: Don't add to store (return message with
   `STOPPED`
   )

**Example:** Chat application (KEEP_FAILED)

```typescript
// Users see all messages including failures
// Can retry failed messages
const strategy = SendFailureStrategy.KEEP_FAILED;
```

**Example:** Form submission (DELETE_FAILED)

```typescript
// Clean UI showing only successful submissions
// Failed attempts don't clutter the list
const strategy = SendFailureStrategy.DELETE_FAILED;
```

**Example:** Background task (ADD_ON_SUCCESS)

```typescript
// No loading state visible to users
// Results appear only after completion
const strategy = SendFailureStrategy.ADD_ON_SUCCESS;
```

---
