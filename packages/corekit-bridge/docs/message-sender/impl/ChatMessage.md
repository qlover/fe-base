## `src/core/message-sender/impl/ChatMessage` (Module)

**Type:** `module src/core/message-sender/impl/ChatMessage`

---

### `ChatMessage` (Class)

**Type:** `class ChatMessage<T, R>`

Chat message implementation class

Represents a single message in a chat conversation, extending the base
message store interface with chat-specific properties like role, files,
and async state management.

Core features:

- Role-based message typing (user/system/assistant)
- Async state tracking (loading, result, error)
- Timing information (start/end timestamps)
- File attachment support
- Placeholder and status management

**Example:** Basic user message

```typescript
const userMessage = new ChatMessage({
  id: 'msg-001',
  content: 'Hello, how are you?',
  role: ChatMessageRole.USER
});
```

**Example:** Assistant message with loading state

```typescript
const assistantMessage = new ChatMessage({
  id: 'msg-002',
  content: 'I am doing well, thank you!',
  role: ChatMessageRole.ASSISTANT,
  loading: false,
  result: { tokens: 10, model: 'gpt-4' }
});
```

**Example:** Message with file attachments

```typescript
const messageWithFiles = new ChatMessage({
  content: 'Here are the documents',
  files: [file1, file2],
  role: ChatMessageRole.USER
});
```

---

#### `new ChatMessage` (Constructor)

**Type:** `(options: Partial<ChatMessage<T, unknown>>) => ChatMessage<T, R>`

#### Parameters

| Name      | Type                               | Optional | Default | Since | Deprecated | Description                                                   |
| --------- | ---------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------------- |
| `options` | `Partial<ChatMessage<T, unknown>>` | ✅       | -       | -     | -          | Optional partial message properties to initialize the message |

---

#### `content` (Property)

**Type:** `T`

Message content

The main payload of the message. Type is generic to support
various content formats (string, rich text, structured data).

---

#### `endTime` (Property)

**Type:** `number`

**Default:** `0`

Message completion timestamp

Unix timestamp (milliseconds) when the message processing completed.
A value of
`0`
indicates the message is still in progress.

---

#### `error` (Property)

**Type:** `unknown`

**Default:** `null`

Error information if message processing failed

Contains error details if the message failed to send or process.

`null`
indicates no error occurred.

---

#### `files` (Property)

**Type:** `File[]`

File attachments associated with the message

Array of
`File`
objects attached to the message, such as images,
documents, or other media files.

---

#### `id` (Property)

**Type:** `string`

Unique message identifier

Optional during creation, typically assigned by the server
or generated client-side for tracking purposes.

---

#### `loading` (Property)

**Type:** `boolean`

**Default:** `false`

Whether the message is currently loading

Indicates if the message is being processed, sent, or waiting
for a response. Useful for showing loading indicators in the UI.

---

#### `placeholder` (Property)

**Type:** `string`

Placeholder text for the message

Optional placeholder text to display while the actual content
is loading or being generated. Commonly used for streaming responses.

---

#### `result` (Property)

**Type:** `null \| R`

**Default:** `null`

Result data from message processing

Contains the result of message processing, such as API response
metadata, token counts, or other computation results.

---

#### `role` (Property)

**Type:** `ChatMessageRoleType`

**Default:** `ChatMessageRole.USER`

Role of the message sender

Identifies who created the message: user, system, or assistant.
Used for message rendering, styling, and conversation flow control.

---

#### `startTime` (Property)

**Type:** `number`

Message creation timestamp

Unix timestamp (milliseconds) when the message was created.
Used for message ordering and duration calculations.

---

#### `status` (Property)

**Type:** `MessageStatusType`

Current status of the message

Indicates the processing state of the message (e.g., draft, sending,
sent, failed). The specific statuses are defined by
`MessageStatusType`
.

---

### `ChatMessageRoleType` (TypeAlias)

**Type:** `type ChatMessageRoleType`

Type representing valid chat message roles

---

### `ChatMessageRole` (Variable)

**Type:** `Object`

**Default:** `{}`

Chat message role constants

Defines the three standard roles in a chat conversation:

- USER: Messages sent by the end user
- SYSTEM: System-level messages (instructions, metadata)
- ASSISTANT: Messages from the AI assistant or bot

---

#### `ASSISTANT` (Property)

**Type:** `"assistant"`

**Default:** `'assistant'`

Assistant role for messages from AI assistant or bot

---

#### `SYSTEM` (Property)

**Type:** `"system"`

**Default:** `'system'`

System role for system-level messages and instructions

---

#### `USER` (Property)

**Type:** `"user"`

**Default:** `'user'`

User role for messages sent by the end user

---
