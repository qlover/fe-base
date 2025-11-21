## `src/core/message-sender/impl/MessageStore` (Module)

**Type:** `unknown`

---

### `MessagesStore` (Class)

**Type:** `unknown`

Messages store implementation for managing message collections

Provides a complete implementation of message store functionality including
CRUD operations, state management, streaming control, and prototype preservation.
This class handles all message lifecycle operations and state synchronization.

Core features:

- Prototype-preserving message merging for class instances
- Automatic ID generation for new messages
- State emission for reactive UI updates
- Message validation and type checking
- Streaming state management

**Example:** Basic usage

```typescript
const store = new MessagesStore();

// Add messages
const message = store.addMessage({ content: 'Hello' });

// Update messages
store.updateMessage(message.id, { content: 'Hello, world!' });

// Get all messages
const messages = store.getMessages();
```

**Example:** With streaming

```typescript
store.startStreaming();
// ... process stream chunks
store.stopStreaming();
```

---

#### `new MessagesStore` (Constructor)

**Type:** `(stateFactory: Object) => MessagesStore<MessageType, State>`

#### Parameters

| Name           | Type     | Optional | Default | Since | Deprecated | Description                                           |
| -------------- | -------- | -------- | ------- | ----- | ---------- | ----------------------------------------------------- |
| `stateFactory` | `Object` | ❌       | -       | -     | -          | () => T, factory function to create the initial state |

---

#### `stateFactory` (Property)

**Type:** `Object`

() => T, factory function to create the initial state

---

#### `state` (Accessor)

**Type:** `unknown`

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

**Type:** `(source: Partial<State>) => State`

#### Parameters

| Name     | Type             | Optional | Default | Since | Deprecated | Description                                             |
| -------- | ---------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------- |
| `source` | `Partial<State>` | ✅       | -       | -     | -          | Partial<T> - properties to override in the cloned state |

---

##### `cloneState` (CallSignature)

**Type:** `State`

**Since:** `1.3.1`

Clone the state of the store

**Returns:**

T - the new cloned state

#### Parameters

| Name     | Type             | Optional | Default | Since | Deprecated | Description                                             |
| -------- | ---------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------- |
| `source` | `Partial<State>` | ✅       | -       | -     | -          | Partial<T> - properties to override in the cloned state |

---

#### `createMessage` (Method)

**Type:** `(message: Partial<T>) => T`

#### Parameters

| Name      | Type         | Optional | Default | Since | Deprecated | Description                   |
| --------- | ------------ | -------- | ------- | ----- | ---------- | ----------------------------- |
| `message` | `Partial<T>` | ✅       | `{}`    | -     | -          | Partial message specification |

---

##### `createMessage` (CallSignature)

**Type:** `T`

Create a new message instance with defaults

Constructs a complete message object from partial data, applying
default values for required fields like ID, status, and timestamps.

**Returns:**

Complete message instance with defaults applied

**Example:**

```typescript
const message = store.createMessage({
  content: 'Hello'
});
// Full message with generated ID, status=DRAFT, etc.
```

#### Parameters

| Name      | Type         | Optional | Default | Since | Deprecated | Description                   |
| --------- | ------------ | -------- | ------- | ----- | ---------- | ----------------------------- |
| `message` | `Partial<T>` | ✅       | `{}`    | -     | -          | Partial message specification |

---

#### `defaultId` (Method)

**Type:** `(message: Partial<MessageType>) => string`

#### Parameters

| Name      | Type                   | Optional | Default | Since | Deprecated | Description            |
| --------- | ---------------------- | -------- | ------- | ----- | ---------- | ---------------------- |
| `message` | `Partial<MessageType>` | ❌       | -       | -     | -          | Partial message object |

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

| Name      | Type                   | Optional | Default | Since | Deprecated | Description            |
| --------- | ---------------------- | -------- | ------- | ----- | ---------- | ---------------------- |
| `message` | `Partial<MessageType>` | ❌       | -       | -     | -          | Partial message object |

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

**Type:** `(state: State) => void`

#### Parameters

| Name    | Type    | Optional | Default | Since | Deprecated | Description          |
| ------- | ------- | -------- | ------- | ----- | ---------- | -------------------- |
| `state` | `State` | ❌       | -       | -     | -          | The new state object |

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

| Name    | Type    | Optional | Default | Since | Deprecated | Description          |
| ------- | ------- | -------- | ------- | ----- | ---------- | -------------------- |
| `state` | `State` | ❌       | -       | -     | -          | The new state object |

---

#### `getMessageById` (Method)

**Type:** `(id: string) => undefined \| MessageType`

#### Parameters

| Name | Type     | Optional | Default | Since | Deprecated | Description                      |
| ---- | -------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `id` | `string` | ❌       | -       | -     | -          | Unique identifier of the message |

---

##### `getMessageById` (CallSignature)

**Type:** `undefined \| MessageType`

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

**Type:** `(index: number) => undefined \| MessageType`

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description               |
| ------- | -------- | -------- | ------- | ----- | ---------- | ------------------------- |
| `index` | `number` | ❌       | -       | -     | -          | Zero-based index position |

---

##### `getMessageByIndex` (CallSignature)

**Type:** `undefined \| MessageType`

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

**Type:** `() => MessageType[]`

---

##### `getMessages` (CallSignature)

**Type:** `MessageType[]`

Get all messages from the store

**Returns:**

Array of all messages in the store

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

