## `src/core/message-sender/impl/ChatMessageStore` (Module)

**Type:** `unknown`

---

### `ChatMessageStore` (Class)

**Type:** `unknown`

Chat message store implementation with draft management

Extends the base message store with chat-specific features including
draft message management with configurable STACK/QUEUE modes, ready-to-send
validation, and chat message type support.

Core features:

- Draft message CRUD operations
- Configurable draft processing mode (STACK/QUEUE)
- Send readiness validation
- Chat message instance support

**Example:** Basic usage

```typescript
const store = new ChatMessageStore<string>();

// Add draft
store.addDraftMessage({ content: 'Hello' });

// Get first draft
const draft = store.getFirstDraftMessage();

// Send when ready
if (draft) {
  const ready = store.getReadySendMessage(draft);
  if (ready) await send(ready);
}
```

**Example:** With STACK mode

```typescript
class MyStore extends ChatMessageStore {
  protected draftMode = DraftMode.STACK;
}

const store = new MyStore();
// Now newest drafts are sent first
```

---

#### `new ChatMessageStore` (Constructor)

**Type:** `(initialState: Object) => ChatMessageStore<T>`

#### Parameters

| Name                                 | Type     | Optional | Default                  | Since | Deprecated | Description                               |
| ------------------------------------ | -------- | -------- | ------------------------ | ----- | ---------- | ----------------------------------------- |
| `initialState`                       | `Object` | ✅       | `createChatMessageState` | -     | -          | Factory function providing initial state, |
| defaults to `createChatMessageState` |

---

#### `draftMode` (Property)

**Type:** `DraftModeType`

**Default:** `DraftMode.QUEUE`

Draft message processing mode

Controls whether drafts are processed in LIFO (STACK) or FIFO (QUEUE) order.
Can be overridden in subclasses to change the default behavior.

**Example:** Override in subclass

```typescript
class MyStore extends ChatMessageStore {
  protected draftMode = DraftMode.STACK;
}
```

---

#### `stateFactory` (Property)

**Type:** `Object`

() => T, factory function to create the initial state

---

#### `state` (Accessor)

**Type:** `unknown`

---

#### `addDraftMessage` (Method)

**Type:** `(message: Partial<ChatMessage<T, unknown>>) => void`

#### Parameters

| Name      | Type                               | Optional | Default | Since | Deprecated | Description                                                    |
| --------- | ---------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `message` | `Partial<ChatMessage<T, unknown>>` | ❌       | -       | -     | -          | Partial message content (will be auto-completed with defaults) |

**Behavior for both modes:**

STACK mode (append to end, last in first out):

- Before: `[A, B]`
- Add C: `[A, B, C]`
- Add D: `[A, B, C, D]`
- Send order: D → C → B → A (newest sent first)

QUEUE mode (append to end, first in first out):

- Before: `[A, B]`
- Add C: `[A, B, C]`
- Add D: `[A, B, C, D]`
- Send order: A → B → C → D (oldest sent first)

**Mode comparison:**

- STACK: New messages append to end, retrieved from end (LIFO)
- QUEUE: New messages append to end, retrieved from start (FIFO)

**Note:**

- Automatically sets message status to `MessageStatus.DRAFT`
- Both modes add the same way, difference is in retrieval order |

---

##### `addDraftMessage` (CallSignature)

**Type:** `void`

Add a new draft message

Creates and adds a draft message to the store. The message is automatically
set to
`DRAFT`
status regardless of the provided status value.

**Example:**

```typescript
store.addDraftMessage({
  content: 'Hello, world!',
  metadata: { priority: 'high' }
});
```

#### Parameters

| Name      | Type                               | Optional | Default | Since | Deprecated | Description                                                    |
| --------- | ---------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `message` | `Partial<ChatMessage<T, unknown>>` | ❌       | -       | -     | -          | Partial message content (will be auto-completed with defaults) |

**Behavior for both modes:**

STACK mode (append to end, last in first out):

- Before: `[A, B]`
- Add C: `[A, B, C]`
- Add D: `[A, B, C, D]`
- Send order: D → C → B → A (newest sent first)

QUEUE mode (append to end, first in first out):

- Before: `[A, B]`
- Add C: `[A, B, C]`
- Add D: `[A, B, C, D]`
- Send order: A → B → C → D (oldest sent first)

**Mode comparison:**

