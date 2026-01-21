## `src/aborter/AborterPlugin` (Module)

**Type:** `module src/aborter/AborterPlugin`

---

### `AborterPlugin` (Class)

**Type:** `class AborterPlugin<TParams, TResult>`

**Since:** `3.0.0`

Lifecycle plugin for managing operation cancellation with timeout support

A lightweight abort management plugin that implements
`LifecyclePluginInterface`

to provide abort control for executor operations. Supports timeout mechanisms,
external signal composition, and automatic resource cleanup.

Core concept:
Integrates abort management into the executor lifecycle, automatically creating
and cleaning up abort controllers for each operation while supporting timeout
and external signal composition.

Main features:

- Lifecycle integration: Hooks into executor lifecycle for automatic management
  - `onBefore`
    : Registers abort operation, injects signal, validates config
  - `onError`
    : Handles abort errors and cleans up resources
  - `onFinally`
    : Ensures cleanup always happens

- Timeout support: Automatic operation timeout with configurable duration
  - Configure via
    `abortTimeout`
    in parameters or default timeout in options
  - Triggers
    `onAbortedTimeout`
    callback when timeout occurs
  - Automatically cleans up timeout timers

- Signal composition: Combines multiple abort signals
  - Internal controller signal (for manual abort)
  - Timeout signal (if timeout configured)
  - External signal (if provided in parameters via
    `getConfig`
    )

- Error handling: Detects and transforms abort errors
  - Converts various abort error types to standard
    `AbortError`

  - Preserves abort context (ID, timeout, reason)
  - Allows other plugins to handle non-abort errors

- Development warnings: Validates configuration in development mode
  - Warns if
    `signal`
    property is missing from extracted config
  - Warns if
    `signal`
    is not an
    `AbortSignal`
    instance
  - Only active when
    `NODE_ENV !== 'production'`

  - Helps catch
    `getConfig`
    implementation errors early

**Example:** Basic usage

```typescript
import { LifecycleExecutor } from '@qlover/fe-corekit';
import { AborterPlugin } from '@qlover/fe-corekit/aborter';

const executor = new LifecycleExecutor();
executor.use(new AborterPlugin());

// Execute with abort support
await executor.exec(
  async ({ signal }) => {
    return fetch('/api/data', { signal });
  },
  { abortTimeout: 5000 }
);
```

**Example:** With default timeout

```typescript
const plugin = new AborterPlugin({ timeout: 10000 });
executor.use(plugin);

// All operations will have 10s timeout unless overridden
await executor.exec(
  async ({ signal }) => fetch('/api/data', { signal }),
  {} // Uses default 10s timeout
);
```

**Example:** Manual abort

```typescript
const plugin = new AborterPlugin();
executor.use(plugin);

// Start operation
const promise = executor.exec(
  async ({ signal }) => fetch('/api/data', { signal }),
  { abortId: 'fetch-data' }
);

// Cancel after 2 seconds
setTimeout(() => plugin.abort('fetch-data'), 2000);
```

**Example:** With callbacks

```typescript
await executor.exec(async ({ signal }) => fetch('/api/data', { signal }), {
  abortTimeout: 5000,
  onAbortedTimeout: (config) => {
    console.log('Request timed out');
  },
  onAborted: (config) => {
    console.log('Request cancelled');
  }
});
```

**Example:** With custom getConfig (MessageSender integration)

```typescript
// Extract AborterConfig from MessageSenderOptions
const plugin = new AborterPlugin({
  getConfig: (params) => ({
    abortId: params.currentMessage.id,
    signal: params.gatewayOptions?.signal, // Important: extract signal
    onAborted: params.gatewayOptions?.onAborted,
    abortTimeout: params.gatewayOptions?.timeout
  })
});

sender.use(plugin);

// Development warning will alert if signal is not extracted correctly
```

---

#### `new AborterPlugin` (Constructor)

**Type:** `(options: AborterPluginOptions<TParams>) => AborterPlugin<TParams, TResult>`

#### Parameters

| Name      | Type                            | Optional | Default | Since | Deprecated | Description                  |
| --------- | ------------------------------- | -------- | ------- | ----- | ---------- | ---------------------------- |
| `options` | `AborterPluginOptions<TParams>` | ✅       | -       | -     | -          | Plugin configuration options |

---

#### `aborter` (Property)

**Type:** `AborterInterface<TParams>`

Abort manager instance for managing abort controllers

---

#### `getConfig` (Property)

**Type:** `AborterConfigExtractor<TParams>`

Configuration extractor function

---

