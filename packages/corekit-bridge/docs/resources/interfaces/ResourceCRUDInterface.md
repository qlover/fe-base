## `src/core/resources/interfaces/ResourceCRUDInterface` (Module)

**Type:** `module src/core/resources/interfaces/ResourceCRUDInterface`

---

### `ResourceCRUDInterface` (Interface)

**Type:** `interface ResourceCRUDInterface<T, Snapshot>`

**Since:** `3.1.0`

Port for resource CRUD only: detail, create, update, remove. Browse/search (paged list, infinite scroll,
refresh flows) should live on a separate search/query interface.

**Remarks:**

**Strengths**

- Separates mutation + detail from search UX, so implementations are not forced to support query pagination.
- Two addressing styles: scalar <a href="#reftype-typealias" class="tsd-kind-type-alias">RefType</a> for common APIs, and Snapshot for rows, composite keys, or cached hints.
- <a href="#create-method" class="tsd-kind-method">create</a> accepts `Snapshot | T` so normal DTOs and occasional full-entity bodies (clone, import) are both expressible without a third generic.
- <a href="#remove-method" class="tsd-kind-method">remove</a> supports batch deletes via arrays, mirroring many backend bulk-delete endpoints.
- Only two type parameters; Snapshot stays caller-controlled.

**Limitations / caveats**

- Overload resolution: if Snapshot is structurally similar to <a href="#reftype-typealias" class="tsd-kind-type-alias">RefType</a> or to `RefType[]` (e.g. `Snapshot` is `string`), calls like `update(x)` or `remove([x])` may resolve to an unintended overload—prefer distinct `Snapshot` shapes or explicit typing at the call site.
- Single-argument `update(snapshot)` can overlap with `detail(snapshot)` in shape only; semantics (read vs write) are not enforced by types—callers and implementers must stay consistent.
- `Snapshot` does not encode whether an update body is a patch vs full replacement; that remains a contract between client and API.
- Batch `remove` returns `Promise<void>` only: per-id failures, partial success, and empty-array behavior are implementation-defined and not modeled here.
- <a href="#reftype-typealias" class="tsd-kind-type-alias">RefType</a> is only `string | number` in this module; other scalar keys must use the Snapshot overloads or a widened alias if you fork the type.
- Implementations must satisfy every overload signature (often one runtime method branching on argument shape).

**Example:** Gateway class with overload declarations + one runtime implementation each

```typescript
class UserCRUD implements ResourceCRUDInterface<User, UserPatch> {
  async detail(ref: RefType, options?: ResourceGatewayOptions): Promise<User>;
  async detail(
    snapshot: UserPatch,
    options?: ResourceGatewayOptions
  ): Promise<User>;
  async detail(
    refOrSnap: RefType | UserPatch,
    options?: ResourceGatewayOptions
  ): Promise<User> {
    const id = typeof refOrSnap === 'object' ? refOrSnap.id : refOrSnap;
    return loadUser(id, options);
  }

  async create(
    payload: UserPatch | User,
    options?: ResourceGatewayOptions
  ): Promise<User> {
    return persistUser(payload, options);
  }

  async update(
    ref: RefType,
    payload: UserPatch,
    options?: ResourceGatewayOptions
  ): Promise<User>;
  async update(
    snapshot: UserPatch,
    options?: ResourceGatewayOptions
  ): Promise<User>;
  async update(
    refOrSnap: RefType | UserPatch,
    payloadOrOpts?: UserPatch | ResourceGatewayOptions,
    options?: ResourceGatewayOptions
  ): Promise<User> {
    // Branch: (ref, payload, opts?) vs (snapshot, opts?)
    return patchUser(refOrSnap, payloadOrOpts as UserPatch, options);
  }

  async remove(ref: RefType, options?: ResourceGatewayOptions): Promise<void>;
  async remove(
    snapshot: UserPatch,
    options?: ResourceGatewayOptions
  ): Promise<void>;
  async remove(
    refs: readonly RefType[],
    options?: ResourceGatewayOptions
  ): Promise<void>;
  async remove(
    snapshots: readonly UserPatch[],
    options?: ResourceGatewayOptions
  ): Promise<void>;
  async remove(
    first: RefType | UserPatch | readonly RefType[] | readonly UserPatch[],
    options?: ResourceGatewayOptions
  ): Promise<void> {
    await deleteUsers(first, options);
  }
}
```