- STACK: New messages append to end, retrieved from end (LIFO)
- QUEUE: New messages append to end, retrieved from start (FIFO)

**Note:**

- Automatically sets message status to `MessageStatus.DRAFT`
- Both modes add the same way, difference is in retrieval order |

---

#### `addMessage` (Method)

**Type:** `(message: Partial<M>) => M`

#### Parameters

| Name      | Type         | Optional | Default | Since | Deprecated | Description                   |
| --------- | ------------ | -------- | ------- | ----- | ---------- | ----------------------------- |
| `message` | `Partial<M>` | ❌       | -       | -     | -          | Partial message specification |

---

##### `addMessage` (CallSignature)

**Type:** `M`

Add a new message to the store

If the message has an ID and already exists in the store, updates the
existing message instead of adding a duplicate. Otherwise creates and
adds a new message to the collection.

**Returns:**

Created or updated message instance

**Example:** Add new message

```typescript
const message = store.addMessage({
  content: 'Hello, world!'
});
```

**Example:** Add message with ID (updates if exists)

```typescript
const message = store.addMessage({
  id: 'msg-123',
  content: 'Updated content'
});
```

#### Parameters

| Name      | Type         | Optional | Default | Since | Deprecated | Description                   |
| --------- | ------------ | -------- | ------- | ----- | ---------- | ----------------------------- |
| `message` | `Partial<M>` | ❌       | -       | -     | -          | Partial message specification |

---

#### `changeDisabledSend` (Method)

**Type:** `(disabled: boolean) => void`

#### Parameters

| Name       | Type      | Optional | Default | Since | Deprecated | Description                                  |
| ---------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `disabled` | `boolean` | ❌       | -       | -     | -          | `true` to disable sending, `false` to enable |

---

##### `changeDisabledSend` (CallSignature)

**Type:** `void`

Change the send disabled state

Controls whether message sending is enabled or disabled globally.
When disabled, the UI should prevent users from sending messages.

**Example:**

```typescript
// Disable sending during validation
store.changeDisabledSend(true);

// Re-enable after validation
store.changeDisabledSend(false);
```

#### Parameters

| Name       | Type      | Optional | Default | Since | Deprecated | Description                                  |
| ---------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `disabled` | `boolean` | ❌       | -       | -     | -          | `true` to disable sending, `false` to enable |

---

#### `clear` (Method)

**Type:** `() => void`

---

##### `clear` (CallSignature)

**Type:** `void`

Clear all observers

This method removes all registered listeners and their last selected values.
It is useful when the component is unloaded or needs to reset the observer state.

**Example:**

```typescript
// Register some observers
observer.observe((state) => console.log(state));

// Remove all observers
observer.clear();

// Now notifications will not trigger any listeners
observer.notify({ count: 3 });
```

---

#### `cloneState` (Method)

**Type:** `(source: Partial<ChatMessageStoreStateInterface<T>>) => ChatMessageStoreStateInterface<T>`

#### Parameters

| Name     | Type                                         | Optional | Default | Since | Deprecated | Description                                             |
| -------- | -------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------- |
| `source` | `Partial<ChatMessageStoreStateInterface<T>>` | ✅       | -       | -     | -          | Partial<T> - properties to override in the cloned state |

---

##### `cloneState` (CallSignature)

**Type:** `ChatMessageStoreStateInterface<T>`

**Since:** `1.3.1`

Clone the state of the store

**Returns:**

T - the new cloned state

#### Parameters

| Name     | Type                                         | Optional | Default | Since | Deprecated | Description                                             |
| -------- | -------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------- |
| `source` | `Partial<ChatMessageStoreStateInterface<T>>` | ✅       | -       | -     | -          | Partial<T> - properties to override in the cloned state |

---

#### `createMessage` (Method)

**Type:** `(message: Partial<M>) => M`

#### Parameters

| Name      | Type         | Optional | Default | Since | Deprecated | Description                   |
| --------- | ------------ | -------- | ------- | ----- | ---------- | ----------------------------- |
| `message` | `Partial<M>` | ✅       | `...`   | -     | -          | Partial message specification |

---

##### `createMessage` (CallSignature)

**Type:** `M`

Create a ChatMessage instance from partial data

Overrides the base implementation to ensure messages are created
as ChatMessage class instances with proper prototype chain.

**Returns:**

ChatMessage instance

#### Parameters

