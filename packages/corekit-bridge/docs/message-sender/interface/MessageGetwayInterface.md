## `src/core/message-sender/interface/MessageGetwayInterface` (Module)

**Type:** `module src/core/message-sender/interface/MessageGetwayInterface`

---

### `GatewayOptions` (Interface)

**Type:** `interface GatewayOptions<M, P>`

Configuration options for message gateway operations

Extends message stream events with additional configuration for
controlling message transmission behavior, including streaming mode,
timeout settings, abort control, and custom parameters.

**Example:** Basic usage

```typescript
const options: GatewayOptions<ChatMessage> = {
  stream: true,
  timeout: 30000,
  onChunk: (chunk) => console.log(chunk)
};
```

**Example:** With custom parameters

```typescript
interface CustomParams {
  temperature: number;
  maxTokens: number;
}

const options: GatewayOptions<ChatMessage, CustomParams> = {
  stream: true,
  params: {
    temperature: 0.7,
    maxTokens: 2000
  }
};
```

---

#### `abortTimeout` (Property)

**Type:** `number`

**Default:** `undefined`

Timeout duration in milliseconds

When set, the operation will be automatically aborted after this duration
Helps prevent hanging requests and manages resource cleanup

**Example:**

```ts
`5000`; // 5 seconds timeout
```

**Example:**

```ts
`30000`; // 30 seconds timeout
```

---

#### `id` (Property)

**Type:** `string`

Unique identifier for the abort operation

Used to identify and manage specific abort controller instances
If not provided, will use
`requestId`
or auto-generated value

**Example:**

```ts
`"user-profile-fetch"`;
```

---

#### `params` (Property)

**Type:** `P`

Additional request parameters

Custom parameters to be sent with the message request.
The type can be customized using the generic parameter
`P`
.

**Example:**

```typescript
const options = {
  params: {
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000
  }
};
```

---

#### `requestId` (Property)

**Type:** `string`

Request unique identifier

Alternative to
`id`
, used for identifying specific requests
Useful when tracking requests across different systems

**Example:**

```ts
`"req_123456789"`;
```

---

#### `signal` (Property)

**Type:** `AbortSignal`

AbortSignal instance for request cancellation

If not provided, the plugin will create and manage one automatically
Can be provided externally to integrate with existing abort mechanisms

**See:**

AbortSignal MDN

---

#### `stream` (Property)

**Type:** `boolean`

**Default:** `false`

Whether to use streaming mode

Controls the message transmission mode:

- `true`
  : Streaming mode - content is progressively output (
  `onChunk`
  will be called)
- `false`
  or
  `undefined`
  : Normal mode - complete content returned at once

Important:

- Streaming provides real-time feedback for long responses
- Both modes support abort control (signal) when options are provided
- Streaming is recommended for AI-generated content or large responses

**Example:** Enable streaming

```typescript
const options = {
  stream: true,
  onChunk: (chunk) => updateUI(chunk)
};
```

---

#### `timeout` (Property)

**Type:** `number`

Request timeout in milliseconds

Maximum time to wait for the request to complete. If the request
takes longer than this duration, it will be aborted.

**Example:**

```typescript
const options = {
  timeout: 30000 // 30 seconds
};
```

---

#### `onAborted` (Method)

**Type:** `(message: M) => void`

#### Parameters

| Name                                     | Type | Optional | Default | Since | Deprecated | Description                                |
| ---------------------------------------- | ---- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `message`                                | `M`  | ❌       | -       | -     | -          | Message state at the time of cancellation, |
| including any partially received content |

---

##### `onAborted` (CallSignature)

**Type:** `void`

Called when message transmission is stopped or cancelled

This event fires when the user or system cancels the streaming operation.
The message contains any partial content that was received before cancellation.

**Example:**

```typescript
onAborted: (message) => {
  console.log('Stream cancelled');
  console.log('Partial content:', message.content);
  saveDraft(message); // Save partial content as draft
};
```

#### Parameters

| Name                                     | Type | Optional | Default | Since | Deprecated | Description                                |
| ---------------------------------------- | ---- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `message`                                | `M`  | ❌       | -       | -     | -          | Message state at the time of cancellation, |
| including any partially received content |