---

#### `create` (Method)

**Type:** `(payload: T \| Snapshot, options: ResourceGatewayOptions) => Promise<T>`

#### Parameters

| Name      | Type                     | Optional | Default | Since | Deprecated | Description                         |
| --------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------------------------------- |
| `payload` | `T \| Snapshot`          | ❌       | -       | -     | -          | Snapshot or T per caller convention |
| `options` | `ResourceGatewayOptions` | ✅       | -       | -     | -          |                                     |

---

##### `create` (CallSignature)

**Type:** `Promise<T>`

Create a new resource; resolves to the persisted representation (including server-generated fields).
Prefer Snapshot for the typical create DTO; pass full T when the body matches the resource shape (clone, import, optimistic entity, etc.).

#### Parameters

| Name      | Type                     | Optional | Default | Since | Deprecated | Description                         |
| --------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------------------------------- |
| `payload` | `T \| Snapshot`          | ❌       | -       | -     | -          | Snapshot or T per caller convention |
| `options` | `ResourceGatewayOptions` | ✅       | -       | -     | -          |                                     |

---

#### `detail` (Method)

**Type:** `(ref: RefType, options: ResourceGatewayOptions) => Promise<T>`

#### Parameters

| Name      | Type                     | Optional | Default | Since | Deprecated | Description                                                                                    |
| --------- | ------------------------ | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------------------------------------- |
| `ref`     | `RefType`                | ❌       | -       | -     | -          | <a href="#reftype-typealias" class="tsd-kind-type-alias">RefType</a> reference to the resource |
| `options` | `ResourceGatewayOptions` | ✅       | -       | -     | -          |                                                                                                |

---

##### `detail` (CallSignature)

**Type:** `Promise<T>`

Load full resource by a scalar handle (string id, slug, numeric id — caller convention).

#### Parameters

| Name      | Type                     | Optional | Default | Since | Deprecated | Description                                                                                    |
| --------- | ------------------------ | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------------------------------------- |
| `ref`     | `RefType`                | ❌       | -       | -     | -          | <a href="#reftype-typealias" class="tsd-kind-type-alias">RefType</a> reference to the resource |
| `options` | `ResourceGatewayOptions` | ✅       | -       | -     | -          |                                                                                                |

---

##### `detail` (CallSignature)

**Type:** `Promise<T>`

Load full resource using a snapshot (cache, list row, or other hint).
Implementations may skip a network call when the snapshot is already sufficient.

#### Parameters

| Name       | Type                     | Optional | Default | Since | Deprecated | Description                           |
| ---------- | ------------------------ | -------- | ------- | ----- | ---------- | ------------------------------------- |
| `snapshot` | `Snapshot`               | ❌       | -       | -     | -          | Snapshot as defined for this resource |
| `options`  | `ResourceGatewayOptions` | ✅       | -       | -     | -          |                                       |

---

#### `remove` (Method)

**Type:** `(ref: RefType, options: ResourceGatewayOptions) => Promise<void>`

#### Parameters

| Name      | Type                     | Optional | Default | Since | Deprecated | Description                                                                                    |
| --------- | ------------------------ | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------------------------------------- |
| `ref`     | `RefType`                | ❌       | -       | -     | -          | <a href="#reftype-typealias" class="tsd-kind-type-alias">RefType</a> reference to the resource |
| `options` | `ResourceGatewayOptions` | ✅       | -       | -     | -          |                                                                                                |

---

##### `remove` (CallSignature)

**Type:** `Promise<void>`

Delete a resource, addressed by scalar handle.

#### Parameters

| Name      | Type                     | Optional | Default | Since | Deprecated | Description                                                                                    |
| --------- | ------------------------ | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------------------------------------- |
| `ref`     | `RefType`                | ❌       | -       | -     | -          | <a href="#reftype-typealias" class="tsd-kind-type-alias">RefType</a> reference to the resource |
| `options` | `ResourceGatewayOptions` | ✅       | -       | -     | -          |                                                                                                |

---

##### `remove` (CallSignature)

**Type:** `Promise<void>`

Delete a resource, addressed by snapshot / locator shape.

#### Parameters

