## `src/core/theme-service/ThemeInterface` (Module)

**Type:** `module src/core/theme-service/ThemeInterface`

---

### `ThemeInterface` (Interface)

**Type:** `interface ThemeInterface`

---

#### `changeTheme` (Method)

**Type:** `(theme: string) => void`

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description            |
| ------- | -------- | -------- | ------- | ----- | ---------- | ---------------------- |
| `theme` | `string` | ❌       | -       | -     | -          | The theme to change to |

---

##### `changeTheme` (CallSignature)

**Type:** `void`

Change the theme

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description            |
| ------- | -------- | -------- | ------- | ----- | ---------- | ---------------------- |
| `theme` | `string` | ❌       | -       | -     | -          | The theme to change to |

---

#### `getTheme` (Method)

**Type:** `() => string`

---

##### `getTheme` (CallSignature)

**Type:** `string`

Get the current theme

---

#### `getThemes` (Method)

**Type:** `() => string[]`

---

##### `getThemes` (CallSignature)

**Type:** `string[]`

Get the supported themes

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

Get the theme tokens

**Example:**

```ts
{
   *   'color-primary': '246 248 250',
   *   'color-secondary': '255 255 255',
   *   'color-elevated': '240 242 244',
   *   'color-primary-text': '31 35 40',
   *   'color-primary-text-hover': '101 109 118',
   *   'color-secondary-text': '101 109 118',
   *   'color-tertiary-text': '140 149 159',
   * }
```

**Returns:**

The theme tokens

#### Parameters

| Name    | Type     | Optional | Default | Since | Deprecated | Description |
| ------- | -------- | -------- | ------- | ----- | ---------- | ----------- |
| `theme` | `string` | ❌       | -       | -     | -          |             |

---

##### `getThemeTokens` (CallSignature)

**Type:** `Record<ThemeId, ThemeTokens>`

Get the theme tokens for the current theme

---

#### `getTokenMapping` (Method)

**Type:** `() => TokenMapping`

---

##### `getTokenMapping` (CallSignature)

**Type:** `TokenMapping`

Get the token mapping

**Example:**

```ts
{
   *   'color-primary': 'rgb(var(--fe-color-primary))',
   *   'color-secondary': 'rgb(var(--fe-color-secondary))',
   *   'color-elevated': 'rgb(var(--fe-color-elevated))',
   *   'color-primary-text': 'rgb(var(--fe-color-primary-text))',
   *   'color-primary-text-hover': 'rgb(var(--fe-color-primary-text-hover))',
   *   'color-secondary-text': 'rgb(var(--fe-color-secondary-text))',
   *   'color-tertiary-text': 'rgb(var(--fe-color-tertiary-text))',
   * }
```

**Returns:**

The token mapping

---

### `ThemeServiceState` (Interface)

**Type:** `interface ThemeServiceState`

---

#### `theme` (Property)

**Type:** `string`

---

### `ThemeId` (TypeAlias)

**Type:** `string`

---
