## `src/core/response-stream/ResponseStream` (Module)

**Type:** `module src/core/response-stream/ResponseStream`

---

### `ResponseStream` (Class)

**Type:** `class ResponseStream`

**Since:** `1.5.0`

Plugin for handling stream response data

Core functionality:

- Processes streaming HTTP responses
- Supports both line-based and SSE stream formats
- Provides event-based stream processing
- Handles stream errors and completion

Business rules:

- Automatically detects and uses appropriate stream processor
- Maintains stream state and buffer management
- Ensures proper stream cleanup and resource release

**Example:** Basic usage

```typescript
const streamPlugin = new ResponseStream({
  onStreamChunk: (chunk) => console.log(chunk),
  onStreamDone: () => console.log('Stream completed')
});
```

**Example:** SSE stream handling

```typescript
const ssePlugin = new ResponseStream({
  ssePrefix: 'data: ',
  onStreamChunk: (chunk) => handleSSEData(chunk)
});
```

---

#### `new ResponseStream` (Constructor)

**Type:** `(config: ResponseStreamConfig) => ResponseStream`

#### Parameters

| Name     | Type                   | Optional | Default | Since | Deprecated | Description |
| -------- | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `config` | `ResponseStreamConfig` | ✅       | `{}`    | -     | -          |             |

---

#### `pluginName` (Property)

**Type:** `"ResponseStream"`

**Default:** `'ResponseStream'`

---

#### `handleStreamResponse` (Method)

**Type:** `(response: Response, config: RequestAdapterConfig<unknown> & ResponseStreamConfig) => Promise<undefined \| string>`

#### Parameters

| Name       | Type                                                   | Optional | Default | Since | Deprecated | Description                       |
| ---------- | ------------------------------------------------------ | -------- | ------- | ----- | ---------- | --------------------------------- |
| `response` | `Response`                                             | ❌       | -       | -     | -          | Response stream from HTTP request |
| `config`   | `RequestAdapterConfig<unknown> & ResponseStreamConfig` | ✅       | -       | -     | -          | Optional configuration overrides  |

---

##### `handleStreamResponse` (CallSignature)

**Type:** `Promise<undefined \| string>`

Handle stream response data

Core functionality:

- Validates response status
- Sets up appropriate stream processor
- Manages stream reading and event handling
- Ensures proper resource cleanup

**Throws:**

If the stream request fails or reader cannot be obtained

**Returns:**

Final processed data or undefined

#### Parameters

| Name       | Type                                                   | Optional | Default | Since | Deprecated | Description                       |
| ---------- | ------------------------------------------------------ | -------- | ------- | ----- | ---------- | --------------------------------- |
| `response` | `Response`                                             | ❌       | -       | -     | -          | Response stream from HTTP request |
| `config`   | `RequestAdapterConfig<unknown> & ResponseStreamConfig` | ✅       | -       | -     | -          | Optional configuration overrides  |

---

#### `onSuccess` (Method)

**Type:** `(context: ExecutorContext<RequestAdapterConfig<unknown>>) => Promise<void>`

#### Parameters

| Name      | Type                                             | Optional | Default | Since | Deprecated | Description                               |
| --------- | ------------------------------------------------ | -------- | ------- | ----- | ---------- | ----------------------------------------- |
| `context` | `ExecutorContext<RequestAdapterConfig<unknown>>` | ❌       | -       | -     | -          | Executor context containing response data |

---

##### `onSuccess` (CallSignature)

**Type:** `Promise<void>`

Process stream response data

Handles successful response by checking if it's a stream
and processing it accordingly.

#### Parameters

| Name      | Type                                             | Optional | Default | Since | Deprecated | Description                               |
| --------- | ------------------------------------------------ | -------- | ------- | ----- | ---------- | ----------------------------------------- |
| `context` | `ExecutorContext<RequestAdapterConfig<unknown>>` | ❌       | -       | -     | -          | Executor context containing response data |

---

#### `streamWithEvent` (Method)

**Type:** `(reader: ReadableStreamDefaultReader<R>, streamEvent: StreamEvent, config: RequestAdapterConfig<unknown> & ResponseStreamConfig) => Promise<undefined \| string>`

#### Parameters

| Name          | Type                                                   | Optional | Default | Since | Deprecated | Description                                |
| ------------- | ------------------------------------------------------ | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `reader`      | `ReadableStreamDefaultReader<R>`                       | ❌       | -       | -     | -          | Stream reader instance                     |
| `streamEvent` | `StreamEvent`                                          | ❌       | -       | -     | -          | Stream event instance for state management |
| `config`      | `RequestAdapterConfig<unknown> & ResponseStreamConfig` | ✅       | -       | -     | -          | Optional configuration overrides           |

