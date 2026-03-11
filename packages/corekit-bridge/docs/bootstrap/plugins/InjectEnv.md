## `src/core/bootstrap/plugins/InjectEnv` (Module)

**Type:** `module src/core/bootstrap/plugins/InjectEnv`

---

### `InjectEnv` (Class)

**Type:** `class InjectEnv`

---

#### `new InjectEnv` (Constructor)

**Type:** `(options: InjectEnvConfig) => InjectEnv`

#### Parameters

| Name      | Type              | Optional | Default | Since   | Deprecated | Description |
| --------- | ----------------- | -------- | ------- | ------- | ---------- | ----------- |
| `options` | `InjectEnvConfig` | ❌       | -       | `2.0.0` | -          |             |

---

#### `options` (Property)

**Type:** `InjectEnvConfig`

**Since:** `2.0.0`

---

#### `pluginName` (Property)

**Type:** `"InjectEnv"`

**Default:** `'InjectEnv'`

Optional plugin name for identification

---

#### `env` (Method)

**Type:** `(key: string, defaultValue: D) => D`

#### Parameters

| Name           | Type     | Optional | Default | Since | Deprecated | Description |
| -------------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `key`          | `string` | ❌       | -       | -     | -          |             |
| `defaultValue` | `D`      | ✅       | -       | -     | -          |             |

---

##### `env` (CallSignature)

**Type:** `D`

#### Parameters

| Name           | Type     | Optional | Default | Since | Deprecated | Description |
| -------------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `key`          | `string` | ❌       | -       | -     | -          |             |
| `defaultValue` | `D`      | ✅       | -       | -     | -          |             |

---

#### `inject` (Method)

**Type:** `(config: EnvConfigInterface) => void`

#### Parameters

| Name     | Type                 | Optional | Default | Since | Deprecated | Description |
| -------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `config` | `EnvConfigInterface` | ❌       | -       | -     | -          |             |

---

##### `inject` (CallSignature)

**Type:** `void`

#### Parameters

| Name     | Type                 | Optional | Default | Since | Deprecated | Description |
| -------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `config` | `EnvConfigInterface` | ❌       | -       | -     | -          |             |

---

#### `isEmpty` (Method)

**Type:** `(value: unknown) => boolean`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description |
| ------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `value` | `unknown` | ❌       | -       | -     | -          |             |

---

##### `isEmpty` (CallSignature)

**Type:** `boolean`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description |
| ------- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `value` | `unknown` | ❌       | -       | -     | -          |             |

---

#### `onBefore` (Method)

**Type:** `() => void`

Hook executed before task execution (synchronous only)

Purpose:
Allows plugins to pre-process input data, validate parameters, or perform
setup operations before the main task executes. Must be synchronous.

Return Value Behavior:

- If returns a value: Context parameters are updated with the returned value
- If returns undefined: Context parameters remain unchanged
- Cannot return Promise

Execution Order:

- Executed in plugin registration order
- All onBefore hooks execute before the task
- Each hook can see parameter changes from previous hooks

**Returns:**

New parameters to update context, or undefined to keep current parameters

**Example:** Parameter validation

```typescript
onBefore: (ctx) => {
  if (!ctx.parameters.userId) {
    throw new Error('userId is required');
  }
};
```

**Example:** Parameter transformation

```typescript
onBefore: (ctx) => {
  return {
    ...ctx.parameters,
    timestamp: Date.now(),
    normalized: true
  };
};
```

---

##### `onBefore` (CallSignature)

**Type:** `void`

---

#### `onSuccess` (Method)

**Type:** `(__namedParameters: BootstrapContext) => void`

Hook executed after successful task execution (synchronous only)

Purpose:
Allows plugins to process results, perform cleanup, or trigger side effects
after successful task completion. Must be synchronous.

Use Cases:

- Logging results
- Caching results
- Triggering notifications
- Cleanup operations

**Example:** Result logging

```typescript
onSuccess: (ctx) => {
  console.log('Task completed:', ctx.returnValue);
};
```

**Example:** Result caching

```typescript
onSuccess: (ctx) => {
  cache.set(ctx.parameters.key, ctx.returnValue);
};
```

#### Parameters

| Name                | Type               | Optional | Default | Since | Deprecated | Description |
| ------------------- | ------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `__namedParameters` | `BootstrapContext` | ❌       | -       | -     | -          |             |

---

##### `onSuccess` (CallSignature)

**Type:** `void`

#### Parameters

| Name                | Type               | Optional | Default | Since | Deprecated | Description |
| ------------------- | ------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `__namedParameters` | `BootstrapContext` | ❌       | -       | -     | -          |             |

---

#### `isJSONString` (Method)

**Type:** `(value: string) => boolean`

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description |
| ------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `value` | `string` | ❌       | -       | -     | -          |             |

---

##### `isJSONString` (CallSignature)

**Type:** `boolean`

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description |
| ------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `value` | `string` | ❌       | -       | -     | -          |             |

---

### `InjectEnvConfig` (Interface)

**Type:** `interface InjectEnvConfig`

---

#### `blackList` (Property)

**Type:** `string[]`

---

#### `prefix` (Property)

**Type:** `string`

---

#### `source` (Property)

**Type:** `Record<string, unknown>`

---

#### `target` (Property)

**Type:** `EnvConfigInterface`

---