| Name       | Type                     | Optional | Default | Since | Deprecated | Description                              |
| ---------- | ------------------------ | -------- | ------- | ----- | ---------- | ---------------------------------------- |
| `snapshot` | `Snapshot`               | ❌       | -       | -     | -          | Snapshot identifying the target resource |
| `options`  | `ResourceGatewayOptions` | ✅       | -       | -     | -          |                                          |

---

##### `remove` (CallSignature)

**Type:** `Promise<void>`

Delete multiple resources by scalar handles (batch — caller / backend convention).

#### Parameters

| Name      | Type                     | Optional | Default | Since | Deprecated | Description                                                                                                                                     |
| --------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `refs`    | `parameter refs`         | ❌       | -       | -     | -          | One or more <a href="#reftype-typealias" class="tsd-kind-type-alias">RefType</a> values; empty array is implementation-defined (no-op or error) |
| `options` | `ResourceGatewayOptions` | ✅       | -       | -     | -          |                                                                                                                                                 |

---

##### `remove` (CallSignature)

**Type:** `Promise<void>`

Delete multiple resources by Snapshot values (batch).

#### Parameters

| Name        | Type                     | Optional | Default | Since | Deprecated | Description                                                                      |
| ----------- | ------------------------ | -------- | ------- | ----- | ---------- | -------------------------------------------------------------------------------- |
| `snapshots` | `parameter snapshots`    | ❌       | -       | -     | -          | One or more snapshots identifying targets; empty array is implementation-defined |
| `options`   | `ResourceGatewayOptions` | ✅       | -       | -     | -          |                                                                                  |

---

#### `update` (Method)

**Type:** `(ref: RefType, payload: Snapshot, options: ResourceGatewayOptions) => Promise<T>`

#### Parameters

| Name      | Type                     | Optional | Default | Since | Deprecated | Description                                                                                    |
| --------- | ------------------------ | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------------------------------------- |
| `ref`     | `RefType`                | ❌       | -       | -     | -          | <a href="#reftype-typealias" class="tsd-kind-type-alias">RefType</a> reference to the resource |
| `payload` | `Snapshot`               | ❌       | -       | -     | -          | Snapshot update body                                                                           |
| `options` | `ResourceGatewayOptions` | ✅       | -       | -     | -          |                                                                                                |

---

##### `update` (CallSignature)

**Type:** `Promise<T>`

Update a resource: scalar locator plus a Snapshot-shaped body (patch / DTO — caller convention).

#### Parameters

| Name      | Type                     | Optional | Default | Since | Deprecated | Description                                                                                    |
| --------- | ------------------------ | -------- | ------- | ----- | ---------- | ---------------------------------------------------------------------------------------------- |
| `ref`     | `RefType`                | ❌       | -       | -     | -          | <a href="#reftype-typealias" class="tsd-kind-type-alias">RefType</a> reference to the resource |
| `payload` | `Snapshot`               | ❌       | -       | -     | -          | Snapshot update body                                                                           |
| `options` | `ResourceGatewayOptions` | ✅       | -       | -     | -          |                                                                                                |

---

##### `update` (CallSignature)

**Type:** `Promise<T>`

Update a resource using only a Snapshot (identity + fields in one object — caller convention).

#### Parameters

| Name       | Type                     | Optional | Default | Since | Deprecated | Description             |
| ---------- | ------------------------ | -------- | ------- | ----- | ---------- | ----------------------- |
| `snapshot` | `Snapshot`               | ❌       | -       | -     | -          | Snapshot for the update |
| `options`  | `ResourceGatewayOptions` | ✅       | -       | -     | -          |                         |

---

### `RefType` (TypeAlias)

**Type:** `string \| number`

Scalar handle for the first overload of <a href="#detail-method" class="tsd-kind-method">ResourceCRUDInterface.detail</a>, <a href="#update-method" class="tsd-kind-method">ResourceCRUDInterface.update</a>,
and <a href="#remove-method" class="tsd-kind-method">ResourceCRUDInterface.remove</a> (fork the alias in app code if you need UUID objects, branded ids, etc.).

**Example:**

```ts
`'user-42'` | `1001`;
```

---

### `ResourceGatewayOptions` (TypeAlias)

**Type:** `Object`

---

#### `signal` (Property)

**Type:** `AbortSignal`

---
