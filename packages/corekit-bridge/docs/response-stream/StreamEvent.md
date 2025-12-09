## `src/core/response-stream/StreamEvent` (Module)

**Type:** `unknown`

---

### `StreamEvent` (Class)

**Type:** `unknown`

Stream event handler for processing stream data

Core functionality:

- Manages streaming data processing lifecycle
- Buffers and processes data chunks
- Tracks stream state and processing statistics
- Handles binary and text data conversion

Implementation details:

- Uses TextDecoder for binary data conversion
- Maintains buffer for incomplete chunks
- Tracks number of processed chunks
- Preserves last processed message

Business rules:

- Processes chunks sequentially to maintain data integrity
- Handles both binary (ArrayBuffer) and text data
- Preserves partial data between chunks
- Provides final data processing on stream end

**Example:** Basic usage

```typescript
const processor = new LineStreamProcessor();
const event = new StreamEvent(processor);

// Process chunks
event.append('chunk1\n');
const messages = event.processBuffer();

// Finish stream
const final = event.doned();
```

---

#### `new StreamEvent` (Constructor)

**Type:** `(processor: StreamProcessorInterface, decoder: TextDecoder) => StreamEvent`

#### Parameters

| Name        | Type                       | Optional | Default | Since | Deprecated | Description                                          |
| ----------- | -------------------------- | -------- | ------- | ----- | ---------- | ---------------------------------------------------- |
| `processor` | `StreamProcessorInterface` | ❌       | -       | -     | -          | Stream processor implementation for chunk processing |

Determines how raw chunks are converted to messagesRaw chunk data from streamArray of processed messages |
| `decoder` | `TextDecoder` | ✅ | `{}` | - | - | Text decoder for binary data conversion

Used when processing ArrayBuffer chunks |

---

#### `decoder` (Property)

**Type:** `TextDecoder`

**Default:** `{}`

Text decoder for binary data conversion

Used when processing ArrayBuffer chunks

---

#### `processor` (Property)

**Type:** `StreamProcessorInterface`

Stream processor implementation for chunk processing

Determines how raw chunks are converted to messages

**Param:** chunk

Raw chunk data from stream

**Returns:**

Array of processed messages

---

#### `finish` (Accessor)

**Type:** `unknown`

---

#### `times` (Accessor)

**Type:** `unknown`

---

#### `append` (Method)

**Type:** `(chunk: string) => void`

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description              |
| ------- | -------- | -------- | ------- | ----- | ---------- | ------------------------ |
| `chunk` | `string` | ❌       | -       | -     | -          | New chunk data to buffer |

---

##### `append` (CallSignature)

**Type:** `void`

Append new chunk to processing buffer

Business rules:

- Only non-empty chunks are buffered
- Maintains chunk order for processing
- Does not process chunks immediately

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description              |
| ------- | -------- | -------- | ------- | ----- | ---------- | ------------------------ |
| `chunk` | `string` | ❌       | -       | -     | -          | New chunk data to buffer |

---

#### `doned` (Method)

**Type:** `() => undefined \| string`

---

##### `doned` (CallSignature)

**Type:** `undefined \| string`

Process final data when stream is complete

Processing steps:

1. Mark stream as finished
2. Check for remaining buffered data
3. Process remaining data if any
4. Clear buffer after processing

Business rules:

- Returns last message if buffer is empty
- Processes remaining buffer as final data
- Clears buffer after final processing
- Falls back to last message if final processing yields nothing

**Returns:**

Final processed message or last known message

**Example:**

```typescript
event.append('final chunk');
const lastMessage = event.doned();
```

---

#### `finished` (Method)

**Type:** `() => void`

---

##### `finished` (CallSignature)

**Type:** `void`

Mark stream as finished

This method:

- Sets the finish flag to true
- Prevents further chunk processing
- Indicates stream completion

Used in conjunction with doned() to handle stream completion

---

#### `isFinished` (Method)

**Type:** `() => boolean`

---

##### `isFinished` (CallSignature)

**Type:** `boolean`

Check if stream is finished

**Returns:**

True if stream is marked as finished, false otherwise

---

#### `parseChunk` (Method)

**Type:** `(chunk: R) => string`

#### Parameters

| Name    | Type | Optional | Default | Since | Deprecated | Description                     |
| ------- | ---- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `chunk` | `R`  | ❌       | -       | -     | -          | Raw chunk data (binary or text) |

---

##### `parseChunk` (CallSignature)

**Type:** `string`

Parse raw chunk data into string format

Processing steps:

1. Increment chunk counter
2. Check chunk type (ArrayBuffer or other)
3. Convert chunk to string format

Business rules:

- ArrayBuffer chunks are decoded using TextDecoder
- Other types are converted using String()
- Maintains chunk count for monitoring

**Returns:**

Decoded string from chunk

**Example:** Binary data

```typescript
const binaryChunk = new Uint8Array([104, 101, 108, 108, 111]); // "hello"
const text = event.parseChunk(binaryChunk);
```

#### Parameters

| Name    | Type | Optional | Default | Since | Deprecated | Description                     |
| ------- | ---- | -------- | ------- | ----- | ---------- | ------------------------------- |
| `chunk` | `R`  | ❌       | -       | -     | -          | Raw chunk data (binary or text) |

---

#### `processBuffer` (Method)

**Type:** `() => string[]`

---

##### `processBuffer` (CallSignature)

**Type:** `string[]`

Process buffered chunks into complete messages

Processing steps:

1. Check buffer for content
2. Process each chunk sequentially
3. Update last message tracking
4. Clear processed chunks

Business rules:

- Maintains chunk processing order
- Preserves last complete message
- Processes all buffered chunks
- Returns empty array if no chunks

**Returns:**

Array of processed messages

**Example:**

```typescript
event.append('message1\n');
event.append('message2\n');
const messages = event.processBuffer();
// Result: ["message1", "message2"]
```

---
