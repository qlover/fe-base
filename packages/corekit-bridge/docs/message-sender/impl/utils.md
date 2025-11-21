## `src/core/message-sender/impl/utils` (Module)

**Type:** `unknown`

---

### `template` (Function)

**Type:** `(template: string, data: Record<string, string \| number \| boolean>) => string`

#### Parameters

| Name       | Type                                          | Optional | Default | Since | Deprecated | Description                                      |
| ---------- | --------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `template` | `string`                                      | ❌       | -       | -     | -          | Template string containing `${key}` placeholders |
| `data`     | `Record<string, string \| number \| boolean>` | ❌       | -       | -     | -          | Object with key-value pairs for interpolation    |

---

#### `template` (CallSignature)

**Type:** `string`

Simple template string interpolation utility

Replaces placeholders in the format
`${key}`
with values from the provided
data object. If a key is not found in the data object, the placeholder is
left unchanged.

**Returns:**

Interpolated string with placeholders replaced by values

**Example:** Basic usage

```typescript
const result = template('Hello, ${name}!', { name: 'Alice' });
console.log(result); // "Hello, Alice!"
```

**Example:** Multiple placeholders

```typescript
const message = template('User ${userId} sent ${count} messages', {
  userId: 123,
  count: 5
});
console.log(message); // "User 123 sent 5 messages"
```

**Example:** With boolean values

```typescript
const status = template('Active: ${isActive}', { isActive: true });
console.log(status); // "Active: true"
```

**Example:** Missing keys preserved

```typescript
const result = template('Hello, ${name}! Age: ${age}', { name: 'Bob' });
console.log(result); // "Hello, Bob! Age: ${age}"
```

#### Parameters

| Name       | Type                                          | Optional | Default | Since | Deprecated | Description                                      |
| ---------- | --------------------------------------------- | -------- | ------- | ----- | ---------- | ------------------------------------------------ |
| `template` | `string`                                      | ❌       | -       | -     | -          | Template string containing `${key}` placeholders |
| `data`     | `Record<string, string \| number \| boolean>` | ❌       | -       | -     | -          | Object with key-value pairs for interpolation    |

---
