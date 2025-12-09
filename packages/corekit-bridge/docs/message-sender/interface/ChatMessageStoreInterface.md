## `src/core/message-sender/interface/ChatMessageStoreInterface` (Module)

**Type:** `module src/core/message-sender/interface/ChatMessageStoreInterface`

---

### `ChatMessageStoreInterface` (Interface)

**Type:** `interface ChatMessageStoreInterface<T>`

Chat message store interface for managing chat message state and operations

This interface extends the base message store with chat-specific functionality,
including draft message management, message state tracking, and send control.
It provides comprehensive methods for handling the complete lifecycle of chat messages.

Core features:

- Draft message CRUD operations
- Message state management
- Send readiness validation
- Message queue handling

**Example:** Basic usage

```typescript
const store: ChatMessageStoreInterface<string> = createStore();

// Add draft message
store.addDraftMessage({ content: 'Hello' });

// Get first draft
const draft = store.getFirstDraftMessage();

// Update draft
store.updateDraftMessage(draft.id, { content: 'Hello, world!' });
```

---

#### `stateFactory` (Property)

**Type:** `Object`

() => T, factory function to create the initial state

---

#### `state` (Accessor)

**Type:** `accessor state`

---

#### `addDraftMessage` (Method)

**Type:** `(message: Partial<ChatMessage<T, unknown>>) => void`

#### Parameters

| Name      | Type                               | Optional | Default | Since | Deprecated | Description                                              |
| --------- | ---------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------- |
| `message` | `Partial<ChatMessage<T, unknown>>` | ❌       | -       | -     | -          | Partial message object containing at minimum the content |

---

##### `addDraftMessage` (CallSignature)

**Type:** `void`

Add a new draft message

Creates and adds a new draft message to the store. The message will
be stored as a draft and will not be sent until explicitly requested.

**Example:**

```typescript
store.addDraftMessage({
  content: 'Hello, world!',
  metadata: { priority: 'high' }
});
```

#### Parameters

| Name      | Type                               | Optional | Default | Since | Deprecated | Description                                              |
| --------- | ---------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------- |
| `message` | `Partial<ChatMessage<T, unknown>>` | ❌       | -       | -     | -          | Partial message object containing at minimum the content |

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

Creates a new message from the partial specification and adds it
to the store. The message is typically appended to the message list.

**Returns:**

Created and added message instance

**Example:**

```typescript
const newMessage = store.addMessage({
  content: 'Hello, world!',
  sender: 'user-123',
  timestamp: Date.now()
});
console.log('Added message:', newMessage.id);
```

#### Parameters

| Name      | Type         | Optional | Default | Since | Deprecated | Description                   |
| --------- | ------------ | -------- | ------- | ----- | ---------- | ----------------------------- |
| `message` | `Partial<M>` | ❌       | -       | -     | -          | Partial message specification |

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

**Type:** `(message: Partial<T>) => T`

#### Parameters

| Name      | Type         | Optional | Default | Since | Deprecated | Description                   |
| --------- | ------------ | -------- | ------- | ----- | ---------- | ----------------------------- |
| `message` | `Partial<T>` | ❌       | -       | -     | -          | Partial message specification |

---

##### `createMessage` (CallSignature)

**Type:** `T`

Create a new message instance

Constructs a new message object from a partial message specification.
Implementations should provide default values for required fields
and validate the message structure.

**Returns:**

Complete message instance

**Example:**

```typescript
const message = store.createMessage({
  content: 'Hello',
  sender: 'user-123'
});
console.log(message.id); // Generated ID
```

#### Parameters

| Name      | Type         | Optional | Default | Since | Deprecated | Description                   |
| --------- | ------------ | -------- | ------- | ----- | ---------- | ----------------------------- |
| `message` | `Partial<T>` | ❌       | -       | -     | -          | Partial message specification |

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

Delete a draft message

Removes a draft message from the store by its ID. This operation
is permanent and cannot be undone.

**Example:**

```typescript
// Delete specific draft
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

Permanently removes a message from the store by its ID.
This operation cannot be undone. Does nothing if the message
doesn't exist.

**Example:**

```typescript
// Delete a message
store.deleteMessage('msg-123');

// Verify deletion
const deleted = store.getMessageById('msg-123');
console.log(deleted === undefined); // true
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

Get draft message by ID

Retrieves a specific draft message from the draft message list.
Returns
`null`
if no draft with the given ID exists.

**Returns:**

Draft message or
`null`
if not found

**Example:**

