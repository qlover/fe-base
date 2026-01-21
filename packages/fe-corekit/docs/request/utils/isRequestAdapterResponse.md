## `src/request/utils/isRequestAdapterResponse` (Module)

**Type:** `module src/request/utils/isRequestAdapterResponse`

---

### `isRequestAdapterResponse` (Function)

**Type:** `(value: unknown) => callsignature isRequestAdapterResponse`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description        |
| ------- | --------- | -------- | ------- | ----- | ---------- | ------------------ |
| `value` | `unknown` | ❌       | -       | -     | -          | The value to check |

---

#### `isRequestAdapterResponse` (CallSignature)

**Type:** `callsignature isRequestAdapterResponse`

**Since:** `3.0.0`

Type guard function to check if a value is a RequestAdapterResponse

Checks if the value has the structure of a RequestAdapterResponse object,
verifying that it has all required properties: response, status, statusText, headers, and config.

**Returns:**

True if value is a RequestAdapterResponse object

**Example:** Basic type guard

```typescript
const value: unknown = {
  data: { id: 1 },
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
  response: new Response()
};

if (isRequestAdapterResponse(value)) {
  // value is now typed as RequestAdapterResponse
  console.log(value.status); // TypeScript knows 'status' exists
  console.log(value.data); // TypeScript knows 'data' exists
}
```

**Example:** In plugin processing

```typescript
const returnValue = context.returnValue;
if (isRequestAdapterResponse(returnValue)) {
  // Process adapter response
  const data = returnValue.data;
}
```

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description        |
| ------- | --------- | -------- | ------- | ----- | ---------- | ------------------ |
| `value` | `unknown` | ❌       | -       | -     | -          | The value to check |

---
