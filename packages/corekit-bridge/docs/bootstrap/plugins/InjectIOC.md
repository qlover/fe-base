## `src/core/bootstrap/plugins/InjectIOC` (Module)

**Type:** `module src/core/bootstrap/plugins/InjectIOC`

---

### `InjectIOC` (Class)

**Type:** `class InjectIOC<Container>`

---

#### `new InjectIOC` (Constructor)

**Type:** `(options: InjectIOCOptions<Container>) => InjectIOC<Container>`

#### Parameters

| Name      | Type                          | Optional | Default | Since   | Deprecated | Description |
| --------- | ----------------------------- | -------- | ------- | ------- | ---------- | ----------- |
| `options` | `InjectIOCOptions<Container>` | ❌       | -       | `2.0.0` | -          |             |

---

#### `options` (Property)

**Type:** `InjectIOCOptions<Container>`

**Since:** `2.0.0`

---

#### `pluginName` (Property)

**Type:** `"InjectIOC"`

**Default:** `'InjectIOC'`

Optional plugin name for identification

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

#### `startup` (Method)

**Type:** `() => void`

---

##### `startup` (CallSignature)

**Type:** `void`

---

#### `isIocManager` (Method)

**Type:** `(ioc: unknown) => callsignature isIocManager<C>`

#### Parameters

| Name  | Type      | Optional | Default | Since | Deprecated | Description |
| ----- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `ioc` | `unknown` | ✅       | -       | -     | -          |             |

---

##### `isIocManager` (CallSignature)

**Type:** `callsignature isIocManager<C>`

#### Parameters

| Name  | Type      | Optional | Default | Since | Deprecated | Description |
| ----- | --------- | -------- | ------- | ----- | ---------- | ----------- |
| `ioc` | `unknown` | ✅       | -       | -     | -          |             |

---

### `InjectIOCOptions` (Interface)

**Type:** `interface InjectIOCOptions<Container>`

---

#### `manager` (Property)

**Type:** `IOCManagerInterface<Container>`

IOC manager

---

#### `register` (Property)

**Type:** `IOCRegisterInterface<Container, unknown>`

IOC register

---
