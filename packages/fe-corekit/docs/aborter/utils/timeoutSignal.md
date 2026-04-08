## `src/aborter/utils/timeoutSignal` (Module)

**Type:** `module src/aborter/utils/timeoutSignal`

---

### `timeoutSignal` (Function)

**Type:** `(ms: number) => ClearableSignal \| AbortSignal`

#### Parameters

| Name | Type     | Optional | Default | Since | Deprecated | Description                      |
| ---- | -------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `ms` | `number` | ❌       | -       | -     | -          | Timeout duration in milliseconds |

---

#### `timeoutSignal` (CallSignature)

**Type:** `ClearableSignal \| AbortSignal`

Creates an AbortSignal that triggers after a specified timeout

Automatically uses the best available implementation:

- Native `AbortSignal.timeout()` (Node.js 17.3+, modern browsers) for optimal performance
- Manual timer implementation for older environments (Node.js 16-17.2)

Key features:

- Aborts with `TimeoutError` DOMException for standard error handling
- Provides `clear()` method to cancel timeout and prevent memory leaks
- Handles invalid timeout values gracefully (NaN, Infinity, negative)
- Clamps large timeouts to maximum safe value

Timeout behavior:

- Valid timeout: Aborts after specified milliseconds
- Invalid timeout (NaN, Infinity, negative): Uses maximum safe timeout
- Zero timeout: Aborts immediately on next tick

**Returns:**

ClearableSignal or AbortSignal that aborts after timeout

**Example:** Basic usage

```typescript
const signal = timeoutSignal(5000);
try {
  await fetch('/api/data', { signal });
} finally {
  signal.clear(); // Cancel timeout if request completes early
}
```

**Example:** With error handling

```typescript
const signal = timeoutSignal(3000);
try {
  const response = await fetch('/api/data', { signal });
  return await response.json();
} catch (error) {
  if (error.name === 'TimeoutError') {
    console.log('Request timed out after 3 seconds');
  }
  throw error;
} finally {
  signal.clear();
}
```

**Example:** Immediate timeout

```typescript
const signal = timeoutSignal(0); // Aborts immediately
```

**Example:** Long timeout

```typescript
const signal = timeoutSignal(86400000); // 24 hours
```

#### Parameters

| Name | Type     | Optional | Default | Since | Deprecated | Description                      |
| ---- | -------- | -------- | ------- | ----- | ---------- | -------------------------------- |
| `ms` | `number` | ❌       | -       | -     | -          | Timeout duration in milliseconds |

---
