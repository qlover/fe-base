## `src/core/response-stream/SSEStreamProcessor` (Module)

**Type:** `module src/core/response-stream/SSEStreamProcessor`

---

### `SSEStreamProcessor` (Class)

**Type:** `class SSEStreamProcessor`

SSE (Server-Sent Events) stream processor

Core functionality:

- Processes Server-Sent Events (SSE) data streams
- Handles line-based event data with configurable prefix
- Filters and extracts event data from SSE format
- Manages partial event data between chunks

Implementation details:

- Uses line-based parsing ('\n' separator)
- Filters lines starting with specified prefix (default: 'data: ')
- Trims whitespace from extracted data
- Handles incomplete events at chunk boundaries

Business rules:

- Only processes lines starting with the specified prefix
- Empty lines are ignored
- Whitespace is trimmed from both the line and extracted data

**Example:** Basic usage with default prefix

```typescript
const processor = new SSEStreamProcessor();
const events = processor.processChunk('data: event1\ndata: event2\n');
// Result: ["event1", "event2"]
```

**Example:** Custom prefix usage

```typescript
const processor = new SSEStreamProcessor('event: ');
const events = processor.processChunk('event: custom1\nevent: custom2\n');
// Result: ["custom1", "custom2"]
```

---

#### `new SSEStreamProcessor` (Constructor)

**Type:** `(prefix: string) => SSEStreamProcessor`

#### Parameters

| Name     | Type     | Optional | Default    | Since | Deprecated | Description                                 |
| -------- | -------- | -------- | ---------- | ----- | ---------- | ------------------------------------------- |
| `prefix` | `string` | ✅       | `'data: '` | -     | -          | SSE data line prefix to identify event data |

               Lines not starting with this prefix are ignored
               Common values: 'data: ', 'event: ', 'id: ' |

---

#### `processChunk` (Method)

**Type:** `(chunk: string) => string[]`

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description            |
| ------- | -------- | -------- | ------- | ----- | ---------- | ---------------------- |
| `chunk` | `string` | ❌       | -       | -     | -          | The raw SSE chunk data |

---

##### `processChunk` (CallSignature)

**Type:** `string[]`

Process a chunk of SSE data into separate events

Processing steps:

1. Split chunk by newlines
2. Trim whitespace from each line
3. Filter lines that start with prefix
4. Extract actual event data by removing prefix

Business rules:

- Only lines starting with prefix are processed
- Empty lines are excluded
- Whitespace is trimmed from both line and extracted data
- Partial events at chunk boundaries are handled by processFinal

**Returns:**

Array of processed event data strings

**Example:**

```typescript
const events = processor.processChunk(
  'data: event1\n\ndata: event2\nignored line\ndata: event3'
);
// Result: ["event1", "event2", "event3"]
```

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description            |
| ------- | -------- | -------- | ------- | ----- | ---------- | ---------------------- |
| `chunk` | `string` | ❌       | -       | -     | -          | The raw SSE chunk data |

---

#### `processFinal` (Method)

**Type:** `(data: string) => undefined \| string`

#### Parameters

| Name   | Type     | Optional | Default | Since | Deprecated | Description                            |
| ------ | -------- | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `data` | `string` | ❌       | -       | -     | -          | Remaining SSE data from the last chunk |

---

##### `processFinal` (CallSignature)

**Type:** `undefined \| string`

Process remaining SSE data when stream ends

This method handles any remaining data that didn't end with a newline.
It ensures no event data is lost at stream boundaries.

Processing steps:

1. Split remaining data by newlines
2. Trim whitespace from each line
3. Filter for prefix-matching lines
4. Return last valid event data if any

Business rules:

- Only the last valid event data is returned
- Returns undefined if no valid events found
- Follows same prefix and trimming rules as processChunk

**Returns:**

Last valid event data if any, undefined otherwise

**Example:**

```typescript
const finalEvent = processor.processFinal(
  'ignored\ndata: final event\ndata: incomplete'
);
// Result: "incomplete"
```

#### Parameters

| Name   | Type     | Optional | Default | Since | Deprecated | Description                            |
| ------ | -------- | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `data` | `string` | ❌       | -       | -     | -          | Remaining SSE data from the last chunk |

---
