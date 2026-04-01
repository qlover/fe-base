## `src/core/resources/ResourceStore` (Module)

**Type:** `module src/core/resources/ResourceStore`

---

### `ResourceStore` (Class)

**Type:** `class ResourceStore<S>`

Store class for managing resource state

Provides methods for:

- Updating list state
- Managing search parameters
- Tracking initialization state

Uses immutable state updates through cloning (see
ResourceStore.emit
).

**Example:** Basic usage

```typescript
interface UserState extends ResourceStateInterface {}

const store = new ResourceStore<UserState>(() => ({
  searchParams: { page: 1, pageSize: 20 },
  initState: { loading: false, result: null, error: null },
  listState: { loading: false, result: null, error: null }
}));
store.changeSearchParams({ page: 1, pageSize: 20 });
```

---

#### `new ResourceStore` (Constructor)

**Type:** `(init: ResourceStoreInit<S>) => ResourceStore<S>`

#### Parameters

| Name   | Type                   | Optional | Default | Since | Deprecated | Description |
| ------ | ---------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `init` | `ResourceStoreInit<S>` | ❌       | -       | -     | -          |             |

---

#### `stateStore` (Property)

**Type:** `StoreInterface<S>`

Backing
StoreInterface
for
`reset`
/
`update`
/
`getState`
/
`subscribe`

Named
`stateStore`
to avoid confusion with
ResourceServiceInterface.store
,
which refers to this
ResourceStore
instance.

---

#### `state` (Accessor)

**Type:** `accessor state`

---

#### `changeInitState` (Method)

**Type:** `(state: AsyncStateInterface<unknown>) => void`

#### Parameters

| Name    | Type                           | Optional | Default | Since | Deprecated | Description              |
| ------- | ------------------------------ | -------- | ------- | ----- | ---------- | ------------------------ |
| `state` | `AsyncStateInterface<unknown>` | ❌       | -       | -     | -          | New initialization state |

---

##### `changeInitState` (CallSignature)

**Type:** `void`

Updates resource initialization state

Used during:

- Resource setup
- Configuration loading
- Initial data fetching

#### Parameters

| Name    | Type                           | Optional | Default | Since | Deprecated | Description              |
| ------- | ------------------------------ | -------- | ------- | ----- | ---------- | ------------------------ |
| `state` | `AsyncStateInterface<unknown>` | ❌       | -       | -     | -          | New initialization state |

---

#### `changeListState` (Method)

**Type:** `(state: AsyncStateInterface<unknown>) => void`

#### Parameters

| Name    | Type                           | Optional | Default | Since | Deprecated | Description    |
| ------- | ------------------------------ | -------- | ------- | ----- | ---------- | -------------- |
| `state` | `AsyncStateInterface<unknown>` | ❌       | -       | -     | -          | New list state |

---

##### `changeListState` (CallSignature)

**Type:** `void`

Updates the list loading state

Used when:

- Loading resource list
- Handling list operation results
- Tracking list operation errors

#### Parameters

| Name    | Type                           | Optional | Default | Since | Deprecated | Description    |
| ------- | ------------------------------ | -------- | ------- | ----- | ---------- | -------------- |
| `state` | `AsyncStateInterface<unknown>` | ❌       | -       | -     | -          | New list state |

---

#### `changeSearchParams` (Method)

**Type:** `(params: Partial<ResourceQuery>) => void`

#### Parameters

| Name     | Type                     | Optional | Default | Since | Deprecated | Description           |
| -------- | ------------------------ | -------- | ------- | ----- | ---------- | --------------------- |
| `params` | `Partial<ResourceQuery>` | ❌       | -       | -     | -          | New search parameters |

---

##### `changeSearchParams` (CallSignature)

**Type:** `void`

Updates search parameters

Used for:

- Changing page number
- Updating sort order
- Modifying filter criteria

#### Parameters

| Name     | Type                     | Optional | Default | Since | Deprecated | Description           |
| -------- | ------------------------ | -------- | ------- | ----- | ---------- | --------------------- |
| `params` | `Partial<ResourceQuery>` | ❌       | -       | -     | -          | New search parameters |

---

#### `cloneState` (Method)

**Type:** `(patch: Partial<S>) => S`

#### Parameters

| Name    | Type         | Optional | Default | Since | Deprecated | Description |
| ------- | ------------ | -------- | ------- | ----- | ---------- | ----------- |
| `patch` | `Partial<S>` | ✅       | `{}`    | -     | -          |             |

---

##### `cloneState` (CallSignature)

**Type:** `S`

Shallow-clone current state and apply a patch (aligned with
SliceStoreAdapter.update
)

#### Parameters

| Name    | Type         | Optional | Default | Since | Deprecated | Description |
| ------- | ------------ | -------- | ------- | ----- | ---------- | ----------- |
| `patch` | `Partial<S>` | ✅       | `{}`    | -     | -          |             |

---

#### `emit` (Method)

**Type:** `(patch: Partial<S>) => void`

#### Parameters

| Name    | Type         | Optional | Default | Since | Deprecated | Description |
| ------- | ------------ | -------- | ------- | ----- | ---------- | ----------- |
| `patch` | `Partial<S>` | ❌       | -       | -     | -          |             |

---

##### `emit` (CallSignature)

**Type:** `void`

Single merge point: patch → cloneState →
StoreInterface.update

#### Parameters

| Name    | Type         | Optional | Default | Since | Deprecated | Description |
| ------- | ------------ | -------- | ------- | ----- | ---------- | ----------- |
| `patch` | `Partial<S>` | ❌       | -       | -     | -          |             |

---

### `ResourceQuery` (Interface)

**Type:** `interface ResourceQuery`

Interface defining resource query parameters

Used for:

- Pagination control
- Sorting configuration
- Data filtering

**Example:** Basic query

```typescript
const query: ResourceQuery = {
  page: 1,
  pageSize: 20,
  orderBy: 'createdAt',
  order: 'desc'
};
```

---

#### `order` (Property)

**Type:** `unknown`

Sort order configuration

**Example:**

```ts
`'asc'` | `'desc'` | { direction: 'asc', nulls: 'last' };
```

---

#### `orderBy` (Property)

**Type:** `string`

Field name to sort by

**Example:**

```ts
`'createdAt'` | `'name'` | `'id'`;
```

---

#### `page` (Property)

**Type:** `number`

**Default:** `ts
1
`

Current page number for pagination

---

#### `pageSize` (Property)

**Type:** `number`

**Default:** `ts
10
`

Number of items per page

---

### `ResourceStateInterface` (Interface)

**Type:** `interface ResourceStateInterface`

Interface for resource state management

Extends the base store state interface with resource-specific
state tracking, including:

- Search parameter state
- Resource initialization state
- Resource list loading state

---

#### `initState` (Property)

**Type:** `AsyncStateInterface<unknown>`

Resource initialization state

---

#### `listState` (Property)

**Type:** `AsyncStateInterface<unknown>`

Resource list loading state

---

#### `searchParams` (Property)

**Type:** `ResourceQuery`

Current search parameters

---

### `ResourceStoreInit` (TypeAlias)

**Type:** `Object \| Object`

How
ResourceStore
obtains its
StoreInterface
port

- Pass a state factory: a
  SliceStoreAdapter
  is created internally (default path).
- Pass
  `{ stateStore }`
  to inject a custom
  StoreInterface
  .

---