| Name      | Type         | Optional | Default | Since | Deprecated | Description                   |
| --------- | ------------ | -------- | ------- | ----- | ---------- | ----------------------------- |
| `message` | `Partial<M>` | ✅       | `...`   | -     | -          | Partial message specification |

---

#### `defaultId` (Method)

**Type:** `(message: Partial<ChatMessage<T, unknown>>) => string`

#### Parameters

| Name      | Type                               | Optional | Default | Since | Deprecated | Description            |
| --------- | ---------------------------------- | -------- | ------- | ----- | ---------- | ---------------------- |
| `message` | `Partial<ChatMessage<T, unknown>>` | ❌       | -       | -     | -          | Partial message object |

---

##### `defaultId` (CallSignature)

**Type:** `string`

Generate default ID for a message

Creates a unique ID using timestamp and random string.
Format:
`{timestamp}-{random}`

**Returns:**

Generated unique ID string

**Example:**

```typescript
const id = store.defaultId({ content: 'Hello' });
// "1640000000000-abc123xyz"
```

#### Parameters

| Name      | Type                               | Optional | Default | Since | Deprecated | Description            |
| --------- | ---------------------------------- | -------- | ------- | ----- | ---------- | ---------------------- |
| `message` | `Partial<ChatMessage<T, unknown>>` | ❌       | -       | -     | -          | Partial message object |

---

#### `deleteDraftMessage` (Method)

**Type:** `(messageId: string) => void`

#### Parameters

| Name        | Type     | Optional | Default | Since | Deprecated | Description                                      |
| ----------- | -------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `messageId` | `string` | ❌       | -       | -     | -          | Unique identifier of the draft message to delete |

---

##### `deleteDraftMessage` (CallSignature)

**Type:** `void`

Delete a draft message by ID

Removes the specified draft message from the store. Does nothing
if no message with the given ID exists.

**Example:**

```typescript
store.deleteDraftMessage('draft-123');
```

#### Parameters

| Name        | Type     | Optional | Default | Since | Deprecated | Description                                      |
| ----------- | -------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `messageId` | `string` | ❌       | -       | -     | -          | Unique identifier of the draft message to delete |

---

#### `deleteMessage` (Method)

**Type:** `(id: string) => void`

#### Parameters

| Name | Type     | Optional | Default | Since | Deprecated | Description                                |
| ---- | -------- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `id` | `string` | ❌       | -       | -     | -          | Unique identifier of the message to delete |

---

##### `deleteMessage` (CallSignature)

**Type:** `void`

Delete a message from the store

Permanently removes a message from the store by its ID using a single
traversal with filter. Does nothing if the message doesn't exist.

**Example:**

```typescript
store.deleteMessage('msg-123');
```

#### Parameters

| Name | Type     | Optional | Default | Since | Deprecated | Description                                |
| ---- | -------- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `id` | `string` | ❌       | -       | -     | -          | Unique identifier of the message to delete |

---

#### `emit` (Method)

**Type:** `(state: ChatMessageStoreStateInterface<T>) => void`

#### Parameters

| Name    | Type                                | Optional | Default | Since | Deprecated | Description          |
| ------- | ----------------------------------- | -------- | ------- | ----- | ---------- | -------------------- |
| `state` | `ChatMessageStoreStateInterface<T>` | ❌       | -       | -     | -          | The new state object |

---

##### `emit` (CallSignature)

**Type:** `void`

Update the state and notify all observers

This method will replace the current state object and trigger all subscribed observers.
The observers will receive the new and old state as parameters.

**Example:**

```typescript
interface UserState {
  name: string;
  age: number;
}

const userStore = new SliceStore<UserState>({
  name: 'John',
  age: 20
});
userStore.emit({ name: 'Jane', age: 25 });
```

#### Parameters

| Name    | Type                                | Optional | Default | Since | Deprecated | Description          |
| ------- | ----------------------------------- | -------- | ------- | ----- | ---------- | -------------------- |
| `state` | `ChatMessageStoreStateInterface<T>` | ❌       | -       | -     | -          | The new state object |

---

#### `getDarftMessageById` (Method)

**Type:** `(messageId: string) => null \| ChatMessage<T, unknown>`

#### Parameters

| Name        | Type     | Optional | Default | Since | Deprecated | Description                            |
| ----------- | -------- | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `messageId` | `string` | ❌       | -       | -     | -          | Unique identifier of the draft message |

---

##### `getDarftMessageById` (CallSignature)