---

##### `streamWithEvent` (CallSignature)

**Type:** `Promise<undefined \| string>`

Process stream data with event handling

Core functionality:

- Reads stream data chunks
- Processes data using configured processor
- Triggers callbacks for chunks and completion
- Manages stream buffer and state

Business rules:

- Continues reading until stream is done or finished flag is set
- Processes complete messages from buffer before callback
- Ensures proper event order (chunk → done)

**Returns:**

Final processed data or undefined

#### Parameters

| Name          | Type                                                   | Optional | Default | Since | Deprecated | Description                                |
| ------------- | ------------------------------------------------------ | -------- | ------- | ----- | ---------- | ------------------------------------------ |
| `reader`      | `ReadableStreamDefaultReader<R>`                       | ❌       | -       | -     | -          | Stream reader instance                     |
| `streamEvent` | `StreamEvent`                                          | ❌       | -       | -     | -          | Stream event instance for state management |
| `config`      | `RequestAdapterConfig<unknown> & ResponseStreamConfig` | ✅       | -       | -     | -          | Optional configuration overrides           |

---

### `ResponseStreamConfig` (Interface)

**Type:** `interface ResponseStreamConfig`

Configuration options for the ResponseStream plugin

Core functionality:

- Stream data processing with customizable processors
- Support for both line-based and SSE stream formats
- Event-driven stream handling with callbacks
- Error handling and stream completion events

---

#### `processor` (Property)

**Type:** `StreamProcessorInterface`

**Default:** `ts
LineStreamProcessor if ssePrefix is not set
`

Stream processor for handling stream data

Determines how incoming stream data is processed and parsed.
Can be customized to handle different stream formats.

---

#### `ssePrefix` (Property)

**Type:** `string`

SSE prefix for stream data

Used to identify and parse Server-Sent Events (SSE) data.
When set, automatically uses SSEStreamProcessor for handling stream data.

**Example:**

```ts
`"data: "` - Common SSE data prefix
```

---

#### `streamContentTypes` (Property)

**Type:** `string[]`

Custom content types to be treated as stream responses

By default, 'text/event-stream' and 'application/x-ndjson' are treated as streams.
Add additional content types here if needed.

**Example:**

```ts
['text/event-stream', 'application/x-ndjson', 'custom/stream-type'];
```

---

#### `onStreamChunk` (Method)

**Type:** `(chunk: string, streamEvent: StreamEvent) => void`

#### Parameters

| Name          | Type          | Optional | Default | Since | Deprecated | Description                                       |
| ------------- | ------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `chunk`       | `string`      | ❌       | -       | -     | -          | Processed data chunk                              |
| `streamEvent` | `StreamEvent` | ❌       | -       | -     | -          | Stream event instance containing processing state |

---

##### `onStreamChunk` (CallSignature)

**Type:** `void`

Callback when receiving stream data

Called for each processed chunk of stream data.
Useful for real-time data handling and UI updates.

#### Parameters

| Name          | Type          | Optional | Default | Since | Deprecated | Description                                       |
| ------------- | ------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------- |
| `chunk`       | `string`      | ❌       | -       | -     | -          | Processed data chunk                              |
| `streamEvent` | `StreamEvent` | ❌       | -       | -     | -          | Stream event instance containing processing state |

---

#### `onStreamDone` (Method)

**Type:** `() => void`

---

##### `onStreamDone` (CallSignature)

**Type:** `void`

Callback when stream is done

Called when the stream is completed successfully.
Use this to perform cleanup or final data processing.

---

#### `onStreamError` (Method)

**Type:** `(error: Error) => void`

#### Parameters

| Name    | Type    | Optional | Default | Since | Deprecated | Description                           |
| ------- | ------- | -------- | ------- | ----- | ---------- | ------------------------------------- |
| `error` | `Error` | ❌       | -       | -     | -          | Error object containing error details |

---

##### `onStreamError` (CallSignature)

**Type:** `void`

Callback when error occurs

Called when stream processing encounters an error.
Use this to handle error cases and provide user feedback.

#### Parameters

| Name    | Type    | Optional | Default | Since | Deprecated | Description                           |
| ------- | ------- | -------- | ------- | ----- | ---------- | ------------------------------------- |
| `error` | `Error` | ❌       | -       | -     | -          | Error object containing error details |

---