```typescript
const draft = store.getDarftMessageById('draft-123');
if (draft) {
  console.log('Draft content:', draft.content);
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

Returns the complete list of draft messages in the store.
Draft messages are unsent messages being composed by the user.

**Returns:**

Array of draft messages

**Example:**

```typescript
const drafts = store.getDraftMessages();
console.log(`You have ${drafts.length} draft(s)`);
```

---

#### `getFirstDraftMessage` (Method)

**Type:** `() => null \| ChatMessage<T, unknown>`

---

##### `getFirstDraftMessage` (CallSignature)

**Type:** `null \| ChatMessage<T, unknown>`

Get the first draft message added to the queue

Returns the first message added to the draft messages list, not necessarily
the first element in the array. This follows a FIFO (First-In-First-Out) pattern.

Important:

- Retrieves from
  `draftMessages`
  list (unsent drafts)
- NOT from
  `messages`
  list (sent message history)

**Returns:**

First queued draft message or
`null`
if none exists

**Example:**

```typescript
const firstDraft = store.getFirstDraftMessage();
if (firstDraft) {
  console.log('Oldest draft:', firstDraft.content);
}
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

Retrieves a specific message from the store by ID.
Returns
`undefined`
if no message with the given ID exists.

**Returns:**

Message object or
`undefined`
if not found

**Example:**

```typescript
const message = store.getMessageById('msg-123');
if (message) {
  console.log('Found:', message.content);
} else {
  console.log('Message not found');
}
```

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

Retrieves a message at the specified zero-based index position.
Returns
`undefined`
if the index is out of bounds.

**Returns:**

Message at the index or
`undefined`
if out of bounds

**Example:**

```typescript
// Get first message
const first = store.getMessageByIndex(0);

// Get last message
const messages = store.getMessages();
const last = store.getMessageByIndex(messages.length - 1);
```

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

Returns the zero-based index of a message in the message array.
Returns
`-1`
if the message doesn't exist in the store.

**Returns:**

Zero-based index of the message, or
`-1`
if not found

**Example:**

```typescript
const index = store.getMessageIndex('msg-123');
if (index !== -1) {
  console.log(`Message is at position ${index + 1}`);
} else {
  console.log('Message not found');
}
```

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

Returns the complete list of messages in the store, typically
ordered chronologically from oldest to newest.

**Returns:**

Array of all messages in the store

**Example:**

```typescript
const messages = store.getMessages();
console.log(`Total messages: ${messages.length}`);
messages.forEach((msg) => console.log(msg.content));
```

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

Determines which message should be sent next, validating readiness
and returning the appropriate message for sending. If no message
is provided, retrieves from the draft queue.

**Returns:**

Message ready to send or
`null`
if none available

**Example:** Get next message to send

```typescript
const readyMessage = store.getReadySendMessage();
if (readyMessage) {
  await gateway.send(readyMessage);
}
```

**Example:** Validate specific message

```typescript
const message = createMessage('Hello');
const ready = store.getReadySendMessage(message);
if (ready) {
  console.log('Message is valid and ready');
}
```

#### Parameters

| Name      | Type                      | Optional | Default | Since | Deprecated | Description                                       |
| --------- | ------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `message` | `ChatMessage<T, unknown>` | ✅       | -       | -     | -          | Optional specific message to validate for sending |

---

#### `isMessage` (Method)

**Type:** `(message: unknown) => callsignature isMessage<T>`

#### Parameters

| Name      | Type      | Optional | Default | Since | Deprecated | Description    |
| --------- | --------- | -------- | ------- | ----- | ---------- | -------------- |
| `message` | `unknown` | ❌       | -       | -     | -          | Value to check |

---

##### `isMessage` (CallSignature)

**Type:** `callsignature isMessage<T>`

Type guard to check if an unknown value is a message

Validates whether an unknown value conforms to the message type
managed by this store. Useful for runtime type checking and validation.

**Returns:**

`true`
if value is a valid message,
`false`
otherwise

**Example:**

```typescript
function processUnknown(value: unknown) {
  if (store.isMessage(value)) {
    // TypeScript knows value is a message here
    console.log('Message content:', value.content);
  } else {
    console.log('Not a valid message');
  }
}
```

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

Merge multiple updates into a target message

Combines multiple partial message objects into the target message,
applying updates in order from left to right. Later updates override
earlier ones for the same fields.

**Returns:**

Merged message with all updates applied

**Example:**