**Type:** `null \| ChatMessage<T, unknown>`

Get a draft message by ID

Retrieves a specific draft message from the draft message list.

**Returns:**

Draft message or
`null`
if not found

**Example:**

```typescript
const draft = store.getDarftMessageById('draft-123');
if (draft) {
  console.log(draft.content);
}
```

#### Parameters

| Name        | Type     | Optional | Default | Since | Deprecated | Description                            |
| ----------- | -------- | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `messageId` | `string` | ❌       | -       | -     | -          | Unique identifier of the draft message |

---

#### `getDraftMessages` (Method)

**Type:** `() => ChatMessage<T, unknown>[]`

---

##### `getDraftMessages` (CallSignature)

**Type:** `ChatMessage<T, unknown>[]`

Get all draft messages

**Returns:**

Array of all draft messages in the store

---

#### `getFirstDraftMessage` (Method)

**Type:** `() => null \| ChatMessage<T, unknown>`

---

##### `getFirstDraftMessage` (CallSignature)

**Type:** `null \| ChatMessage<T, unknown>`

Get the first draft message based on configured mode

Returns the draft message that should be processed/sent first
according to the configured draft mode. This is the logical "first"
message, not necessarily the array's first element.

**Returns:**

First draft message to process, or
`null`
if none exists

**Mode behavior:**

- STACK mode (LIFO):
  `[A, B, C]`
  → returns C (last, newest, sent first)
- QUEUE mode (FIFO):
  `[A, B, C]`
  → returns A (first, oldest, sent first)

**Note:** "First" refers to the message that should be prioritized,
not its position in the array.

**Example:** With QUEUE mode (default)

```typescript
store.addDraftMessage({ content: 'A' });
store.addDraftMessage({ content: 'B' });
store.addDraftMessage({ content: 'C' });

const first = store.getFirstDraftMessage();
console.log(first.content); // "A" - oldest is first
```

**Example:** With STACK mode

```typescript
class MyStore extends ChatMessageStore {
  protected draftMode = DraftMode.STACK;
}

const store = new MyStore();
store.addDraftMessage({ content: 'A' });
store.addDraftMessage({ content: 'B' });
store.addDraftMessage({ content: 'C' });

const first = store.getFirstDraftMessage();
console.log(first.content); // "C" - newest is first
```

---

#### `getMessageById` (Method)

**Type:** `(id: string) => undefined \| ChatMessage<T, unknown>`

#### Parameters

| Name | Type     | Optional | Default | Since | Deprecated | Description                      |
| ---- | -------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `id` | `string` | ❌       | -       | -     | -          | Unique identifier of the message |

---

##### `getMessageById` (CallSignature)

**Type:** `undefined \| ChatMessage<T, unknown>`

Get a message by its unique identifier

**Returns:**

Message object or
`undefined`
if not found

#### Parameters

| Name | Type     | Optional | Default | Since | Deprecated | Description                      |
| ---- | -------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `id` | `string` | ❌       | -       | -     | -          | Unique identifier of the message |

---

#### `getMessageByIndex` (Method)

**Type:** `(index: number) => undefined \| ChatMessage<T, unknown>`

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description               |
| ------- | -------- | -------- | ------- | ----- | ---------- | ------------------------- |
| `index` | `number` | ❌       | -       | -     | -          | Zero-based index position |

---

##### `getMessageByIndex` (CallSignature)

**Type:** `undefined \| ChatMessage<T, unknown>`

Get a message by its index position

**Returns:**

Message at the index or
`undefined`
if out of bounds

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description               |
| ------- | -------- | -------- | ------- | ----- | ---------- | ------------------------- |
| `index` | `number` | ❌       | -       | -     | -          | Zero-based index position |

---

#### `getMessageIndex` (Method)

**Type:** `(id: string) => number`

#### Parameters

| Name | Type     | Optional | Default | Since | Deprecated | Description                      |
| ---- | -------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `id` | `string` | ❌       | -       | -     | -          | Unique identifier of the message |

---

##### `getMessageIndex` (CallSignature)

**Type:** `number`

Get the index position of a message in the store

**Returns:**

Zero-based index of the message, or
`-1`
if not found

#### Parameters

| Name | Type     | Optional | Default | Since | Deprecated | Description                      |
| ---- | -------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `id` | `string` | ❌       | -       | -     | -          | Unique identifier of the message |

---