---

#### `onChunk` (Method)

**Type:** `(chunk: M) => void`

#### Parameters

| Name    | Type | Optional | Default | Since | Deprecated | Description                                              |
| ------- | ---- | -------- | ------- | ----- | ---------- | -------------------------------------------------------- |
| `chunk` | `M`  | ❌       | -       | -     | -          | Message fragment, usually the accumulated message so far |

---

##### `onChunk` (CallSignature)

**Type:** `void`

Called each time a new data chunk is received

This event fires for each chunk of data received during streaming.
The chunk typically contains cumulative message data, not incremental.

**Example:**

```typescript
onChunk: (chunk) => {
  // Update UI with streaming content
  updateMessageDisplay(chunk.content);
};
```

#### Parameters

| Name    | Type | Optional | Default | Since | Deprecated | Description                                              |
| ------- | ---- | -------- | ------- | ----- | ---------- | -------------------------------------------------------- |
| `chunk` | `M`  | ❌       | -       | -     | -          | Message fragment, usually the accumulated message so far |

---

#### `onComplete` (Method)

**Type:** `(finalMessage: M) => void`

#### Parameters

| Name           | Type | Optional | Default | Since | Deprecated | Description                                 |
| -------------- | ---- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `finalMessage` | `M`  | ❌       | -       | -     | -          | The complete final message with all content |

---

##### `onComplete` (CallSignature)

**Type:** `void`

Called when streaming transmission is complete

This event fires after all chunks have been received and the stream
has ended successfully.

**Example:**

```typescript
onComplete: (finalMessage) => {
  console.log('Streaming finished');
  hideLoadingIndicator();
  saveMessage(finalMessage);
};
```

#### Parameters

| Name           | Type | Optional | Default | Since | Deprecated | Description                                 |
| -------------- | ---- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `finalMessage` | `M`  | ❌       | -       | -     | -          | The complete final message with all content |

---

#### `onConnected` (Method)

**Type:** `() => void`

---

##### `onConnected` (CallSignature)

**Type:** `void`

Called when network connection is successfully established

This event fires after the request is sent and the server has responded,
but before any data chunks are received. Indicates that streaming is
about to begin.

**Example:**

```typescript
onConnected: () => {
  console.log('Connection established, streaming will begin');
  showLoadingIndicator();
};
```

---

#### `onError` (Method)

**Type:** `(error: unknown) => void`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description                             |
| ------- | --------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `error` | `unknown` | ❌       | -       | -     | -          | Error object describing what went wrong |

---

##### `onError` (CallSignature)

**Type:** `void`

Called when an error occurs during streaming

This event fires if any error occurs during connection, streaming,
or processing of the message.

**Example:**

```typescript
onError: (error) => {
  console.error('Stream error:', error);
  showErrorNotification(error.message);
  resetStreamState();
};
```

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description                             |
| ------- | --------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `error` | `unknown` | ❌       | -       | -     | -          | Error object describing what went wrong |

---

#### `onProgress` (Method)

**Type:** `(progress: number) => void`

#### Parameters

| Name       | Type     | Optional | Default | Since | Deprecated | Description                 |
| ---------- | -------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `progress` | `number` | ❌       | -       | -     | -          | Progress percentage (0-100) |

---

##### `onProgress` (CallSignature)

**Type:** `void`

Called to report streaming progress

This event provides progress updates during streaming transmission,
useful for displaying progress bars or status indicators.

**Example:**

```typescript
onProgress: (progress) => {
  updateProgressBar(progress);
  console.log(`Download progress: ${progress}%`);
};
```

#### Parameters

| Name       | Type     | Optional | Default | Since | Deprecated | Description                 |
| ---------- | -------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `progress` | `number` | ❌       | -       | -     | -          | Progress percentage (0-100) |

---

### `MessageGetwayInterface` (Interface)

**Type:** `interface MessageGetwayInterface`

Message gateway interface for sending messages to external services

This interface defines the contract for message gateway implementations
that handle message transmission to external services (e.g., chat APIs,
message brokers). It supports both normal and streaming modes of operation.

**Example:** Basic implementation

