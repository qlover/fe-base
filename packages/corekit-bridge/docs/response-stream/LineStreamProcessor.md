## `src/core/response-stream/LineStreamProcessor` (Module)

**Type:** `module src/core/response-stream/LineStreamProcessor`

---

### `LineStreamProcessor` (Class)

**Type:** `class LineStreamProcessor`

Default line-based stream processor

Core functionality:

- Processes incoming stream data by line breaks
- Handles partial line data between chunks
- Trims whitespace and filters empty lines
- Supports custom line separator configuration

Implementation details:

- Uses string split operation for line separation
- Automatically trims whitespace from each line
- Filters out empty lines after trimming
- Processes remaining data when stream ends

**Example:** Basic usage with default separator

```typescript
const processor = new LineStreamProcessor();
const lines = processor.processChunk('line1\nline2\nline3');
// Result: ["line1", "line2", "line3"]
```

**Example:** Custom separator usage

```typescript
const processor = new LineStreamProcessor('\r\n');
const lines = processor.processChunk('line1\r\nline2\r\nline3');
// Result: ["line1", "line2", "line3"]
```

---

#### `new LineStreamProcessor` (Constructor)

**Type:** `(separator: string) => LineStreamProcessor`

#### Parameters

| Name        | Type     | Optional | Default | Since | Deprecated | Description           |
| ----------- | -------- | -------- | ------- | ----- | ---------- | --------------------- |
| `separator` | `string` | ✅       | `'\n'`  | -     | -          | Line separator string |

                  Used to split incoming data into lines
                  Common values: '\n' (Unix), '\r\n' (Windows) |

---

#### `processChunk` (Method)

**Type:** `(chunk: string) => string[]`

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description                    |
| ------- | -------- | -------- | ------- | ----- | ---------- | ------------------------------ |
| `chunk` | `string` | ❌       | -       | -     | -          | The raw chunk data from stream |

---

##### `processChunk` (CallSignature)

**Type:** `string[]`

Process a chunk of data into separate lines

Processing steps:

1. Split chunk by separator
2. Trim whitespace from each line
3. Filter out empty lines

Business rules:

- Empty lines (after trimming) are excluded from output
- Whitespace is trimmed from both ends of each line
- Partial lines at chunk boundaries are handled by processFinal

**Returns:**

Array of processed non-empty lines

**Example:**

```typescript
const lines = processor.processChunk('  line1  \n\n  line2  ');
// Result: ["line1", "line2"]
```

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description                    |
| ------- | -------- | -------- | ------- | ----- | ---------- | ------------------------------ |
| `chunk` | `string` | ❌       | -       | -     | -          | The raw chunk data from stream |

---

#### `processFinal` (Method)

**Type:** `(data: string) => undefined \| string`

#### Parameters

| Name   | Type     | Optional | Default | Since | Deprecated | Description                        |
| ------ | -------- | -------- | ------- | ----- | ---------- | ---------------------------------- |
| `data` | `string` | ❌       | -       | -     | -          | Remaining data from the last chunk |

---

##### `processFinal` (CallSignature)

**Type:** `undefined \| string`

Process remaining data when stream ends

This method handles any remaining data that didn't end with a separator.
It ensures no data is lost at stream boundaries.

Processing steps:

1. Trim whitespace from remaining data
2. Return trimmed data if non-empty
3. Return undefined if empty after trimming

**Returns:**

Processed data string if non-empty, undefined otherwise

**Example:**

```typescript
const finalData = processor.processFinal('  last line  ');
// Result: "last line"
```

#### Parameters

| Name   | Type     | Optional | Default | Since | Deprecated | Description                        |
| ------ | -------- | -------- | ------- | ----- | ---------- | ---------------------------------- |
| `data` | `string` | ❌       | -       | -     | -          | Remaining data from the last chunk |

---
