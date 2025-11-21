## `src/core/message-sender/interface/ChatMessageBridgeInterface` (Module)

**Type:** `unknown`

---

### `ChatMessageBridgeInterface` (Interface)

**Type:** `unknown`

Chat message bridge interface for managing chat message operations

This interface provides a comprehensive set of methods for handling chat message
functionality including sending, storing, drafting, and controlling message state.
It serves as the main bridge between UI components and message handling logic.

Core features:

- Message sending with optional gateway options
- Draft message management
- Send state control and monitoring
- Input element reference management
- Plugin-based extensibility

**Example:** Basic usage

```typescript
const bridge: ChatMessageBridgeInterface<string> = createBridge();

// Set input reference
bridge.setRef(inputElement);

// Change content
bridge.onChangeContent('Hello, world!');

// Send message
await bridge.send();
```

**Example:** With custom content type

```typescript
interface RichContent {
  text: string;
  attachments: File[];
}

const bridge: ChatMessageBridgeInterface<RichContent> = createBridge();
bridge.onChangeContent({
  text: 'Check these files',
  attachments: [file1, file2]
});
```

---

#### `focus` (Method)

**Type:** `() => void`

---

##### `focus` (CallSignature)

**Type:** `void`

Focus on the input element

Programmatically sets focus to the input element, useful for
improving user experience after actions like sending a message.

**Example:**

```typescript
// Focus input after sending a message
await bridge.send(message);
bridge.focus();
```

---

#### `getDisabledSend` (Method)

**Type:** `(params: DisabledSendParams<T>) => boolean`

#### Parameters

| Name     | Type                    | Optional | Default | Since | Deprecated | Description                                     |
| -------- | ----------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `params` | `DisabledSendParams<T>` | ✅       | -       | -     | -          | Optional parameters for checking disabled state |

---

##### `getDisabledSend` (CallSignature)

**Type:** `boolean`

Determine if message sending should be disabled

Checks various conditions to determine if the send button should be disabled,
including draft message state, ongoing send operations, and manual overrides.

**Returns:**

`true`
if sending should be disabled,
`false`
otherwise

**Example:**

```typescript
const isDisabled = bridge.getDisabledSend({
  firstDraft: currentDraft,
  sendingMessage: activeSend,
  disabledSend: false
});

// Use in UI
<button disabled={isDisabled}>Send</button>
```

#### Parameters

| Name     | Type                    | Optional | Default | Since | Deprecated | Description                                     |
| -------- | ----------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------------- |
| `params` | `DisabledSendParams<T>` | ✅       | -       | -     | -          | Optional parameters for checking disabled state |

---

#### `getFirstDraftMessage` (Method)

**Type:** `(draftMessages: ChatMessage<T, unknown>[]) => null \| ChatMessage<T, unknown>`

#### Parameters

| Name            | Type                        | Optional | Default | Since | Deprecated | Description                               |
| --------------- | --------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------- |
| `draftMessages` | `ChatMessage<T, unknown>[]` | ✅       | -       | -     | -          | Optional draft message list from UI layer |

(recommended to get from UI to avoid direct store access).
If not provided, defaults to fetching all messages from store. |

---

##### `getFirstDraftMessage` (CallSignature)

**Type:** `null \| ChatMessage<T, unknown>`

Get the first draft message from the message list

Retrieves the most recent draft message from the UI layer. This method
should get the latest draft message displayed in the UI to avoid stale
data from the store.

**Returns:**

First draft message or
`null`
if none exists

**Example:**

```typescript
// Get first draft from UI layer
const draft = bridge.getFirstDraftMessage(uiDraftMessages);
if (draft) {
  console.log('Current draft:', draft.content);
}
```

#### Parameters

| Name            | Type                        | Optional | Default | Since | Deprecated | Description                               |
| --------------- | --------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------------- |
| `draftMessages` | `ChatMessage<T, unknown>[]` | ✅       | -       | -     | -          | Optional draft message list from UI layer |

(recommended to get from UI to avoid direct store access).
If not provided, defaults to fetching all messages from store. |

---

#### `getMessageStore` (Method)

**Type:** `() => ChatMessageStoreInterface<T>`

---

##### `getMessageStore` (CallSignature)

**Type:** `ChatMessageStoreInterface<T>`

Get the message store instance

Returns a more specific
`ChatMessageStoreInterface`
type for managing
chat messages, providing access to message persistence and state management.

**Returns:**

Chat message store instance

**Example:**

```typescript
const store = bridge.getMessageStore();
const allMessages = store.getMessages();
```

---

#### `getSendingMessage` (Method)

**Type:** `(messages: ChatMessage<T, unknown>[]) => null \| ChatMessage<T, unknown>`

#### Parameters

| Name       | Type                        | Optional | Default | Since | Deprecated | Description                         |
| ---------- | --------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------- |
| `messages` | `ChatMessage<T, unknown>[]` | ✅       | -       | -     | -          | Optional message list from UI layer |

(recommended to get from UI to avoid direct store access).
If not provided, defaults to fetching all messages from store. |

