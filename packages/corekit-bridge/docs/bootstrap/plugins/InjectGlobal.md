## `src/core/bootstrap/plugins/InjectGlobal` (Module)

**Type:** `module src/core/bootstrap/plugins/InjectGlobal`

---

### `InjectGlobal` (Class)

**Type:** `class InjectGlobal`

---

#### `new InjectGlobal` (Constructor)

**Type:** `(config: InjectGlobalConfig) => InjectGlobal`

#### Parameters

| Name     | Type                 | Optional | Default | Since | Deprecated | Description |
| -------- | -------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `config` | `InjectGlobalConfig` | ❌       | -       | -     | -          |             |

---

#### `config` (Property)

**Type:** `InjectGlobalConfig`

---

#### `pluginName` (Property)

**Type:** `"InjectGlobal"`

**Default:** `'InjectGlobal'`

Optional plugin name for identification

---

#### `onBefore` (Method)

**Type:** `(context: BootstrapContext) => void`

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

#### Parameters

| Name      | Type               | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `BootstrapContext` | ❌       | -       | -     | -          |             |

---

##### `onBefore` (CallSignature)

**Type:** `void`

#### Parameters

| Name      | Type               | Optional | Default | Since | Deprecated | Description |
| --------- | ------------------ | -------- | ------- | ----- | ---------- | ----------- |
| `context` | `BootstrapContext` | ❌       | -       | -     | -          |             |

---

### `InjectGlobalConfig` (Interface)

**Type:** `interface InjectGlobalConfig`

---

#### `sources` (Property)

**Type:** `Record<string, unknown>`

---

#### `target` (Property)

**Type:** `string \| Record<string, unknown>`

If target is string, will be append to plugin context root
If target is object, will be inject to target

---