```typescript
class ChatGateway implements MessageGetwayInterface {
  async sendMessage<M extends MessageInterface<unknown>>(
    message: M,
    options?: GatewayOptions<M>
  ): Promise<M> {
    if (options?.stream) {
      return this.sendStreamingMessage(message, options);
    }
    return this.sendNormalMessage(message);
  }
}
```

**Example:** Usage

```typescript
const gateway: MessageGetwayInterface = new ChatGateway();

// Normal send
const result = await gateway.sendMessage(message);

// Streaming send
await gateway.sendMessage(message, {
  stream: true,
  onChunk: (chunk) => console.log(chunk)
});
```

---

#### `sendMessage` (Method)

**Type:** `(message: M, options: GatewayOptions<M, Record<string, unknown>>) => Promise<unknown>`

#### Parameters

| Name                           | Type                                         | Optional | Default | Since | Deprecated | Description                                             |
| ------------------------------ | -------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------- |
| `message`                      | `M`                                          | ❌       | -       | -     | -          | Message object to send                                  |
| `options`                      | `GatewayOptions<M, Record<string, unknown>>` | ✅       | -       | -     | -          | Optional gateway configuration including stream events, |
| timeout, and custom parameters |

---

##### `sendMessage` (CallSignature)

**Type:** `Promise<unknown>`

Send a message through the gateway

Transmits a message to the configured external service. Supports both
normal mode (one-time response) and streaming mode (progressive response).

**Returns:**

Promise resolving to the sent message with response data

**Throws:**

When message transmission fails

**Throws:**

When request exceeds the specified timeout

**Throws:**

When request is cancelled via abort signal

**Example:** Normal send

```typescript
const message = createMessage({ content: 'Hello' });
const result = await gateway.sendMessage(message);
console.log('Response:', result.content);
```

**Example:** Streaming send

```typescript
await gateway.sendMessage(message, {
  stream: true,
  onConnected: () => console.log('Connected'),
  onChunk: (chunk) => updateUI(chunk),
  onComplete: (final) => console.log('Done:', final),
  onError: (err) => console.error('Error:', err)
});
```

**Example:** With timeout and abort control

```typescript
const controller = new AbortController();

const promise = gateway.sendMessage(message, {
  timeout: 30000,
  signal: controller.signal,
  onProgress: (progress) => console.log(`${progress}%`)
});

// Cancel if needed
setTimeout(() => controller.abort(), 5000);
```

#### Parameters

| Name                           | Type                                         | Optional | Default | Since | Deprecated | Description                                             |
| ------------------------------ | -------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------------- |
| `message`                      | `M`                                          | ❌       | -       | -     | -          | Message object to send                                  |
| `options`                      | `GatewayOptions<M, Record<string, unknown>>` | ✅       | -       | -     | -          | Optional gateway configuration including stream events, |
| timeout, and custom parameters |

---

### `MessageStreamEvent` (Interface)

**Type:** `interface MessageStreamEvent<M>`

Event callbacks for streaming message operations

Provides lifecycle hooks for monitoring and handling streaming message
transmission, including connection establishment, data chunks, completion,
errors, progress tracking, and cancellation.

**Example:**

```typescript
const streamEvents: MessageStreamEvent<ChatMessage> = {
  onConnected: () => console.log('Connected'),
  onChunk: (chunk) => console.log('Received:', chunk),
  onComplete: (msg) => console.log('Complete:', msg),
  onError: (err) => console.error('Error:', err)
};
```

---

#### `onAborted` (Method)

**Type:** `(message: M) => void`

#### Parameters

| Name                                     | Type | Optional | Default | Since | Deprecated | Description                                |
| ---------------------------------------- | ---- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `message`                                | `M`  | ❌       | -       | -     | -          | Message state at the time of cancellation, |
| including any partially received content |

---

##### `onAborted` (CallSignature)

**Type:** `void`

Called when message transmission is stopped or cancelled

This event fires when the user or system cancels the streaming operation.
The message contains any partial content that was received before cancellation.

**Example:**

```typescript
onAborted: (message) => {
  console.log('Stream cancelled');
  console.log('Partial content:', message.content);
  saveDraft(message); // Save partial content as draft
};
```