---

##### `getSendingMessage` (CallSignature)

**Type:** `null \| ChatMessage<T, unknown>`

Get the currently sending message

Retrieves the message that is currently being sent to the server.
Useful for displaying loading states or preventing duplicate sends.

**Returns:**

Currently sending message or
`null`
if none

**Example:**

```typescript
const sending = bridge.getSendingMessage(uiMessages);
if (sending) {
  console.log('Sending in progress:', sending.id);
}
```

#### Parameters

| Name       | Type                        | Optional | Default | Since | Deprecated | Description                         |
| ---------- | --------------------------- | -------- | ------- | ----- | ---------- | ----------------------------------- |
| `messages` | `ChatMessage<T, unknown>[]` | ✅       | -       | -     | -          | Optional message list from UI layer |

(recommended to get from UI to avoid direct store access).
If not provided, defaults to fetching all messages from store. |

---

#### `onChangeContent` (Method)

**Type:** `(content: T) => void`

#### Parameters

| Name      | Type | Optional | Default | Since | Deprecated | Description                           |
| --------- | ---- | -------- | ------- | ----- | ---------- | ------------------------------------- |
| `content` | `T`  | ❌       | -       | -     | -          | New content to set in the input field |

---

##### `onChangeContent` (CallSignature)

**Type:** `void`

Update the input content

Triggers content change in the input field. To get the latest draft message
from the UI, use
`getFirstDraftMessage()`
method instead.

**Example:**

```typescript
// Update text content
bridge.onChangeContent('New message text');

// Update with rich content
bridge.onChangeContent({
  text: 'Hello',
  mentions: ['@user1']
});
```

#### Parameters

| Name      | Type | Optional | Default | Since | Deprecated | Description                           |
| --------- | ---- | -------- | ------- | ----- | ---------- | ------------------------------------- |
| `content` | `T`  | ❌       | -       | -     | -          | New content to set in the input field |

---

#### `send` (Method)

**Type:** `(message: ChatMessage<T, unknown>, gatewayOptions: GatewayOptions<ChatMessage<T, unknown>, Record<string, unknown>>) => Promise<ChatMessage<T, unknown>>`

#### Parameters

| Name             | Type                                                               | Optional | Default | Since | Deprecated | Description                                                     |
| ---------------- | ------------------------------------------------------------------ | -------- | ------- | ----- | ---------- | --------------------------------------------------------------- |
| `message`        | `ChatMessage<T, unknown>`                                          | ✅       | -       | -     | -          | Optional message to send. If not provided, uses current draft   |
| `gatewayOptions` | `GatewayOptions<ChatMessage<T, unknown>, Record<string, unknown>>` | ✅       | -       | -     | -          | Optional gateway configuration for streaming and other features |

---

##### `send` (CallSignature)

**Type:** `Promise<ChatMessage<T, unknown>>`

Send user message to the server

Sends a chat message through the configured gateway. If no message is provided,
uses the current draft message. Gateway options can be provided for advanced
features like streaming responses.

Behavior:

- Without
  `message`
  parameter: sends the current draft message
- With
  `gatewayOptions`
  : enables streaming mode for real-time responses

**Returns:**

Promise resolving to the sent message

**Throws:**

When no draft message exists and no message is provided

**Throws:**

When sending fails due to network or validation issues

**Example:** Basic send

```typescript
// Send current draft
const sentMessage = await bridge.send();
```

**Example:** Send specific message

```typescript
const message = new ChatMessage({ content: 'Hello' });
await bridge.send(message);
```

**Example:** With streaming

```typescript
await bridge.send(message, {
  stream: true,
  onChunk: (chunk) => console.log('Received:', chunk)
});
```

#### Parameters

| Name             | Type                                                               | Optional | Default | Since | Deprecated | Description                                                     |
| ---------------- | ------------------------------------------------------------------ | -------- | ------- | ----- | ---------- | --------------------------------------------------------------- |
| `message`        | `ChatMessage<T, unknown>`                                          | ✅       | -       | -     | -          | Optional message to send. If not provided, uses current draft   |
| `gatewayOptions` | `GatewayOptions<ChatMessage<T, unknown>, Record<string, unknown>>` | ✅       | -       | -     | -          | Optional gateway configuration for streaming and other features |

---

#### `setRef` (Method)

**Type:** `(ref: unknown) => void`

#### Parameters

| Name  | Type      | Optional | Default | Since | Deprecated | Description                                      |
| ----- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `ref` | `unknown` | ❌       | -       | -     | -          | Input element reference to be stored and managed |

---

##### `setRef` (CallSignature)

**Type:** `void`

Set the input element reference

**Example:**

```typescript
const inputRef = useRef<HTMLInputElement>(null);
bridge.setRef(inputRef.current);
```

#### Parameters

| Name  | Type      | Optional | Default | Since | Deprecated | Description                                      |
| ----- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `ref` | `unknown` | ❌       | -       | -     | -          | Input element reference to be stored and managed |

---

#### `stop` (Method)

