## `src/core/theme-service/ThemeService` (Module)

**Type:** `module src/core/theme-service/ThemeService`

---

### `ThemeService` (Class)

**Type:** `class ThemeService`

Theme DOM + optional persistence; reactive state lives on <a href="#store-property" class="tsd-kind-property">ThemeService.store</a>.

---

#### `new ThemeService` (Constructor)

**Type:** `(props: ThemeServiceProps) => ThemeService`

#### Parameters

| Name    | Type                | Optional | Default | Since | Deprecated | Description |
| ------- | ------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `props` | `ThemeServiceProps` | ❌       | -       | -     | -          |             |

---

#### `store` (Property)

**Type:** `StoreInterface<ThemeServiceState>`

<a href="../store-state/interface/StoreInterface.md#storeinterface-interface" class="tsd-kind-interface">StoreInterface</a> port (default <a href="../store-state/impl/SliceStoreAdapter.md#slicestoreadapter-class" class="tsd-kind-class">SliceStoreAdapter</a>)

---

#### `state` (Accessor)

**Type:** `accessor state`

---

#### `bindToTheme` (Method)

**Type:** `() => void`

---

##### `bindToTheme` (CallSignature)

**Type:** `void`

---

#### `changeTheme` (Method)

**Type:** `(theme: string) => void`

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description |
| ------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `theme` | `string` | ❌       | -       | -     | -          |             |

---

##### `changeTheme` (CallSignature)

**Type:** `void`

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description |
| ------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `theme` | `string` | ❌       | -       | -     | -          |             |

---

#### `cloneState` (Method)

**Type:** `(patch: Partial<ThemeServiceState>) => ThemeServiceState`

#### Parameters

| Name    | Type                         | Optional | Default | Since | Deprecated | Description |
| ------- | ---------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `patch` | `Partial<ThemeServiceState>` | ✅       | `{}`    | -     | -          |             |

---

##### `cloneState` (CallSignature)

**Type:** `ThemeServiceState`

#### Parameters

| Name    | Type                         | Optional | Default | Since | Deprecated | Description |
| ------- | ---------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `patch` | `Partial<ThemeServiceState>` | ✅       | `{}`    | -     | -          |             |

---

#### `emit` (Method)

**Type:** `(patch: Partial<ThemeServiceState>) => void`

#### Parameters

| Name    | Type                         | Optional | Default | Since | Deprecated | Description |
| ------- | ---------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `patch` | `Partial<ThemeServiceState>` | ❌       | -       | -     | -          |             |

---

##### `emit` (CallSignature)

**Type:** `void`

#### Parameters

| Name    | Type                         | Optional | Default | Since | Deprecated | Description |
| ------- | ---------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `patch` | `Partial<ThemeServiceState>` | ❌       | -       | -     | -          |             |

---

#### `getSupportedThemes` (Method)

**Type:** `() => string[]`

---

##### `getSupportedThemes` (CallSignature)

**Type:** `string[]`

---

#### `getTarget` (Method)

**Type:** `() => HTMLElement`

---

##### `getTarget` (CallSignature)

**Type:** `HTMLElement`

---

### `defaultThemeConfig` (Variable)

**Type:** `ThemeConfig`

**Default:** `{}`

---
