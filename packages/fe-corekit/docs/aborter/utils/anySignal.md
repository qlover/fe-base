## `src/aborter/utils/anySignal` (Module)

**Type:** `module src/aborter/utils/anySignal`

---

### `anySignal` (Function)

**Type:** `(signals: undefined \| null \| AbortSignal[]) => ClearableSignal`

#### Parameters

| Name      | Type                                 | Optional | Default | Since | Deprecated | Description                                                                |
| --------- | ------------------------------------ | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------- |
| `signals` | `undefined \| null \| AbortSignal[]` | ❌       | -       | -     | -          | Array of AbortSignals to combine (null/undefined entries are filtered out) |

---

#### `anySignal` (CallSignature)

**Type:** `ClearableSignal`

Creates a combined AbortSignal from multiple signals with cleanup capability

Combines multiple AbortSignals into a single signal that aborts when any
input signal aborts. Automatically uses the best available implementation:

- Native `AbortSignal.any()` (Node.js 20+, modern browsers) for optimal performance
- `any-signal` library fallback for older environments (Node.js 16-19)

Key features:

- Filters out `null` and `undefined` signals automatically
- Propagates abort reasons correctly from source signals
- Provides `clear()` method for manual cleanup of event listeners
- No memory leaks with proper cleanup

Performance notes:

- Native implementation is faster and doesn't require manual cleanup
- Library fallback requires calling `clear()` to prevent memory leaks
- Both implementations provide consistent API

**Returns:**

ClearableSignal that aborts when any input signal aborts

**Example:** Basic usage

```typescript
const controller1 = new AbortController();
const controller2 = new AbortController();

const combined = anySignal([controller1.signal, controller2.signal]);

try {
  await fetch('/api/data', { signal: combined });
} finally {
  combined.clear(); // Clean up listeners
}
```

**Example:** With timeout

```typescript
const controller = new AbortController();
const timeoutSig = timeoutSignal(5000);

const combined = anySignal([controller.signal, timeoutSig]);

try {
  await fetch('/api/data', { signal: combined });
} finally {
  combined.clear();
}
```

**Example:** Filtering null/undefined

```typescript
const combined = anySignal([
  controller.signal,
  config.signal, // May be undefined
  null // Will be filtered out
]);
```

#### Parameters

| Name      | Type                                 | Optional | Default | Since | Deprecated | Description                                                                |
| --------- | ------------------------------------ | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------- |
| `signals` | `undefined \| null \| AbortSignal[]` | ❌       | -       | -     | -          | Array of AbortSignals to combine (null/undefined entries are filtered out) |

---
