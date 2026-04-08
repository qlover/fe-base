## `src/core/message-sender/impl/SenderGateway` (Module)

**Type:** `module src/core/message-sender/impl/SenderGateway`

---

### `SenderGateway` (Class)

**Type:** `class SenderGateway<MessageType>`

Sender gateway implementation

Bridges between the message sender and the actual gateway implementation.
Handles gateway options creation, signal management, and streaming callback
coordination with the plugin executor.

**Core responsibilities:**

- Create and configure gateway options for each send operation
- Merge abort signals from multiple sources
- Coordinate streaming callbacks with plugin hooks
- Ensure abort signal is checked before each callback

**Signal priority:**

1. Custom signal from `gatewayOptions.signal` (user-provided)
2. Plugin-created signal from `context.parameters.signal` (AborterPlugin)
3. No signal (operation not cancellable)

**Example:** Basic usage

```typescript
const executor = new MessageSenderExecutor();
const gateway = new SenderGateway(executor);

const options = gateway.createGatewayOptions(
  { stream: true, onChunk: (chunk) => console.log(chunk) },
  context
);
```

---

#### `new SenderGateway` (Constructor)

**Type:** `(executor: undefined \| MessageSenderExecutor<MessageType>) => SenderGateway<MessageType>`

#### Parameters

| Name       | Type                                              | Optional | Default | Since | Deprecated | Description                                              |
| ---------- | ------------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------- |
| `executor` | `undefined \| MessageSenderExecutor<MessageType>` | ❌       | -       | -     | -          | Optional message sender executor for plugin coordination |

---

#### `executor` (Property)

**Type:** `undefined \| MessageSenderExecutor<MessageType>`

Optional message sender executor for plugin coordination

---

#### `createGatewayOptions` (Method)

**Type:** `(gatewayOptions: GatewayOptions<MessageType, Record<string, unknown>>, context: MessageSenderContext<MessageType>) => GatewayOptions<MessageType, Record<string, unknown>>`

#### Parameters

| Name             | Type                                                   | Optional | Default | Since | Deprecated | Description                                  |
| ---------------- | ------------------------------------------------------ | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `gatewayOptions` | `GatewayOptions<MessageType, Record<string, unknown>>` | ❌       | -       | -     | -          | Gateway options from send call               |
| `context`        | `MessageSenderContext<MessageType>`                    | ✅       | -       | -     | -          | Optional execution context with plugin state |

---

##### `createGatewayOptions` (CallSignature)

**Type:** `GatewayOptions<MessageType, Record<string, unknown>>`

Create gateway options with plugin integration

Creates the complete gateway options object needed for message send execution.
Merges signals from multiple sources, wraps callbacks to integrate with
plugin hooks, and ensures abort signals are checked before each callback.

**Signal merging:**

- Priority: `gatewayOptions.signal` > `context.parameters.signal`
- Merged signal stored in both context parameters and returned options
- Allows plugins to access the final signal

**Callback wrapping:**

- `onConnected`: Checks signal → runs plugin hook → calls user callback
- `onChunk`: Checks signal → runs plugin hook → calls user callback with result
- Other callbacks: Passed through unchanged

**Important notes:**

- Only whitelisted properties are included in returned options
- Unknown properties are not merged (prevents unexpected behavior)
- Signal checked before each callback to enable early cancellation

**Returns:**

Complete gateway options for gateway execution

**Example:** With custom signal

```typescript
const controller = new AbortController();
const options = gateway.createGatewayOptions(
  {
    stream: true,
    signal: controller.signal,
    onChunk: (chunk) => console.log(chunk)
  },
  context
);
// options.signal === controller.signal (custom signal takes priority)
```

**Example:** With plugin-created signal

```typescript
// AborterPlugin creates signal and stores in context.parameters.signal
const options = gateway.createGatewayOptions(
  { stream: true, onChunk: (chunk) => console.log(chunk) },
  context
);
// options.signal === context.parameters.signal (plugin signal used)
```

**Example:** Callback integration

```typescript
const options = gateway.createGatewayOptions(
  {
    onConnected: () => console.log('User: Connected'),
    onChunk: (chunk) => console.log('User:', chunk)
  },
  context
);
// Execution order for onConnected:
// 1. Check signal.throwIfAborted()
// 2. executor.runConnected(context) - plugin hooks
// 3. User callback: console.log('User: Connected')

// Execution order for onChunk:
// 1. Check signal.throwIfAborted()
// 2. executor.runStream(chunk, context) - plugin hooks
// 3. User callback with plugin-processed chunk
```

#### Parameters

| Name             | Type                                                   | Optional | Default | Since | Deprecated | Description                                  |
| ---------------- | ------------------------------------------------------ | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `gatewayOptions` | `GatewayOptions<MessageType, Record<string, unknown>>` | ❌       | -       | -     | -          | Gateway options from send call               |
| `context`        | `MessageSenderContext<MessageType>`                    | ✅       | -       | -     | -          | Optional execution context with plugin state |

