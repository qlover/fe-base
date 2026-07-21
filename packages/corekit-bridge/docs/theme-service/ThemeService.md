## `src/core/theme-service/ThemeService` (Module)

**Type:** `module src/core/theme-service/ThemeService`

---

### `ThemeService` (Class)

**Type:** `class ThemeService`

Theme DOM + optional persistence; reactive state lives on [ThemeService.store](#store-property).

---

#### `constructor` (Constructor)

**Type:** `(props: ThemeServiceProps) => ThemeService`

#### Parameters

| Name    | Type                | Optional | Default | Since | Deprecated | Description |
| ------- | ------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `props` | `ThemeServiceProps` | ❌       | -       | -     | -          |             |

---

#### `store` (Property)

**Type:** `StoreInterface<ThemeServiceState>`

[StoreInterface](../store-state/interface/StoreInterface.md#storeinterface-interface) port (default [SliceStoreAdapter](../store-state/impl/SliceStoreAdapter.md#slicestoreadapter-class))

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

#### `emit` (Method)

**Type:** `(patch: StoreUpdateValue<ThemeServiceState>) => void`

#### Parameters

| Name    | Type                                  | Optional | Default | Since | Deprecated | Description |
| ------- | ------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `patch` | `StoreUpdateValue<ThemeServiceState>` | ❌       | -       | -     | -          |             |

---

##### `emit` (CallSignature)

**Type:** `void`

#### Parameters

| Name    | Type                                  | Optional | Default | Since | Deprecated | Description |
| ------- | ------------------------------------- | -------- | ------- | ----- | ---------- | ----------- |
| `patch` | `StoreUpdateValue<ThemeServiceState>` | ❌       | -       | -     | -          |             |

---

#### `getSupportedThemes` (Method)

**Type:** `() => string[]`

---

##### `getSupportedThemes` (CallSignature)⚠️

**Type:** `string[]`

This only get the supported themes from the config

**Returns:**

---

#### `getTarget` (Method)

**Type:** `() => HTMLElement`

---

##### `getTarget` (CallSignature)

**Type:** `HTMLElement`

---

#### `getTheme` (Method)

**Type:** `() => string`

---

##### `getTheme` (CallSignature)

**Type:** `string`

---

#### `getThemes` (Method)

**Type:** `() => string[]`

---

##### `getThemes` (CallSignature)

**Type:** `string[]`

Get the supported themes, from the store state

---

#### `getThemeTokens` (Method)

**Type:** `(theme: string) => ThemeTokens`

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description |
| ------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `theme` | `string` | ❌       | -       | -     | -          |             |

---

##### `getThemeTokens` (CallSignature)

**Type:** `ThemeTokens`

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description |
| ------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `theme` | `string` | ❌       | -       | -     | -          |             |

---

##### `getThemeTokens` (CallSignature)

**Type:** `Record<ThemeId, ThemeTokens>`

---

#### `getTokenMapping` (Method)

**Type:** `() => TokenMapping`

---

##### `getTokenMapping` (CallSignature)

**Type:** `TokenMapping`

---

### `defaultThemeConfig` (Variable)

**Type:** `ThemeConfig`

**Default:** `{}`

---
