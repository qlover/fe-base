## `src/core/resources/interfaces/ResourceIOInterface` (Module)

**Type:** `module src/core/resources/interfaces/ResourceIOInterface`

---

### `ResourceIOInterface` (Interface)

**Type:** `interface ResourceIOInterface<TPayload, TCriteria>`

**Since:** `3.1.0`

Port for **bulk ingest** (`importData`) and **bulk export** (`exportData`) on one resource type.

**Remarks:**

**Contract**

- Use `importData` / `exportData` method names because `import` and `export` are reserved in JavaScript.
- Hard failures (4xx/5xx, invalid file) should **reject** the `Promise`; <a href="#resourceinresult-interface" class="tsd-kind-interface">ResourceInResult</a> /
  <a href="#resourceoutresult-interface" class="tsd-kind-interface">ResourceOutResult</a> describe **successful** HTTP responses with a body.
- `status` values are **not** enumerated here—define constants or enums in your app (e.g. `'ok'`, `'pending'`, `200`).
- MIME type, headers, and extra vendor fields can live outside these types (e.g. wrapper around `fetch`) or in
  `hint` when a single string is enough.
- Import-only or export-only backends can still implement this interface and reject the unsupported operation, or
  expose a thin facade that only forwards one method.

**Example:** CSV import and filtered export

```typescript
class ProductIO implements ResourceIOInterface<FormData, ProductSearchParams> {
  async importData(source: FormData) {
    const res = await fetch('/api/products/import', {
      method: 'POST',
      body: source
    });
    return (await res.json()) as ResourceInResult;
  }
  async exportData(scope: ProductSearchParams) {
    const res = await fetch(
      '/api/products/export?' + new URLSearchParams(String(scope))
    );
    return { status: 'ok', body: await res.blob() };
  }
}
```

---

#### `exportData` (Method)

**Type:** `(scope: TCriteria) => Promise<ResourceOutResult>`

#### Parameters

| Name    | Type        | Optional | Default | Since | Deprecated | Description |
| ------- | ----------- | -------- | ------- | ----- | ---------- | ----------- |
| `scope` | `TCriteria` | ❌       | -       | -     | -          |             |

---

##### `exportData` (CallSignature)

**Type:** `Promise<ResourceOutResult>`

**Since:** `3.1.0`

Request an export for the given scope; resolves to a <a href="#resourceoutresult-interface" class="tsd-kind-interface">ResourceOutResult</a> on success.

#### Parameters

| Name    | Type        | Optional | Default | Since | Deprecated | Description |
| ------- | ----------- | -------- | ------- | ----- | ---------- | ----------- |
| `scope` | `TCriteria` | ❌       | -       | -     | -          |             |

---

#### `importData` (Method)

**Type:** `(source: TPayload) => Promise<ResourceInResult>`

#### Parameters

| Name     | Type       | Optional | Default | Since | Deprecated | Description |
| -------- | ---------- | -------- | ------- | ----- | ---------- | ----------- |
| `source` | `TPayload` | ❌       | -       | -     | -          |             |

---

##### `importData` (CallSignature)

**Type:** `Promise<ResourceInResult>`

**Since:** `3.1.0`

Submit data to import; resolves to a <a href="#resourceinresult-interface" class="tsd-kind-interface">ResourceInResult</a> on success.

#### Parameters

| Name     | Type       | Optional | Default | Since | Deprecated | Description |
| -------- | ---------- | -------- | ------- | ----- | ---------- | ----------- |
| `source` | `TPayload` | ❌       | -       | -     | -          |             |

---

### `ResourceInResult` (Interface)

**Type:** `interface ResourceInResult`

**Since:** `3.1.0`

Normalized import response. Only `status` is required; meaning is entirely API-defined (string token or numeric code).

---

#### `count` (Property)

**Type:** `number`

Rows successfully written in this round-trip, when the API reports it.

---

#### `hint` (Property)

**Type:** `string`

Free-form note: human message, vendor error string, or auxiliary code text.

---

#### `id` (Property)

**Type:** `string`

Stable id for the batch, entity, or async job (same slot as a “jobId” if you only have one).

---

#### `status` (Property)

**Type:** `string \| number`

---

#### `url` (Property)

**Type:** `string`

Link to poll status, download an error report, or open a portal page.

---

### `ResourceOutResult` (Interface)

**Type:** `interface ResourceOutResult`

**Since:** `3.1.0`

Normalized export response. Only `status` is required; payload is either inline `body` or remote `url`, or an async
`id`/`url` pair—per your backend.

---

#### `body` (Property)

**Type:** `string \| Blob \| ArrayBuffer`

Inline bytes or string payload when the file is returned in-band.

---

#### `filename` (Property)

**Type:** `string`

Suggested name for a save dialog when `body` or `url` points to a file.

---

#### `id` (Property)

**Type:** `string`

Export job or document id when useful for follow-up calls.

---

#### `status` (Property)

**Type:** `string \| number`

---

#### `url` (Property)

**Type:** `string`

Signed download URL or landing page when the file is out-of-band.

---

### `ResourceImportBody` (TypeAlias)

**Type:** `Blob \| FormData \| ArrayBuffer`

**Since:** `3.1.0`

Typical binary/multipart import source (`File` in browsers is a Blob). For structured rows, pick another
`TPayload` on <a href="#resourceiointerface-interface" class="tsd-kind-interface">ResourceIOInterface</a>.

---
