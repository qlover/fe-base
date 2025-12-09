## `src/core/message-sender/interface/MessageSenderInterface` (Module)

**Type:** `module src/core/message-sender/interface/MessageSenderInterface`

---

### `MessageSenderInterface` (Interface)

**Type:** `interface MessageSenderInterface<Message>`

Message sender interface for managing message transmission

This interface provides a high-level API for sending messages, managing
message storage, and extending functionality through plugins. It serves
as the main entry point for message operations in the application.

Core features:

- Message sending with normal and streaming modes
- Message store access for persistence
- Gateway management for external communication
- Plugin-based extensibility

**Example:** Basic usage

```typescript
const sender: MessageSenderInterface<ChatMessage> = createSender();

// Access message store
const store = sender.getMessageStore();

// Send message
const result = await sender.send({ content: 'Hello' });
```

**Example:** With plugins

```typescript
sender.use(loggingPlugin).use(validationPlugin).use(transformPlugin);

await sender.send({ content: 'Hello' });
```

---

#### `getGateway` (Method)

**Type:** `() => undefined \| MessageGetwayInterface`

---

##### `getGateway` (CallSignature)

**Type:** `undefined \| MessageGetwayInterface`

Get the gateway instance

Returns the configured message gateway used for external communication.
Returns
`undefined`
if no gateway has been configured.

**Returns:**

Gateway instance or
`undefined`
if not configured

**Example:**

```typescript
const gateway = sender.getGateway();
if (gateway) {
  console.log('Gateway configured');
} else {
  console.log('No gateway available');
}
```

---

#### `getMessageStore` (Method)

**Type:** `() => MessagesStoreInterface<Message, MessagesStateInterface<Message>>`

---

##### `getMessageStore` (CallSignature)

**Type:** `MessagesStoreInterface<Message, MessagesStateInterface<Message>>`

Get the message store instance

Returns the message store responsible for managing message state
and persistence. The store provides access to message history,
state management, and CRUD operations.

**Returns:**

Message store instance

**Example:**

```typescript
const store = sender.getMessageStore();
const messages = store.getMessages();
console.log(`Total messages: ${messages.length}`);
```

---

#### `send` (Method)

**Type:** `(message: Partial<Message>, streamEvent: MessageStreamEvent<unknown>) => Promise<Message>`

#### Parameters

| Name          | Type                          | Optional | Default | Since | Deprecated | Description                                                      |
| ------------- | ----------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------- |
| `message`     | `Partial<Message>`            | ❌       | -       | -     | -          | Partial message object containing at minimum the required fields |
| `streamEvent` | `MessageStreamEvent<unknown>` | ✅       | -       | -     | -          | Optional stream event callbacks for streaming mode               |

---

##### `send` (CallSignature)

**Type:** `Promise<Message>`

Send a message through the sender

Sends a message using either normal mode (one-time response) or
streaming mode (progressive response) based on the provided options.

Behavior:

- With
  `streamEvent`
  parameter: sends as streaming message with real-time updates
- Without
  `streamEvent`
  : sends as normal message with single response

**Returns:**

Promise resolving to the complete sent message

**Throws:**

When message validation fails

**Throws:**

When network communication fails

**Throws:**

When gateway is not configured or fails

**Example:** Normal send

```typescript
const result = await sender.send({
  content: 'Hello, world!',
  metadata: { priority: 'high' }
});
console.log('Message sent:', result.id);
```

**Example:** Streaming send

```typescript
await sender.send(
  { content: 'Hello' },
  {
    onConnected: () => console.log('Connected'),
    onChunk: (chunk) => updateUI(chunk),
    onComplete: (final) => console.log('Complete:', final),
    onError: (err) => console.error('Error:', err)
  }
);
```

**Example:** With error handling

```typescript
try {
  const message = await sender.send({ content: 'Hello' });
  showSuccessNotification('Message sent!');
} catch (error) {
  showErrorNotification(error.message);
}
```

#### Parameters

| Name          | Type                          | Optional | Default | Since | Deprecated | Description                                                      |
| ------------- | ----------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------- |
| `message`     | `Partial<Message>`            | ❌       | -       | -     | -          | Partial message object containing at minimum the required fields |
| `streamEvent` | `MessageStreamEvent<unknown>` | ✅       | -       | -     | -          | Optional stream event callbacks for streaming mode               |

---

#### `use` (Method)

**Type:** `(plugin: ExecutorPlugin<T>) => this`

#### Parameters

| Name     | Type                | Optional | Default | Since | Deprecated | Description                        |
| -------- | ------------------- | -------- | ------- | ----- | ---------- | ---------------------------------- |
| `plugin` | `ExecutorPlugin<T>` | ❌       | -       | -     | -          | Plugin to register with the sender |

---

##### `use` (CallSignature)

**Type:** `this`

Register a message sender plugin

Extends the message sender functionality with custom plugins that can
intercept, modify, or enhance the message sending process. Plugins are
executed in the order they are registered.

**Returns:**

Current sender instance for method chaining

**Example:** Single plugin

```typescript
sender.use({
  name: 'logger',
  execute: async (context, next) => {
    console.log('Sending:', context.message);
    const result = await next();
    console.log('Sent:', result);
    return result;
  }
});
```

**Example:** Chained plugins

```typescript
sender.use(authPlugin).use(validationPlugin).use(transformPlugin);
```

#### Parameters

| Name     | Type                | Optional | Default | Since | Deprecated | Description                        |
| -------- | ------------------- | -------- | ------- | ----- | ---------- | ---------------------------------- |
| `plugin` | `ExecutorPlugin<T>` | ❌       | -       | -     | -          | Plugin to register with the sender |

---