#### Parameters

| Name                                     | Type | Optional | Default | Since | Deprecated | Description                                |
| ---------------------------------------- | ---- | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `message`                                | `M`  | ❌       | -       | -     | -          | Message state at the time of cancellation, |
| including any partially received content |

---

#### `onChunk` (Method)

**Type:** `(chunk: M) => void`

#### Parameters

| Name    | Type | Optional | Default | Since | Deprecated | Description                                              |
| ------- | ---- | -------- | ------- | ----- | ---------- | -------------------------------------------------------- |
| `chunk` | `M`  | ❌       | -       | -     | -          | Message fragment, usually the accumulated message so far |

---

##### `onChunk` (CallSignature)

**Type:** `void`

Called each time a new data chunk is received

This event fires for each chunk of data received during streaming.
The chunk typically contains cumulative message data, not incremental.

**Example:**

```typescript
onChunk: (chunk) => {
  // Update UI with streaming content
  updateMessageDisplay(chunk.content);
};
```

#### Parameters

| Name    | Type | Optional | Default | Since | Deprecated | Description                                              |
| ------- | ---- | -------- | ------- | ----- | ---------- | -------------------------------------------------------- |
| `chunk` | `M`  | ❌       | -       | -     | -          | Message fragment, usually the accumulated message so far |

---

#### `onComplete` (Method)

**Type:** `(finalMessage: M) => void`

#### Parameters

| Name           | Type | Optional | Default | Since | Deprecated | Description                                 |
| -------------- | ---- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `finalMessage` | `M`  | ❌       | -       | -     | -          | The complete final message with all content |

---

##### `onComplete` (CallSignature)

**Type:** `void`

Called when streaming transmission is complete

This event fires after all chunks have been received and the stream
has ended successfully.

**Example:**

```typescript
onComplete: (finalMessage) => {
  console.log('Streaming finished');
  hideLoadingIndicator();
  saveMessage(finalMessage);
};
```

#### Parameters

| Name           | Type | Optional | Default | Since | Deprecated | Description                                 |
| -------------- | ---- | -------- | ------- | ----- | ---------- | ------------------------------------------- |
| `finalMessage` | `M`  | ❌       | -       | -     | -          | The complete final message with all content |

---

#### `onConnected` (Method)

**Type:** `() => void`

---

##### `onConnected` (CallSignature)

**Type:** `void`

Called when network connection is successfully established

This event fires after the request is sent and the server has responded,
but before any data chunks are received. Indicates that streaming is
about to begin.

**Example:**

```typescript
onConnected: () => {
  console.log('Connection established, streaming will begin');
  showLoadingIndicator();
};
```

---

#### `onError` (Method)

**Type:** `(error: unknown) => void`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description                             |
| ------- | --------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `error` | `unknown` | ❌       | -       | -     | -          | Error object describing what went wrong |

---

##### `onError` (CallSignature)

**Type:** `void`

Called when an error occurs during streaming

This event fires if any error occurs during connection, streaming,
or processing of the message.

**Example:**

```typescript
onError: (error) => {
  console.error('Stream error:', error);
  showErrorNotification(error.message);
  resetStreamState();
};
```

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description                             |
| ------- | --------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `error` | `unknown` | ❌       | -       | -     | -          | Error object describing what went wrong |

---

#### `onProgress` (Method)

**Type:** `(progress: number) => void`

#### Parameters

| Name       | Type     | Optional | Default | Since | Deprecated | Description                 |
| ---------- | -------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `progress` | `number` | ❌       | -       | -     | -          | Progress percentage (0-100) |

---

##### `onProgress` (CallSignature)

**Type:** `void`

Called to report streaming progress

This event provides progress updates during streaming transmission,
useful for displaying progress bars or status indicators.

**Example:**

```typescript
onProgress: (progress) => {
  updateProgressBar(progress);
  console.log(`Download progress: ${progress}%`);
};
```

#### Parameters

| Name       | Type     | Optional | Default | Since | Deprecated | Description                 |
| ---------- | -------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `progress` | `number` | ❌       | -       | -     | -          | Progress percentage (0-100) |

---