**Type:** `(messageId: string) => boolean`

#### Parameters

| Name                                                | Type     | Optional | Default | Since | Deprecated | Description                                 |
| --------------------------------------------------- | -------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `messageId`                                         | `string` | ✅       | -       | -     | -          | Optional ID of the message to stop sending. |
| If not provided, stops the current sending message. |

---

##### `stop` (CallSignature)

**Type:** `boolean`

Stop sending a message

Cancels an ongoing message send operation. Useful for streaming responses
that users want to interrupt or for handling timeout scenarios.

**Returns:**

`true`
if stop was successful,
`false`
otherwise

**Example:** Stop current send

```typescript
const stopped = bridge.stop();
if (stopped) {
  console.log('Send operation cancelled');
}
```

**Example:** Stop specific message

```typescript
bridge.stop('message-id-123');
```

#### Parameters

| Name                                                | Type     | Optional | Default | Since | Deprecated | Description                                 |
| --------------------------------------------------- | -------- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `messageId`                                         | `string` | ✅       | -       | -     | -          | Optional ID of the message to stop sending. |
| If not provided, stops the current sending message. |

---

#### `use` (Method)

**Type:** `(plugin: ChatMessageBridgePlugin<T> \| ChatMessageBridgePlugin<T>[]) => this`

#### Parameters

| Name     | Type                                                         | Optional | Default | Since | Deprecated | Description                                   |
| -------- | ------------------------------------------------------------ | -------- | ------- | ----- | ---------- | --------------------------------------------- |
| `plugin` | `ChatMessageBridgePlugin<T> \| ChatMessageBridgePlugin<T>[]` | ❌       | -       | -     | -          | Single plugin or array of plugins to register |

---

##### `use` (CallSignature)

**Type:** `this`

Register message sender plugin(s)

Allows extending the message sender functionality with custom plugins
that can intercept, modify, or enhance the message sending process.
Multiple plugins can be registered at once.

**Returns:**

Current bridge instance for method chaining

**Example:** Single plugin

```typescript
bridge.use({
  name: 'logger',
  execute: async (context, next) => {
    console.log('Message:', context.message);
    return next();
  }
});
```

**Example:** Multiple plugins

```typescript
bridge.use([loggerPlugin, validatorPlugin, transformerPlugin]);
```

#### Parameters

| Name     | Type                                                         | Optional | Default | Since | Deprecated | Description                                   |
| -------- | ------------------------------------------------------------ | -------- | ------- | ----- | ---------- | --------------------------------------------- |
| `plugin` | `ChatMessageBridgePlugin<T> \| ChatMessageBridgePlugin<T>[]` | ❌       | -       | -     | -          | Single plugin or array of plugins to register |

---

### `InputRefInterface` (Interface)

**Type:** `unknown`

Input reference interface for managing input element references and focus control

This interface provides methods to control input elements in the chat message UI,
allowing components to set references and manage focus programmatically.

---

#### `focus` (Method)

**Type:** `() => void`

---

##### `focus` (CallSignature)

**Type:** `void`

Focus on the input element

Programmatically sets focus to the input element, useful for
improving user experience after actions like sending a message.

**Example:**

```typescript
// Focus input after sending a message
await bridge.send(message);
bridge.focus();
```

---

#### `setRef` (Method)

**Type:** `(ref: unknown) => void`

#### Parameters

| Name  | Type      | Optional | Default | Since | Deprecated | Description                                      |
| ----- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `ref` | `unknown` | ❌       | -       | -     | -          | Input element reference to be stored and managed |

---

##### `setRef` (CallSignature)

**Type:** `void`

Set the input element reference

**Example:**

```typescript
const inputRef = useRef<HTMLInputElement>(null);
bridge.setRef(inputRef.current);
```

#### Parameters

| Name  | Type      | Optional | Default | Since | Deprecated | Description                                      |
| ----- | --------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `ref` | `unknown` | ❌       | -       | -     | -          | Input element reference to be stored and managed |

---

### `ChatMessageBridgePlugin` (TypeAlias)

**Type:** `ExecutorPlugin<MessageSenderContext<ChatMessage<T>>>`

Plugin type for chat message bridge executor

Allows extending the message sender functionality with custom plugins
that can intercept and modify the message sending process.

**Example:**

```typescript
const logPlugin: ChatMessageBridgePlugin<string> = {
  name: 'logger',
  execute: async (context, next) => {
    console.log('Sending message:', context.message);
    return next();
  }
};
```

---

### `DisabledSendParams` (TypeAlias)

**Type:** `Object`

Parameters for determining if sending messages should be disabled

---

#### `disabledSend` (Property)

**Type:** `boolean`

Whether sending should be disabled

Manual override flag to disable sending functionality

---

#### `firstDraft` (Property)

**Type:** `ChatMessage<T> \| null`

First draft message in the message list

The most recent unsent draft message that user is currently editing

---

#### `sendingMessage` (Property)

**Type:** `ChatMessage<T> \| null`

Currently sending message

The message that is currently being sent to the server

---
