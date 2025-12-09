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

**Type:** `(messages: MessagesStore<MessageType, MessagesStateInterface<MessageType>>, config: MessageSenderConfig) => MessageSender<MessageType>`

#### Parameters

| Name       | Type                                                              | Optional | Default | Since | Deprecated | Description                                       |
| ---------- | ----------------------------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `messages` | `MessagesStore<MessageType, MessagesStateInterface<MessageType>>` | ❌       | -       | -     | -          | Message store instance for managing message state |
| `config`   | `MessageSenderConfig`                                             | ✅       | -       | -     | -          | Optional configuration for sender behavior        |

---

#### `abortPlugin` (Property)

**Type:** `AbortPlugin<MessageSenderContextOptions<MessageType>>`

Abort plugin for handling message cancellation

---

#### `config` (Property)

**Type:** `MessageSenderConfig`

Optional configuration for sender behavior

---

#### `executor` (Property)

**Type:** `MessageSenderExecutor<MessageType>`

Plugin executor for managing send pipeline

---

#### `logger` (Property)

**Type:** `LoggerInterface`

Optional logger instance

---

#### `loggerTpl` (Property)

**Type:** `Object`

**Default:** `{}`

Logger message templates

Predefined templates for consistent logging throughout
the sender's lifecycle.

---

##### `failed` (Property)

**Type:** `"[${senderName}] ${messageId} failed"`

**Default:** `'[${senderName}] ${messageId} failed'`

---

##### `success` (Property)

**Type:** `"[${senderName}] ${messageId} success, speed: ${speed}ms"`

**Default:** `'[${senderName}] ${messageId} success, speed: ${speed}ms'`

---

#### `messageSenderErrorId` (Property)

**Type:** `string`

**Default:** `defaultMessageSenderErrorId`

Error ID for message sender errors

---

#### `messages` (Property)

**Type:** `MessagesStore<MessageType, MessagesStateInterface<MessageType>>`

Message store instance for managing message state

---

#### `senderName` (Property)

**Type:** `string`

Name of this sender instance

---

#### `createSendContext` (Method)

**Type:** `(sendingMessage: MessageType, gatewayOptions: GatewayOptions<MessageType, Record<string, unknown>>) => MessageSenderContextOptions<MessageType>`

#### Parameters

| Name             | Type                                                   | Optional | Default | Since | Deprecated | Description                    |
| ---------------- | ------------------------------------------------------ | -------- | ------- | ----- | ---------- | ------------------------------ |
| `sendingMessage` | `MessageType`                                          | ❌       | -       | -     | -          | Message being sent             |
| `gatewayOptions` | `GatewayOptions<MessageType, Record<string, unknown>>` | ✅       | -       | -     | -          | Optional gateway configuration |

---

##### `createSendContext` (CallSignature)

**Type:** `MessageSenderContextOptions<MessageType>`

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

Gateway instance or
`undefined`
if not configured

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

**Type:** `(error: unknown, context: MessageSenderContextOptions<MessageType>) => Promise<MessageType>`

#### Parameters

| Name      | Type                                       | Optional | Default | Since | Deprecated | Description                                            |
| --------- | ------------------------------------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `error`   | `unknown`                                  | ❌       | -       | -     | -          | Error that occurred during send                        |
| `context` | `MessageSenderContextOptions<MessageType>` | ❌       | -       | -     | -          | Execution context containing message sender parameters |

---

##### `handleError` (CallSignature)

**Type:** `Promise<MessageType>`

Handle send operation errors

Processes errors that occur during message sending. Converts unknown
async errors to MESSAGE_SENDER_ERROR format, logs failures, and either
throws or returns an error message based on configuration.

**Status handling:**
Allows plugins to modify final status. If status is still
`SENDING`
at
this point, it's reset to
`FAILED`
. Examples of plugin-modified status:

`STOPPED`
for cancelled operations.

**Returns:**

Message with error state, or throws if
`throwIfError`
is
`true`

**Throws:**

Error when
`throwIfError`
configuration is
`true`

#### Parameters

| Name      | Type                                       | Optional | Default | Since | Deprecated | Description                                            |
| --------- | ------------------------------------------ | -------- | ------- | ----- | ---------- | ------------------------------------------------------ |
| `error`   | `unknown`                                  | ❌       | -       | -     | -          | Error that occurred during send                        |
| `context` | `MessageSenderContextOptions<MessageType>` | ❌       | -       | -     | -          | Execution context containing message sender parameters |

---

#### `send` (Method)

**Type:** `(message: Partial<MessageType>, gatewayOptions: GatewayOptions<MessageType, Record<string, unknown>>) => Promise<MessageType>`

#### Parameters

| Name             | Type                                                   | Optional | Default | Since | Deprecated | Description                                           |
| ---------------- | ------------------------------------------------------ | -------- | ------- | ----- | ---------- | ----------------------------------------------------- |
| `message`        | `Partial<MessageType>`                                 | ❌       | -       | -     | -          | Partial message object to send                        |
| `gatewayOptions` | `GatewayOptions<MessageType, Record<string, unknown>>` | ✅       | -       | -     | -          | Optional gateway configuration for this specific send |