#### `getMessages` (Method)

**Type:** `() => ChatMessage<T, unknown>[]`

---

##### `getMessages` (CallSignature)

**Type:** `ChatMessage<T, unknown>[]`

Get all messages from the store

**Returns:**

Array of all messages in the store

---

#### `getReadySendMessage` (Method)

**Type:** `(message: ChatMessage<T, unknown>) => null \| ChatMessage<T, unknown>`

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                                       |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `message` | `ChatMessage<T, unknown>` | ✅       | -       | -     | -          | Optional specific message to validate for sending |

---

##### `getReadySendMessage` (CallSignature)

**Type:** `null \| ChatMessage<T, unknown>`

Get the message ready to be sent

Determines which message should be sent next. Follows this priority:

1. If a specific message is provided and exists as a draft, use it
2. If the message exists in sent history, use it
3. Otherwise, shift the first draft message from the queue/stack

**Returns:**

Message ready to send, or
`null`
if none available

**Example:** Auto-send next draft

```typescript
const message = store.getReadySendMessage();
if (message) {
  await gateway.send(message);
}
```

**Example:** Validate specific message

```typescript
const message = store.createMessage({ content: 'Hello' });
const ready = store.getReadySendMessage(message);
if (ready) {
  await gateway.send(ready);
}
```

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                                       |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `message` | `ChatMessage<T, unknown>` | ✅       | -       | -     | -          | Optional specific message to validate for sending |

---

#### `isMessage` (Method)

**Type:** `(message: unknown) => unknown`

#### Parameters

| Name      | Type      | Optional | Default | Since | Deprecated | Description    |
| --------- | --------- | -------- | ------- | ----- | ---------- | -------------- |
| `message` | `unknown` | ❌       | -       | -     | -          | Value to check |

---

##### `isMessage` (CallSignature)

**Type:** `unknown`

Type guard to check if a value is a ChatMessage instance

**Returns:**

`true`
if value is a ChatMessage instance,
`false`
otherwise

#### Parameters

| Name      | Type      | Optional | Default | Since | Deprecated | Description    |
| --------- | --------- | -------- | ------- | ----- | ---------- | -------------- |
| `message` | `unknown` | ❌       | -       | -     | -          | Value to check |

---

#### `mergeMessage` (Method)

**Type:** `(target: T, updates: Partial<T>[]) => T`

#### Parameters

| Name      | Type           | Optional | Default | Since | Deprecated | Description                                         |
| --------- | -------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `target`  | `T`            | ❌       | -       | -     | -          | Target message to merge updates into                |
| `updates` | `Partial<T>[]` | ❌       | -       | -     | -          | Variable number of partial message objects to merge |

---

##### `mergeMessage` (CallSignature)

**Type:** `T`

Merge message objects while preserving prototype chain

**Important:** This method preserves the prototype chain for class instances,
ensuring that methods and instanceof checks continue to work after merging.
Plain objects are merged directly without prototype preservation.

**Returns:**

Merged message with prototype chain preserved

**Example:** With class instance

```typescript
class ChatMessage extends MessageStoreMsg {
  greet() {
    return 'Hello';
  }
}

const message = new ChatMessage({ content: 'Hi' });
const merged = store.mergeMessage(message, { content: 'Hello' });

// Prototype is preserved
console.log(merged instanceof ChatMessage); // true
console.log(merged.greet()); // "Hello"
```

**Example:** With plain object

```typescript
const message = { content: 'Hi', id: '123' };
const merged = store.mergeMessage(message, { content: 'Hello' });
// Plain object merge
```

#### Parameters

| Name      | Type           | Optional | Default | Since | Deprecated | Description                                         |
| --------- | -------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `target`  | `T`            | ❌       | -       | -     | -          | Target message to merge updates into                |
| `updates` | `Partial<T>[]` | ❌       | -       | -     | -          | Variable number of partial message objects to merge |

---

#### `notify` (Method)

**Type:** `(value: ChatMessageStoreStateInterface<T>, lastValue: ChatMessageStoreStateInterface<T>) => void`

#### Parameters

| Name        | Type                                | Optional | Default | Since | Deprecated | Description                                        |
| ----------- | ----------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------- |
| `value`     | `ChatMessageStoreStateInterface<T>` | ❌       | -       | -     | -          | The new state value                                |
| `lastValue` | `ChatMessageStoreStateInterface<T>` | ✅       | -       | -     | -          | Optional previous state value, used for comparison |