Type guard to check if an unknown value is a message

Validates whether an unknown value is a non-null object,
which is the basic requirement for message objects.

**Returns:**

`true`
if value is a valid message object,
`false`
otherwise

**Example:**

```typescript
if (store.isMessage(value)) {
  // TypeScript knows value is a message here
  console.log(value.content);
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

**Type:** `(value: State, lastValue: State) => void`

#### Parameters

| Name        | Type    | Optional | Default | Since | Deprecated | Description                                        |
| ----------- | ------- | -------- | ------- | ----- | ---------- | -------------------------------------------------- |
| `value`     | `State` | ❌       | -       | -     | -          | The new state value                                |
| `lastValue` | `State` | ✅       | -       | -     | -          | Optional previous state value, used for comparison |

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

| Name        | Type    | Optional | Default | Since | Deprecated | Description                                        |
| ----------- | ------- | -------- | ------- | ----- | ---------- | -------------------------------------------------- |
| `value`     | `State` | ❌       | -       | -     | -          | The new state value                                |
| `lastValue` | `State` | ✅       | -       | -     | -          | Optional previous state value, used for comparison |

---

#### `observe` (Method)

**Type:** `(selectorOrListener: Selector<State, K> \| Listener<State>, listener: Listener<K>) => Object`

#### Parameters

| Name                 | Type                                    | Optional | Default | Since | Deprecated | Description                                                    |
| -------------------- | --------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `selectorOrListener` | `Selector<State, K> \| Listener<State>` | ❌       | -       | -     | -          | Selector function or listener that listens to the entire state |
| `listener`           | `Listener<K>`                           | ✅       | -       | -     | -          | Listener for the selected result when a selector is provided   |

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

| Name                 | Type                                    | Optional | Default | Since | Deprecated | Description                                                    |
| -------------------- | --------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `selectorOrListener` | `Selector<State, K> \| Listener<State>` | ❌       | -       | -     | -          | Selector function or listener that listens to the entire state |
| `listener`           | `Listener<K>`                           | ✅       | -       | -     | -          | Listener for the selected result when a selector is provided   |

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

#### `resetMessages` (Method)

**Type:** `(messages: MessageType[]) => void`

#### Parameters

| Name       | Type            | Optional | Default | Since | Deprecated | Description                          |
| ---------- | --------------- | -------- | ------- | ----- | ---------- | ------------------------------------ |
| `messages` | `MessageType[]` | ❌       | -       | -     | -          | New message list to set in the store |

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

| Name       | Type            | Optional | Default | Since | Deprecated | Description                          |
| ---------- | --------------- | -------- | ------- | ----- | ---------- | ------------------------------------ |
| `messages` | `MessageType[]` | ❌       | -       | -     | -          | New message list to set in the store |

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

**Type:** `(value: State) => this`

#### Parameters

| Name    | Type    | Optional | Default | Since | Deprecated | Description                 |
| ------- | ------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `value` | `State` | ❌       | -       | -     | -          | The new state object to set |

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

| Name    | Type    | Optional | Default | Since | Deprecated | Description                 |
| ------- | ------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `value` | `State` | ❌       | -       | -     | -          | The new state object to set |

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

### `MessageStoreMsg` (Interface)

**Type:** `unknown`

Message store message interface

Extends the base message interface with store-specific properties
for content, placeholders, attachments, and status tracking.

---

#### `content` (Property)

**Type:** `T`

Message content

The main payload of the message. Type is generic to support
various content formats (text, rich content, structured data).

---

#### `endTime` (Property)

**Type:** `number`

Timestamp when the async operation completed

Will be 0 if operation hasn't completed
Used with startTime to calculate total operation duration

**Example:**

```ts
`Date.now()`;
```

---

#### `error` (Property)

**Type:** `unknown`

Error information if the async operation failed

Will be null if:

- Operation hasn't completed
- Operation completed successfully

---

#### `files` (Property)

**Type:** `File[]`

File attachments

Optional file attachments associated with the message.
Support for file handling may be added in future versions.

---

#### `id` (Property)

**Type:** `string`

Unique message identifier

Optional during message creation, assigned by the server upon successful
transmission. Used for message tracking, updates, and deletion operations.

**Example:**

```ts
`"msg-123e4567-e89b-12d3-a456-426614174000"`;
```

---

#### `loading` (Property)

**Type:** `boolean`

**Default:** `ts
false
`

Whether the async operation is currently in progress

---

#### `placeholder` (Property)

**Type:** `string`

Placeholder text before content input

Displayed when the message content is empty or loading,
providing context to the user about what to expect.

---

#### `result` (Property)

**Type:** `null \| R`

The result of the async operation if successful

Will be null if:

- Operation hasn't completed
- Operation failed
- Operation completed but returned no data

---

#### `startTime` (Property)

**Type:** `number`

Timestamp when the async operation started

Used for:

- Performance tracking
- Operation timeout detection
- Loading time calculations

**Example:**

```ts
`Date.now()`;
```

---

#### `status` (Property)

**Type:** `MessageStatusType`

Current message status

Tracks the lifecycle state of the message from draft to completion.

---

### `MessageStatusType` (TypeAlias)

**Type:** `unknown`

Type representing valid message statuses

---

### `MessageStatus` (Variable)

**Type:** `Readonly<Object>`

**Default:** `...`

Message status constants

Defines the lifecycle states of a message from draft to completion.
These statuses help track message progress and display appropriate UI states.

---