---

##### `send` (CallSignature)

**Type:** `Promise<MessageType>`

Send a message through the sender pipeline

Main public API for sending messages. Handles the complete send lifecycle
including message preparation, plugin execution, gateway communication,
error handling, and logging.

**Behavior:**

- If
  `throwIfError=true`
  : Throws on send failure
- If
  `throwIfError=false`
  (default): Returns error message on failure
- If
  `gatewayOptions`
  provided: Uses specified configuration
- If
  `gatewayOptions.signal`
  provided: Uses custom signal (stop method won't work)
- If no signal provided: AbortPlugin creates one automatically (stoppable via stop method)
- Resource cleanup managed automatically by AbortPlugin

**Returns:**

Promise resolving to sent message with response data

**Throws:**

Error when
`throwIfError`
is
`true`
and send fails

**Example:** Basic send

```typescript
const result = await sender.send({
  content: 'Hello, world!'
});
console.log('Sent:', result.id);
```

**Example:** With streaming

```typescript
await sender.send(
  { content: 'Hello' },
  {
    stream: true,
    onConnected: () => console.log('Connected'),
    onChunk: (chunk) => updateUI(chunk),
    onComplete: (msg) => console.log('Complete')
  }
);
```

**Example:** With custom abort control

```typescript
const controller = new AbortController();

const promise = sender.send(
  { content: 'Hello' },
  { signal: controller.signal }
);

// Cancel manually
setTimeout(() => controller.abort(), 5000);

try {
  await promise;
} catch (error) {
  console.log('Send cancelled');
}
```

#### Parameters

| Name             | Type                                                   | Optional | Default | Since | Deprecated | Description                                           |
| ---------------- | ------------------------------------------------------ | -------- | ------- | ----- | ---------- | ----------------------------------------------------- |
| `message`        | `Partial<MessageType>`                                 | ❌       | -       | -     | -          | Partial message object to send                        |
| `gatewayOptions` | `GatewayOptions<MessageType, Record<string, unknown>>` | ✅       | -       | -     | -          | Optional gateway configuration for this specific send |

---

#### `sendMessage` (Method)

**Type:** `(message: MessageType, context: MessageSenderPluginContext<MessageType>) => Promise<MessageType>`

#### Parameters

| Name      | Type                                      | Optional | Default | Since | Deprecated | Description                              |
| --------- | ----------------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `message` | `MessageType`                             | ❌       | -       | -     | -          | Message to send                          |
| `context` | `MessageSenderPluginContext<MessageType>` | ❌       | -       | -     | -          | Execution context with sender parameters |

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

| Name      | Type                                      | Optional | Default | Since | Deprecated | Description                              |
| --------- | ----------------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `message` | `MessageType`                             | ❌       | -       | -     | -          | Message to send                          |
| `context` | `MessageSenderPluginContext<MessageType>` | ❌       | -       | -     | -          | Execution context with sender parameters |

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

Cancels an ongoing message send operation by ID. This only works
for requests created automatically by MessageSender (without custom signal).

**Important notes:**

- Only affects requests created by MessageSender (no custom signal provided)
- If a custom signal was provided during send, this method has no effect
- Automatically cleans up related resources (managed by AbortPlugin)

**Returns:**

`true`
if stop was successful,
`false`
otherwise

**Example:**

```typescript
const message = await sender.send({ content: 'Hello' });

// Later, cancel the send
const stopped = sender.stop(message.id);
if (stopped) {
  console.log('Send cancelled successfully');
}
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

Cancels all currently active message send operations.
Automatically cleans up all related resources (managed by AbortPlugin).

**Example:**

```typescript
// Cancel all pending sends
sender.stopAll();
console.log('All sends cancelled');
```

---

#### `use` (Method)

**Type:** `(plugin: ExecutorPlugin<T>) => this`

#### Parameters

| Name     | Type                | Optional | Default | Since | Deprecated | Description        |
| -------- | ------------------- | -------- | ------- | ----- | ---------- | ------------------ |
| `plugin` | `ExecutorPlugin<T>` | ❌       | -       | -     | -          | Plugin to register |

---

##### `use` (CallSignature)

**Type:** `this`

Register a plugin with the sender

Plugins are executed in registration order during message sending.
Returns
`this`
for method chaining.

**Returns:**

This sender instance for chaining

**Example:**

```typescript
sender.use(validationPlugin).use(loggingPlugin).use(transformPlugin);
```

#### Parameters

| Name     | Type                | Optional | Default | Since | Deprecated | Description        |
| -------- | ------------------- | -------- | ------- | ----- | ---------- | ------------------ |
| `plugin` | `ExecutorPlugin<T>` | ❌       | -       | -     | -          | Plugin to register |

---

### `MessageSenderConfig` (Interface)

**Type:** `interface MessageSenderConfig`

Configuration options for message sender

Defines behavior, logging, gateway integration, and error handling
for the message sender instance.

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