---

##### `notify` (CallSignature)

**Type:** `void`

Notify all observers that the state has changed

This method will iterate through all registered observers and call their listeners.
If an observer has a selector, it will only notify when the selected state part changes.

**Example:**

```typescript
// Notify observers that the state has changed
observer.notify({ count: 2, name: 'New name' });

// Provide the previous state for comparison
const oldState = { count: 1, name: 'Old name' };
const newState = { count: 2, name: 'New name' };
observer.notify(newState, oldState);
```

#### Parameters

| Name        | Type                                | Optional | Default | Since | Deprecated | Description                                        |
| ----------- | ----------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------- |
| `value`     | `ChatMessageStoreStateInterface<T>` | ❌       | -       | -     | -          | The new state value                                |
| `lastValue` | `ChatMessageStoreStateInterface<T>` | ✅       | -       | -     | -          | Optional previous state value, used for comparison |

---

#### `observe` (Method)

**Type:** `(selectorOrListener: Selector<ChatMessageStoreStateInterface<T>, K> \| Listener<ChatMessageStoreStateInterface<T>>, listener: Listener<K>) => Object`

#### Parameters

| Name                 | Type                                                                                            | Optional | Default | Since | Deprecated | Description                                                    |
| -------------------- | ----------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `selectorOrListener` | `Selector<ChatMessageStoreStateInterface<T>, K> \| Listener<ChatMessageStoreStateInterface<T>>` | ❌       | -       | -     | -          | Selector function or listener that listens to the entire state |
| `listener`           | `Listener<K>`                                                                                   | ✅       | -       | -     | -          | Listener for the selected result when a selector is provided   |

---

##### `observe` (CallSignature)

**Type:** `Object`

Register an observer to listen for state changes

This method supports two calling methods:

1. Provide a listener that listens to the entire state
2. Provide a selector and a listener that listens to the selected part

**Returns:**

The function to unsubscribe, calling it removes the registered observer

**Example:** Listen to the entire state

```typescript
const unsubscribe = observer.observe((state) => {
  console.log('Full state:', state);
});

// Unsubscribe
unsubscribe();
```

**Example:** Listen to a specific part of the state

```typescript
const unsubscribe = observer.observe(
  (state) => state.user,
  (user) => console.log('User information changed:', user)
);
```

#### Parameters

| Name                 | Type                                                                                            | Optional | Default | Since | Deprecated | Description                                                    |
| -------------------- | ----------------------------------------------------------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `selectorOrListener` | `Selector<ChatMessageStoreStateInterface<T>, K> \| Listener<ChatMessageStoreStateInterface<T>>` | ❌       | -       | -     | -          | Selector function or listener that listens to the entire state |
| `listener`           | `Listener<K>`                                                                                   | ✅       | -       | -     | -          | Listener for the selected result when a selector is provided   |

---

#### `reset` (Method)

**Type:** `() => void`

---

##### `reset` (CallSignature)

**Type:** `void`

**Since:** `1.2.5`

Reset the state to the initial value

This method will use the maker provided in the constructor to create a new state object,
and then emit it as the current state, triggering a notification to all observers.

Use cases:

- When you need to clear all state
- When you need to restore to the initial state
- When the current state is polluted or invalid

**Example:**

```typescript
const store = new SliceStore(MyStateClass);
// ... some operations modified the state ...
store.reset(); // The state is reset to the initial value
```

---

#### `resetDraftMessages` (Method)

**Type:** `(messages: ChatMessage<T, unknown>[]) => void`

#### Parameters

| Name       | Type                        | Optional | Default | Since | Deprecated | Description                                         |
| ---------- | --------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `messages` | `ChatMessage<T, unknown>[]` | ✅       | -       | -     | -          | New draft message list, or omit to clear all drafts |

---

##### `resetDraftMessages` (CallSignature)

**Type:** `void`

Reset draft messages list

Replaces all draft messages with the provided list, or clears all
drafts if no messages are provided.

**Example:** Clear drafts

```typescript
store.resetDraftMessages();
```

**Example:** Replace with new drafts

```typescript
store.resetDraftMessages([draft1, draft2]);
```

#### Parameters

| Name       | Type                        | Optional | Default | Since | Deprecated | Description                                         |
| ---------- | --------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `messages` | `ChatMessage<T, unknown>[]` | ✅       | -       | -     | -          | New draft message list, or omit to clear all drafts |

