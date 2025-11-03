## `src/core/resources/ResourceInterface` (Module)

**Type:** `unknown`

---

### `ResourceInterface` (Interface)

**Type:** `unknown`

Generic interface for resource operations

Provides a standardized contract for CRUD operations and data export functionality.
This interface is designed to work with any resource type and implements common
data management patterns.

Features:

- CRUD operations (Create, Remove, Update)
- Search functionality with pagination and sorting
- Data export capability

**Example:** Basic implementation

```typescript
class UserResource implements ResourceInterface<User> {
  async create(user: User) {
    // Implementation
  }
  // ... other methods
}
```

---

#### `create` (Method)

**Type:** `(data: T) => Promise<unknown>`

#### Parameters

| Name   | Type | Optional | Default | Since | Deprecated | Description                 |
| ------ | ---- | -------- | ------- | ----- | ---------- | --------------------------- |
| `data` | `T`  | ❌       | -       | -     | -          | The resource data to create |

---

##### `create` (CallSignature)

**Type:** `Promise<unknown>`

Creates a new resource instance

**Returns:**

Promise resolving to the created resource

**Throws:**

When data validation fails

**Throws:**

When resource already exists

#### Parameters

| Name   | Type | Optional | Default | Since | Deprecated | Description                 |
| ------ | ---- | -------- | ------- | ----- | ---------- | --------------------------- |
| `data` | `T`  | ❌       | -       | -     | -          | The resource data to create |

---

#### `export` (Method)

**Type:** `(data: T) => Promise<unknown>`

#### Parameters

| Name   | Type | Optional | Default | Since | Deprecated | Description             |
| ------ | ---- | -------- | ------- | ----- | ---------- | ----------------------- |
| `data` | `T`  | ❌       | -       | -     | -          | Resource data to export |

---

##### `export` (CallSignature)

**Type:** `Promise<unknown>`

Exports resource data in a specific format

**Returns:**

Promise resolving to exported data

**Throws:**

When export operation fails

#### Parameters

| Name   | Type | Optional | Default | Since | Deprecated | Description             |
| ------ | ---- | -------- | ------- | ----- | ---------- | ----------------------- |
| `data` | `T`  | ❌       | -       | -     | -          | Resource data to export |

---

#### `remove` (Method)

**Type:** `(data: T) => Promise<unknown>`

#### Parameters

| Name   | Type | Optional | Default | Since | Deprecated | Description                 |
| ------ | ---- | -------- | ------- | ----- | ---------- | --------------------------- |
| `data` | `T`  | ❌       | -       | -     | -          | The resource data to remove |

---

##### `remove` (CallSignature)

**Type:** `Promise<unknown>`

Removes an existing resource

**Returns:**

Promise resolving when resource is removed

**Throws:**

When resource doesn't exist

#### Parameters

| Name   | Type | Optional | Default | Since | Deprecated | Description                 |
| ------ | ---- | -------- | ------- | ----- | ---------- | --------------------------- |
| `data` | `T`  | ❌       | -       | -     | -          | The resource data to remove |

---

#### `search` (Method)

**Type:** `(params: Partial<ResourceQuery>) => Promise<unknown>`

#### Parameters

| Name     | Type                     | Optional | Default | Since | Deprecated | Description                                        |
| -------- | ------------------------ | -------- | ------- | ----- | ---------- | -------------------------------------------------- |
| `params` | `Partial<ResourceQuery>` | ❌       | -       | -     | -          | Search parameters including pagination and sorting |

---

##### `search` (CallSignature)

**Type:** `Promise<unknown>`

Searches for resources based on query parameters

**Returns:**

Promise resolving to search results

**Throws:**

When search parameters are invalid

#### Parameters

| Name     | Type                     | Optional | Default | Since | Deprecated | Description                                        |
| -------- | ------------------------ | -------- | ------- | ----- | ---------- | -------------------------------------------------- |
| `params` | `Partial<ResourceQuery>` | ❌       | -       | -     | -          | Search parameters including pagination and sorting |

---

#### `update` (Method)

**Type:** `(data: Partial<T>) => Promise<unknown>`

#### Parameters

| Name   | Type         | Optional | Default | Since | Deprecated | Description                     |
| ------ | ------------ | -------- | ------- | ----- | ---------- | ------------------------------- |
| `data` | `Partial<T>` | ❌       | -       | -     | -          | Partial resource data to update |

---

##### `update` (CallSignature)

**Type:** `Promise<unknown>`

Updates an existing resource with partial data

**Returns:**

Promise resolving to the updated resource

**Throws:**

When resource doesn't exist

**Throws:**

When update data is invalid

#### Parameters

| Name   | Type         | Optional | Default | Since | Deprecated | Description                     |
| ------ | ------------ | -------- | ------- | ----- | ---------- | ------------------------------- |
| `data` | `Partial<T>` | ❌       | -       | -     | -          | Partial resource data to update |

---
