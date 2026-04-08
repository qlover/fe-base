## `src/core/resources/ResourceSearchResult` (Module)

**Type:** `module src/core/resources/ResourceSearchResult`

---

### `isResourceSearchResult` (Function)

**Type:** `(value: unknown) => callsignature isResourceSearchResult<T>`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description                                                    |
| ------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `value` | `unknown` | ❌       | -       | -     | -          | Arbitrary value (e.g. parsed JSON) from a list/search endpoint |

---

#### `isResourceSearchResult` (CallSignature)

**Type:** `callsignature isResourceSearchResult<T>`

Narrow `unknown` to <a href="./interfaces/ResourceSearchInterface.md#resourcesearchresult-interface" class="tsd-kind-interface">ResourceSearchResult</a> by requiring a non-null object with an array `items`.
Optional fields (`total`, `page`, cursors, `facets`, `meta`, …) are **not** validated.

**Returns:**

`true` when `value` is a non-null object with an `items` array (may be empty)

**Example:** Accept any object with an `items` array

```typescript
const body: unknown = await res.json();
if (isResourceSearchResult<Row>(body)) {
  console.log(body.items.length);
}
```

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description                                                    |
| ------- | --------- | -------- | ------- | ----- | ---------- | -------------------------------------------------------------- |
| `value` | `unknown` | ❌       | -       | -     | -          | Arbitrary value (e.g. parsed JSON) from a list/search endpoint |

---

### `isResourceSearchResultStrict` (Function)

**Type:** `(value: unknown) => callsignature isResourceSearchResultStrict<T>`

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description                 |
| ------- | --------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `value` | `unknown` | ❌       | -       | -     | -          | Arbitrary value to validate |

---

#### `isResourceSearchResultStrict` (CallSignature)

**Type:** `callsignature isResourceSearchResultStrict<T>`

Stricter variant of <a href="#isresourcesearchresult-function" class="tsd-kind-function">isResourceSearchResult</a>: when optional keys exist, their **types** must match
<a href="./interfaces/ResourceSearchInterface.md#resourcesearchresult-interface" class="tsd-kind-interface">ResourceSearchResult</a> (`total` / `page` / `pageSize` as finite numbers, `nextCursor` / `prevCursor` as
`string | null | undefined`, `hasMore` as `boolean` when present). Does **not** inspect `facets` or `meta`.

ResourceSearch uses this guard by default before committing to the store.

**Returns:**

`true` when the loose shape holds and present optional fields have correct types

**Example:** Default guard before trusting a gateway response

```typescript
if (!isResourceSearchResultStrict<Row>(payload)) {
  throw new TypeError('Invalid search result');
}
```

#### Parameters

| Name    | Type      | Optional | Default | Since | Deprecated | Description                 |
| ------- | --------- | -------- | ------- | ----- | ---------- | --------------------------- |
| `value` | `unknown` | ❌       | -       | -     | -          | Arbitrary value to validate |

---