#### `onlyOne` (Property)

**Type:** `true`

**Default:** `true`

Ensures only one instance of this plugin can be registered

---

#### `pluginName` (Property)

**Type:** `string`

Plugin identifier name

---

#### `timeout` (Property)

**Type:** `number`

Default timeout duration for all operations

---

#### `abort` (Method)

**Type:** `(config: string \| TParams) => boolean`

#### Parameters

| Name     | Type                | Optional | Default | Since | Deprecated | Description                             |
| -------- | ------------------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `config` | `string \| TParams` | ❌       | -       | -     | -          | Configuration object or abort ID string |

---

##### `abort` (CallSignature)

**Type:** `boolean`

Manually aborts a specific operation

Delegates to the internal aborter instance. Provides convenient
access to abort functionality without exposing the aborter directly.

**Returns:**

`true`
if operation was aborted,
`false`
if not found

**Example:**

```typescript
const plugin = new AborterPlugin();
executor.use(plugin);

// Start operation
executor.exec(async ({ signal }) => fetch('/api/data', { signal }), {
  abortId: 'fetch-data'
});

// Cancel after 2 seconds
setTimeout(() => plugin.abort('fetch-data'), 2000);
```

#### Parameters

| Name     | Type                | Optional | Default | Since | Deprecated | Description                             |
| -------- | ------------------- | -------- | ------- | ----- | ---------- | --------------------------------------- |
| `config` | `string \| TParams` | ❌       | -       | -     | -          | Configuration object or abort ID string |

---

#### `abortAll` (Method)

**Type:** `() => void`

---

##### `abortAll` (CallSignature)

**Type:** `void`

Aborts all pending operations

Delegates to the internal aborter instance. Provides convenient
access to abort all functionality without exposing the aborter directly.

**Example:**

```typescript
const plugin = new AborterPlugin();
executor.use(plugin);

// Start multiple operations
executor.exec(async ({ signal }) => fetch('/api/data1', { signal }), {
  abortId: 'fetch-1'
});
executor.exec(async ({ signal }) => fetch('/api/data2', { signal }), {
  abortId: 'fetch-2'
});

// Cancel all operations
plugin.abortAll();
```

---

#### `cleanupFromContext` (Method)

**Type:** `(parameters: TParams) => void`

#### Parameters

| Name         | Type      | Optional | Default | Since | Deprecated | Description |
| ------------ | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `parameters` | `TParams` | ❌       | -       | -     | -          |             |

---

##### `cleanupFromContext` (CallSignature)

**Type:** `void`

Helper method to cleanup resources from context

#### Parameters

| Name         | Type      | Optional | Default | Since | Deprecated | Description |
| ------------ | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `parameters` | `TParams` | ❌       | -       | -     | -          |             |

---

#### `getAborter` (Method)

**Type:** `() => AborterInterface<TParams>`

---

##### `getAborter` (CallSignature)

**Type:** `AborterInterface<TParams>`

Get the internal aborter instance

Provides access to the underlying aborter for advanced use cases.
Most users should use
`abort()`
and
`abortAll()`
methods instead.

**Returns:**

The internal aborter instance

**Example:**

```typescript
const plugin = new AborterPlugin();
const aborter = plugin.getAborter();

// Use advanced aborter features
aborter.register({ abortId: 'custom-op' });
```

---

#### `onBefore` (Method)

**Type:** `(ctx: ExecutorContextInterface<TParams, TResult, HookRuntimes>) => void \| TParams`

#### Parameters

| Name  | Type                                                       | Optional | Default | Since | Deprecated | Description                            |
| ----- | ---------------------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `ctx` | `ExecutorContextInterface<TParams, TResult, HookRuntimes>` | ❌       | -       | -     | -          | Executor context containing parameters |

---

##### `onBefore` (CallSignature)

**Type:** `void \| TParams`

Lifecycle hook: called before operation execution

Performs the following operations:

1. Extracts configuration using
   `getConfig`

2. Validates signal extraction (development mode only)
3. Applies default timeout if not specified
4. Aborts any existing operation with the same ID
5. Registers new abort operation
6. Injects signal and abortId into context parameters

**Development mode validation:**

- Warns if
  `config.signal`
  is missing or not an
  `AbortSignal`
  instance
- Only active when
  `NODE_ENV !== 'production'`

- Helps catch
  `getConfig`
  implementation errors

**Example:** Context after execution

```typescript
// Before: ctx.parameters = { abortId: 'task-1' }
// After:  ctx.parameters = { abortId: 'task-1', signal: AbortSignal }
```