---

#### `resetMessages` (Method)

**Type:** `(messages: ChatMessage<T, unknown>[]) => void`

#### Parameters

| Name       | Type                        | Optional | Default | Since | Deprecated | Description                          |
| ---------- | --------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------ |
| `messages` | `ChatMessage<T, unknown>[]` | ❌       | -       | -     | -          | New message list to set in the store |

---

##### `resetMessages` (CallSignature)

**Type:** `void`

Replace all messages in the store

Clears the current message list and replaces it with the provided
messages. Each message is processed through
`createMessage`
to ensure
proper defaults and structure.

**Example:**

```typescript
store.resetMessages([message1, message2, message3]);
```

#### Parameters

| Name       | Type                        | Optional | Default | Since | Deprecated | Description                          |
| ---------- | --------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------ |
| `messages` | `ChatMessage<T, unknown>[]` | ❌       | -       | -     | -          | New message list to set in the store |

---

#### `resetState` (Method)

**Type:** `() => void`

---

##### `resetState` (CallSignature)⚠️

**Type:** `void`

Reset the state of the store

**Returns:**

void

---

#### `setDefaultState` (Method)

**Type:** `(value: ChatMessageStoreStateInterface<T>) => this`

#### Parameters

| Name    | Type                                | Optional | Default | Since | Deprecated | Description                 |
| ------- | ----------------------------------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `value` | `ChatMessageStoreStateInterface<T>` | ❌       | -       | -     | -          | The new state object to set |

---

##### `setDefaultState` (CallSignature)⚠️

**Type:** `this`

Set the default state

Replace the entire state object, but will not trigger the observer notification.
This method is mainly used for initialization, not recommended for regular state updates.

**Returns:**

The current instance, supporting method chaining

**Example:**

```typescript
// Not recommended to use
store.setDefaultState(initialState);

// Recommended alternative
store.emit(initialState);
```

#### Parameters

| Name    | Type                                | Optional | Default | Since | Deprecated | Description                 |
| ------- | ----------------------------------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `value` | `ChatMessageStoreStateInterface<T>` | ❌       | -       | -     | -          | The new state object to set |

---

#### `shiftFirstDraftMessage` (Method)

**Type:** `() => null \| ChatMessage<T, unknown>`

---

##### `shiftFirstDraftMessage` (CallSignature)

**Type:** `null \| ChatMessage<T, unknown>`

Get and remove the first draft message based on mode

Similar to
`Array.shift()`
, but which message is removed depends on
the configured draft mode. This is the atomic operation that both
retrieves and removes the draft in a single transaction.

**Returns:**

Removed draft message, or
`null`
if no drafts exist

**Behavior examples:**

STACK mode (LIFO):

- Before:
  `[A, B, C]`

- After:
  `[A, B]`

- Returns: C (newest added)

QUEUE mode (FIFO):

- Before:
  `[A, B, C]`

- After:
  `[B, C]`

- Returns: A (oldest added)

**Mode differences:**

- STACK: Removes and returns newest message (last in, first out)
- QUEUE: Removes and returns oldest message (first in, first out)
- Ensures "get" and "delete" operate on the same message (critical for bug prevention)

**Example:** With QUEUE mode

```typescript
store.addDraftMessage({ content: 'A' });
store.addDraftMessage({ content: 'B' });

const draft = store.shiftFirstDraftMessage();
console.log(draft.content); // "A"
// Remaining drafts: [B]
```

**Example:** With STACK mode

```typescript
class MyStore extends ChatMessageStore {
  protected draftMode = DraftMode.STACK;
}

const store = new MyStore();
store.addDraftMessage({ content: 'A' });
store.addDraftMessage({ content: 'B' });

const draft = store.shiftFirstDraftMessage();
console.log(draft.content); // "B"
// Remaining drafts: [A]
```

---

#### `sliceDraftMessages` (Method)

**Type:** `() => ChatMessage<T, unknown>[]`

---

##### `sliceDraftMessages` (CallSignature)

**Type:** `ChatMessage<T, unknown>[]`

Remove the first draft message based on configured mode

Returns the remaining draft messages after removing the first one.
Which message is "first" depends on the draft mode.

**Returns:**

Array of remaining draft messages after removal

**Mode behavior:**

- STACK mode (LIFO):
  `[A, B, C]`
  →
  `[A, B]`
  (removes last: C)