```typescript
const message = store.createMessage({ content: 'Hello' });
const merged = store.mergeMessage(
  message,
  { metadata: { edited: true } },
  { timestamp: Date.now() }
);
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

| Name       | Type                        | Optional | Default | Since | Deprecated | Description                             |
| ---------- | --------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `messages` | `ChatMessage<T, unknown>[]` | ✅       | -       | -     | -          | Optional replacement draft message list |

---

##### `resetDraftMessages` (CallSignature)

**Type:** `void`

Clear all draft messages

Removes all draft messages from the store, or replaces them with
the provided message list if specified.

**Example:** Clear all drafts

```typescript
store.resetDraftMessages();
```

**Example:** Replace with new drafts

```typescript
store.resetDraftMessages([newDraft1, newDraft2]);
```

#### Parameters

| Name       | Type                        | Optional | Default | Since | Deprecated | Description                             |
| ---------- | --------------------------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `messages` | `ChatMessage<T, unknown>[]` | ✅       | -       | -     | -          | Optional replacement draft message list |

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
messages. This is useful for bulk updates or resetting the store state.

**Example:** Reset with new messages

```typescript
const newMessages = [message1, message2, message3];
store.resetMessages(newMessages);
```

**Example:** Clear all messages

```typescript
store.resetMessages([]);
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

Get and remove the first draft message

Returns the first message from the draft queue and removes it from
the draft message list. Useful for processing drafts one at a time.

**Returns:**

First queued draft message or
`null`
if none exists

**Example:**

```typescript
// Process drafts in order
while (true) {
  const draft = store.shiftFirstDraftMessage();
  if (!draft) break;
  await sendMessage(draft);
}
```

---

#### `startStreaming` (Method)

**Type:** `() => void`

---

##### `startStreaming` (CallSignature)

**Type:** `void`

Start streaming mode

Sets the store state to indicate that streaming is active.
This is typically called when beginning to receive a streamed
message response.

**Example:**

```typescript
// Start streaming
store.startStreaming();

// Receive chunks...
onChunk((chunk) => {
  store.updateMessage(messageId, { content: chunk });
});

// Stop when complete
store.stopStreaming();
```

---

#### `stopStreaming` (Method)

**Type:** `() => void`

---

##### `stopStreaming` (CallSignature)

**Type:** `void`

Stop streaming mode

Sets the store state to indicate that streaming has ended.
This is typically called when a streamed message response is
complete or cancelled.

**Example:**

```typescript
try {
  store.startStreaming();
  await receiveStream();
} finally {
  store.stopStreaming(); // Always stop, even on error
}
```

---

#### `toJson` (Method)

**Type:** `() => Record<string, unknown>[]`

---

##### `toJson` (CallSignature)

**Type:** `Record<string, unknown>[]`

Convert all messages to JSON-serializable format

Serializes all messages in the store to plain JavaScript objects
suitable for JSON serialization. Useful for persistence, logging,
or data export.

**Returns:**

Array of JSON-serializable message objects

**Example:**

```typescript
const jsonData = store.toJson();
const jsonString = JSON.stringify(jsonData, null, 2);
localStorage.setItem('messages', jsonString);
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

Update an existing draft message

Modifies fields of an existing draft message. Only provided fields
will be updated; other fields remain unchanged.

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
Updates are applied in order from left to right. Returns
`undefined`

if no message with the given ID exists.

**Returns:**

Updated message or
`undefined`
if message not found

**Example:** Single update

```typescript
const updated = store.updateMessage('msg-123', {
  content: 'Updated content'
});
```

**Example:** Multiple updates

```typescript
store.updateMessage(
  'msg-123',
  { content: 'New content' },
  { metadata: { edited: true } },
  { timestamp: Date.now() }
);
```

#### Parameters

| Name      | Type           | Optional | Default | Since | Deprecated | Description                                         |
| --------- | -------------- | -------- | ------- | ----- | ---------- | --------------------------------------------------- |
| `id`      | `string`       | ❌       | -       | -     | -          | Unique identifier of the message to update          |
| `updates` | `Partial<M>[]` | ❌       | -       | -     | -          | Variable number of partial message objects to apply |

---

### `ChatMessageStoreStateInterface` (Interface)

**Type:** `interface ChatMessageStoreStateInterface<T>`

State interface for chat message store

Extends the base message state with chat-specific features like
draft messages and send control.

---

#### `disabledSend` (Property)

**Type:** `boolean`

Whether sending messages is disabled

Controls whether the user can send messages. Can be used to
prevent sending during validation, rate limiting, or other
application-specific conditions.

---

#### `draftMessages` (Property)

**Type:** `ChatMessage<T, unknown>[]`

Draft message list

Draft messages are unsent messages being composed by the user.
They are persisted separately from sent messages and can be edited
before sending.

Business rules:

- Draft messages are not sent to the server
- Drafts persist across page reloads
- Only one draft per user session typically

---

#### `messages` (Property)

**Type:** `ChatMessage<T, unknown>[]`

Historical message list

Contains all messages in the store, including sent messages,
received responses, and system messages. Messages are typically
ordered chronologically.

---

#### `streaming` (Property)

**Type:** `boolean`

**Default:** `false`

Whether streaming is currently active

Indicates if a message is currently being received in streaming mode.
Used for UI state management and preventing concurrent operations.

---