#### Parameters

| Name  | Type                                                       | Optional | Default | Since | Deprecated | Description                            |
| ----- | ---------------------------------------------------------- | -------- | ------- | ----- | ---------- | -------------------------------------- |
| `ctx` | `ExecutorContextInterface<TParams, TResult, HookRuntimes>` | ❌       | -       | -     | -          | Executor context containing parameters |

---

#### `onError` (Method)

**Type:** `(ctx: ExecutorContextInterface<TParams, TResult, HookRuntimes>) => LifecycleErrorResult`

#### Parameters

| Name  | Type                                                       | Optional | Default | Since | Deprecated | Description                       |
| ----- | ---------------------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------- |
| `ctx` | `ExecutorContextInterface<TParams, TResult, HookRuntimes>` | ❌       | -       | -     | -          | Executor context containing error |

---

##### `onError` (CallSignature)

**Type:** `LifecycleErrorResult`

Lifecycle hook: called when execution fails

Handles abort errors and cleans up resources.
Returns
`AbortError`
if error is abort-related, otherwise returns void
to allow other plugins to handle the error.

**Returns:**

`AbortError`
if error is abort-related, void otherwise

#### Parameters

| Name  | Type                                                       | Optional | Default | Since | Deprecated | Description                       |
| ----- | ---------------------------------------------------------- | -------- | ------- | ----- | ---------- | --------------------------------- |
| `ctx` | `ExecutorContextInterface<TParams, TResult, HookRuntimes>` | ❌       | -       | -     | -          | Executor context containing error |

---

#### `onFinally` (Method)

**Type:** `(ctx: ExecutorContextInterface<TParams, TResult, HookRuntimes>) => void`

#### Parameters

| Name  | Type                                                       | Optional | Default | Since | Deprecated | Description      |
| ----- | ---------------------------------------------------------- | -------- | ------- | ----- | ---------- | ---------------- |
| `ctx` | `ExecutorContextInterface<TParams, TResult, HookRuntimes>` | ❌       | -       | -     | -          | Executor context |

---

##### `onFinally` (CallSignature)

**Type:** `void`

Lifecycle hook: always executed after operation completes

Ensures cleanup happens even if other hooks fail.
This is the only place where cleanup is performed to avoid redundant calls.

#### Parameters

| Name  | Type                                                       | Optional | Default | Since | Deprecated | Description      |
| ----- | ---------------------------------------------------------- | -------- | ------- | ----- | ---------- | ---------------- |
| `ctx` | `ExecutorContextInterface<TParams, TResult, HookRuntimes>` | ❌       | -       | -     | -          | Executor context |

---

### `AborterPluginOptions` (Interface)

**Type:** `interface AborterPluginOptions<T>`

Configuration options for initializing AborterPlugin

---

#### `aborter` (Property)

**Type:** `AborterInterface<T>`

**Default:** `new Aborter<AborterConfig>(this.pluginName)`

Custom abort manager instance

---

#### `getConfig` (Property)

**Type:** `AborterConfigExtractor<T>`

**Default:** `Direct cast of parameters to `

Custom configuration extractor function

Extracts
`AborterConfig`
from executor context parameters.
This is crucial when using the plugin with custom parameter structures.

**Important:** Make sure to extract the
`signal`
property if it exists
in the original parameters. The plugin will warn in development mode
if
`signal`
is missing or invalid.

**Example:**

```typescript
// For MessageSender integration
getConfig: (params) => ({
  abortId: params.currentMessage.id,
  signal: params.gatewayOptions?.signal, // Extract signal!
  onAborted: params.gatewayOptions?.onAborted,
  abortTimeout: params.gatewayOptions?.timeout
});
```

---

#### `pluginName` (Property)

**Type:** `string`

**Default:** `'AborterPlugin'`

Plugin name

---

#### `timeout` (Property)

**Type:** `number`

**Default:** `undefined`

Default timeout duration for all operations

**Example:**

```ts
`10000`; // 10 seconds default timeout
```

---

### `AborterConfigExtractor` (TypeAlias)

**Type:** `Object`

Configuration extractor function type for AborterPlugin

Extracts
`AborterConfig`
from executor context parameters.
Enables flexible configuration passing in different execution contexts.

**Returns:**

Extracted abort configuration compatible with
`AborterConfig`

**Example:**

```typescript
const extractor: AborterConfigExtractor<MyParams> = (params) => ({
  abortId: params.requestId,
  abortTimeout: params.timeout,
  signal: params.customSignal
});
```

---