- QUEUE mode (FIFO):
  `[A, B, C]`
  →
  `[B, C]`
  (removes first: A)

**Example:**

```typescript
// With QUEUE mode
store.addDraftMessage({ content: 'A' });
store.addDraftMessage({ content: 'B' });
const remaining = store.sliceDraftMessages(); // [B]
```

---

#### `startStreaming` (Method)

**Type:** `() => void`

---

##### `startStreaming` (CallSignature)

**Type:** `void`

Start streaming mode

Sets the store state to indicate that streaming is active.
Emits state change for reactive UI updates.

---

#### `stopStreaming` (Method)

**Type:** `() => void`

---

##### `stopStreaming` (CallSignature)

**Type:** `void`

Stop streaming mode

Sets the store state to indicate that streaming has ended.
Emits state change for reactive UI updates.

---

#### `toJson` (Method)

**Type:** `() => Record<string, unknown>[]`

---

##### `toJson` (CallSignature)

**Type:** `Record<string, unknown>[]`

Convert all messages to JSON-serializable format

Serializes all messages in the store to plain JavaScript objects
by parsing and stringifying. This removes methods and prototypes.

**Returns:**

Array of JSON-serializable message objects

**Example:**

```typescript
const jsonData = store.toJson();
localStorage.setItem('messages', JSON.stringify(jsonData));
```

---

#### `updateDraftMessage` (Method)

**Type:** `(messageId: string, updates: Partial<ChatMessage<T, unknown>>) => undefined \| ChatMessage<T, unknown>`

#### Parameters

| Name        | Type                               | Optional | Default | Since | Deprecated | Description                                      |
| ----------- | ---------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `messageId` | `string`                           | ❌       | -       | -     | -          | Unique identifier of the draft message to update |
| `updates`   | `Partial<ChatMessage<T, unknown>>` | ❌       | -       | -     | -          | Partial message object with fields to update     |

---

##### `updateDraftMessage` (CallSignature)

**Type:** `undefined \| ChatMessage<T, unknown>`

Update a draft message by ID

Applies partial updates to a draft message identified by ID.
Uses a single traversal to find and update the message efficiently.

**Returns:**

Updated message or
`undefined`
if message not found

**Example:**

```typescript
const updated = store.updateDraftMessage('draft-123', {
  content: 'Updated content',
  metadata: { edited: true }
});
```

#### Parameters

| Name        | Type                               | Optional | Default | Since | Deprecated | Description                                      |
| ----------- | ---------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `messageId` | `string`                           | ❌       | -       | -     | -          | Unique identifier of the draft message to update |
| `updates`   | `Partial<ChatMessage<T, unknown>>` | ❌       | -       | -     | -          | Partial message object with fields to update     |

---

#### `updateMessage` (Method)

**Type:** `(id: string, updates: Partial<M>[]) => undefined \| M`

#### Parameters

| Name      | Type           | Optional | Default | Since | Deprecated | Description                                         |
| --------- | -------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `id`      | `string`       | ❌       | -       | -     | -          | Unique identifier of the message to update          |
| `updates` | `Partial<M>[]` | ❌       | -       | -     | -          | Variable number of partial message objects to apply |

---

##### `updateMessage` (CallSignature)

**Type:** `undefined \| M`

Update an existing message in the store

Applies multiple partial updates to a message identified by ID.
Uses a single traversal to find and update the message efficiently.
Returns
`undefined`
if no message with the given ID exists.

**Returns:**

Updated message or
`undefined`
if message not found

**Example:**

```typescript
const updated = store.updateMessage('msg-123', {
  content: 'New content',
  status: MessageStatus.SENT
});
```

#### Parameters

| Name      | Type           | Optional | Default | Since | Deprecated | Description                                         |
| --------- | -------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `id`      | `string`       | ❌       | -       | -     | -          | Unique identifier of the message to update          |
| `updates` | `Partial<M>[]` | ❌       | -       | -     | -          | Variable number of partial message objects to apply |

---

### `DraftModeType` (TypeAlias)

**Type:** `unknown`

Type representing valid draft modes

---

### `DraftMode` (Variable)

**Type:** `Readonly<Object>`

**Default:** `...`

Draft message processing modes

Controls the order of adding and removing draft messages, which affects
the message sending sequence. Choose between stack (LIFO) and queue (FIFO)
behaviors based on application requirements.

---