---

#### `onChunk` (Method)

**Type:** `(chunk: unknown, gatewayOptions: GatewayOptions<MessageType, Record<string, unknown>>, context: MessageSenderContext<MessageType>) => void`

#### Parameters

| Name             | Type                                                   | Optional | Default | Since | Deprecated | Description                                  |
| ---------------- | ------------------------------------------------------ | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `chunk`          | `unknown`                                              | ❌       | -       | -     | -          | Data chunk received from stream              |
| `gatewayOptions` | `GatewayOptions<MessageType, Record<string, unknown>>` | ❌       | -       | -     | -          | Original gateway options with user callbacks |
| `context`        | `MessageSenderContext<MessageType>`                    | ✅       | -       | -     | -          | Optional execution context for plugin hooks  |

---

##### `onChunk` (CallSignature)

**Type:** `void`

Handle streaming chunk received

Called each time a chunk is received during streaming.
Checks abort signal, runs plugin hooks to process chunk,
then invokes user callback with the processed result.

**Execution order:**

1. Check if operation was aborted (throws if aborted)
2. Run `onStream` plugin hooks via executor (async)
3. Call user's `onChunk` callback with processed chunk

**Chunk processing:**

- Plugins can transform chunks via `onStream` hook
- Processed chunk (or original if no transform) passed to user
- If no executor: Original chunk passed directly to user

**Important notes:**

- Signal checked first to enable early cancellation
- Plugin processing is async (returns early if executor present)
- User callback receives plugin-processed chunk
- Fallback to original chunk if plugin returns `undefined`

**Throws:**

When signal is aborted before chunk processing

**Example:** Without plugins

```typescript
// No executor configured
onChunk(chunk, gatewayOptions, undefined);
// User callback called immediately with original chunk
```

**Example:** With plugin transformation

```typescript
// Plugin transforms chunk
plugin.onStream = (ctx, chunk) => ({
  ...chunk,
  processed: true
});

// Gateway calls this method
// 1. Checks signal
// 2. Runs plugin hooks (transforms chunk)
// 3. Calls user callback with transformed chunk
```

**Example:** Abort during streaming

```typescript
// Signal aborted before chunk processing
signal.abort();
onChunk(chunk, gatewayOptions, context);
// Throws AbortError immediately, chunk not processed
```

#### Parameters

| Name             | Type                                                   | Optional | Default | Since | Deprecated | Description                                  |
| ---------------- | ------------------------------------------------------ | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `chunk`          | `unknown`                                              | ❌       | -       | -     | -          | Data chunk received from stream              |
| `gatewayOptions` | `GatewayOptions<MessageType, Record<string, unknown>>` | ❌       | -       | -     | -          | Original gateway options with user callbacks |
| `context`        | `MessageSenderContext<MessageType>`                    | ✅       | -       | -     | -          | Optional execution context for plugin hooks  |

---

#### `onConnected` (Method)

**Type:** `(gatewayOptions: GatewayOptions<MessageType, Record<string, unknown>>, context: MessageSenderContext<MessageType>) => void`

#### Parameters

| Name             | Type                                                   | Optional | Default | Since | Deprecated | Description                                  |
| ---------------- | ------------------------------------------------------ | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `gatewayOptions` | `GatewayOptions<MessageType, Record<string, unknown>>` | ❌       | -       | -     | -          | Original gateway options with user callbacks |
| `context`        | `MessageSenderContext<MessageType>`                    | ✅       | -       | -     | -          | Optional execution context for plugin hooks  |

---

##### `onConnected` (CallSignature)

**Type:** `void`

Handle streaming connection established

Called when streaming connection is successfully established.
Checks abort signal, runs plugin hooks, then invokes user callback.

**Execution order:**

1. Check if operation was aborted (throws if aborted)
2. Run `onConnected` plugin hooks via executor
3. Call user's `onConnected` callback

**Important notes:**

- Signal checked first to enable early cancellation
- Plugin hooks run before user callback
- User callback always called (even without executor)

**Throws:**

When signal is aborted before connection handling

**Example:**

```typescript
// User provides callback
gatewayOptions.onConnected = () => console.log('Connected');

// Gateway calls this method
// 1. Checks signal
// 2. Runs plugin hooks (e.g., update message status)
// 3. Calls user callback
```

#### Parameters

| Name             | Type                                                   | Optional | Default | Since | Deprecated | Description                                  |
| ---------------- | ------------------------------------------------------ | -------- | ------- | ----- | ---------- | -------------------------------------------- |
| `gatewayOptions` | `GatewayOptions<MessageType, Record<string, unknown>>` | ❌       | -       | -     | -          | Original gateway options with user callbacks |
| `context`        | `MessageSenderContext<MessageType>`                    | ✅       | -       | -     | -          | Optional execution context for plugin hooks  |

---
