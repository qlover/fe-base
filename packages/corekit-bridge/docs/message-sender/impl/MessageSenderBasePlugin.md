## `src/core/message-sender/impl/MessageSenderBasePlugin` (Module)

**Type:** `module src/core/message-sender/impl/MessageSenderBasePlugin`

---

### `MessageSenderBasePlugin` (Class)

**Type:** `class MessageSenderBasePlugin<T>`

Abstract base class for message sender plugins

Provides common utility methods for plugin implementations, simplifying
the process of creating custom message sender plugins. This class handles
common operations like message merging, return value management, and
store state tracking.

Core features:

- Runtime message merging with context updates
- Return value management for async operations
- Store state tracking (added to store flag)
- Type-safe plugin implementation base

**Example:** Basic plugin implementation

```typescript
class LoggingPlugin extends MessageSenderBasePlugin<ChatMessage> {
  readonly pluginName = 'logger';

  async execute(context, next) {
    console.log('Before send:', context.parameters.currentMessage);

    // Update message with timestamp
    this.mergeRuntimeMessage(context, {
      metadata: { loggedAt: Date.now() }
    });

    const result = await next();

    console.log('After send:', result);
    return this.asyncReturnValue(context, result);
  }
}
```

**Example:** Plugin with store state management

```typescript
class ValidationPlugin extends MessageSenderBasePlugin {
  readonly pluginName = 'validator';

  async execute(context, next) {
    const { currentMessage } = context.parameters;

    // Validate before adding to store
    if (!isValid(currentMessage)) {
      throw new Error('Invalid message');
    }

    this.openAddedToStore(context);
    const result = await next();
    this.closeAddedToStore(context);

    return result;
  }
}
```

---

#### `new MessageSenderBasePlugin` (Constructor)

**Type:** `() => MessageSenderBasePlugin<T>`

---

#### `pluginName` (Property)

**Type:** `string`

Unique plugin name identifier

Must be implemented by subclasses to provide a unique name
for the plugin. Used for plugin registration and debugging.

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
